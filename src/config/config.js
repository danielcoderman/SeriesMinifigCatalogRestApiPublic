// Configuration for the Express.js application server

import dotenv from 'dotenv';

dotenv.config();

const config = {
  development: {
    port: process.env.PORT || 3000,
    database: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  },
  test: {
    port: process.env.PORT || 3000,
    database: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  },
  production: {
    port: process.env.PORT || 80,
    database: {
      ssl: {
        require: true,
        rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false'
      }
    }
  }
};

// Use NODE_ENV to determine which environment to use, defaulting to development
const env = process.env.NODE_ENV || 'development';
export default config[env];