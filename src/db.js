const { MongoClient } = require('mongodb');

module.exports = () =>
  MongoClient
    .connect('mongodb://localhost:27017', { useNewUrlParser: true })
    .then(client => client.db('powercord'))
    .then(async db => ({
      users: await db.collection('users'),
      banned: await db.collection('banned'),
      badges: await db.collection('badges'),
      starboard: await db.collection('starboard'),
      plugins: await db.collection('plugins'),
      themes: await db.collection('themes'),
      reviews: await db.collection('reviews'),
      submissions: await db.collection('submissions'),
      tags: await db.collection('tags')
    }))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
