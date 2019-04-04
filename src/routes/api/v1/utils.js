module.exports = {
  recolorPlug: (req, res) => {
    res.render('plugSvg', { color: req.params.color });
  }
};
