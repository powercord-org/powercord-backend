const { MongoClient } = require('.pnpm/fastify-mongodb@2.0.0/node_modules/mongodb')
MongoClient.connect('mongodb://localhost:27017/powercord')
  .then(m => m.db('powercord').collection('users').find({}).forEach(d =>
    m.db('powercord').collection('users').updateOne({ _id: d._id }, { $set: { avatar: d.avatar.split('/').pop().split('.')[0] } })
  ))
