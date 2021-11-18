'use strict';
const faker = require('faker');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Comments',
      Array.from({ length: 10 }).map((item, index) => ({
        text: faker.lorem.sentence(),
        createdAt: new Date(),
        updatedAt: new Date(),
        UserId: Math.ceil(Math.random() * 3),  // 1,2,3
        RestaurantId: Math.ceil(Math.random() * 5)  //1,2,..4,5
      })), {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Comments', null, {})
  }
};
