const { MongoClient } = require('mongodb');

module.exports = () =>
  MongoClient
    .connect('mongodb://localhost:27017')
    .then(client => client.db('powercord'))
    .then(async db => ({
      users: await db.collection('users'),
      plugins: await db.collection('plugins')
    }))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
