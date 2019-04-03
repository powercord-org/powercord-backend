const { MongoClient } = require('mongodb');

module.exports = () =>
  MongoClient
    .connect('mongodb://localhost:27017', { useNewUrlParser: true })
    .then(client => client.db('powercord'))
    .then(async db => ({
      users: await db.collection('users'),
      starboard: await db.collection('starboard'),
      plugins: await db.collection('plugins')
    }))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
