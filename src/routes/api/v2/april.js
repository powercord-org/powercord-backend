module.exports = async (req, res) => {
  const date = new Date();
  if (date.getUTCMonth() === 4 && date.getUTCDay() === 1) {
    return res.json({ not: 'yet' });
  }
  res.json({ whats_this: req.config.aprilFools });
};
