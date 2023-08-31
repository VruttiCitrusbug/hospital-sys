  const express = require('express');
  const sequelize = require('./config/sequelize');
  const User = require('./models/User');
  const Patient = require('./models/Patient');
  const Doctor = require('./models/Doctor');
  const MedicalRecord = require('./models/MedicalRecord');
  const userRouter = require('./routers/userpath');

  const app = express();
  app.use(express.json())
  app.use(userRouter)

  sequelize
    .sync()
    .then(() => {
      app.listen(3000, () => {
        console.log('Server is running on port 3000');
      });
    })
    .catch((error) => {
      console.error('Error syncing the database: ', error);
    });
