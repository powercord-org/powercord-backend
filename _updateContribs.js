const { MongoClient } = require('mongodb');
const { get } = require('./src/util/http');
const config = require('./config');

(async () => {
  const collection = (await MongoClient.connect('mongodb://localhost:27017')).db('powercord').collection('users');
  const users = await collection.find({ $or: [ { 'badges.contributor': true }, { 'badges.developer': true } ] }).toArray();
  for (const user of users) {
    const discordUser = await get(`https://discordapp.com/api/v6/users/${user._id}`)
      .set('Authorization', `Bot ${config.discord.boat.token}`)
      .then(r => r.body);

    await collection.updateOne({ _id: user.id }, {
      $set: {
        username: discordUser.username,
        discriminator: discordUser.discriminator,
        avatar: discordUser.avatar
          ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.${discordUser.avatar.startsWith('a_') ? 'gif' : 'png'}`
          : `https://cdn.discordapp.com/embed/avatars/${discordUser.discriminator % 5}.png`
      }
    });

    // Just to be sure to not hit ratelimits (dont do this)
    await new Promise(res => setTimeout(res, 50));
  }
})().then(() => process.exit(0));
