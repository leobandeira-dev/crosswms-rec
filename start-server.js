import { createServer } from 'vite'
import path from 'path'

const server = await createServer({
  configFile: './vite.config.ts',
  server: {
    host: '0.0.0.0',
    port: 8080,
    allowedHosts: [
      'localhost',
      '.replit.dev',
      '.repl.co', 
      '.replit.app',
      '.repl.it',
      process.env.REPLIT_DEV_DOMAIN
    ].filter(Boolean)
  }
})

await server.listen()
server.printUrls()
