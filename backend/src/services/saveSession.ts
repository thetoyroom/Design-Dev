import { chromium } from "playwright";

async function saveSession() {

  const browser = await chromium.launch({
    headless: false
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("https://www.instagram.com/accounts/login/");

  console.log("Login manually in the opened browser...");

  await page.waitForTimeout(90000);

  await context.storageState({
    path: "instagram-session.json"
  });

  console.log("Session saved successfully.");

  await browser.close();
}

saveSession();