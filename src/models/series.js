import { DataTypes } from 'sequelize';
import sequelize from './index.js';

const Series = sequelize.define('series', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    image_url: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
    },
    num_of_minifigs: {
        type: DataTypes.SMALLINT,
        allowNull: false
    },
    release_date: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    // read-only timestamps (Managed by the database, not Sequelize)
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false
    }
},
{
    // Hide the timestamps by default when querying for data (e.g. Series.findAll(query))
    defaultScope: {
        attributes: { exclude: ['created_at', 'updated_at'] }
    }
}
);

export default Series;