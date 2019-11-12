const Model = require('./Model');

class Forms extends Model {
  constructor (mongo, db = 'forms') {
    super(mongo, db);
  }

  create (document) {
    return super.create({
      handlerId: null,
      ...document
    });
  }
}

module.exports = Forms;
