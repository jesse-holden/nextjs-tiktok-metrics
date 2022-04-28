import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const BASE_URL = 'https://www.tiktok.com';

export function getUserInfoContentURL(identifier: string): string {
  if (!identifier || typeof identifier === 'undefined') {
    throw new Error('Passed User must have a username set.');
  }

  return `${BASE_URL}/node/share/user/@${identifier}`;
}

export default class TikTokAPI {
  readonly request: AxiosInstance;
  readonly baseURL: string;

  constructor(baseURL: string = BASE_URL, config = {} as AxiosRequestConfig) {
    this.baseURL = baseURL;
    this.request = axios.create({
      baseURL: this.baseURL,
      headers: {
        // host: this.config.host,
        connection: 'keep-alive',
        'accept-encoding': 'gzip',
        // 'user-agent': this.config.userAgent,
        'sdk-version': 1,
        'x-ss-tc': 0,
      },
      withCredentials: true,
      ...config,
    } as AxiosRequestConfig);
  }

  async getUserInfoContent(identifier: string): Promise<string> {
    const url = getUserInfoContentURL(identifier);
    const response = await this.request.get(url);
    return response.data;
  }
}
