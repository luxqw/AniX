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
        source: '/bookmarks/[slug]',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=2592000, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/collection/[id]',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=2592000, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/home/[slug]',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=2592000, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/profile/[id]',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=2592000, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/profile/[id]/bookmarks/[slug]',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=2592000, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/profile/[id]/:path',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=2592000, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/release/[id]',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=2592000, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/release/[id]/collections',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=2592000, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/related/[id]',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=2592000, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/search',
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
