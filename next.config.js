const removeImports = require('next-remove-imports')();
const { i18n } = require('./next-i18next.config');

/** @type {import('next').NextConfig} */
const nextConfig = {
    i18n,
    reactStrictMode: true,
    experimental: {
        appDir: true,
    },
    images: {
        unoptimized: true /* <- TODO: I don’t want only unoptimize images from cdn.midjourney.com, maybe just do not use <img there */,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cdn.midjourney.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
    webpack: (config) => {
        config.module.rules.push({
            test: /\.md$/,
            use: 'raw-loader',
        });
        return config;
    },
    staticPageGenerationTimeout: 60 * 5 /* 5 minutes */,
};

module.exports = removeImports(nextConfig);
