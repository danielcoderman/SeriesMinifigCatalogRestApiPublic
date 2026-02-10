'use strict';
// Non-urgent: Put this in a transaction. From my understanding if the first statement fails then there's no issues because the migrations process stops.
// However, if the first ones succeed and later ones don't then that can cause problems, but transactions can solve this issue.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('minifigure', {
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
      position_in_series: {
        type: Sequelize.SMALLINT,
        allowNull: false
      },
      series_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'series',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      CREATE TRIGGER update_minifigure_updated_at
          BEFORE UPDATE ON minifigure
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `);
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(
      `DROP TRIGGER IF EXISTS update_minifigure_updated_at ON minifigure;`
    );

    await queryInterface.dropTable('minifigure', { cascade: true });
  }
};
