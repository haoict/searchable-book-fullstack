var express = require('express');
var router = express.Router();
var logger = require('../helpers/logging.helper');
var config = require('../config/main');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var User = require('../models/User');
var verifyAuthToken = require('../helpers/verifyAuthToken');
var verifyApiAccessToken = require('../helpers/verifyApiAccessToken');
var request = require('request');
var constants = require('../config/constants');

module.exports = router;

// Handle json body request
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

/**
 *  Routes
 **/
router.post('/register', verifyApiAccessToken, function(req, res) {
  if (!req.body || !req.body.name || !req.body.email || !req.body.password) {
    return res.status(400).send({ result: false, message: 'Name and email and password must not empty' });
  }
  if (req.body.password.length < 6) {
    return res.status(400).send({ result: false, message: 'Password does not follow password policy' });
  }
  User.findOne({ email: req.body.email }, function(err, user) {
    if (err) {
      logger.log('error', '[%s] DB Error: %s', req.originalUrl, err.message);
      return res.status(500).send({ result: false, message: constants.STR_SERVER_ERROR });
    }
    if (user) {
      logger.log('info', '[%s] Email already exists: %s', req.originalUrl, user.email);
      return res.send({ result: false, message: 'Email already exists' });
    }
    var hashedPassword = bcrypt.hashSync(req.body.password, 8);
    User.create(
      {
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        level: constants.USER_LEVEL_BASIC,
        enable: true,
        create_time: new Date(),
        update_time: new Date()
      },
      function(err, user) {
        if (err) {
          logger.log('error', '[%s] DB Error: %s', req.originalUrl, err.message);
          if (err.name === 'ValidationError') {
            return res.status(500).send({ result: false, message: 'Incorrect email format' });
          }
          return res.status(500).send({ result: false, message: constants.STR_SERVER_ERROR });
        }
        // create token
        var token = jwt.sign({ email: user.email }, config.app.secret, {
          expiresIn: config.app.jwtExpireTime
        });
        res.status(200).send({ result: true, token: token });
      }
    );
  });
});

router.post('/login', verifyApiAccessToken, function(req, res) {
  if (!req.body || !req.body.email || !req.body.password) return res.status(401).send({ result: false, token: null });
  User.findOne({ email: req.body.email, enable: true }, function(err, user) {
    if (err) {
      logger.log('error', '[%s] DB Error: %s', req.originalUrl, err.message);
      return res.status(500).send({ result: false, message: constants.STR_SERVER_ERROR });
    }
    if (!user) {
      logger.log('info', '[%s] User not found: %s', req.originalUrl, req.body.email);
      return res.status(500).send({ result: false, message: 'User not found' });
    }
    if (!user.password) {
      logger.log(
        'info',
        '[%s] This user has logged in by Facebook before, please login with facebook',
        req.originalUrl
      );
      return res.status(401).send({
        result: false,
        message: 'This user has logged in by Facebook before, please login with facebook'
      });
    }
    var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    if (!passwordIsValid) {
      logger.log('info', '[%s] Incorrect password: %s', req.originalUrl, req.body.email);
      return res.status(401).send({ result: false, message: 'Incorrect password', token: null });
    }
    var token = jwt.sign({ email: user.email }, config.app.secret, {
      expiresIn: config.app.jwtExpireTime
    });
    res.status(200).send({ result: true, token: token });
  });
});

router.get('/logout', verifyApiAccessToken, function(req, res) {
  res.status(200).send({ result: true, token: null });
});

router.post('/changepassword', verifyAuthToken, function(req, res) {
  if (!req.body || !req.body.email || !req.body.newPassword) {
    return res.status(400).send({ result: false, message: 'New password must not empty' });
  }
  if (req.userEmail !== req.body.email) {
    return res.status(400).send({ result: false, message: 'x-access-token and email not match' });
  }
  if (req.body.newPassword.length < 6) {
    return res.status(400).send({ result: false, message: 'New password does not follow password policy' });
  }
  User.findOne({ email: req.body.email, enable: true }, function(err, user) {
    if (err) {
      logger.log('error', '[%s] DB Error: %s', req.originalUrl, err.message);
      return res.status(500).send({ result: false, message: constants.STR_SERVER_ERROR });
    }
    if (!user) {
      logger.log('info', '[%s] User not found: %s', req.originalUrl, req.body.email);
      return res.status(500).send({ result: false, message: 'User not found' });
    }
    if (user.password) {
      if (!req.body.currentPassword) {
        return res.status(400).send({ result: false, message: 'Current password must not empty' });
      }
      var passwordIsValid = bcrypt.compareSync(req.body.currentPassword, user.password);
      if (!passwordIsValid) {
        logger.log('info', '[%s] Incorrect current password: %s', req.originalUrl, req.body.email);
        return res.send({ result: false, message: 'Incorrect current password', token: null });
      }
    }
    var hashedPassword = bcrypt.hashSync(req.body.newPassword, 8);
    user.password = hashedPassword;
    user
      .save()
      .then(result => {})
      .catch(function(err) {
        logger.log('error', '[%s] DB Error: %s', req.originalUrl, err.message);
        return res.send({ result: false, message: 'Server Error' });
      });
    var token = jwt.sign({ email: user.email }, config.app.secret, {
      expiresIn: config.app.jwtExpireTime
    });
    res.status(200).send({ result: true, token: token });
  });
});

router.get('/me', verifyAuthToken, function(req, res) {
  User.findOne({ email: req.userEmail, enable: true }, { 'facebook.token': 0 }, function(err, user) {
    if (err) {
      logger.log('error', '[%s] DB Error: %s', req.originalUrl, err.message);
      return res.status(500).send({ result: false, message: constants.STR_SERVER_ERROR });
    }
    if (!user) {
      logger.log('info', '[%s] User not found: %s', req.originalUrl, req.body.email);
      return res.status(404).send({ result: false, message: 'User not found' });
    }
    let resUser = JSON.parse(JSON.stringify(user));
    if (user.password) {
      resUser.hasPassword = true;
      delete resUser.password;
    }
    res.status(200).send({ result: true, data: resUser });
  });
});

router.get('/checkemail', verifyApiAccessToken, function(req, res) {
  var q = req.query.q;
  if (!q) return res.send({ result: false, message: 'Empty query string' });
  User.findOne({ email: q, enable: true }, function(err, user) {
    if (err) {
      logger.log('error', '[%s] DB Error: %s', req.originalUrl, err.message);
      return res.status(500).send({ result: false, message: constants.STR_SERVER_ERROR });
    }
    if (!user) return res.send({ result: true, emailExists: false });
    return res.send({ result: true, emailExists: true });
  });
});

router.post('/facebook', verifyApiAccessToken, function(req, res) {
  User.findOne({ email: req.body.email, enable: true }, function(err, user) {
    if (err) {
      logger.log('error', '[%s] DB Error: %s', req.originalUrl, err.message);
      return res.status(500).send({ result: false, message: constants.STR_SERVER_ERROR });
    }
    if (user) {
      // already logged in before, now verify x-access-token
      request.get(constants.FB_GRAPH_API_URL + req.body.token, function(err1, res1, body1) {
        if (!err1 && res1.statusCode == 200) {
          var fbGraphRes = JSON.parse(body1);
          if (fbGraphRes.id) {
            if (fbGraphRes.id === req.body.id) {
              // save new data to db
              user.name = req.body.name;
              user.facebook.id = req.body.id;
              user.facebook.token = req.body.token;
              user.save(function(err) {
                if (err) {
                  logger.log('error', '[%s] DB Error: %s', req.originalUrl, err.message);
                }
              });
              // send token
              var token = jwt.sign({ email: user.email }, config.app.secret, {
                expiresIn: config.app.jwtExpireTime
              });
              return res.status(200).send({ result: true, token: token });
            } else {
              logger.log('info', '[%s] FB Graph API Error: %s', req.originalUrl, 'facebook user id is not match');
              return res.status(401).send({ result: false, message: 'Can not verify Facebook Access Token' });
            }
          }
        }
        logger.log('error', '[%s] FB Graph API Error. Status code: %s', req.originalUrl, res1.statusCode);
        return res.status(401).send({ result: false, message: 'Can not verify Facebook Access Token' });
      });
    } else {
      User.create(
        {
          name: req.body.name,
          email: req.body.email,
          facebook: {
            id: req.body.id,
            token: req.body.token
          },
          level: constants.USER_LEVEL_BASIC,
          enable: true,
          create_time: new Date(),
          update_time: new Date()
        },
        function(err, user) {
          if (err) {
            logger.log('error', '[%s] DB Error: %s', req.originalUrl, err.message);
            return res.status(500).send({ result: false, message: constants.STR_SERVER_ERROR });
          }
          // create token
          var token = jwt.sign({ email: user.email }, config.app.secret, {
            expiresIn: config.app.jwtExpireTime
          });
          res.status(200).send({ result: true, token: token });
        }
      );
    }
  });
});
