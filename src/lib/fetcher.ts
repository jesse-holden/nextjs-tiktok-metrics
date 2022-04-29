import axios from 'axios';

export const fetcher = async <T = unknown>(url: string) => {
  const res = await axios(url);
  const data = res.data;
  return data as T;
};
