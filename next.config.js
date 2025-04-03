const { withPlausibleProxy } = require("next-plausible");
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

const config = () => {
  const plugins = [withPlausibleProxy, withFlowbiteReact];
  return (
    plugins.reduce((acc, next) => {
      console.log(`INIT: ${next.name}`);
      if (next.name === "withPlausibleProxy") {
        return next(acc, {
          customDomain: "https://analytics.wah.su",
        });
      }

      return next(acc);
    }),
    { ...NextConfig }
  );
};

console.log(config());
module.exports = config();
