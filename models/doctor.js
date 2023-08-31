const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const User = require('./user'); 

const Doctor = sequelize.define('Doctor', {

  specialization: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  contactNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  token:{
    type: DataTypes.STRING,
    allowNull: true,
  },
});

Doctor.belongsTo(User);

module.exports = Doctor;