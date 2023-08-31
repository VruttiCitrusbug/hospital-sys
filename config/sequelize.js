const Sequelize = require('sequelize');

const sequelize = new Sequelize({
  database: process.env.DATABASE,
  username: process.env.USERNAME,
  password:process.env.PASSWORD,
  host: process.env.HOST,
  dialect: process.env.DIALECT, // Use 'mysql', 'sqlite', 'mssql', or 'postgres' as per your database
});

module.exports = sequelize;