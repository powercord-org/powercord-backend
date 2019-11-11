const { MongoClient, ObjectID } = require('mongodb');

// That shit is to make the user collection less shit
(async () => {
  const collection = (await MongoClient.connect('mongodb://localhost:27017')).db('powercord').collection('users');
  const users = await collection.find({}).toArray();
  const newUsers = users.map(user => ({
    _id: user.id,
    createdAt: new ObjectID(user._id).getTimestamp(),
    username: user.metadata.username,
    discriminator: user.metadata.discriminator,
    avatar: user.metadata.avatar,
    accounts: {
      discord: user.discord,
      spotify: user.spotify,
      github: {
        access_token: user.github.access_token,
        display: user.github.name,
        login: user.metadata.github
      }
    },
    settings: user.settings,
    badges: {
      developer: user.metadata.developer,
      contributor: user.metadata.contributor,
      hunter: user.metadata.hunter,
      early: user.metadata.early,
      custom: {
        color: user.badges.color,
        icon: user.badges.custom,
        white: user.badges.customWhite,
        name: user.badges.name
      }
    }
  }));
  await collection.deleteMany({});
  await collection.insertMany(newUsers);
})().then(() => process.exit(0));
