
/**
 * Module dependencies.
 */

var express = require('express')
  , mongoose = require('mongoose')
  , http = require('http')
  , path = require('path')

  , db = require('./db/schema')
  , seed = require('./db/seed.js')
  , pass = require('./config/pass')
  , passport = require('passport')
  , login_routes = require('./routes/login')
  , user_routes = require('./routes/user')

  , config = require('./config.js')
  , form = require("express-form")
  , engine = require('ejs-locals')
  , filter = form.filter
  , validate = form.validate

var app = express();



app.configure('development', function() {
  app.set('db-uri', 'mongodb://localhost/nodepad-development');
});





app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.set('db-uri', config.dev.dbUrl);
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));
  app.engine('ejs', engine);
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat' }));
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});


// 1. Get to the index
app.get('/', function (req, res) {
    res.render('index', {
      title: 'ptq'
    });
});

app.post( '/', // Route
  
  form( // Form filter and validation middleware
    filter("email").trim(),
    validate("email").required().isEmail(),
    filter("zip").trim(),
    validate("zip").required()
  ),
  
  // Express request-handler gets filtered and validated data
  function (req, res){
    if (!req.form.isValid) {
      // Handle errors
      console.log(req.form.errors);
      res.redirect('/');

    } else {
      // Or, use filtered form data from the form object:
      res.render('userCreate', {
        title: 'create user',
        email: req.form.email,
        zip: req.form.zip,
        tos: config.dev.tos
      })
    }
  }
);

app.get('/user/create', function (req, res){
  console.log(req);
  res.redirect('/login');
})

app.post('/user/create', 
  form(
    filter("name").trim(),
    validate("name").required(),
    filter("email").trim(),
    validate("email").required().isEmail(),
    filter("zip").trim(),
    validate("zip").required(),
    validate("password").required(),
    validate("confirm").equals("field::password"),
    filter("phone").trim(),
    validate("phone").required().isNumeric()
  ),

  function (req, res){
    if (!req.form.isValid) {

      console.log(req.form.errors);

      // Add flash messages maybe
      res.render('userCreate', {
        title: 'create user',
        email: req.form.email,
        zip: req.form.zip,
        tos: config.dev.tos
      });

    } else {
      console.log('About to create a user....');
      console.log(req.form);
      user_routes.create(req, res);
    }
  }
);

/*
app.get('order/create', function (req, res){
  res.render('/orderCreate', {
    ////////////////////////////////////////  
    // THIS IS WHERE WERE CURRENTLY AT
    ////////////////////////////////////////

    
  })
})
*/

app.get('/basics', function (req, res){
  res.render('basics', {});
})



//app.get('/', login_routes.index);
app.get('/account', pass.ensureAuthenticated, user_routes.account);
app.get('/login', user_routes.getlogin);
app.get('/admin', pass.ensureAuthenticated, pass.ensureAdmin(), user_routes.admin);
app.post('/login', user_routes.postlogin);
app.get('/logout', user_routes.logout);





//app.get('/user/', user.create);



app.get( '/public/*' , function(req, res, next) {
        var file = req.params[0]; 
        res.sendfile( __dirname + '/public/' + file );
})

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});