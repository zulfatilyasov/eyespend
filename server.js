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
    if (req.path == '/quickpass' || req.path == '/api/users/login' || req.cookies && req.cookies.token)
        next();
    else {
        res.sendfile(__dirname + '/app/landing.html');
    }
}

var secret = 'eyespend-secret';
var db = require('./db');
var app = express();


var ApiInjector = function apiInjector() {
    var injectStubApi = function injectStubApi(app) {
        app.use('/api/secure', expressJwt({secret: secret}));
        app.use(cookieParser());
        app.use(express.static(__dirname + '/app'));
        app.use(beforeRequest);
        app.get('/', function (req, res) {
            res.sendfile(__dirname + '/app/index/index.html');
        });

        app.get('/api/secure/transactions', function (req, res) {
            console.log('user ' + req.user.email + ' is calling /api/transactions');
            var offset = parseInt(req.query.offset);
            var count = parseInt(req.query.count);
            var desc = req.query.desc === "true";
            var withPhoto = req.query.withPhoto === "true";
            var fromDate = parseInt(req.query.fromDate);
            var toDate = parseInt(req.query.toDate);
            var tagsString = req.query.tags;
            var tags = tagsString.split(';');

            console.log('tags \n' + tags);
            console.log('fromDate ' + new Date(fromDate));
            console.log('toDate ' + new Date(toDate));
            console.log('withPhoto ' + withPhoto);

            var result = db.getTransactions(req.query.sorting, desc, offset, count, fromDate, toDate, tags, withPhoto);

            setTimeout(function () {
                res.json(result);
            }, 1500)
        });

        app.get('/api/secure/getUserTags', function (req, res) {
            res.json(db.getUserTags());
        });

        app.post('/api/secure/updateTransaction', function (req, res) {
            console.log('user updated transaction' + JSON.stringify(req.body.transaction));
            res.send(200);
        });
        app.post('/api/secure/createTransaction', function (req, res) {
            console.log('user created transaction' + JSON.stringify(req.body.transaction));
            res.send(db.createId());
        });
        app.post('/api/secure/deleteTransaction', function (req, res) {
            console.log('user deleted transaction' + JSON.stringify(req.body.id));
            res.send(200);
        });

        app.post('/api/users/login', function (req, res) {
            console.log('Authentication request');

            if (!(req.body.authCodeOrEmail === 'foo@gmail.com' && req.body.password === 'bar')) {
                console.log('Wrong user or password');
                res.send(401, 'Wrong user or password');
                return;
            }

            res.json({ token: createTokenWithProfile(), userTags: db.getUserTags() });
        });

        app.post('/api/user/linkEmailOrPhone', function (req, res) {
            console.log('email or phone: ' + req.body.emailOrPhone + ' psw: ' + req.body.currentPsw);
            if (req.body.currentPsw !== 'bar') {
                res.send(400, 'wrong password');
            }
            res.send(200);
        });

        app.post('/quickpass', function (req, res) {
            if (!(req.body.psw === '123')) {
                console.log('wrong disposable password');
                res.send(401, 'Wrong password');
                return;
            }
            res.json({ token: createTokenWithProfile(), userTags: db.getUserTags() });
        });

        app.post('/api/changePassword', function (req, res) {
            if (!req.body.psw || req.body.psw.length < 6) {
                console.log('new password is not valid');
                res.send(400, 'Wrong password');
                return;
            }
            console.log(req.body.psw);
            res.send(200);
        });

        function createTokenWithProfile() {
            var profile = {
                first_name: 'Foo',
                last_name: 'Bar',
                email: 'foobar@gmail.com',
                id: 123
            };

            return jwt.sign(profile, secret, { expiresInMinutes: 20 });
        }
    };

    var injectRealApi = function injectRealApi(api) {
        var apiProxy = function apiProxy(pattern, host, port) {
            var proxy = new httpProxy.createProxyServer();

            return function apiProxyHandler(req, res, next) {
                if (req.url.match(pattern)) {
                    req.url = '/webapi/1/' + req.url.split('/').slice(2).join('/'); // remove the '/api' part
                    return proxy.proxyRequest(req, res, { target: 'http://127.0.0.1:9292' });
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


var port = process.env.PORT || 3000;
app.listen(port);

console.log('Express server started on port ' + port);


