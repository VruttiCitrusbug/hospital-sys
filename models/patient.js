
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize'); 
const User = require('./user');

const Patient = sequelize.define('Patient', {
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
},{
  timestamps: false,
});

Patient.belongsTo(User);

module.exports = Patient;