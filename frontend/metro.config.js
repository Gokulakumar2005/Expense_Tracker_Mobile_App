const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

// Load environment variables from the unified root .env file
try {
  const { load } = require('@expo/env');
  load(path.resolve(__dirname, '..'));
} catch (e) {
  try {
    require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
  } catch (_) {}
}

const config = getDefaultConfig(__dirname);

module.exports = config;
