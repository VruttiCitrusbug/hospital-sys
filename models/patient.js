
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize'); 
const User = require('./User');

const Patient = sequelize.define('Patient', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  contactNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  token:{
    type: DataTypes.STRING,
    allowNull: true,
  },
});

Patient.belongsTo(User);

module.exports = Patient;