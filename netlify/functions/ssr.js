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
            return res.redirect(Number(status) || 301, to.replace('*', req.path.split('/').pop() || ''));
          }
          next();
        });
      } else {
        app.use(from, (req, res, next) => {
          if (req.path === from) {
            return res.redirect(Number(status) || 301, to);
          }
          next();
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
    // Importa dinámicamente el bundle SSR (módulo raíz)
    const ssrModule = await import(ssrBundlePath);
    const angularApp = ssrModule.default;
    if (!angularApp) {
      console.error('SSR: No se pudo importar el módulo raíz (default) del bundle SSR');
      return res.status(500).send('SSR Error: No se pudo importar el módulo raíz (default)');
    }
    // Importa renderModule desde @angular/platform-server
    const { renderModule } = await import('@angular/platform-server');
    if (!renderModule) {
      console.error('SSR: No se pudo importar renderModule de @angular/platform-server');
      return res.status(500).send('SSR Error: No se pudo importar renderModule');
    }
    const indexHtml = fs.readFileSync(path.join(distFolder, 'index.html'), 'utf-8');
    const html = await renderModule(angularApp, {
      url: req.url,
      document: indexHtml,
    });
    res.status(200).send(html);
  } catch (err) {
    console.error('SSR error:', err);
    if (!res.headersSent) {
      res.status(500).send('SSR Error');
    }
  }
});

export const handler = builder(app);
