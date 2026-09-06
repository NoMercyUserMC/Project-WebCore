# WEBCore - Creative Web Experiments

WEBCore is a fully static HTML, CSS, and JavaScript experiment library.

## Production

The GitHub Pages and Vercel deployments serve the repository files directly. The production site does not use Node.js, Express, filesystem scanning, or API routes.

- `index.html` is the main entry point.
- `experiments.js` contains every experiment path and background-image path.
- `animations.js` handles the rotating background images.
- `carousel.js` handles the experiment carousel.
- All site URLs are relative, so the project works at `/WEBCore/`, localhost, and a Vercel deployment.

## Local development

A simple static server is recommended:

```bash
python -m http.server 8765
```

Then open `http://localhost:8765/`.

`server.js` remains available as an optional Express static server:

```bash
npm start
```

It only serves files and does not generate HTML or provide production APIs.

## GitHub Pages

Enable **Settings -> Pages -> Deploy from a branch**, select `main`, and select `/(root)`. The site will be available at:

```text
https://USERNAME.github.io/WEBCore/
```
