var express = require('express');
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
var secret = 'eyespend-secret';

var app = express();
app.use(express.static(__dirname + '/app'));
app.use('/api', expressJwt({secret: secret}));
app.use(bodyParser());

app.get('/api/transactions', function (req, res) {
    console.log('user ' + req.user.email + ' is calling /api/transactions');
    res.json(transactions);
});

app.post('/authenticate', function (req, res) {
        //TODO validate req.body.username and req.body.password
        //if is invalid, return 401
        console.log(req.body);
        if (!(req.body.username === 'foo@gmail.com' && req.body.password === 'bar')) {
            res.send(401, 'Wrong user or password');
            return;
        }

        var profile = {
            first_name: 'Foo',
            last_name: 'Bar',
            email: 'foobar@gmail.com',
            id: 123
        };

        var token = jwt.sign(profile, secret, { expiresInMinutes: 60 * 5 });
        res.json({ token: token });
    });

var port = process.env.PORT || 3000;
app.listen(port);

console.log('Express server started on port ' + port);

//@todo: generate those tnsxs randomly
var transactions = [
    {"Id": 1, "Amount": 160, "tags": [
        {"text": "банковская карта"},
        {"text": "мвидео"}
    ], "Date": 1388838486907, "Address": {"lat": 40.759927, "lng": -73.985217}},
    {"Id": 2, "Amount": 1910, "tags": [
        {"text": "подарок"},
        {"text": "наличные"}
    ], "Date": 1340413090837, "Address": {"lat": 40.759927, "lng": -73.985217}},
    {"Id": 3, "Amount": 1096, "tags": [
        {"text": "аэропорт"}
    ], "Date": 1377997353075, "Address": {"lat": 55.780805, "lng": 49.21476}},
    {"Id": 4, "Amount": 1930, "tags": [
        {"text": "банковская карта"},
        {"text": "аэропорт"}
    ], "Date": 1366664397810, "Address": {"lat": 55.786657, "lng": 49.12431}},
    {"Id": 5, "Amount": 67, "tags": [
        {"text": "заправка"},
        {"text": "продукты"}
    ], "Date": 1332289900418, "Address": {"lat": 55.780805, "lng": 49.21476}},
    {"Id": 6, "Amount": 71, "tags": [
        {"text": "аэропорт"}
    ], "Date": 1382955861823, "Address": {"lat": 55.780805, "lng": 49.21476}},
    {"Id": 7, "Amount": 707, "tags": [
        {"text": "аптека"}
    ], "Date": 1394864658821, "Address": {"lat": 55.786657, "lng": 49.12431}},
    {"Id": 8, "Amount": 1912, "tags": [
        {"text": "наличные"},
        {"text": "мвидео"}
    ], "Date": 1336309752157, "Address": {"lat": 40.759927, "lng": -73.985217}},
    {"Id": 9, "Amount": 1707, "tags": [
        {"text": "кафе"}
    ], "Date": 1390406743715, "Address": {"lat": 40.759927, "lng": -73.985217}},
    {"Id": 10, "Amount": 1409, "tags": [
        {"text": "банковская карта"},
        {"text": "мвидео"}
    ], "Date": 1329786803509, "Address": {"lat": 55.786657, "lng": 49.12431}},
    {"Id": 11, "Amount": 571, "tags": [
        {"text": "мвидео"}
    ], "Date": 1328743876348, "Address": {"lat": 40.759927, "lng": -73.985217}},
    {"Id": 12, "Amount": 414, "tags": [
        {"text": "аптека"},
        {"text": "кафе"},
        {"text": "ресторан"}
    ], "Date": 1328995911261, "Address": {"lat": 55.754069, "lng": 37.620849}},
    {"Id": 13, "Amount": 132, "tags": [
        {"text": "банковская карта"},
        {"text": "заправка"}
    ], "Date": 1347323868931, "Address": {"lat": 40.759927, "lng": -73.985217}},
    {"Id": 14, "Amount": 2083, "tags": [
        {"text": "наличные"},
        {"text": "банковская карта"}
    ], "Date": 1368006882563, "Address": {"lat": 48.858335, "lng": 2.294599}},
    {"Id": 15, "Amount": 274, "tags": [
        {"text": "аптека"}
    ], "Date": 1332810050487, "Address": {"lat": 55.780805, "lng": 49.21476}},
    {"Id": 16, "Amount": 1518, "tags": [
        {"text": "банковская карта"}
    ], "Date": 1336619010774, "Address": {"lat": 48.858335, "lng": 2.294599}},
    {"Id": 17, "Amount": 1761, "tags": [
        {"text": "подарок"},
        {"text": "аптека"}
    ], "Date": 1351105448922, "Address": {"lat": 55.754069, "lng": 37.620849}},
    {"Id": 18, "Amount": 1831, "tags": [
        {"text": "ресторан"},
        {"text": "наличные"}
    ], "Date": 1344136783342, "Address": {"lat": 40.759927, "lng": -73.985217}},
    {"Id": 19, "Amount": 1495, "tags": [
        {"text": "кино"}
    ], "Date": 1391589913580, "Address": {"lat": 55.754069, "lng": 37.620849}},
    {"Id": 20, "Amount": 2751, "tags": [
        {"text": "аптека"},
        {"text": "аэропорт"},
        {"text": "кино"}
    ], "Date": 1344002430649, "Address": {"lat": 55.786657, "lng": 49.12431}},
    {"Id": 21, "Amount": 1231, "tags": [
        {"text": "продукты"}
    ], "Date": 1368165669555, "Address": {"lat": 55.754069, "lng": 37.620849}},
    {"Id": 22, "Amount": 1573, "tags": [
        {"text": "ресторан"},
        {"text": "аэропорт"}
    ], "Date": 1334639049206, "Address": {"lat": 55.754069, "lng": 37.620849}},
    {"Id": 23, "Amount": 327, "tags": [
        {"text": "аэропорт"},
        {"text": "подарок"},
        {"text": "аптека"}
    ], "Date": 1375882873476, "Address": {"lat": 55.780805, "lng": 49.21476}},
    {"Id": 24, "Amount": 2188, "tags": [
        {"text": "продукты"},
        {"text": "кино"}
    ], "Date": 1342851014904, "Address": {"lat": 55.786657, "lng": 49.12431}},
    {"Id": 25, "Amount": 2254, "tags": [
        {"text": "коммунальные услуги"},
        {"text": "продукты"}
    ], "Date": 1359916149340, "Address": {"lat": 40.759927, "lng": -73.985217}},
    {"Id": 26, "Amount": 1357, "tags": [
        {"text": "наличные"}
    ], "Date": 1330873490778, "Address": {"lat": 40.759927, "lng": -73.985217}},
    {"Id": 27, "Amount": 1376, "tags": [
        {"text": "кино"},
        {"text": "аэропорт"},
        {"text": "банковская карта"}
    ], "Date": 1397430000893, "Address": {"lat": 40.759927, "lng": -73.985217}},
    {"Id": 28, "Amount": 477, "tags": [
        {"text": "продукты"},
        {"text": "кафе"}
    ], "Date": 1398395296330, "Address": {"lat": 55.780805, "lng": 49.21476}},
    {"Id": 29, "Amount": 1933, "tags": [
        {"text": "продукты"},
        {"text": "банковская карта"},
        {"text": "подарок"}
    ], "Date": 1339160667636, "Address": {"lat": 55.780805, "lng": 49.21476}},
    {"Id": 30, "Amount": 1013, "tags": [
        {"text": "коммунальные услуги"},
        {"text": "ресторан"}
    ], "Date": 1378073793690, "Address": {"lat": 55.780805, "lng": 49.21476}},
    {"Id": 31, "Amount": 224, "tags": [
        {"text": "наличные"}
    ], "Date": 1362034515057, "Address": {"lat": 55.780805, "lng": 49.21476}},
    {"Id": 32, "Amount": 499, "tags": [
        {"text": "продукты"}
    ], "Date": 1348599607166, "Address": {"lat": 40.759927, "lng": -73.985217}},
    {"Id": 33, "Amount": 59, "tags": [
        {"text": "коммунальные услуги"},
        {"text": "кафе"}
    ], "Date": 1358925600377, "Address": {"lat": 55.754069, "lng": 37.620849}},
    {"Id": 34, "Amount": 809, "tags": [
        {"text": "подарок"},
        {"text": "банковская карта"},
        {"text": "наличные"}
    ], "Date": 1340844268924, "Address": {"lat": 55.754069, "lng": 37.620849}},
    {"Id": 35, "Amount": 672, "tags": [
        {"text": "наличные"},
        {"text": "продукты"},
        {"text": "кафе"}
    ], "Date": 1365456975322, "Address": {"lat": 55.780805, "lng": 49.21476}},
    {"Id": 36, "Amount": 1082, "tags": [], "Date": 1335107475313, "Address": {"lat": 48.858335, "lng": 2.294599}},
    {"Id": 37, "Amount": 2623, "tags": [
        {"text": "аптека"},
        {"text": "кино"}
    ], "Date": 1343441262975, "Address": {"lat": 55.780805, "lng": 49.21476}},
    {"Id": 38, "Amount": 1885, "tags": [
        {"text": "коммунальные услуги"},
        {"text": "продукты"}
    ], "Date": 1325883354145, "Address": {"lat": 55.786657, "lng": 49.12431}},
    {"Id": 39, "Amount": 2684, "tags": [
        {"text": "наличные"},
        {"text": "ресторан"}
    ], "Date": 1343439723783, "Address": {"lat": 48.858335, "lng": 2.294599}},
    {"Id": 40, "Amount": 1686, "tags": [
        {"text": "кафе"},
        {"text": "заправка"}
    ], "Date": 1374526611806, "Address": {"lat": 55.780805, "lng": 49.21476}},
    {"Id": 41, "Amount": 2348, "tags": [
        {"text": "ресторан"},
        {"text": "банковская карта"},
        {"text": "кафе"}
    ], "Date": 1385470308330, "Address": {"lat": 55.780805, "lng": 49.21476}},
    {"Id": 42, "Amount": 266, "tags": [
        {"text": "кафе"}
    ], "Date": 1371256930782, "Address": {"lat": 55.780805, "lng": 49.21476}},
    {"Id": 43, "Amount": 2357, "tags": [
        {"text": "банковская карта"},
        {"text": "мвидео"}
    ], "Date": 1383462714738, "Address": {"lat": 55.786657, "lng": 49.12431}},
    {"Id": 44, "Amount": 1220, "tags": [
        {"text": "продукты"},
        {"text": "заправка"}
    ], "Date": 1360427667465, "Address": {"lat": 48.858335, "lng": 2.294599}},
    {"Id": 45, "Amount": 1068, "tags": [], "Date": 1392251391840, "Address": {"lat": 55.754069, "lng": 37.620849}},
    {"Id": 46, "Amount": 282, "tags": [
        {"text": "наличные"},
        {"text": "ресторан"}
    ], "Date": 1370718221448, "Address": {"lat": 55.754069, "lng": 37.620849}},
    {"Id": 47, "Amount": 878, "tags": [
        {"text": "аптека"},
        {"text": "коммунальные услуги"}
    ], "Date": 1338446766441, "Address": {"lat": 55.754069, "lng": 37.620849}},
    {"Id": 48, "Amount": 1329, "tags": [
        {"text": "коммунальные услуги"},
        {"text": "аптека"},
        {"text": "кино"}
    ], "Date": 1335375883284, "Address": {"lat": 48.858335, "lng": 2.294599}},
    {"Id": 49, "Amount": 1501, "tags": [
        {"text": "банковская карта"}
    ], "Date": 1360927704430, "Address": {"lat": 48.858335, "lng": 2.294599}},
    {"Id": 50, "Amount": 2197, "tags": [
        {"text": "наличные"},
        {"text": "кафе"}
    ], "Date": 1353530270625, "Address": {"lat": 40.759927, "lng": -73.985217}},
    {"Id": 51, "Amount": 511, "tags": [
        {"text": "кино"}
    ], "Date": 1330916631566, "Address": {"lat": 55.780805, "lng": 49.21476}},
    {"Id": 52, "Amount": 2272, "tags": [
        {"text": "аэропорт"}
    ], "Date": 1396681436703, "Address": {"lat": 48.858335, "lng": 2.294599}},
    {"Id": 53, "Amount": 2563, "tags": [
        {"text": "кафе"},
        {"text": "аэропорт"}
    ], "Date": 1326750951852, "Address": {"lat": 40.759927, "lng": -73.985217}},
    {"Id": 54, "Amount": 2415, "tags": [
        {"text": "ресторан"},
        {"text": "продукты"}
    ], "Date": 1373931747125, "Address": {"lat": 40.759927, "lng": -73.985217}},
    {"Id": 55, "Amount": 1818, "tags": [
        {"text": "банковская карта"},
        {"text": "наличные"}
    ], "Date": 1378748481421, "Address": {"lat": 40.759927, "lng": -73.985217}},
    {"Id": 56, "Amount": 2137, "tags": [
        {"text": "ресторан"},
        {"text": "подарок"}
    ], "Date": 1371952808210, "Address": {"lat": 55.754069, "lng": 37.620849}},
    {"Id": 57, "Amount": 1882, "tags": [
        {"text": "ресторан"},
        {"text": "аптека"}
    ], "Date": 1359993705462, "Address": {"lat": 55.786657, "lng": 49.12431}},
    {"Id": 58, "Amount": 2833, "tags": [
        {"text": "аптека"},
        {"text": "продукты"},
        {"text": "кино"}
    ], "Date": 1343194951872, "Address": {"lat": 55.780805, "lng": 49.21476}},
    {"Id": 59, "Amount": 2166, "tags": [
        {"text": "ресторан"}
    ], "Date": 1335176779815, "Address": {"lat": 48.858335, "lng": 2.294599}},
    {"Id": 60, "Amount": 355, "tags": [
        {"text": "аэропорт"},
        {"text": "кафе"}
    ], "Date": 1398920442682, "Address": {"lat": 40.759927, "lng": -73.985217}},
    {"Id": 61, "Amount": 113, "tags": [
        {"text": "коммунальные услуги"},
        {"text": "кафе"}
    ], "Date": 1346829435349, "Address": {"lat": 40.759927, "lng": -73.985217}},
    {"Id": 62, "Amount": 1915, "tags": [
        {"text": "банковская карта"},
        {"text": "наличные"},
        {"text": "кафе"}
    ], "Date": 1398055802967, "Address": {"lat": 55.780805, "lng": 49.21476}},
    {"Id": 63, "Amount": 1484, "tags": [
        {"text": "продукты"},
        {"text": "подарок"}
    ], "Date": 1372897984338, "Address": {"lat": 55.780805, "lng": 49.21476}},
    {"Id": 64, "Amount": 1884, "tags": [
        {"text": "наличные"}
    ], "Date": 1372383260577, "Address": {"lat": 55.780805, "lng": 49.21476}},
    {"Id": 65, "Amount": 40, "tags": [
        {"text": "наличные"},
        {"text": "ресторан"}
    ], "Date": 1327382526041, "Address": {"lat": 40.759927, "lng": -73.985217}},
    {"Id": 66, "Amount": 413, "tags": [
        {"text": "мвидео"},
        {"text": "ресторан"}
    ], "Date": 1342279517407, "Address": {"lat": 55.786657, "lng": 49.12431}},
    {"Id": 67, "Amount": 1426, "tags": [
        {"text": "кино"}
    ], "Date": 1352869653230, "Address": {"lat": 55.754069, "lng": 37.620849}},
    {"Id": 68, "Amount": 1743, "tags": [
        {"text": "коммунальные услуги"}
    ], "Date": 1341952217720, "Address": {"lat": 55.786657, "lng": 49.12431}},
    {"Id": 69, "Amount": 754, "tags": [
        {"text": "аэропорт"},
        {"text": "кафе"}
    ], "Date": 1387444232248, "Address": {"lat": 55.780805, "lng": 49.21476}},
    {"Id": 70, "Amount": 1242, "tags": [
        {"text": "аэропорт"},
        {"text": "коммунальные услуги"}
    ], "Date": 1395056636070, "Address": {"lat": 48.858335, "lng": 2.294599}},
    {"Id": 71, "Amount": 1949, "tags": [
        {"text": "банковская карта"}
    ], "Date": 1364029886985, "Address": {"lat": 48.858335, "lng": 2.294599}}
];