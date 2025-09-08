
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 5000;

// In development, serve static files from root
if (process.env.NODE_ENV === 'development') {
  // Serve static files from root directory
  app.use(express.static(__dirname));
  
  // Serve the main index.html for all routes in development
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });
} else {
  // Serve static files from dist/public (production)
  app.use(express.static(path.join(__dirname, 'dist/public')));
  
  // Handle client-side routing for production
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/public/index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access your app at: http://localhost:${PORT}`);
});
