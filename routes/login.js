exports.index = function(req, res) {
  res.render('indexRes', { user: req.user });
};