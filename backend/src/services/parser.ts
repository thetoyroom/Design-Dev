export interface ParsedResult {
  title: string;
  url: string;
  domain: string;
}

/**
 * Advanced OCR Output Parser
 * Extracts valid URLs and corresponding tool titles while filtering noise.
 */
export function parseOcrOutput(text: string): ParsedResult | null {
  if (!text) return null;

  // 1. Normalize OCR spacing issues (e.g., "https: //", "www . ")
  const normalized = text
    .replace(/https?:\s*\/\/\s*/gi, 'https://')
    .replace(/www\s*\.\s*/gi, 'www.')
    .replace(/\s*\.\s*(com|net|org|io|dev|app|me|sh|graphics|design|tools|co)/gi, '.$1');

  const lines = normalized.split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const urlRegex = /(https?:\/\/[^\s]+|www\.[a-z0-9.-]+\.[a-z]{2,})/i;

  for (let i = 0; i < lines.length; i++) {
    const urlMatch = lines[i].match(urlRegex);
    
    if (urlMatch) {
      let url = urlMatch[1];
      if (url.toLowerCase().startsWith('www.')) url = 'https://' + url;

      // Extract domain for classification
      const domainMatch = url.match(/^(?:https?:\/\/)?(?:www\.)?([a-z0-9.-]+)/i);
      const domain = domainMatch ? domainMatch[1].toLowerCase() : '';

      // Validate URL format (must have at least one dot)
      if (!domain.includes('.')) continue;

      // 2. Derive Title (Line above URL)
      let title = i > 0 ? lines[i - 1] : "Unknown Tool";
      
      // Clean Title
      title = title
        .replace(/[^\w\s-]/g, '') // Remove symbols
        .replace(/\s+/g, ' ')
        .trim();

      // Filter Aggressively
      if (isNoise(title)) {
        // Try the line itself if no title above or if above is noise
        title = lines[i].replace(urlRegex, '').trim().replace(/[^\w\s-]/g, '');
        if (isNoise(title)) title = "Unknown Tool";
      }

      if (title.length > 60 || title.length < 2) title = "Unknown Tool";

      return { title, url, domain };
    }
  }

  return null;
}

function isNoise(text: string): boolean {
  const lower = text.toLowerCase();
  const noisePatterns = [
    'link in bio', 
    'search in figma', 
    'save this', 
    'follow me', 
    'tap to', 
    'available at', 
    'check it', 
    'view more',
    'click here'
  ];
  
  if (noisePatterns.some(p => lower.includes(p))) return true;
  if (!/[a-zA-Z]/.test(text)) return true; // No letters
  if (text.split(' ').length > 10) return true; // Too long for a title

  return false;
}
