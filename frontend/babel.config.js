const path = require('path');

try {
  const { load } = require('@expo/env');
  load(path.resolve(__dirname, '..'));
} catch (e) {
  try {
    require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
  } catch (_) {}
}

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['nativewind/babel'],
  };
};
