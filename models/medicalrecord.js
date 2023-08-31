// models/MedicalRecord.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize'); 
const Patient = require('./Patient');
const Doctor = require('./doctor'); 

const MedicalRecord = sequelize.define('MedicalRecord', {
  record_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

// Establish the foreign key relationships with the Patient and Doctor models
MedicalRecord.belongsTo(Patient);
MedicalRecord.belongsTo(Doctor);

module.exports = MedicalRecord;
