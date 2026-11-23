// backend/config/database.js
// Load backend/.env so sequelize-cli (npm run db:migrate / db:seed) sees
// DB_FILE etc. without needing dotenv-cli. Does nothing if there is no .env.
require('dotenv').config();
const config = require('./index');

module.exports = {
  development: {
    storage: config.dbFile,
    dialect: "sqlite",
    // No seeder bookkeeping table: the demo seeder checks the data itself and
    // no-ops when users exist, so it is safe to run on every deploy (S0).
    seederStorage: "none",
    logQueryParameters: true,
    typeValidation: true
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    seederStorage: 'none',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    define: {         // define schema here
      schema: process.env.SCHEMA
    }
  }
};
