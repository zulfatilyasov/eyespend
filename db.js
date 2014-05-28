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
function getUserTags() {
    return data.tags;
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

function getImage() {
    var randomInt = getRandomInt(1, 10);
    if (randomInt < 3)
        return "https://pp.vk.me/c312918/v312918215/13d1/ZPMJ-haAVKs.jpg";
    if (randomInt > 7)
        return "https://pp.vk.me/c606420/v606420215/32a9/t0nCYahM8Ro.jpg";
    return null;
}

function generateTransactions(count) {
    var transactions = [];
    for (var l = 0; l < count; l++) {
        var randomIndex = getRandomInt(0, data.addresses.length - 1);
        transactions.push({
            amountInBaseCurrency: getRandomInt(200, 3000),
            tags: getRandomTags(),
            timestamp: _randomDate(new Date(2012, 0, 1), new Date(2014, 10, 10)),
            id: uuid.v1(),
            latitude: data.addresses[randomIndex].latitude,
            longitude: data.addresses[randomIndex].longitude,
            imgUrl: getImage()
        });
    }
    return transactions;
}

var sortByDateDesc = function (a, b) {
    var d1 = parseInt(a.timestamp);
    var d2 = parseInt(b.timestamp);
    if (d1 > d2) {
        return -1;
    } else if (d1 < d2) {
        return 1;
    } else {
        return 0;
    }
};

var sortByDateAsc = function (a, b) {
    var d1 = parseInt(a.timestamp);
    var d2 = parseInt(b.timestamp);
    if (d1 > d2) {
        return 1;
    } else if (d1 < d2) {
        return -1;
    } else {
        return 0;
    }
};

var sortByAmountDesc = function (a, b) {
    var d1 = parseInt(a.amountInBaseCurrency);
    var d2 = parseInt(b.amountInBaseCurrency);
    if (d1 > d2) {
        return 1;
    } else if (d1 < d2) {
        return -1;
    } else {
        return 0;
    }
};

var sortByAmountAsc = function (a, b) {
    var d1 = parseInt(a.amountInBaseCurrency);
    var d2 = parseInt(b.amountInBaseCurrency);
    if (d1 > d2) {
        return -1;
    } else if (d1 < d2) {
        return 1;
    } else {
        return 0;
    }
};

var sortByFotoDesc = function (d1, d2) {
    if (d1.imgUrl && !d2.imgUrl) {
        return 1;
    } else if (!d1.imgUrl && d2.imgUrl) {
        return -1;
    } else {
        return 0;
    }
};

var sortByFotoAsc = function (d1, d2) {
    if (d1.imgUrl && !d2.imgUrl) {
        return -1;
    } else if (!d1.imgUrl && d2.imgUrl) {
        return 1;
    } else {
        return 0;
    }
};


var transactions = generateTransactions(1000);
transactions = transactions.sort(sortByDateDesc);

function getSortFn(sorting, desc) {
    var fn = sortByDateDesc;
    if (sorting === 'timestamp' && !desc)
        fn = sortByDateAsc;
    if (sorting === 'amountInBaseCurrency' && desc)
        fn = sortByAmountAsc;
    if (sorting === 'amountInBaseCurrency' && !desc)
        fn = sortByAmountDesc;
    if (sorting === 'foto' && desc)
        fn = sortByFotoAsc;
    if (sorting === 'foto' && !desc)
        fn = sortByFotoDesc;
    return fn;
}
function createId() {
    return uuid.v1();
}

function getTransactionsByTags(tags, collection) {
    if (tags.length === 0 || tags[0] === '') {
        return getTransactions('timestamp', true, 0, 30);
    }
    var target = collection || transactions;
    return target.filter(function (t) {
        for (var i = 0; i < tags.length; i++) {
            var tagFound = false;
            for (var j = 0; j < t.tags.length && !tagFound; j++) {
                tagFound = t.tags[j] === tags[i];
            }
            if (!tagFound)
                return false;
        }
        return true;
    });
}

function getTransactionsByDate(fromDate, toDate, collection) {
    var target = collection || transactions;
    return target.filter(function (t) {
        return (!fromDate || t.timestamp >= fromDate) && (!toDate || t.timestamp <= toDate);
    });
}

function getTransactions(sorting, desc, offset, count, fromDate, toDate, tags) {
    console.log('offset ' + offset + ' count ' + count + ' desc ' + desc + ' sorting ' + sorting);

    var sortFn = getSortFn(sorting, desc);
    var result = transactions.sort(sortFn);
    if (fromDate || toDate)
        result = getTransactionsByDate(fromDate, toDate, result);
    if (tags && tags.length && tags[0] !== '')
        result = getTransactionsByTags(tags, result);
    return result.slice(offset, offset + count);
}

exports.getTransactions = getTransactions;
exports.getTransactionsByDate = getTransactionsByDate;
exports.getTransactionsByTags = getTransactionsByTags;
exports.createId = createId;
exports.getUserTags = getUserTags;