//run with "real" option (node server.js real) to run app with production backend;
var useRealServer = process.argv[2] === "real";

var express = require('express');
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
var request = require('request');
var httpProxy = require('http-proxy');
var secret = 'eyespend-secret';

var app = express();

app.use(express.static(__dirname + '/app'));

var ApiInjector = function apiInjector() {
    var injectStubApi = function injectStubApi(app) {
        app.use('/api/secure', expressJwt({secret: secret}));

        app.get('/api/secure/transactions', function (req, res) {
            console.log('user ' + req.user.email + ' is calling /api/transactions');
            res.json(transactions);
        });
        app.post('/api/secure/updateTransaction', function (req, res) {
            console.log('user updated transaction' + JSON.stringify(req.body.transaction));
            res.send(200);
        });
        app.post('/api/users/login', function (req, res) {
            console.log('Authentication request');

            if (!(req.body.authCodeOrEmail === 'foo@gmail.com' && req.body.password === 'bar')) {
                console.log('Wrong user or password');
                res.send(401, 'Wrong user or password');
                return;
            }

            res.json({ token: createTokenWithProfile() });
        });

        app.post('/quickpass', function (req, res) {
            if (!(req.body.psw === '123')) {
                console.log('wrong disposable password');
                res.send(401, 'Wrong password');
                return;
            }
            res.json({ token: createTokenWithProfile() });
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
    }

    var injectRealApi = function injectRealApi(api) {
        var apiProxy = function apiProxy(pattern, host, port) {
            var proxy = new httpProxy.createProxyServer();

            return function apiProxyHandler(req, res, next) {
                if (req.url.match(pattern)) {
                    req.url = '/' + req.url.split('/').slice(2).join('/'); // remove the '/api' part
                    return proxy.proxyRequest(req, res, { target: 'http://127.0.0.1:9292' });
                } else {
                    return next();
                }
            };
        };

        app.use(apiProxy(/\/api\/.*/, 'localhost', 9292));
    }

    return {
        injectRealApi: injectRealApi,
        injectStubApi: injectStubApi
    }
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

//@todo: generate those tnsxs randomly
var transactions = [
    {"id": 1, "amountInBaseCurrency": 2395, "tags": ["наличные"], "timestamp": 1397293599150, "latitude": 55.754069, "longitude": 37.620849},
    {"id": 2, "amountInBaseCurrency": 1090, "tags": ["банковская карта"], "timestamp": 1391650932445, "latitude": 55.786657, "longitude": 49.12431},
    {"id": 3, "amountInBaseCurrency": 1037, "tags": ["аэропорт"], "timestamp": 1393579556855, "latitude": 55.786657, "longitude": 49.12431},
    {"id": 4, "amountInBaseCurrency": 2552, "tags": ["аптека", "продукты"], "timestamp": 1378872015043, "latitude": 55.754069, "longitude": 37.620849},
    {"id": 5, "amountInBaseCurrency": 2655, "tags": ["аэропорт", "кино"], "timestamp": 1355617215484, "latitude": 48.858335, "longitude": 2.294599},
    {"id": 6, "amountInBaseCurrency": 2830, "tags": ["аптека"], "timestamp": 1350416717126, "latitude": 55.754069, "longitude": 37.620849},
    {"id": 7, "amountInBaseCurrency": 2385, "tags": ["коммунальные услуги", "аптека", "мвидео"], "timestamp": 1373493704133, "latitude": 55.786657, "longitude": 49.12431},
    {"id": 8, "amountInBaseCurrency": 1219, "tags": ["ресторан", "банковская карта"], "timestamp": 1347377140589, "latitude": 48.858335, "longitude": 2.294599},
    {"id": 9, "amountInBaseCurrency": 2504, "tags": ["аэропорт", "ресторан"], "timestamp": 1331547349424, "latitude": 55.754069, "longitude": 37.620849},
    {"id": 10, "amountInBaseCurrency": 784, "tags": [], "timestamp": 1341627098450, "latitude": 55.780805, "longitude": 49.21476},
    {"id": 11, "amountInBaseCurrency": 2170, "tags": [], "timestamp": 1374148231810, "latitude": 48.858335, "longitude": 2.294599},
    {"id": 12, "amountInBaseCurrency": 1185, "tags": ["кафе", "продукты", "ресторан"], "timestamp": 1346887971899, "latitude": 48.858335, "longitude": 2.294599},
    {"id": 13, "amountInBaseCurrency": 767, "tags": ["наличные", "мвидео", "банковская карта"], "timestamp": 1362973767757, "latitude": 55.780805, "longitude": 49.21476},
    {"id": 14, "amountInBaseCurrency": 869, "tags": ["подарок", "наличные"], "timestamp": 1366785947006, "latitude": 48.858335, "longitude": 2.294599},
    {"id": 15, "amountInBaseCurrency": 462, "tags": ["продукты"], "timestamp": 1344098727293, "latitude": 55.754069, "longitude": 37.620849},
    {"id": 16, "amountInBaseCurrency": 2226, "tags": ["ресторан"], "timestamp": 1376976392623, "latitude": 55.780805, "longitude": 49.21476},
    {"id": 17, "amountInBaseCurrency": 795, "tags": ["кино", "наличные"], "timestamp": 1376359801935, "latitude": 55.754069, "longitude": 37.620849},
    {"id": 18, "amountInBaseCurrency": 1861, "tags": ["ресторан", "коммунальные услуги", "заправка"], "timestamp": 1335053988508, "latitude": 40.759927, "longitude": -73.985217},
    {"id": 19, "amountInBaseCurrency": 986, "tags": ["кино", "ресторан"], "timestamp": 1338054873893, "latitude": 40.759927, "longitude": -73.985217},
    {"id": 20, "amountInBaseCurrency": 248, "tags": ["ресторан", "банковская карта", "аптека"], "timestamp": 1385975449202, "latitude": 55.786657, "longitude": 49.12431},
    {"id": 21, "amountInBaseCurrency": 706, "tags": ["кафе", "коммунальные услуги"], "timestamp": 1362796448458, "latitude": 55.754069, "longitude": 37.620849},
    {"id": 22, "amountInBaseCurrency": 637, "tags": ["заправка", "банковская карта"], "timestamp": 1363059864153, "latitude": 55.786657, "longitude": 49.12431}
];