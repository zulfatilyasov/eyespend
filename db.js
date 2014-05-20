var uuid = require('node-uuid');
var data = {
    tags: [ 'аптека',
        'ресторан',
        'кино',
        'кафе',
        'наличные',
        'банковская карта',
        'коммунальные услуги',
        'продукты',
        'мвидео',
        'подарок',
        'заправка',
        'аэропорт'],
    addresses: [
        {
            latitude: 48.858335,
            longitude: 2.294599
        },
        {
            latitude: 55.754069,
            longitude: 37.620849
        },
        {
            latitude: 55.780805,
            longitude: 49.214760
        },
        {
            latitude: 55.786657,
            longitude: 49.124310
        },
        {
            latitude: 40.759927,
            longitude: -73.985217
        }
    ]
};

function _randomDate(start, end) {
    return (start.getTime() + parseInt(Math.random() * (end.getTime() - start.getTime())));
}

function _distictTags(array) {
    array = array.filter(function (elem, pos1) {
        return array.every(function (t, pos2) {
            return pos1 == pos2 || t != elem;
        });
    });
    return array;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomTags() {
    var a = getRandomInt(0, data.tags.length);
    var b = getRandomInt(0, data.tags.length);
    if (b - a > 3)
        b = a + 3;
    if (a - b > 3)
        a = b + 3;
    return a < b ? data.tags.slice(a, b) : data.tags.slice(b, a);
}

function generateTransactions(count) {
    var transactions = [];
    for (var l = 0; l < count; l++) {
        var randomIndex = getRandomInt(0, data.addresses.length - 1);
        var imgUrl = getRandomInt(1, 10) < 4 ? "https://pp.vk.me/c606420/v606420215/32a9/t0nCYahM8Ro.jpg" : null;
        transactions.push({
            amountInBaseCurrency: getRandomInt(200, 3000),
            tags: getRandomTags(),
            timestamp: _randomDate(new Date(2012, 0, 1), new Date()),
            id: uuid.v1(),
            latitude: data.addresses[randomIndex].latitude,
            longitude: data.addresses[randomIndex].longitude,
            imgUrl: imgUrl
        });
    }
    return transactions;
}

function sortByDateDesc(a, b) {
    var d1 = parseInt(a.timestamp);
    var d2 = parseInt(b.timestamp);
    if (d1 > d2) {
        return -1;
    } else if (d1 < d2) {
        return 1;
    } else {
        return 0;
    }
}
function sortByDateAsc(a, b) {
    var d1 = parseInt(a.timestamp);
    var d2 = parseInt(b.timestamp);
    if (d1 > d2) {
        return 1;
    } else if (d1 < d2) {
        return -1;
    } else {
        return 0;
    }
}


var transactions = generateTransactions(100);
transactions = transactions.sort(sortByDateDesc);

function getTransactions(sorting, offset, count) {
    console.log('offset ' + offset);
    console.log('count ' + count);
    return transactions.slice(offset, offset + count);
}

function sortTransactions(column, descending, count, offset) {
    console.log('column ' + column);
    console.log('descending ' +  descending);
    console.log('count ' +  count);
    var result = transactions.slice(offset || 0, count || 30).sort(sortByDateDesc);
    if (column === 'timestamp' && !descending)
        result =  result.sort(sortByDateAsc);
    return result;
}

exports.getTransactions = getTransactions;
exports.sortTransactions = sortTransactions;