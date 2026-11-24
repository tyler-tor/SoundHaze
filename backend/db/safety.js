// backend/db/safety.js
//
// Guard for anything that deletes data (seed undo, migration undo, db:reset).
// Those commands are for local development only. In production they would
// wipe real users' data, which is exactly what the old Render deploy did
// on every deploy.
'use strict';

function isProduction() {
  return process.env.NODE_ENV === 'production';
}

function assertNotProduction(action) {
  if (isProduction()) {
    throw new Error(
      `Refusing to ${action} because NODE_ENV=production. ` +
      'Undo/reset commands delete data and are for local development only. ' +
      'In production: run "npm run db:migrate" and "npm run db:seed" only.'
    );
  }
}

module.exports = { isProduction, assertNotProduction };
