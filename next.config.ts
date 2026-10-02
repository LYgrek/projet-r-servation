import type { NextConfig } from "next";

/**
 * Configuration Next.js.
 * - `typedRoutes` : les liens <Link href> sont vérifiés à la compilation.
 * - `serverExternalPackages` : le client libSQL embarque un binaire natif,
 *   il ne doit pas être empaqueté par le bundler.
 */
const nextConfig: NextConfig = {
  typedRoutes: true,
  serverExternalPackages: ["@libsql/client", "libsql"],
};

export default nextConfig;
