# Web Mini App

React + Vite front-end that runs inside a Telegram Mini App. After each win it calls the Promo API directly (configured via `VITE_API_BASE_URL`) and shows the returned promo code inside the UI.

## Local development

```bash
cd web-server
npm install
npm run dev
```

The dev server runs on HTTPS (see below). For production builds:

```bash
npm run build
npm run preview   # serves the contents of dist/
```

Create a `.env` (see `.env.example`) and point `VITE_API_BASE_URL` to your FastAPI deployment so the mini app can submit wins during development.

## HTTPS with mkcert

The Mini App must be served over HTTPS, even in development. We use [mkcert](https://github.com/FiloSottile/mkcert) to generate a local CA and certificates that browsers trust.

1. Install mkcert (e.g. `brew install mkcert nss` on macOS).  
2. Trust the local CA (only once):

   ```bash
   mkcert -install
   ```

3. Generate certificates inside `web-server/certs` (already ignored in git):

   ```bash
   cd web-server
   mkdir -p certs
   mkcert \
     -cert-file certs/localhost-cert.pem \
     -key-file certs/localhost-key.pem \
     localhost 127.0.0.1 ::1 localtunnel.om1ji
   ```

Vite automatically picks these files up (see `vite.config.ts`) and enables HTTPS for both `npm run dev` and `npm run preview`. If you expose the preview server via tunnels such as `localtunnel.om1ji`, the hostname is already whitelisted in the config.
