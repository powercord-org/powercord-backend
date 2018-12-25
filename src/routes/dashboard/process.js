const ui = require('./ui');

const process = {
  // plugins @todo

  async contributors (req, res) {
    const users = await req.db.users.find({}).toArray()
    await process.asyncForEach(users, async user => {
      const contrib = req.body[`c-${user.id}`] === 'on'
      const developer = req.body[`d-${user.id}`] === 'on'

      if (user.metadata.contributor !== contrib || user.metadata.developer !== developer) {
        await req.db.users.updateOne({ id: user.id }, {
          $set: {
            'metadata.contributor': !developer && contrib,
            'metadata.developer': developer
          }
        });
      }
    })

    ui.contributors(req, res);
  },

  async asyncForEach (array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }
};

module.exports = process;
