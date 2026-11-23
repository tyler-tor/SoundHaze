#!/usr/bin/env node
// Exits with an error when NODE_ENV=production. Used by "npm run db:reset"
// so the reset can never run against a production database.
const { assertNotProduction } = require('../db/safety');

try {
  assertNotProduction(process.argv[2] || 'reset the database');
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
