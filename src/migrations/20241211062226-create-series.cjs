'use strict';
// Non-urgent: Put this in a transaction. From my understanding if the first statement fails then there's no issues because the migrations process stops.
// However, if the first ones succeed and later ones don't then that can cause problems, but transactions can solve this issue.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('series', {
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
        allowNull: false,
        unique: true
      },
      num_of_minifigs: {
        type: Sequelize.SMALLINT,
        allowNull: false
      },
      release_date: {
        type: Sequelize.TEXT,
        allowNull: false
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

    // Add the trigger
    await queryInterface.sequelize.query(`
      CREATE TRIGGER update_series_updated_at
          BEFORE UPDATE ON series
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `);
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(
      `DROP TRIGGER IF EXISTS update_series_updated_at ON series;`
    );

    await queryInterface.dropTable('series', { cascade: true });
  }
};
