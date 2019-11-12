const Model = require('./Model');

class Badges extends Model {
  constructor (mongo) {
    super(mongo, 'badges');
  }

  async findAllAsKV () {
    const badges = await this.findAll();
    return badges.reduce((acc, badge) => {
      acc[badge._id] = {
        name: badge.name,
        icon: badge.icon
      };
      return acc;
    }, {});
  }
}

module.exports = Badges;
