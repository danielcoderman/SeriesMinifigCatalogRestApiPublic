'use strict';

const path = require('path');
const { transformMinifigureData } = require('../utils/transformData.cjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, _Sequelize) {
    const minifigure2JsonPath = path.join(__dirname, '../data/Minifigure2.json');
    const minifigure2Data = transformMinifigureData(minifigure2JsonPath);
    await queryInterface.bulkInsert('minifigure', minifigure2Data, {});
  },

  async down(queryInterface, _Sequelize) {
    const minifigure2JsonPath = path.join(__dirname, '../data/Minifigure2.json');
    const minifigure2Data = transformMinifigureData(minifigure2JsonPath);
    
    // delete the minifigures inserted during the up migration
    await queryInterface.bulkDelete('minifigure', {
      id: minifigure2Data.map(m => m.id)
    });
  }
};