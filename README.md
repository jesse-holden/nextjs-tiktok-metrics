<div align="center">
  <h1>nextjs-tiktok-metrics</h1>
  <p>Next.js + Tailwind CSS + TypeScript TikTok stats scraper</p>
  <p>Made by <a href="https://holden.xyz">Jesse Holden</a></p>
  
  
  ![CI](https://github.com/jesse-holden/nextjs-tiktok-metrics/actions/workflows/lint.yml/badge.svg)

</div>

Check out the 👉 [live demo on netlify](https://nextjs-tiktok-metrics.netlify.app/) 👈

## Features

Main features of this application:

- Fetch data from TikTok user profiles
- Fetch data from video links
- E2E testing w/ Cypress
- Unit testing w/ Jest
- ESLint
- Prettier
- Husky & Lint Staged
- Conventional Commit Lint
- Github Actions
- Automatic Branch and Issue Autolink
- No-config Netlify deployment

## Getting Started

### 1. Install dependencies

It is encouraged to use **yarn** so the husky hooks can work properly.

```bash
yarn install
```

### 2. Run the development server

You can start the server using this command:

```bash
yarn dev
```

### 3. Testing

You can start Cypress while development is running using this command:

```bash
yarn cy:open-only
```

If the development server is not running, you can run the app automatically for the test using:

```bash
yarn cy:open
```

Note: for headless E2E testing, replace `open` in the two commands above with `run`

Standard unit tests can be run with:

```bash
yarn test
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Challenges

### TikTok API

The TikTok API is not public, and not meant to be accessed by external developers. This proved to be an issue, as it was not trivial to develop a solution to bypass their security measures. Looking for options online resulted in disappointing or costly solutions. In experimenting, it seems that web scraping was the best option and provided enough data to meet the criteria of this challenge.

### Responsive design

There were some hidden complexities involved with the figma design that proved challenging to implement using only TailwindCSS. The main challenge had to do with the design for the metrics display, there is not (to my knowledge) a simple solution to handle responsive grids with dividers that can be styled in the way that the Figma design provides. I instead used a solution I was familiar with from past experiences, which involves passing the index of cell to the component, and use simple logic within the component to conditionally render borders.

### Bot detection

It was easy to accidentally trigger TikTok's validation guard during development, so I had to implement an SQLite memory storage to persist past page scrapes between reloads, using only in-memory storage would result in the cache being lost after restarting the server. In the end, I had to remove this option, as the Netlify build image does not include libraries required for SQLite to run in production.

### Optimization

An impactful early issue had to do with scraping each of the top 10 latest videos of the user profile, I left this optimization for later on so I wouldn't spend too much time over-engineering the solution for it. In a real-world production environment, I think the best approach would involve setting up a worker queue, then use pub-sub or polling pattern to fetch the data as soon as it's ready from the client. The implementation I went with involves returning scraped data early if it encounters an un-cached video page, then tells the client more data will need to be requested afterwards. The browser is then directed to the metrics page, where a second request is run (if necessary) to wait for the video data to complete. After each video has been scraped at least once, it will be cached for faster future loading.

Another weird thing I wanted to resolve, was instead of running 2 queries from the index page:

1. Check if the user exists
2. Load the user data

I would rather load all of the data on the first query, and then redirect to the full page. This caused an issue of double-fetching due to the SSR code not being aware of the data already being available to the client (cached locally by SWR). I am not an expert with NextJS, so it looked like the best option was to just pass a query param to tell the SSR code to skip the fetch, then remove the query param from the client after the page renders.

### Caching

Currently, pages are cached in-memory indefinitely. I started on logic for adding stale time to handle background refreshing of older data, but this project was already fairly complete so I left it. You can at least manually invalidate all page cache by calling the `/api/metrics/tiktok/clear-cache` route from the browser in case you need to refresh the data.

### Deployment

Initially, I was going to deploy this app to Vercel. But I ran into a compatibility issue due to Vercel's reliance on AWS. The page scraping library I am using requires NodeJS >=15, but Vercel ships with only 14 and earlier. It would not be much work to replace the page scraping library I implemented (only a few lines of code need to be changed) but I knew already that Netlify offered NodeJS 16 and could handle NextJS SSR rendering, so I changed over to Netlify for the production deployment.

I also momentarily ran into an issue on Netlify, there is a missing library required for SQLite to run. I had only intended to use the SQLite store for local development, but I had to remove the package for compatibility reasons and default to the memory store. It also didn't seem worth the effort to spin up a Redis store for a test like this to allow for shared cache across all edge server (would reduce chances of scraping detection from TikTok by ensuring all cache is re-used globally).

### Bugs

I am aware of a few bugs, I didn't have time to resolve all of them

- Minor responsive issues with cells that have very large numbers
  - Solution would be to either change number formatting (using K/M units) or fine-tune the responsive behaviour of the flex grid
- Profile images won't always load correctly
  - I implemented this pretty late before I remembered how the images get pre-rendered, there's a few easy ways to deal with it, but it seemed low priority
- Hydration errors during development for accounts with less than 10 videos
  - Didn't seem high priority to tackle this one either
- Video stat averages are off
  - I didn't spend much time on the calculation logic for these numbers, it looks like it needs some tweaking at least for accounts with fewer than 10 videos
- There appears to be some cases where my scraper is getting video IDs belonging to other creators
  - This only seems to impact creators with less than 10 videos, so I didn't look at what was causing this
