// Optional local development server. GitHub Pages and Vercel serve the files directly.
const express = require("express");

const app = express();
const root = __dirname;
const port = process.env.PORT || 3000;

app.use(express.static(root, { extensions: ["html"] }));

app.listen(port, () => {
  console.log(`WEBCore static server running at http://localhost:${port}`);
});