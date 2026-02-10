'use strict';
// Non-urgent: Put this in a transaction. From my understanding if the first statement fails then there's no issues because the migrations process stops.
// However, if the first ones succeed and later ones don't then that can cause problems, but transactions can solve this issue.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop the trigger based on the old minifigure_inventory table name
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS update_minifigure_inventory_updated_at ON minifigure_inventory;
    `);

    // Rename the minifigure_inventory table to minifigure_inventory_item
    await queryInterface.renameTable('minifigure_inventory', 'minifigure_inventory_item')

    // Recreate the trigger with the new table name
    await queryInterface.sequelize.query(`
      CREATE TRIGGER update_minifigure_inventory_item_updated_at
          BEFORE UPDATE ON minifigure_inventory_item
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `);

    // Add the inventory_size column
    await queryInterface.addColumn('minifigure', 'inventory_size', {
      type: Sequelize.SMALLINT,
      allowNull: true, // Allow null initially while we populate it
    });

    // Populate the inventory_size for existing minifigures
    // [1]
    await queryInterface.sequelize.query(`
      UPDATE minifigure AS m
      SET inventory_size = mii.count
      FROM (
        SELECT minifigure_id, COUNT(*)::smallint AS count
        FROM minifigure_inventory_item
        GROUP BY minifigure_id
      ) AS mii
      WHERE m.id = mii.minifigure_id
    `);

    // Make the column NOT NULL after populating
    await queryInterface.changeColumn('minifigure', 'inventory_size', {
      type: Sequelize.SMALLINT,
      allowNull: false
    });
  },

  async down(queryInterface, _Sequelize) {
    // Reverse the changes

    // Remove the new inventory_size column from minifigure
    await queryInterface.removeColumn('minifigure', 'inventory_size');

    // Drop the new trigger
    await queryInterface.sequelize.query(
      `DROP TRIGGER IF EXISTS update_minifigure_inventory_item_updated_at ON minifigure_inventory_item;`
    );

    // Rename the table back to it's old name
    await queryInterface.renameTable('minifigure_inventory_item', 'minifigure_inventory');

    // Recreate the original trigger
    await queryInterface.sequelize.query(`
      CREATE TRIGGER update_minifigure_inventory_updated_at
        BEFORE UPDATE ON minifigure_inventory
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);
  }
};

// Notes
// [1]: The subquery in the UPDATE statement is computed once. It basically returns what's known as a "derived (virtual) table".
// This derived table has two columns, one is the minifigure id and the other is the count of inventory items with that minifigure id.
// The UPDATE statement will run for each row in the minifigure table and try to find a match for it, through the join in the where clause,
// in the mi table (derived table). If it finds a match it will set the inventory size of that minifigure to the count of the matching row
// in the derived table. Otherwise, the minifigure row will be skipped/ignored, which shouldn't happen in our case.