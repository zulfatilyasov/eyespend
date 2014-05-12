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
    {"id": 1, "amountInBaseCurrency": 1644, "tags": ["продукты", "ресторан"], "timestamp": 1391265759, "latitude": 55.786657, "longitude": 49.12431},
    {"id": 2, "amountInBaseCurrency": 2013, "tags": ["ресторан", "наличные"], "timestamp": 1356104367, "latitude": 55.780805, "longitude": 49.21476},
    {"id": 3, "amountInBaseCurrency": 1801, "tags": ["коммунальные услуги", "ресторан"], "timestamp": 1339681816, "latitude": 48.858335, "longitude": 2.294599},
    {"id": 4, "amountInBaseCurrency": 1778, "tags": ["коммунальные услуги", "наличные"], "timestamp": 1334169482, "latitude": 40.759927, "longitude": -73.985217},
    {"id": 5, "amountInBaseCurrency": 2083, "tags": ["коммунальные услуги", "мвидео"], "timestamp": 1337107593, "latitude": 55.754069, "longitude": 37.620849},
    {"id": 6, "amountInBaseCurrency": 113, "tags": ["мвидео"], "timestamp": 1337846427, "latitude": 55.780805, "longitude": 49.21476},
    {"id": 7, "amountInBaseCurrency": 693, "tags": ["ресторан", "мвидео", "коммунальные услуги"], "timestamp": 1348262263, "latitude": 40.759927, "longitude": -73.985217},
    {"id": 8, "amountInBaseCurrency": 1901, "tags": ["аптека", "кафе", "коммунальные услуги"], "timestamp": 1390972370, "latitude": 55.780805, "longitude": 49.21476},
    {"id": 9, "amountInBaseCurrency": 2873, "tags": ["аэропорт", "банковская карта"], "timestamp": 1361971927, "latitude": 55.754069, "longitude": 37.620849},
    {"id": 10, "amountInBaseCurrency": 792, "tags": ["подарок", "мвидео"], "timestamp": 1330153028, "latitude": 55.780805, "longitude": 49.21476},
    {"id": 11, "amountInBaseCurrency": 1713, "tags": ["кафе"], "timestamp": 1355853300, "latitude": 55.786657, "longitude": 49.12431},
    {"id": 12, "amountInBaseCurrency": 1825, "tags": ["ресторан", "кафе", "аэропорт"], "timestamp": 1356973438, "latitude": 40.759927, "longitude": -73.985217},
    {"id": 13, "amountInBaseCurrency": 1733, "tags": ["мвидео", "кафе"], "timestamp": 1385742512, "latitude": 40.759927, "longitude": -73.985217},
    {"id": 14, "amountInBaseCurrency": 73, "tags": ["ресторан", "аэропорт", "кино"], "timestamp": 1367246287, "latitude": 48.858335, "longitude": 2.294599},
    {"id": 15, "amountInBaseCurrency": 2960, "tags": ["аэропорт"], "timestamp": 1395890253, "latitude": 40.759927, "longitude": -73.985217},
    {"id": 16, "amountInBaseCurrency": 1001, "tags": ["наличные"], "timestamp": 1362921516, "latitude": 55.786657, "longitude": 49.12431},
    {"id": 17, "amountInBaseCurrency": 2772, "tags": ["коммунальные услуги", "ресторан"], "timestamp": 1366669920, "latitude": 40.759927, "longitude": -73.985217},
    {"id": 18, "amountInBaseCurrency": 951, "tags": ["коммунальные услуги", "кафе"], "timestamp": 1327560289, "latitude": 55.754069, "longitude": 37.620849},
    {"id": 19, "amountInBaseCurrency": 848, "tags": ["наличные", "аэропорт", "подарок"], "timestamp": 1377247641, "latitude": 40.759927, "longitude": -73.985217},
    {"id": 20, "amountInBaseCurrency": 1321, "tags": ["продукты", "коммунальные услуги"], "timestamp": 1371510557, "latitude": 55.786657, "longitude": 49.12431},
    {"id": 21, "amountInBaseCurrency": 2009, "tags": ["заправка", "продукты", "банковская карта"], "timestamp": 1398650767, "latitude": 55.780805, "longitude": 49.21476},
    {"id": 22, "amountInBaseCurrency": 1886, "tags": ["аптека", "банковская карта"], "timestamp": 1371904397, "latitude": 55.780805, "longitude": 49.21476},
    {"id": 23, "amountInBaseCurrency": 1687, "tags": ["мвидео"], "timestamp": 1334148205, "latitude": 55.786657, "longitude": 49.12431}
];
