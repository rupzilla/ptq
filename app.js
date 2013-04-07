
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
  , order_routes = require('./routes/user')
  , fs = require('fs')
  , config = require('./config.js')
  , form = require("express-form")
  , engine = require('ejs-locals')
  , filter = form.filter
  , validate = form.validate
  , nodemailer = require('nodemailer');

var app = express();

var transport = nodemailer.createTransport("SMTP", {
    host: "smtp.sendgrid.net", // hostname
    port: 587, // port for secure SMTP
    auth: {
        user: "popthequestion",
        pass: "PoptheQuestion1"
    }
})

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
      title: 'ptq',
      user: req.user
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
      // console.log(req.form.errors);
      res.redirect('/');

    } else {
      // Or, use filtered form data from the form object:
      res.render('userCreate', {
        title: 'create user',
        email: req.form.email,
        zip: req.form.zip,
        tos: config.dev.tos,
        user: req.user
      })
    }
  }
);

app.get('/user/create', function (req, res){
  res.render('userCreate', {zip: " ", email: " ", tos: config.dev.tos, user: req.user});
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

      // console.log(req.form.errors);

      // Add flash messages maybe
      res.render('userCreate', {
        title: 'create user',
        email: req.form.email,
        zip: req.form.zip,
        tos: config.dev.tos,
        user: req.user
      });

    } else {
      console.log('About to create a user....');
      //console.log(req.form);
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
  res.render('basics', {user: req.user});
})


app.post('/order/create/option1', pass.ensureAuthenticated, 
  form(
    validate("metal").required(),
    validate("band").required(),
    validate("budget").required(),
    validate("numberOfStones").required().isNumeric(),
    validate("size").required(),
    validate("carat").required(),
    validate("color").required(),
    validate("cut").required(),
    validate("clarity").required(),
    filter("comments").trim()
  ),

  function (req, res){
    if (!req.form.isValid) {
      res.render('orderCreate', {user: req.user});
      res.end();
    } 
    else {

      var numberOfFiles = 0;
      for (file in req.files){
        var type = req.files[file].type.split('/');
        if (req.files[file].size !== 0 && 
          req.files[file].size <= 2000000 && 
          type[0] === 'image'){
          //console.log(file);
          var fileno = file.charAt(file.length - 1); console.log(fileno);

          var fileCallback = function (fileno) {
            return function (err, data) {
              var newPath = __dirname + '/public/images/rings/' + req.user._id + "_" + fileno +  '.' + type[1];
              console.log(newPath);
              fs.writeFile(newPath, data, function (err) {});
            }
          } 

          fs.readFile(req.files[file].path, fileCallback(fileno));
          numberOfFiles++;
        }
      }   
      var order = new db.orderModel({ 
        placedBy: req.user._id,
        orderDate: Date.now(),
        metal: req.form.metal,
        band: req.form.band,
        budget: req.form.budget,
        stones: req.form.numberOfStones,
        size: req.form.size,
        carat: req.form.carat,
        color: req.form.color,
        cut: req.form.cut,
        clarity: req.form.clarity,
        comments: req.form.comments ,
        files: numberOfFiles
      });

      order.save(function (err){
        if(err) {
          res.render('orderCreate', {user: req.user, message:"Something Went Wrong again"});
          res.end();
        } else {
          order.success = true;
          res.render('orderPlaced', {user: req.user, order: order} );
        }
      });
    }
  }
);

app.post('/order/create/option2', pass.ensureAuthenticated,

form(
    validate("budget").required(),
    filter("budget").trim(),
    validate("drivingDistance").required(),
    filter("email").trim(),
    validate("contactEmail").required().isEmail(),
    validate("message").required()
  ),

function (req, res){
    if (!req.form.isValid) {
      res.render('orderCreate', {user: req.user});
      res.end();
    } 
    else {

      var order = new db.orderModel({ 
        placedBy: req.user._id,
        orderDate: Date.now(),
        budget: req.form.budget
      });

      console.log(order);

      order.save(function (err){
        if(err) {
          res.render('orderCreate', {user: req.user, message:"Something Went Wrong again"});
          res.end();
        } else {
          order.success = true;
          res.render('orderPlaced2', {user: req.user, order: order} );
        }
      });




var mailOptions = {
    from: "mailer@popthequestion.us", // sender address
    to: req.form.contactEmail, // list of receivers
    subject: (req.user.name + " needs your help! - PoptheQuestion"), // Subject line
    text: "Hello world", // plaintext body
    html: "<a href=http://localhost:3000/order/" + order._id + '/help' + ">" +   "Click Me </a>" // html body
}

// send mail with defined transport object
transport.sendMail(mailOptions, function(error, response){
    if(error){
        console.log(error);
    } else {
        console.log("Message sent: " + response.message);
    }

    // if you don't want to use this transport object anymore, uncomment following line
    //smtpTransport.close(); // shut down the connection pool, no more messages
});






      // email.send({
      //   host: "smtp.sendgrid.net",
      //   port : 587,
      //   domain: "smtp.sendgrid.net",
      //   authentication: "login",
      //   username: 'popthequestion',
      //   password: 'PoptheQuestion1',
      //   to : req.form.contactEmail,
      //   from : "mailer@popthequestion.us",
      //   subject : (req.user.name + " Needs Your Help! - PopTheQuestion"),
      //   body : req.form.message
      // }, 
      // function (err, result){
      //   if(err){ console.log(err)}; 
      // });


    }
  }
)

app.get('/order/create', pass.ensureAuthenticated, function (req, res){
  res.render('orderCreate', {user: req.user});
});

app.get('/order/:id/help', function (req, res){
  console.log(req.params.id);

  db.orderModel.findOne({ _id: req.params.id }, function(err, order) {
    if (err) {return done(err);}
    if (!order) {return done(null, false, { message: 'Unknown order '});}
    else if (order){
      db.userModel.findOne({_id: order.placedBy}, function (err, user){
        if (err){return done(err);}
        if (!user){return done(null, false, {message: 'Unknown user '})}
        else if (user){
          res.render('orderHelp', {creator: user, order: order, user:req.user});
        }
      })
    }
  });
})

//app.get('/', login_routes.index);
app.get('/account', pass.ensureAuthenticated, user_routes.account);
app.get('/login', user_routes.getlogin);

app.get('/admin', pass.ensureAuthenticated, pass.ensureAdmin(), user_routes.admin);
app.get('/admin/orders', pass.ensureAuthenticated, pass.ensureAdmin(), user_routes.adminOrders);

app.post('/login', user_routes.postlogin);
app.get('/logout', user_routes.logout);


app.get( '/public/*' , function(req, res, next) {
        var file = req.params[0]; 
        res.sendfile( __dirname + '/public/' + file );
})

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
