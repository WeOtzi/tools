import { defineConfig, Plugin } from 'vite'
import path from 'path'
import fs from 'fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// Custom Vite plugin to handle local saving of Config and Images
function localSaveAPI(): Plugin {
  return {
    name: 'local-save-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/save-config' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });

          req.on('end', async () => {
            try {
              const payload = JSON.parse(body);
              const { images, config } = payload; // format: { images: { "logo": "data:...", "card_0": "data:..." }, config: { ... } }

              const publicDir = path.resolve(__dirname, 'public');
              const uploadsDir = path.resolve(publicDir, 'uploads');

              if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
              }

              // Process base64 images
              if (images) {
                for (const [key, base64Data] of Object.entries(images)) {
                  if (typeof base64Data === 'string' && base64Data.startsWith('data:image')) {
                    const matches = base64Data.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
                    if (matches && matches.length === 3) {
                      const extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
                      const buffer = Buffer.from(matches[2], 'base64');
                      const filename = `${key}_${Date.now()}.${extension}`;
                      const filepath = path.join(uploadsDir, filename);

                      fs.writeFileSync(filepath, buffer);

                      // Update the config with the new local URL directly
                      if (key === 'logoImg') {
                        config.logoImg = `/uploads/${filename}`;
                      } else if (key.startsWith('card_bg_')) {
                        const idx = parseInt(key.replace('card_bg_', ''), 10);
                        if (!isNaN(idx) && config.cards && config.cards[idx]) {
                          config.cards[idx].bg = `/uploads/${filename}`;
                        }
                      }
                    }
                  }
                }
              }

              // Save the updated configuration to public/config.json
              fs.writeFileSync(
                path.resolve(publicDir, 'config.json'),
                JSON.stringify(config, null, 2)
              );

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: 'Config and images saved successfully' }));
            } catch (err: any) {
              console.error("Save Error:", err);
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
        } else {
          next();
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    localSaveAPI(), // Add our custom saving middleware
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
