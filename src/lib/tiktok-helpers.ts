import * as gotScraping from 'got-scraping';
import { CookieJar } from 'tough-cookie';
import { promisify } from 'util';

const cookieJar = new CookieJar();
export const setCookie = promisify(cookieJar.setCookie.bind(cookieJar));
export const removeAllCookies = promisify(
  cookieJar.removeAllCookies.bind(cookieJar)
);

export async function fetchTikTokURL(url: string) {
  const res = await gotScraping({
    url,
    cookieJar: cookieJar,
    headers: {
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
      referer: 'https://www.tiktok.com/',
    },
  });
  return res.body as string;
}
