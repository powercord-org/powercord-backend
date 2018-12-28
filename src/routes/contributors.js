module.exports = async (req, res) => {
  res.render('contributors', {
    contributors: await req.db.users.find({ 'metadata.contributor': true }).toArray(),
    developers: await req.db.users.find({ 'metadata.developer': true }).toArray(),
    ...req.session
  });
};
