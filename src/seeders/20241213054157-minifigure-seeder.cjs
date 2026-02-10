'use strict';

const path = require('path');
const { transformMinifigureData } = require('../utils/transformData.cjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, _Sequelize) {
    const minifigureJsonPath = path.join(__dirname, '../data/Minifigure.json');
    const minifigureData = transformMinifigureData(minifigureJsonPath);
    await queryInterface.bulkInsert('minifigure', minifigureData, {});
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.bulkDelete('minifigure', null);
  }
};