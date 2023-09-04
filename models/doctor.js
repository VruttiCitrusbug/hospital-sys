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
},{
  timestamps: false,
});

Doctor.belongsTo(User);

module.exports = Doctor;