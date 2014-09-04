//run with "real" option (node server.js real) to run app with production backend;
var useRealServer = process.argv[2] === "real";

var express = require('express');
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var request = require('request');
var httpProxy = require('http-proxy');

function beforeRequest(req, res, next) {
  if (req.path == '/api/users/login' || req.cookies && req.cookies.isAuthenticated === "true")
    next();
  else {
    res.sendfile(__dirname + '/app/landing-3/index.html');
  }
}

var secret = 'eyespend-secret';
var db = require('./db');
var app = express();


var ApiInjector = function apiInjector() {
  var injectStubApi = function injectStubApi(app) {
    app.use('/api/secure', expressJwt({
      secret: secret
    }));
    app.get('/api/secure/transactions', function(req, res) {
      console.log('calling /api/transactions');
      var offset = parseInt(req.query.offset);
      var count = parseInt(req.query.count);
      var desc = req.query.desc === "true";
      var withPhoto = req.query.withPhotoOnly === "true";
      var fromDate = parseInt(req.query.fromDate);
      var toDate = parseInt(req.query.toDate);
      var tags = [];

      if (req.query.tags) {
        tags = req.query.tags;
      }

      console.log('tags \n' + tags);
      console.log('fromDate ' + new Date(fromDate));
      console.log('toDate ' + new Date(toDate));
      console.log('withPhoto ' + withPhoto);

      var result = db.getTransactions(req.query.sorting, desc, offset, count, fromDate, toDate, tags, withPhoto);

      res.json({
        transactions: result,
        total: 15670
      });
    });

    //        app.get('/api/secure/transactionsExtended', function (req, res) {
    //            console.log('calling /api/secure/transactionsExtended');
    //            var count = parseInt(req.query.count);
    //            var result = db.getTransactions(null, null, null, count);
    //            res.json({transactions: result, totals: db.getTotals()});
    //        });

    app.get('/api/secure/getUserTags', function(req, res) {
      res.json(db.getUserTags());
    });

    app.get('/api/secure/settings', function(req, res) {
      if (req.user.email === 'qwe@gmail.com') {
        res.json(db.qweLinkStatus());
      } else {
        res.json(db.fooLinkStatus());
      }
    });

    app.get(['/activate', '/activateMobile', '/activateChange'], function(req, res) {
      res.sendfile(__dirname + '/app/activation-page/activation.html');
    });

    app.get('/api/secure/excelFileUrl', function(req, res) {
      console.log('/api/secure/excelFileUrl');
      console.log(req.query);
      res.send('files/transactions.xls');
    });

    app.put('/api/secure/transactions/:id', function(req, res) {
      console.log('user updated transaction' + JSON.stringify(req.body));
      res.json(req.body);
    });

    app.post('/api/secure/transactions', function(req, res) {
      console.log('user created transaction' + JSON.stringify(req.body));
      var newId = db.createId();
      var response = req.body;
      response.id = db.createId();
      res.send(response);
    });

    app.delete('/api/secure/transactions/:id', function(req, res) {
      console.log('user deleted transaction' + JSON.stringify(req.params));
      res.send(200);
    });

    app.post('/api/linkConfirm', function(req, res) {
      if (req.body.code && req.body.oneTimePassword && req.body.oneTimePassword.length > 5) {
        res.json({
          token: createTokenWithProfile('qwe@gmail.com')
        });
      } else {
        res.status(400).send({
          error: {
            code: "invalid_one_time_password",
            message: "Invalid one time password provided"
          }
        });
      }
    });

    app.post('/api/linkConfirmMobile', function(req, res) {
      if (!req.body.code) {
        res.status(400).send({
          error: {
            code: "invalid_code",
            message: "Invalid code provided"
          }
        });
        return;
      }

      if (!req.body.password || req.body.password.length < 5) {
        res.status(400).send({
          error: {
            code: "invalid_password",
            message: "Password is shorter than 5 symbols, or ..."
          }
        });
        return;
      }

      res.json({
        token: createTokenWithProfile('qwe@gmail.com')
      });
    });

    app.post('/api/users/login', function(req, res) {
      console.log('/api/users/login');
      if (validCredentials(req.body.auth_code_or_email, req.body.password)) {
        res.json({
          token: createTokenWithProfile(req.body.auth_code_or_email),
          userTags: db.getUserTags()
        });
      } else {
        console.log('Wrong user or password');
        res.send(401, 'Wrong user or password');
      }
    });

    app.post('/api/linkVerify', function(req, res) {
      if (req.body.code === '123') {
        res.json({
          email: "qwe@gmail.com"
        });
      } else {
        res.status(400).send({
          error: {
            code: "invalid_code",
            message: "Invalid code provided"
          }
        });
      }
    });

    app.get('/api/getTokenFromCode', function(req, res) {
      console.log('called /api/getTokenFromCode');
      console.log('code ' + req.query.code);
      var code = parseInt(req.query.code);
      if (code == 123456) {
        var token = createTokenWithProfile(req.query.code);
        res.json({
          token: token
        });
      } else {
        res.json({
          token: null
        });
      }

    });


    app.post('/api/secure/linkInit', function(req, res) {
      console.log('called /api/secure/linkInit');
      console.log('email: ' + req.body.email);
      console.log('password: ' + req.body.password);
      var linkStatus = null;
      if (req.user.email === 'qwe@gmail.com') {
        linkStatus = db.qweLinkStatus();
      } else {
        linkStatus = db.fooLinkStatus();
      }
      linkStatus.emailLink.address = req.body.email;
      linkStatus.emailLink.status = "linkPending";
      res.json(linkStatus);
    });

    app.post('/api/secure/emailChangeInit', function(req, res) {
      console.log('called /api/secure/changeEmailInit');
      res.send(201);
    });

    app.post('/api/emailChangeConfirm', function(req, res) {
      console.log('called /api/emailChangeConfirm');
      console.log(req.body);
      if (!req.body.code) {
        res.status(400).send({
          error: {
            code: "invalid_code",
            message: "Invalid code provided"
          }
        });
        return;
      }
      if (req.body.password !== 'bar') {
        res.status(400).send({
          error: {
            code: "invalid_password",
            message: "Password is invalid"
          }
        });
        return;
      }
      res.send(201);
    });

    app.post('/api/secure/changePassword', function(req, res) {
      console.log(req.body);
      if (req.body.oldPassword !== 'bar') {
        console.log('old password is not valid');
        res.status(400).send({
          error: {
            code: "invalid_old_password",
            message: "Invalid old password provided"
          }
        });
        return;
      }
      if (req.body.newPassword.length < 5) {
        console.log('new password is not valid');
        res.status(400).send({
          error: {
            code: "invalid_new_password",
            message: "New password is shorter than 5 symbols, or ..."
          }
        });
        return;
      }
      res.send(201);
    });

    app.get('/api/secure/transactionsForChart', function(req, res) {
      var data = db.getTransactionsForChart();
      res.json(
        data
      );
    });

    function createTokenWithProfile(codeOrEmail) {
      var profile = {
        first_name: 'Foo',
        last_name: 'Bar',
        email: codeOrEmail,
        id: 123
      };

      if (codeOrEmail === 'qwe@gmail.com' || codeOrEmail === '321') {
        profile.email = 'qwe@gmail.com';
      }

      return jwt.sign(profile, secret, {
        expiresInMinutes: 60
      });
    }

    function validCredentials(email, psw) {
      if (email === '123' || email === '321') {
        return true;
      }
      if (email === 'foo@gmail.com' && psw === 'bar' ||
        email === 'qwe@gmail.com' && psw === 'bar') {
        return true;
      }
      return false;
    }

    function userHasLinkedEmail(user) {
      return user.email === 'qwe@gmail.com';
    }
  };

  var injectRealApi = function injectRealApi(api) {
    var apiProxy = function apiProxy(pattern, host, port) {
      var proxy = new httpProxy.createProxyServer();

      return function apiProxyHandler(req, res, next) {
        if (req.url.match(pattern)) {
          req.url = '/webapi/1/' + req.url.split('/').slice(2).join('/'); // remove the '/api' part
          return proxy.proxyRequest(req, res, {
            target: 'http://127.0.0.1:9292'
          });
        } else {
          return next();
        }
      };
    };

    app.use(apiProxy(/\/api\/.*/, 'localhost', 9292));
  };

  return {
    injectRealApi: injectRealApi,
    injectStubApi: injectStubApi
  };
};

if (useRealServer) {
  (new ApiInjector()).injectRealApi(app);
  app.use(bodyParser());
} else {
  app.use(bodyParser());
  (new ApiInjector()).injectStubApi(app);
}

app.use(cookieParser());
app.use(express.static(__dirname + '/app', {
  maxAge: 86400000
}));
app.use(beforeRequest);
app.get('/', function(req, res) {
  res.sendfile(__dirname + '/app/index/index.html');
});

var port = process.env.PORT || 3000;
app.listen(port);

console.log('Express server started on port ' + port);
