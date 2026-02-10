import { DataTypes } from 'sequelize';
import sequelize from './index.js';

const MinifigureInventoryItem = sequelize.define('minifigure_inventory_item', {
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
        allowNull: false
    },
    part_url: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    minifigure_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    quantity: {
        type: DataTypes.SMALLINT,
        allowNull: false
    },
    type: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    set_num: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    rebrickable_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    last_updated_rebrickable: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
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
    // Hide the timestamps by default when querying for data (e.g. MinifigureInventoryItem.findAll(query))
    defaultScope: {
        attributes: { exclude: ['last_updated_rebrickable', 'created_at', 'updated_at'] }
    }
}
);

export default MinifigureInventoryItem;