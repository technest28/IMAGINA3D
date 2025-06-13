const { builder } = require('@netlify/functions');
const express = require('express');
const path = require('path');
const fs = require('fs');
const { renderModule } = require('@angular/platform-server');

const app = express();
const distFolder = path.join(__dirname, '../../dist/imagina3-d/browser');
const serverBundlePath = path.join(__dirname, '../../dist/imagina3-d/server/main.server.mjs');
const indexHtml = fs.readFileSync(path.join(distFolder, 'index.html'), 'utf-8');

app.get('*.*', express.static(distFolder, {
  maxAge: '1y'
}));

app.get('*', async (req, res) => {
  try {
    const { AppServerModule } = await import(serverBundlePath);
    const html = await renderModule(AppServerModule, {
      document: indexHtml,
      url: req.originalUrl
    });
    res.status(200).send(html);
  } catch (err) {
    res.status(500).send('Error rendering Angular Universal SSR: ' + err);
  }
});

exports.handler = builder(app);
