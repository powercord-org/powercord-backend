const { MongoClient } = require('.pnpm/fastify-mongodb@2.0.0/node_modules/mongodb')
MongoClient.connect('mongodb://localhost:27017/powercord')
  .then(m => m.db('powercord').collection('users').find({}).forEach(d =>
    m.db('powercord').collection('users').updateOne({ _id: d._id }, {
      $set: {
        avatar: d.avatar.split('/').pop().split('.')[0],
        'accounts.discord': d.accounts.discord
          ? {
            accessToken: d.accounts.discord.accessToken || d.accounts.discord.access_token,
            refreshToken: d.accounts.discord.refreshToken || d.accounts.discord.refresh_token,
            expiryDate: d.accounts.discord.expiryDate || d.accounts.discord.expiry_date
          }
          : null,
        'accounts.spotify': d.accounts.spotify
          ? {
            accessToken: d.accounts.spotify.accessToken || d.accounts.spotify.access_token,
            refreshToken: d.accounts.spotify.refreshToken || d.accounts.spotify.refresh_token,
            expiryDate: d.accounts.spotify.expiryDate || d.accounts.spotify.expiry_date,
            name: d.accounts.spotify.name,
            scopes: d.accounts.spotify.scopes
          }
          : null,
        'accounts.github': d.accounts.github
          ? {
            accessToken: d.accounts.github.accessToken || d.accounts.github.access_token,
            display: d.accounts.github.display,
            login: d.accounts.github.login
          }
          : null
      }
    })
  ))
