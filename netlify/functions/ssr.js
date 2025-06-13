const { builder } = require('@netlify/functions');
const express = require('express');
const path = require('path');
const { AppServerModule } = require('../server/main');
const { renderModule } = require('@angular/platform-server');
const fs = require('fs');

const app = express();
const distFolder = path.join(__dirname, '../browser');
const indexHtml = fs.readFileSync(path.join(distFolder, 'index.html'), 'utf-8');

app.get('*.*', express.static(distFolder, {
  maxAge: '1y'
}));

app.get('*', async (req, res) => {
  try {
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
