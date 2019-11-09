const Model = require('./Model');

class Badges extends Model {
  constructor (mongo) {
    super(mongo, 'badges');
  }
}

module.exports = Badges;
