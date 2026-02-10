// Configuration specifically for Sequelize CLI operations (migrations, seeders)

const dotenv = require('dotenv');
dotenv.config();

const config = {
  development: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  },
  test: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true // If rejectUnauthorized is not set to a value it will default to the value false
      }
    }
  }
};

module.exports = config;