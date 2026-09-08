import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'admin.fleurgarden.com',
        pathname: '/**',
      },
      // Absolute URLs coming from the excel import `image_url` column.
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fleurgarden.ru',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.fleurgarden.ru',
        pathname: '/**',
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

export default withNextIntl(nextConfig);
