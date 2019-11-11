const Model = require('./Model');

class Users extends Model {
  constructor (mongo) {
    super(mongo, 'users');
    this.banned = mongo.collection('banned');
  }

  findContributors () {
    return this.findAll({ 'metadata.contributor': true });
  }

  findDevelopers () {
    return this.findAll({ 'metadata.developer': true });
  }

  async findWithBanned (id) {
    const user = await this.collection.aggregate([
      { $match: { id } },
      {
        $lookup: {
          from: 'banned',
          localField: 'id',
          foreignField: '_id',
          as: 'banned'
        }
      },
      {
        $unwind: {
          path: '$banned',
          preserveNullAndEmptyArrays: true
        }
      }
    ]).next();

    user.banned = this._formatBanned(user.banned || {});
    return user;
  }

  async findBanned (id) {
    return this._formatBanned(await this.banned.findOne({ _id: id }) || {});
  }

  create (partialDocument) {
    return super.create({
      createdAt: new Date(),
      patreon: 0,
      badges: {
        developer: true,
        contributor: false,
        hunter: true,
        early: true,
        custom: null
      },
      ...partialDocument
    });
  }

  _formatBanned (data) {
    return {
      account: !!data.account, // Having a Powercord account
      publish: !!data.publish, // Publishing plugin and themes
      hosting: !!data.hosting, // Requesting hosting on Powercord's server
      pledging: !!data.pledging, // Getting paid perks
      reporting: !!data.reporting, // Reporting plugin and themes
      reviewing: !!data.reviewing // Posting plugin/themes reviews
    };
  }
}

module.exports = Users;
