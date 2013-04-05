var passport = require('passport')
  , db = require('../db/schema.js');

//console.log("\n \n USERMODEL");
//console.log(db.userModel.User); 

exports.create = function (req, res) {
  //res.render('orderCreate', {email:req.form.email, zip:req.form.zip});


  console.log(req.form);

  var user = new db.userModel({ 
            email: req.form.email
          , name: req.form.name
          , password: req.form.password
          , zip: req.form.zip
          , phone: req.form.phone
          , admin: true
          , reg_date: Date.now() });

  user.save(function (err){
    if(err) {
      res.render('login', {user: req.user, message:"Email already in use. Log in below or click to retrieve your account. "});
      res.end();
    } else {
      console.log('saved user: ' + user.email);
      res.render('login', {user: req.user, message: "Welcome. Log in with your email and password to get started!"} );
    }
  })
};





exports.account = function(req, res) {
  res.render('account', { user: req.user });
};

exports.getlogin = function(req, res) {
  res.render('login', { user: req.user, message: req.session.messages });
};

exports.admin = function(req, res) {
  db.userModel.find({}, function (err, users) {
    res.render('admin', {user: req.user, users: users});
  })
  
};

exports.adminOrders = function(req, res) {
  db.orderModel.find({}, function (err, orders) {
    console.log(orders);
    res.render('adminOrders', {user: req.user, orders: orders});
  })
  
};

// POST /login
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
//
//   curl -v -d "username=bob&password=secret" http://127.0.0.1:3000/login
//   
/***** This version has a problem with flash messages
app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
  function(req, res) {
    res.redirect('/');
  });
*/
  
// POST /login
//   This is an alternative implementation that uses a custom callback to
//   acheive the same functionality.
exports.postlogin = function(req, res, next) {

  console.log("in here 2");

  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err) }
    if (!user) {
      req.session.messages =  [info.message];
      return res.redirect('/login')
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/account');
    });
  })(req, res, next);
};

exports.logout = function(req, res) {
  req.logout();
  res.redirect('/');
};
