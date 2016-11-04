var express = require('express'),
    morgan = require('morgan'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    AuthController = require('./controllers/auth_controller');

var app = express();
var router = express.Router();

mongoose.connect('mongodb://localhost:testOauth/testOauth')


var protectedAction = function(req, res) {
  res.send("Here's some protected information!");
}


router.route('/facebook_auth')
  .post(AuthController.facebookAuth);
router.route('/protected')
  .get([AuthController.requireAuth, protectedAction]);

app.use(morgan('combined'));
app.use(bodyParser.json({type:'*/*'}));
app.use('/v1', router);

app.listen(3000, function(err) {
  if (err) { return console.log(err); }
  console.log("Listening on port 3000.");
});
