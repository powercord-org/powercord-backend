const usersRoutes = {
  async ui (req, res) {
    res.render('dashboard/users', {
      items: await req.db.users.find({}).toArray(),
      ...req.session
    });
  },

  async process (req, res) {
    const users = await req.db.users.find({}).toArray();
    for (let index = 0; index < users.length; index++) {
      const user = users[index];
      const developer = req.body[`d-${user.id}`] === 'on';
      const contrib = req.body[`c-${user.id}`] === 'on';
      const tester = req.body[`t-${user.id}`] === 'on';
      const hunter = req.body[`h-${user.id}`] === 'on';

      if (
        user.metadata.developer !== developer ||
        user.metadata.contributor !== (!developer && contrib) ||
        user.metadata.tester !== tester ||
        user.metadata.hunter !== hunter
      ) {
        await req.db.users.updateOne({ id: user.id }, {
          $set: {
            'metadata.developer': developer,
            'metadata.contributor': !developer && contrib,
            'metadata.tester': tester,
            'metadata.hunter': hunter
          }
        });
      }
    }

    usersRoutes.ui(req, res);
  }
};

module.exports = usersRoutes;
