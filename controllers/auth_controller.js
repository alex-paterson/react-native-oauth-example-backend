var jwt = require('jwt-simple'),
    User = require('../model/user'),
    axios = require('axios'),
    SECRET = require('../config').SECRET;

function tokenForUser (user) {
  var obj = {
    sub: user._id,
    iat: new Date().getTime()
  };
  return jwt.encode(obj, SECRET);
}

exports.requireAuth = function(req, res, next) {
  var authHeader = req.get('Authorization');
  var jwtToken = jwt.decode(authHeader, SECRET);
  var user_id = jwtToken.sub;
  User.findById(user_id, function(err, user) {
    if (err) { return next(err); }
    if (!user) { return next(new Error("User not found.")); }
    req.user = user;
    next();
  });
}

exports.facebookAuth = function(req, res, next) {
  var token = req.body.token;
  axios.get(`https://graph.facebook.com/v2.8/me?fields=id,name,email&access_token=${token}`).then(function (response) {
    var facebook_id = response.data.id;
    var name = response.data.name;
    var email = response.data.email;
    User.find({facebook_id: response.data.id}, function(err, users) {
      user = users[0];
      if (err) { return next(err); }
      if (!user) {
        var user = new User({
          facebook_id: facebook_id,
          email: email,
          name: name
        });
        user.save(function(err) {
          if (err) { return next(err); }
          res.json({token: tokenForUser(user)});
        });
      } else {
        res.json({token: tokenForUser(user)});
      }
    });
  }).catch(function(error) {
    return next(error);
  });
}
