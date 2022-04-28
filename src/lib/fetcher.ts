export const fetcher = async (url: string) => {
  const res = await fetch(url);
  const data = await res.json();

  if (res.status < 200 || res.status >= 300) {
    throw new Error(data.message);
  }

  return data;
};
