import puppeteer from 'puppeteer';

export async function fetchTikTokURL(url: string): Promise<string> {
  const browser = await puppeteer.launch();
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
