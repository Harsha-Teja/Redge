import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'rss-proxy-middleware',
      configureServer(server)
      {
        server.middlewares.use(async (req, res, next) =>
        {
          try
          {
            const path = req.url || ''
            if (!path.startsWith('/rss-proxy'))
            {
              return next()
            }

            // Support both /rss-proxy and /rss-proxy/
            const fullUrl = new URL(req.originalUrl || req.url || '', 'http://localhost')
            const targetUrl = fullUrl.searchParams.get('url')
            if (!targetUrl)
            {
              res.statusCode = 400
              res.end('Missing url param')
              return
            }

            const controller = new AbortController()
            const timeout = setTimeout(() => controller.abort(), 15000)
            const response = await fetch(targetUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
                'Accept': 'application/rss+xml, application/xml;q=0.9, */*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
              },
              redirect: 'follow',
              signal: controller.signal,
            })
            clearTimeout(timeout)

            if (!response.ok)
            {
              res.statusCode = response.status
              res.end(`Upstream error: ${response.status}`)
              return
            }

            const text = await response.text()
            res.setHeader('Content-Type', 'application/xml; charset=utf-8')
            res.statusCode = 200
            res.end(text)
          } catch (e)
          {
            res.statusCode = 502
            res.end('Upstream fetch failed')
          }
        })
      },
    },
  ],
})
