const { ObjectId } = require('mongodb');
const { post, put, patch, del } = require('../../http');
const ui = require('./ui');

const processReqs = {
  async create (req, res) {
    const user = await processReqs._process(req, res, true);
    if (!user) {
      return;
    }

    // Create GH repo
    await post(`https://api.github.com/orgs/${req.config.githubOrg}/repos`)
      .set('Authorization', `token ${req.session.tokens.github.access_token}`)
      .send({ name: req.body.name })
      .execute();

    // Create GH webhook
    await post(`https://api.github.com/repos/${req.config.githubOrg}/${req.body.name}/hooks`)
      .set('Authorization', `token ${req.session.tokens.github.access_token}`)
      .send({
        config: {
          url: `${req.config.domain}/hook`,
          content_type: 'json',
          secret: req.config.secret
        }
      }).execute();

    // Invite the correspondig developer
    await put(`https://api.github.com/repos/${req.config.githubOrg}/${req.body.name}/collaborators/${user.metadata.github}`)
      .set('Authorization', `token ${req.session.tokens.github.access_token}`)
      .send({ permission: 'push' })
      .execute();

    // Send invitation link via webhook
    await post(req.config.discordHook)
      .set('Content-Type', 'application/json')
      .send({
        content: `<@${req.body.developer}> your plugin repository is ready! https://github.com/${req.config.githubOrg}/${req.body.name}/invitations\nYour plugin will go live as soon as you add the manifest.json file`,
        username: 'Powercord',
        avatar_url: `${req.config.domain}/assets/powercord.png`
      }).execute();

    // Insert in database
    await req.db.plugins.insertOne({
      name: req.body.name,
      developer: req.body.developer,
      manifest: null
    });

    return res.redirect('/dashboard');
  },

  async edit (req, res) {
    const item = await req.db.plugins.findOne({ _id: new ObjectId(req.params.id) });
    if (!item) {
      return res.redirect('/dashboard');
    }

    const user = await processReqs._process(req, res, false);
    if (!user) {
      return;
    }

    if (item.name !== req.body.name) {
      await patch(`https://api.github.com/repos/${req.config.githubOrg}/${item.name}`)
        .set('Authorization', `token ${req.session.tokens.github.access_token}`)
        .send({ name: req.body.name })
        .execute();
    }

    // @todo: Remove old developer/better management of developers
    if (item.developer !== req.body.developer) {
      // Invite the correspondig developer
      await put(`https://api.github.com/repos/${req.config.githubOrg}/${req.body.name}/collaborators/${user.metadata.github}`)
        .set('Authorization', `token ${req.session.tokens.github.access_token}`)
        .send({ permission: 'push' })
        .execute();

      // Send invitation link via webhook
      await post(req.config.discordHook).send({
        content: `<@${req.body.develper}> your plugin repository is ready! https://github.com/${req.config.githubOrg}/${req.body.name}/invitations`,
        username: 'Powercord',
        avatar_url: `${req.config.domain}/assets/powercord.png`
      }).execute();
    }

    await req.db.plugins.updateOne({ _id: new ObjectId(req.params.id) }, {
      $set: {
        name: req.body.name,
        developer: req.body.developer
      }
    });
    return res.redirect('/dashboard');
  },

  async _process (req, res, create) {
    let nameErr,
      idErr;
    // Validation step 1
    if (typeof req.body.name === 'undefined' || req.body.name.trim().length < 2) {
      nameErr = 'You must fill this field with at least 2 characters';
    } else if (!req.body.name.match(/^[a-z0-9_-]+$/i)) {
      nameErr = 'Only letters, numbers, dashes and underscores';
    }
    if (typeof req.body.developer === 'undefined') {
      idErr = 'You must fill this field';
    }
    if (!!nameErr || !!idErr) {
      res.render('dashboard/editor', {
        create,
        nameErr,
        idErr,
        item: {
          name: req.body.name || '',
          developer: req.body.developer || ''
        },
        ...req.session
      });
      return false;
    }

    // Validation step 2
    const user = await req.db.users.findOne({ id: req.body.developer });
    if (!user || !user.github) {
      res.render('dashboard/editor', {
        create,
        idErr: !user ? 'This user does not exist in the database' : 'This user haven\'t linked a GitHub account',
        item: {
          name: req.body.name,
          developer: req.body.developer
        },
        ...req.session
      });
      return false;
    }

    return user;
  },

  async delete (req, res) {
    const item = await req.db.plugins.findOne({ _id: new ObjectId(req.params.id) });
    if (!item) {
      return res.redirect('/dashboard');
    }

    await del(`https://api.github.com/repos/${req.config.githubOrg}/${item.name}`)
      .set('Authorization', `token ${req.session.tokens.github.access_token}`)
      .execute();

    await req.db.plugins.deleteOne({ _id: new ObjectId(req.params.id) });
    return res.redirect('/dashboard');
  },

  async contributors (req, res) {
    const users = await req.db.users.find({}).toArray();
    await processReqs.asyncForEach(users, async user => {
      const contrib = req.body[`c-${user.id}`] === 'on';
      const developer = req.body[`d-${user.id}`] === 'on';

      if (user.metadata.contributor !== contrib || user.metadata.developer !== developer) {
        await req.db.users.updateOne({ id: user.id }, {
          $set: {
            'metadata.contributor': !developer && contrib,
            'metadata.developer': developer
          }
        });
      }
    });

    ui.contributors(req, res);
  },

  async asyncForEach (array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array); // eslint-disable-line callback-return
    }
  }
};

module.exports = processReqs;
