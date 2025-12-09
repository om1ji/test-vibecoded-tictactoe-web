import fs from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const rootDir = dirname(fileURLToPath(import.meta.url));
const certDir = resolve(rootDir, "certs");
const certPath = resolve(certDir, "localhost-cert.pem");
const keyPath = resolve(certDir, "localhost-key.pem");

const hasCertificates = fs.existsSync(certPath) && fs.existsSync(keyPath);
if (!hasCertificates) {
  console.warn(
    "[vite] TLS certificates were not found. Generate them with mkcert (see README.md) " +
      "to enable HTTPS locally."
  );
}

const httpsOptions = hasCertificates
  ? {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    }
  : undefined;

export default defineConfig({
  plugins: [react()],
  server: {
    port: 443,
    host: true,
    https: httpsOptions
  },
  preview: {
    port: 4173,
    host: true,
    allowedHosts: ["localtunnel.om1ji"],
    https: httpsOptions
  },
  build: {
    outDir: "dist",
    sourcemap: true
  }
});
