const { MongoClient } = require('mongodb');

const Users = require('./models/Users');
const Badges = require('./models/Badges');

module.exports = () =>
  MongoClient
    .connect('mongodb://localhost:27017', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(client => client.db('powercord'))
    .then(async db => ({
      users: new Users(db),
      badges: new Badges(db),
      starboard: await db.collection('starboard'),
      plugins: await db.collection('plugins'),
      themes: await db.collection('themes'),
      reviews: await db.collection('reviews'),
      reports: await db.collection('reports'),
      forms: await db.collection('forms'),
      tags: await db.collection('tags')
    }))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
