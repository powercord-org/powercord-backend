const { MongoClient } = require('mongodb');

module.exports = () =>
  MongoClient
    .connect('mongodb://localhost:27017', { useNewUrlParser: true })
    .then(client => client.db('powercord'))
    .then(async db => ({
      users: await db.collection('users'),
      badges: await db.collection('badges'),
      starboard: await db.collection('starboard'),
      plugins: await db.collection('plugins'),
      themes: await db.collection('themes')
    }))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
