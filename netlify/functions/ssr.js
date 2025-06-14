import path from 'path';
import fs from 'fs';
import express from 'express';
import { builder } from '@netlify/functions';

const distFolder = path.resolve('./dist/imagina3-d/browser');
const ssrBundlePath = path.resolve('./dist/imagina3-d/server/main.js');

const app = express();

// Middleware para manejar redirecciones personalizadas desde _redirects
const redirectsPath = path.join(distFolder, '_redirects');
if (fs.existsSync(redirectsPath)) {
  const redirects = fs.readFileSync(redirectsPath, 'utf-8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));

  redirects.forEach(rule => {
    const [from, to, status] = rule.split(/\s+/);
    if (from && to) {
      if (from.includes('*')) {
        const pattern = new RegExp('^' + from.replace(/\*/g, '.*') + '$');
        app.use((req, res, next) => {
          if (pattern.test(req.path)) {
            res.redirect(Number(status) || 301, to.replace('*', req.path.split('/').pop() || ''));
          } else {
            next();
          }
        });
      } else {
        app.use(from, (req, res, next) => {
          if (req.path === from) {
            res.redirect(Number(status) || 301, to);
          } else {
            next();
          }
        });
      }
    }
  });
}

// Sirve archivos estáticos
app.use(express.static(distFolder));

// SSR handler principal
app.get('*', async (req, res) => {
  try {
    // Importa dinámicamente el bundle SSR
    const { app: angularApp, renderModule } = await import(ssrBundlePath);
    const indexHtml = fs.readFileSync(path.join(distFolder, 'index.html'), 'utf-8');
    const html = await renderModule(angularApp, {
      url: req.url,
      document: indexHtml,
    });
    res.status(200).send(html);
  } catch (err) {
    console.error('SSR error:', err);
    res.status(500).send('SSR Error');
  }
});

export const handler = builder(app);
