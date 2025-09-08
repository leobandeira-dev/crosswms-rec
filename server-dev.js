import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Create Vite server in middleware mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  });

  // Use vite's connect instance as middleware
  app.use(vite.middlewares);

  // Serve static files from dist/public (production fallback)
  app.use(express.static(path.join(__dirname, 'dist/public')));

  // Handle all routes - serve index.html and let Vite handle the rest
  app.get('*', async (req, res, next) => {
    try {
      // 1. Read index.html
      let template = await vite.transformIndexHtml(req.url, `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
            <title>Sistema de Gestão Logística</title>
          </head>
          <body>
            <div id="root"></div>
            <script type="module" src="/src/main.tsx"></script>
          </body>
        </html>
      `);

      // 2. Apply Vite HTML transforms
      template = await vite.transformIndexHtml(req.url, template);

      // 3. Load the server entry
      const { render } = await vite.ssrLoadModule('/src/main.tsx');

      // 4. Render the app HTML
      const appHtml = await render(url, manifest);

      // 5. Inject the app-rendered HTML into the template
      const html = template.replace(`<!--ssr-outlet-->`, appHtml);

      // 6. Send the rendered HTML back
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      // If an error is caught, let Vite fix the stack trace so it maps back to
      // your actual source code
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access your app at: http://localhost:${PORT}`);
  });
}

createServer().catch((e) => {
  console.error(e);
  process.exit(1);
});


