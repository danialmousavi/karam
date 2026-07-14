const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// به اکسپو می‌گوییم که فایل‌های دیتابیس (sql) را بشناسد
config.resolver.sourceExts.push('sql');

module.exports = config;