'use strict';

const path = require('path');
const { transformSeriesData } = require('../utils/transformData.cjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, _Sequelize) {
    const seriesJsonPath = path.join(__dirname, '../data/Series.json');
    const seriesData = transformSeriesData(seriesJsonPath);
    await queryInterface.bulkInsert('series', seriesData, {});
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.bulkDelete('series', null);
  }
};
