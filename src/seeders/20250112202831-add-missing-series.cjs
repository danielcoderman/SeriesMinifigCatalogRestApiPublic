'use strict';

const path = require('path');
const { transformSeriesData } = require('../utils/transformData.cjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, _Sequelize) {
    const series2JsonPath = path.join(__dirname, '../data/Series2.json');
    const series2Data = transformSeriesData(series2JsonPath);
    await queryInterface.bulkInsert('series', series2Data, {});
  },

  async down(queryInterface, _Sequelize) {
    const series2JsonPath = path.join(__dirname, '../data/Series2.json');
    const series2Data = transformSeriesData(series2JsonPath);
    
    // Delete any series data inserted in the "up" migration above
    await queryInterface.bulkDelete('series', {
      id: series2Data.map(s => s.id)
    });
  }
};
