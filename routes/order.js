var db = require('../db/schema.js');

exports.create = function (req, res) {
  //res.render('orderCreate', {email:req.form.email, zip:req.form.zip});


  //console.log(req.form);

  var order = new db.orderModel({ 
	name: req.user.name,
	zip: req.user.zip,
	email: req.user.email,
	phone: req.user.phone,
	orderDate: Date.now(),
	metal: req.form.metal,
	band: req.form.band,
	stones: req.form.numberOfStones,
	size: req.form.size,
	carat: req.form.carat,
	color: req.form.color,
	cut: req.form.cut,
	clarity: req.form.clarity,
	comments: req.form.comments 
  })

  //console.log(order);

  order.save(function (err){
    if(err) {
      //console.log('error...')
      //console.log(err);
      res.render('orderCreate', {user: req.user, message:"Something Went Wrong again"});
      res.end();
  });

  //console.log('success');
  //console.log('saved order: ' + order.email);
  res.render('orderPlaced', {user: req.user, order: order} );
  res.end();
};


// // User schema
// var orderSchema = new Schema({
//   name: { type: String, required: true},
//   zip: { type: String, required: true},
//   email: { type: String, required: true},
//   phone: {type: String, reqired: true},
//   orderDate: {type: Date, required: true},
//   metal: {type: String, required: true},
//   band: {type: String, required: true},
//   stones: {type: String, required: true},
//   size: {type: String, required: true},
//   carat: {type: String, required: true},
//   color: {type: String, required: true},
//   cut: {type: String, required: true},
//   clarity: {type: String, required: true},
//   comments: {type: String}
// });

//   name: req.user.name,
//   zip: req.user.zip,
//   email: req.user.email,
//   phone: req.user.phone,
//   orderDate: Date.now(),
//   metal: req.form.metal,
//   band: req.form.band,
//   stones: req.form.numberOfStones,
//   size: req.form.size,
//   carat: req.form.carat,
//   color: req.form.color,
//   cut: req.form.cut,
//   clarity: req.form.clarity,
//   comments: req.form.comments