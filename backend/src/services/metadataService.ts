import metascraper from 'metascraper';
import metascraperTitle from 'metascraper-title';
import metascraperDescription from 'metascraper-description';
import metascraperImage from 'metascraper-image';
import metascraperLogoFavicon from 'metascraper-logo-favicon';
import axios from 'axios';

const scraper = metascraper([
  metascraperTitle(),
  metascraperDescription(),
  metascraperImage(),
  metascraperLogoFavicon()
]);

export async function enrichMetadata(url: string) {
  try {
    const { data: html } = await axios.get(url, { 
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
    });
    const metadata = await scraper({ html, url });
    return metadata;
  } catch (error) {
    console.error(`Metadata enrichment failed for ${url}:`, error);
    return null;
  }
}
