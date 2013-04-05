var mongoose = require('mongoose'),
	bcrypt = require('bcrypt'),
	SALT_WORK_FACTOR = 10;
exports.mongoose = mongoose;

// Database connect
var uristring = 
  process.env.MONGOLAB_URI || 
  process.env.MONGOHQ_URL || 
  'mongodb://localhost/test';

var mongoOptions = { db: { safe: true }};

mongoose.connect(uristring, mongoOptions, function (err, res) {
  if (err) { 
    console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
    console.log ('Successfully connected to: ' + uristring);
  }
});


//******* Database schema TODO add more validation
var Schema = mongoose.Schema, 
	ObjectId = Schema.ObjectId;

// User schema
var userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true},
  password: { type: String, required: true},
  admin: { type: Boolean, required: true },
  zip: {type: String, required: true},
  phone: {type: String, reqired: true},
  reg_date: {type: Date, required: true}
});

userSchema.index({email: 1});




// Bcrypt middleware
userSchema.pre('save', function(next) {
	var user = this;

	if(!user.isModified('password')) return next();

	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
		if(err) return next(err);

		bcrypt.hash(user.password, salt, function(err, hash) {
			if(err) return next(err);
			user.password = hash;
			next();
		});
	});
});






// User schema
var orderSchema = new Schema({
  placedBy: { type: String, ref: 'User', required:true },
  orderDate: {type: Date, required: true},
  metal: {type: String, required: true},
  band: {type: String, required: true},
  budget: {type: String, required: true},
  stones: {type: String, required: true},
  size: {type: String, required: true},
  carat: {type: String, required: true},
  color: {type: String, required: true},
  cut: {type: String, required: true},
  clarity: {type: String, required: true},
  comments: {type: String}
});


// Password verification
userSchema.methods.comparePassword = function(candidatePassword, cb) {
	bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
		if(err) return cb(err);
		cb(null, isMatch);
	});
};

// Export user model
var userModel = mongoose.model('User', userSchema);
exports.userModel = userModel;

var orderModel = mongoose.model('Order', orderSchema);
exports.orderModel = orderModel;

// userModel.remove({}, function(err) { 
//    console.log('collection removed') 
// });

orderModel.remove({}, function(err) { 
   console.log('collection removed') 
});
