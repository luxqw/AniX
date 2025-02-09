const { withPlausibleProxy } = require("next-plausible");

module.exports = withPlausibleProxy({
  customDomain: "https://analytics.wah.su",
})({
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/bookmarks/(.+)',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=2592000, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/collection/(.+)',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=2592000, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/home/(.+)',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=2592000, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/profile/(.+)',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=2592000, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
});
