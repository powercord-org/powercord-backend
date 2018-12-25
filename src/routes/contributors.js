module.exports = async (req, res) => {
  res.render('contributors', {
    contributors: await req.db.users.find({ 'metadata.contributor': true }),
    developers: await req.db.users.find({ 'metadata.developer': true }),
    ...req.session
  })
};
