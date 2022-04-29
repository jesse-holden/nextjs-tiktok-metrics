import { gotScraping, ToughCookieJar } from 'got-scraping';
import { CookieJar } from 'tough-cookie';
import { promisify } from 'util';

const cookieJar = new CookieJar();
export const setCookie = promisify(cookieJar.setCookie.bind(cookieJar));
export const removeAllCookies = promisify(
  cookieJar.removeAllCookies.bind(cookieJar)
);

export function fetchTikTokURL(url: string) {
  return gotScraping({
    url,
    cookieJar: cookieJar as ToughCookieJar,
    headers: {
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
      referer: 'https://www.tiktok.com/',
    },
  });
}
