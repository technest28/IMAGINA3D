const { builder } = require('@netlify/functions');
const { createServer } = require('http');
const { AppServerModule } = require('./dist/imagina3-d/server/main');
const { ngExpressEngine } = require('@nguniversal/express-engine');
const express = require('express');
const path = require('path');

const app = express();
const distFolder = path.join(__dirname, '../browser');
const indexHtml = 'index.html';

app.engine('html', ngExpressEngine({
  bootstrap: AppServerModule,
}));

app.set('view engine', 'html');
app.set('views', distFolder);

app.get('*.*', express.static(distFolder, {
  maxAge: '1y'
}));

app.get('*', (req, res) => {
  res.render(indexHtml, { req });
});

const handler = builder(async (event, context) => {
  return new Promise((resolve, reject) => {
    const server = createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      app.handle(event, context, (err, result) => {
        server.close();
        if (err) reject(err);
        else resolve(result);
      });
    });
  });
});

exports.handler = handler;
