const { chromium } = require('playwright');
const axios = require('axios');
require('dotenv').config();

const TARGET_ACCOUNT = 'kalypsodesigns';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001/api/tools';

async function scrapeInstagram() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log(`Navigating to https://www.instagram.com/${TARGET_ACCOUNT}/...`);
    await page.goto(`https://www.instagram.com/${TARGET_ACCOUNT}/`, { waitUntil: 'networkidle' });

    // Note: In production, you'd need to handle login if the page is private or blocked
    // For this example, we'll try to extract what's visible
    
    const posts = await page.evaluate(() => {
      const items = [];
      const postElements = document.querySelectorAll('article a'); // Simplified selector
      
      postElements.forEach(el => {
        items.push({
          link: el.href,
          thumbnail: el.querySelector('img')?.src || ''
        });
      });
      return items.slice(0, 5); // Just first 5 for now
    });

    console.log(`Found ${posts.length} posts. Processing...`);

    for (const post of posts) {
      // Logic to visit each post and extract caption + links
      // This is a simplified version
      const caption = "Extracted from Instagram @kalypsodesigns";
      const urls = caption.match(/https?:\/\/[^\s]+/g) || [];
      
      if (urls.length > 0) {
        for (const url of urls) {
          try {
            await axios.post(BACKEND_URL, {
              url: url,
              source: 'Instagram',
              category_id: 'SCRAPED_CATEGORY_ID' // Need a default category
            });
            console.log(`Saved tool from URL: ${url}`);
          } catch (err) {
            console.error(`Error saving URL ${url}:`, err.message);
          }
        }
      }
    }

  } catch (error) {
    console.error('Scraping error:', error);
  } finally {
    await browser.close();
  }
}

// Simple cron-like execution (or run via node-cron)
scrapeInstagram();
