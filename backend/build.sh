#!/usr/bin/env bash
set -o errexit

npm install
node src/config/migrate.js
node src/config/seed.js
