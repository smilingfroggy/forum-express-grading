'use strict';
const faker = require('faker');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Comments',
      Array.from({ length: 20 }).map((item, index) => ({
        text: faker.lorem.sentence(),
        createdAt: faker.date.recent(10),
        updatedAt: new Date(),
        UserId: Math.ceil(Math.random() * 3),  // 1,2,3
        RestaurantId: Math.ceil(Math.random() * 10 )  //1,2,..9,10
      })), {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Comments', null, {})
  }
};
