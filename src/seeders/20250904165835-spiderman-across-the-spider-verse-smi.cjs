'use strict';

const path = require('path');
const { parseJsonData } = require('../utils/transformData.cjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, _Sequelize) {
    // Transaction auto-commits on success, auto-rolls back on throw/reject.
    return queryInterface.sequelize.transaction(async (t) => {
      // Insert the series
      const seriesJsonPath = path.join(__dirname, '../data/spiderman-across-the-spiderverse/series.json');
      const series = parseJsonData(seriesJsonPath);
      await queryInterface.bulkInsert('series', series, { transaction: t }); // Note: The transaction must be passed in the options argument in order for the query to happen under the transaction.

      // Insert the minifigures
      const minifiguresJsonPath = path.join(__dirname, '../data/spiderman-across-the-spiderverse/minifigures.json');
      const minifigures = parseJsonData(minifiguresJsonPath);
      await queryInterface.bulkInsert('minifigure', minifigures, { transaction: t });

      // Insert the minifigure inventory items
      const minifigureInvItemsJsonPath = path.join(__dirname, '../data/spiderman-across-the-spiderverse/minifigure-inventory-items.json');
      const minifigureInventoryItems = parseJsonData(minifigureInvItemsJsonPath);
      await queryInterface.bulkInsert('minifigure_inventory_item', minifigureInventoryItems, { transaction: t });
    });
  },

  async down (queryInterface, _Sequelize) {
    // Rely on FK ON DELETE CASCADE: series -> minifigure -> minifigure_inventory_item
    return queryInterface.sequelize.transaction(async (t) => {
      // Delete the series inserted during the up migration
      const seriesJsonPath = path.join(__dirname, '../data/spiderman-across-the-spiderverse/series.json');
      const series = parseJsonData(seriesJsonPath);
      await queryInterface.bulkDelete('series', { id: series.map(s => s.id) }, { transaction: t });
    });
  }
};