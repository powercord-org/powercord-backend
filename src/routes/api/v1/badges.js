module.exports = async (req, res) => {
  const badges = await req.db.badges.find().toArray();
  res.json(
    badges.reduce((acc, badge) => {
      acc[badge._id] = {
        name: badge.name,
        icon: badge.icon
      };
      return acc;
    }, {})
  );
};
