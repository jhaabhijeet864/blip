/** @type {import('next').NextConfig} */
// On Vercel, the app is deployed to the root domain, so basePath should be empty.
// On GitHub Actions (Pages), it defaults to '/blip'.
const isVercel = process.env.VERCEL === '1';
const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH || (!isVercel && process.env.GITHUB_ACTIONS === 'true' ? '/blip' : '');
const basePath = rawBasePath && rawBasePath !== '/'
  ? (rawBasePath.startsWith('/') ? rawBasePath : `/${rawBasePath}`).replace(/\/$/, '')
  : '';

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: basePath || undefined,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
