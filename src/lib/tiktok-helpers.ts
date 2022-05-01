import Chrome from 'chrome-aws-lambda';
import puppeteerLib from 'puppeteer';

let chrome = {
  args: [],
} as unknown as typeof Chrome;
let puppeteer: typeof puppeteerLib;

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  // running on the Vercel platform.
  chrome = require('chrome-aws-lambda');
  puppeteer = require('puppeteer-core');
} else {
  // running locally.
  puppeteer = require('puppeteer');
}

export async function fetchTikTokURL(url: string): Promise<string> {
  const browser = await puppeteer.launch({
    args: [...chrome.args, '--hide-scrollbars', '--disable-web-security'],
    defaultViewport: chrome.defaultViewport,
    executablePath: await chrome.executablePath,
    headless: true,
    ignoreHTTPSErrors: true,
  });
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({
    'user-agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
    referer: 'https://www.tiktok.com/',
  });
  await page.goto(url);
  const html = await page.content();
  await browser.close();
  return html;
}
