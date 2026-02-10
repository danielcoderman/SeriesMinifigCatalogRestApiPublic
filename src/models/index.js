import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import config from  '../config/config.js'

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: config.database.ssl
    },
    define: {
        underscored: true, // Use snake_case for column names
        timestamps: false,   // Don't have Sequelize include the created_at and updated_at columns, let the database defaults or triggers handle them.
        freezeTableName: true, // Prevent pluralization
    }
});

export default sequelize;