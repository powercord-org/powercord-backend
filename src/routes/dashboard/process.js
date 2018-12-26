const ui = require('./ui');
const { ObjectId } = require('mongodb');

const process = {
  async create (req, res) {
    const success = process._process(req, res, true);
    if (!success) {
      return
    }

    await req.db.plugins.insertOne({
      name: req.body.name,
      developer: req.body.developer,
      manifest: null
    });
    return res.redirect('/dashboard')
  },

  async edit (req, res) {
    const item = await req.db.plugins.findOne({ _id: ObjectId(req.params.id) });
    if (!item) {
      return res.redirect('/dashboard')
    }

    const success = process._process(req, res, false);
    if (!success) {
      return
    }

    await req.db.plugins.updateOne({ _id: ObjectId(req.params.id) }, {
      $set: {
        name: req.body.name,
        developer: req.body.developer
      }
    });
    return res.redirect('/dashboard')
  },

  async _process (req, res, create) {
    let nameErr, idErr
    // Validation step 1
    if (req.body.name === undefined || req.body.name.trim().length < 2) {
      nameErr = 'You must fill this field with at least 2 characters'
    }
    if (req.body.developer === undefined) {
      iErr = 'You must fill this field'
    }
    if (nameErr || idErr) {
      res.render('dashboard/editor', {
        create: create,
        nameErr, idErr,
        item: { name: req.body.name || '', developer: req.body.developer || '' },
        ...req.session
      });
      return false;
    }

    // Validation step 2
    const user = await req.db.users.findOne({ id: req.body.developer });
    if (!user || !user.github) {
      res.render('dashboard/editor', {
        create: create,
        idErr: !user ? 'This user does not exist in the database' : 'This user haven\'t linked a GitHub account',
        item: { name: req.body.name, developer: req.body.developer },
        ...req.session
      });
      return false;
    }

    return true;
  },

  async delete (req, res) {
    const item = await req.db.plugins.findOne({ _id: ObjectId(req.params.id) });
    if (!item) {
      return res.redirect('/dashboard');
    }

    await req.db.plugins.deleteOne({ _id: ObjectId(req.params.id) });
    return res.redirect('/dashboard');
  },

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
