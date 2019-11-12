const auth = require('../../../../middlewares/auth');

class Forms {
  registerRoutes (express) {
    express.get('/api/v2/sudoers/forms', auth(true), this.getForms.bind(this, 'forms'));
    express.get('/api/v2/sudoers/reports', auth(true), this.getForms.bind(this, 'reports'));
    express.post('/api/v2/sudoers/:id', auth(true), this.handleForm.bind(this));
    express.delete('/api/v2/sudoers/:id', auth(true), this.deleteForm.bind(this));
  }

  async getForms (type, req, res) {
    res.json(await req.db.forms.findAll({
      category: type,
      handlerId: { $in: [ null, req.session.user._id ] }
    }));
  }

  async handleForm (req, res) {
    const form = await res.json(await req.db.forms.findAll({
      _id: req.params.id,
      handlerId: { $in: [ null, req.session.user._id ] }
    }));
    if (!form) {
      return res.sendStatus(404);
    }

    await req.db.forms.update(req.params.id, { handlerId: req.session.user._id });
    res.sendStatus(204);
  }

  async deleteForm (req, res) {
    const form = await req.db.forms.find({
      _id: req.params.id,
      handlerId: { $in: [ null, req.session.user._id ] }
    });
    if (!form) {
      return res.sendStatus(404);
    }
    await req.db.forms.delete(req.params.id);
    res.sendStatus(204);
  }
}

module.exports = Forms;
