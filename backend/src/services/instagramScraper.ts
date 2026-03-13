import Tool from "../models/Tool";
import Category from "../models/Category";
import { parseOcrOutput } from "./parser";
import { chromium } from "playwright";
import { extractTextFromImage } from "./ocrService";
import { enrichMetadata } from "./metadataService";
import mongoose from "mongoose";

/**
 * Deterministic Category Resolver
 */
async function resolveCategory(domain: string, title: string): Promise<mongoose.Types.ObjectId> {
  let slug = "ui-inspiration"; // default

  const lowerDomain = domain.toLowerCase();
  const lowerTitle = title.toLowerCase();

  const domainMap: Record<string, string[]> = {
    "fonts": ["dafont.com", "velvetyne.fr", "pixelsurplus.com", "fonts.google.com", "myfonts.com"],
    "developer-tools": ["github.com", "gitlab.com", "vercel.app", "npm.com", "api.", "docs.", "dev."],
    "mockups": ["mockups-design.com", "ls.graphics", "mockups.com", "anthonyboyd.graphics"],
    "self-hosted": ["twenty.com", "hoppscotch.io", "browserless.io", "local-"]
  };

  const titleMap: Record<string, string[]> = {
    "fonts": ["font", "typeface", "typography"],
    "developer-tools": ["api", "library", "react", "vue", "backend", "code"],
    "mockups": ["mockup", "branding", "flyer"]
  };

  for (const [s, domains] of Object.entries(domainMap)) {
    if (domains.some(d => lowerDomain.includes(d))) {
      slug = s;
      break;
    }
  }

  // Double check title if domain didn't match specific ones
  if (slug === "ui-inspiration") {
    for (const [s, keywords] of Object.entries(titleMap)) {
      if (keywords.some(k => lowerTitle.includes(k))) {
        slug = s;
        break;
      }
    }
  }

  let cat = await Category.findOne({ slug });
  if (!cat) {
    cat = await Category.create({ 
      name: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      slug: slug,
      description: `Automated ${slug} category`
    });
  }
  return cat._id as mongoose.Types.ObjectId;
}

/**
 * Dynamic Tag Generator
 */
function generateTags(domain: string, title: string, categorySlug: string): string[] {
  const tags: string[] = [categorySlug.replace(/-/g, ' ')];
  const combined = (domain + " " + title).toLowerCase();

  const tagRules: Record<string, string[]> = {
    "font": ["font", "typeface"],
    "open-source": ["github", "gitlab", "npm"],
    "ui-library": ["ui", "component", "figma", "library"],
    "developer-tool": ["api", "dev", "code", "backend", "vercel"],
    "design-tool": ["design", "canvas", "editor", "creative"],
    "directory": ["list", "directory", "resource", "hub"]
  };

  for (const [tag, keywords] of Object.entries(tagRules)) {
    if (keywords.some(k => combined.includes(k))) {
      tags.push(tag);
    }
  }

  return Array.from(new Set(tags));
}

export async function scrapeInstagram() {
  console.log("Starting Advanced DesignDev Hub Pipeline...");

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ storageState: "instagram-session.json" });
  const page = await context.newPage();

  try {
    // 1. Open Profile
    console.log("Opening Instagram profile: @kalypsodesigns...");
    await page.goto("https://www.instagram.com/kalypsodesigns/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(5000);

    // 2. Open first post to enter modal viewer
    const postElements = await page.$$('a[href*="/p/"]');
    if (postElements.length === 0) throw new Error("No posts found on profile.");
    
    console.log("Opening first post in modal viewer...");
    await postElements[0].click();

    // 3. Process loop inside modal
    const POST_LIMIT = 100;
    for (let i = 0; i < POST_LIMIT; i++) {
      console.log(`\n--- [POST ${i + 1}/${POST_LIMIT}] ---`);
      
      // Wait for modal article to load
      try {
        await page.waitForSelector("article", { state: 'visible', timeout: 15000 });
        await page.waitForTimeout(2000); 
      } catch (err) {
        console.warn("Timeout waiting for post article. Attempting to skip or finish.");
        break;
      }

      const slides: string[] = [];
      // Carousel Traversal Logic (Preserved)
      while (true) {
        const currentSrcs = await page.$$eval('article img', 
          imgs => imgs.filter(img => (img as HTMLImageElement).clientWidth > 200).map(img => (img as HTMLImageElement).src)
        );
        currentSrcs.forEach(src => { if (!slides.includes(src)) slides.push(src); });

        // Target carousel slide next button strictly inside article
        const nextSlide = await page.$('article button[aria-label="Next"]');
        if (!nextSlide) break;
        await nextSlide.click();
        await page.waitForTimeout(1500);
      }

      console.log(`Carousel Traversed: ${slides.length} slides found.`);

      // Process slides 2-7 (Tools content) - Extraction pipeline
      if (slides.length >= 2) {
        const toolSlides = slides.slice(1, 7);
        for (let j = 0; j < toolSlides.length; j++) {
          const slideImg = toolSlides[j];
          try {
            console.log(`\n[Slide ${j + 2}] Analyzing OCR...`);
            const ocrText = await extractTextFromImage(slideImg);
            const parsed = parseOcrOutput(ocrText);

            if (parsed) {
              const { url, title: ocrTitle, domain } = parsed;
              
              const exists = await Tool.findOne({ url });
              if (exists) {
                console.log(`[DUPLICATE] Tool exists: ${url}`);
                continue;
              }

              const categoryId = await resolveCategory(domain, ocrTitle);
              const categoryObj = await Category.findById(categoryId);
              const categorySlug = categoryObj?.slug || "ui-inspiration";

              console.log(`[ENRICHING] Fetching metadata for: ${url}`);
              const enriched = await enrichMetadata(url);
              
              const finalTitle = enriched?.title || ocrTitle || "Unnamed Tool";
              const finalDesc = enriched?.description || "Curated tool from @kalypsodesigns.";
              const finalPreview = enriched?.image || slideImg; 

              const tags = generateTags(domain, finalTitle, categorySlug);

              await Tool.create({
                title: finalTitle,
                description: finalDesc,
                url: url,
                thumbnail: finalPreview,
                category_id: categoryId,
                tags: tags,
                source: "Instagram - @kalypsodesigns"
              });

              console.log(`[SUCCESS] Saved: ${finalTitle} (Category: ${categorySlug})`);
            } else {
              console.log(`[FILTERED] Slide ${j + 2} contained no valid tool link.`);
            }
          } catch (slideErr) {
            console.error(`Error processing slide ${j + 2}:`, slideErr);
          }
        }
      }

      // Next Post Navigation inside Modal
      console.log("Jumping to Next Post...");
      
      // Specifically target the forward navigation button outside the article
      const nextPostButton = await page.$('button._abl-:has(svg[aria-label="Next"])');

      if (nextPostButton) {
        const currentUrl = page.url();
        await nextPostButton.click();
        
        // Wait for post change
        try {
          await page.waitForFunction((oldUrl) => window.location.href !== oldUrl, currentUrl, { timeout: 10000 });
          await page.waitForTimeout(2000); 
        } catch (navErr) {
          console.warn("Navigation to next post timed out or end of feed.");
          break;
        }
      } else {
        console.log("No Next Post button found. End of feed.");
        break;
      }
    }

  } catch (err) {
    console.error("Critical Pipeline Error:", err);
  } finally {
    await browser.close();
    console.log("\nPipeline Execution Complete.");
  }
}
