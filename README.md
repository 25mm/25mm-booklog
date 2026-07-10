
# 25mm Booklog

A horizontal booklog webpage built with Figma Make. Copyright of all images belong to their respective owners.

  ## Running the code

Run `npm ci` to install the exact locked dependencies.

Run `npm run dev` to start the development server.

Run `npm run build` to create the production files in `dist/`.

Run `npm run preview` to preview the production build locally.

## Deploying to GitHub Pages

The site is deployed automatically via GitHub Actions when you push to `main`.

1. In your repo on GitHub, go to **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions** (not "Deploy from a branch").
3. Push to `main` — the workflow builds with `npm run build:pages` and publishes `dist/`.

The live site is at [https://cm-mayc.github.io/25mm-booklog/](https://cm-mayc.github.io/25mm-booklog/).

**Important:** Do not open `index.html` directly in the browser. Always use `npm run dev` for local development, or `npm run preview` to test the production build.

## Deploying to Vercel

Import the GitHub repository into Vercel. It automatically recognizes this as a Vite project and uses `npm run build` with `dist` as the output directory.

## Content rights

Before publishing, confirm that you have permission to publish the book-cover images, reviews, and other supplied content.
  
