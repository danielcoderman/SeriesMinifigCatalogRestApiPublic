import { DataTypes } from 'sequelize';
import sequelize from './index.js';

const Minifigure = sequelize.define('minifigure', {
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
    position_in_series: {
        type: DataTypes.SMALLINT,
        allowNull: false
    },
    series_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    inventory_size: { // Note that the inventory size doesn't take the quantity of each item into account. It's basically the count of unique items of a minifigure.
        type: DataTypes.SMALLINT,
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
    // Hide the timestamps by default when querying for data (e.g. Minifigure.findAll(query))
    defaultScope: {
        attributes: { exclude: ['created_at', 'updated_at'] }
    }
}
);

export default Minifigure;
