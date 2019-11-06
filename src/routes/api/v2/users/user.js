const userRoutes = {
  getSelfUser: async (req, res) => {
    res.json({
      id: req.session.user.id,
      connections: {
        spotify: (req.session.user.spotify && req.session.user.spotify.name) ? req.session.user.spotify.name : null,
        github: (req.session.user.github && req.session.user.github.name) ? req.session.user.github.name : null
      },
      communityStatus: await userRoutes._getCommunityStatus(req.session.user, req.db)
    });
  },

  getUser: async (req, res) => {
    const user = await req.db.users.findOne({ id: req.params.id });

    if (!user) {
      return res.status(404).json({
        status: 404,
        error: 'Not found'
      });
    }

    // I use !! just to make sure value is present in payload, even if we define it by default. Never too safe #RS256
    res.json({
      rank: {
        developer: !!user.metadata.developer,
        contributor: !!user.metadata.contributor,
        early: !!user.metadata.early,
        tester: !!user.metadata.tester,
        hunter: !!user.metadata.hunter
      },
      communityStatus: await userRoutes._getCommunityStatus(user, req.db),
      badge: {
        // @todo: real check
        displayBadge: user.badges && user.badges.custom, // req.config.admins.includes(user.id) /* || user.donor */,
        color: user.badges && user.badges.color ? user.badges.color : null,
        custom: user.badges && user.badges.custom ? user.badges.custom : null,
        customWhite: user.badges && user.badges.customWhite ? user.badges.customWhite : null,
        name: user.badges && user.badges.name ? user.badges.name : null
      }
    });
  },

  async _getCommunityStatus (user, mongo) {
    const banned = await mongo.banned.findOne({ _id: user.id }) || {};
    return {
      publish: !banned.publish, // Publishing plugin and themes
      hosting: !banned.hosting, // Requesting hosting on Powercord's server
      pledging: !banned.pledging, // Getting paid perks
      reporting: !banned.reporting, // Reporting plugin and themes
      reviewing: !banned.reviewing // Posting plugin/themes reviews
    };
  }
};

module.exports = userRoutes;
