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
    // Importa dinámicamente el bundle SSR y renderModule
    const ssrModule = await import(ssrBundlePath);
    // Intenta obtener el módulo raíz y renderModule de la forma más compatible
    const angularApp = ssrModule.AppServerModule || ssrModule.app || ssrModule.default;
    let renderModule;
    try {
      // Intenta importar renderModule desde el bundle SSR
      renderModule = ssrModule.renderModule;
    } catch {
      // Si no está, impórtalo desde @angular/platform-server
      ({ renderModule } = await import('@angular/platform-server'));
    }
    if (!angularApp || !renderModule) {
      console.error('SSR: No se pudo importar el módulo raíz o renderModule');
      return res.status(500).send('SSR Error: No se pudo importar el módulo raíz o renderModule');
    }
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
