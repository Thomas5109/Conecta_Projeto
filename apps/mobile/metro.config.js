const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const monorepoRoot = path.resolve(__dirname, '../..');
const watchFolders = new Set(config.watchFolders ?? []);
watchFolders.add(monorepoRoot);
config.watchFolders = [...watchFolders];

module.exports = config;
