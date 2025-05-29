const withFlowbiteReact = require("flowbite-react/plugin/nextjs");
/** @type {import('next').NextConfig} */
const NextConfig = {
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/bookmarks/:slug*",
        headers: [
          {
            key: "Cache-Control",
            value: "s-maxage=2592000, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/collection/:slug*",
        headers: [
          {
            key: "Cache-Control",
            value: "s-maxage=2592000, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/home/:slug*",
        headers: [
          {
            key: "Cache-Control",
            value: "s-maxage=2592000, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/profile/:slug*",
        headers: [
          {
            key: "Cache-Control",
            value: "s-maxage=2592000, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/release/:slug*",
        headers: [
          {
            key: "Cache-Control",
            value: "s-maxage=2592000, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/related/:slug*",
        headers: [
          {
            key: "Cache-Control",
            value: "s-maxage=2592000, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/search",
        headers: [
          {
            key: "Cache-Control",
            value: "s-maxage=2592000, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

const config = withFlowbiteReact(NextConfig);

module.exports = config;
