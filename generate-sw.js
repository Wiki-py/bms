const { generateSW } = require('workbox-build');

generateSW({
  globDirectory: 'dist', // Adjust to your build output folder
  globPatterns: ['**/*.{html,js,css,png,jpg,ico}'],
  swDest: 'dist/sw.js',
  runtimeCaching: [
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|ico)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 50,
        },
      },
    },
    {
      urlPattern: new RegExp('/api/.*'),
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
      },
    },
  ],
}).then(({ count, size }) => {
  console.log(`Generated service worker with ${count} files, totaling ${size} bytes.`);
});