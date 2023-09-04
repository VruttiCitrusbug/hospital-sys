  const express = require('express')
  const sequelize = require('./config/sequelize');
  const userRouter = require('./routers/userpath');
  const adduserRouter = require('./routers/add_user');

  const app = express();
  app.use(express.json())
  app.use(userRouter)
  app.use(adduserRouter)

  // sequelize
  //   .sync()
  //   .then(() => {
  //     app.listen(3000, () => {
  //       console.log('Server is running on port 3000');
  //     });
  //   })
  //   .catch((error) => {
  //     console.error('Error syncing the database: ', error);
  //   });
  app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });

  module.exports = app