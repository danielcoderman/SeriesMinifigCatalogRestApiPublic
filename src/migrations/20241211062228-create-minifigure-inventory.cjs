'use strict';
// Non-urgent: Put this in a transaction. From my understanding if the first statement fails then there's no issues because the migrations process stops.
// However, if the first ones succeed and later ones don't then that can cause problems, but transactions can solve this issue.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('minifigure_inventory', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      image_url: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      part_url: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      minifigure_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'minifigure',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      quantity: {
        type: Sequelize.SMALLINT,
        allowNull: false
      },
      type: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      set_num: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      rebrickable_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true
      },
      last_updated_rebrickable: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add the check constraint
    await queryInterface.sequelize.query(
      `ALTER TABLE minifigure_inventory ADD CONSTRAINT type_check CHECK (type IN ('Accessory', 'Part'));`
    );

    // Add the trigger
    await queryInterface.sequelize.query(`
      CREATE TRIGGER update_minifigure_inventory_updated_at
          BEFORE UPDATE ON minifigure_inventory
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `);
  },

  async down(queryInterface, _Sequelize) {
    // Remove the trigger
    await queryInterface.sequelize.query(
      `DROP TRIGGER IF EXISTS update_minifigure_inventory_updated_at ON minifigure_inventory;`
    );

    await queryInterface.dropTable('minifigure_inventory', { cascade: true });
  }
};