const { MongoClient } = require('mongodb');

module.exports = async () =>
  await MongoClient
    .connect('mongodb://localhost:27017')
    .then(client => client.db('powercord'))
    .then(async db => ({ tokens: await db.collection('tokens'), plugins: await db.collection('plugins') }))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
