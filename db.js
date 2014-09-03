var uuid = require('node-uuid');
var fs = require('fs');
var data = {
  tags: [{
    text: 'аптека',
    sum: 2390
  }, {
    text: 'ресторан',
    sum: 3980
  }, {
    text: 'кино',
    sum: 1500
  }, {
    text: 'кафе',
    sum: 5200
  }, {
    text: 'наличные',
    sum: 16032
  }, {
    text: 'банковская карта',
    sum: 39023
  }, {
    text: 'коммунальные услуги',
    sum: 39400
  }, {
    text: 'продукты',
    sum: 3400
  }, {
    text: 'мвидео',
    sum: 4108
  }, {
    text: 'подарок',
    sum: 240
  }, {
    text: 'заправка',
    sum: 540
  }, {
    text: 'аэропорт',
    sum: 5450
  }],
  totals: {
    all: 45386,
    week: 1580,
    month: 8438
  },
  addresses: [{
    latitude: 48.858335,
    longitude: 2.294599
  }, {
    latitude: 55.754069,
    longitude: 37.620849
  }, {
    latitude: 55.780805,
    longitude: 49.214760
  }, {
    latitude: 55.786657,
    longitude: 49.124310
  }, {
    latitude: 40.759927,
    longitude: -73.985217
  }]
};

function _randomDate(start, end) {
  return (start.getTime() + parseInt(Math.random() * (end.getTime() - start.getTime())));
}

function getUserTags() {
  return data.tags;
}

function getTotals() {
  return data.totals;
}

function _distictTags(array) {
  array = array.filter(function(elem, pos1) {
    return array.every(function(t, pos2) {
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
      timestamp: _randomDate(new Date(2012, 0, 1), new Date()),
      id: uuid.v1(),
      latitude: data.addresses[randomIndex].latitude,
      longitude: data.addresses[randomIndex].longitude,
      imgUrl: getImage()
    });
  }

  fs.writeFile('transactions.json', JSON.stringify(transactions, null, 4), function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log("JSON saved to transactions.json");
    }
  });

  return transactions;
}

var sortByDateDesc = function(a, b) {
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

var sortByDateAsc = function(a, b) {
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

var sortByAmountDesc = function(a, b) {
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

var sortByAmountAsc = function(a, b) {
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

var sortByFotoDesc = function(d1, d2) {
  if (d1.imgUrl && !d2.imgUrl) {
    return 1;
  } else if (!d1.imgUrl && d2.imgUrl) {
    return -1;
  } else {
    return 0;
  }
};

var sortByFotoAsc = function(d1, d2) {
  if (d1.imgUrl && !d2.imgUrl) {
    return -1;
  } else if (!d1.imgUrl && d2.imgUrl) {
    return 1;
  } else {
    return 0;
  }
};

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

function getTransactionsByTags(tags, transactions) {
  if (tags.length === 0 || tags[0] === '') {
    return getTransactions('timestamp', true, 0, 30);
  }
  return transactions.filter(function(t) {
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

function getTransactionsWithPhoto(transactions) {
  return transactions.filter(function(t) {
    return !!t.imgUrl;
  });
}

function getTransactionsByDate(fromDate, toDate, transactions) {
  return transactions.filter(function(t) {
    return (!fromDate || t.timestamp >= fromDate) && (!toDate || t.timestamp <= toDate);
  });
}

function readJsonFile(filepath, encoding) {

  if (typeof(encoding) == 'undefined') {
    encoding = 'utf8';
  }
  var file = fs.readFileSync(filepath, encoding);
  return JSON.parse(file);
}

function getTransactions(sorting, desc, offset, count, fromDate, toDate, tags, withPhoto) {
  console.log('offset ' + offset + ' count ' + count + ' desc ' + desc + ' sorting ' + sorting);
  var transactions = readJsonFile('transactions.json');

  var sortFn = getSortFn(sorting, desc);
  var result = transactions.sort(sortFn);
  if ((fromDate || toDate))
    result = getTransactionsByDate(fromDate, toDate, result);
  if (tags && tags.length && tags[0] !== '')
    result = getTransactionsByTags(tags, result);
  if (withPhoto)
    result = getTransactionsWithPhoto(result);
  return result.slice(offset, offset + count);
}

function getTransactionsForChart() {
  var transactions = readJsonFile('transactions.json'),
    result = [];
  transactions = transactions.sort(sortByDateAsc);

  var curDate = new Date(transactions[0].timestamp),
    curDay = curDate.getDate(),
    curMonth = curDate.getMonth() + 1,
    curYear = curDate.getFullYear(),
    daySum = transactions[0].amountInBaseCurrency;
  daysCount = 0;
  for (var i = 0; i < transactions.length; i++) {
    var date = new Date(transactions[i].timestamp),
      day = date.getDate(),
      month = date.getMonth() + 1,
      year = date.getFullYear();

    if (day == curDay && month == curMonth && year == curYear) {
      daySum += transactions[i].amountInBaseCurrency;
      daysCount++;
    } else {
      result.push({
        // amountInBaseCurrency: Math.floor(daySum / daysCount),
        amountInBaseCurrency: daySum,
        timestamp: curDate.getTime()
      });
      curDate = date;
      curDay = day;
      curMonth = month;
      curYear = year;
      daySum = transactions[i].amountInBaseCurrency;
      daysCount = 0;
    };
  }

  return result;
}

function qweLinkStatus() {
  return {
    mobileLink: {
      code: 23143
    },
    emailLink: {
      status: "linked",
      address: "qwe@gmail.com"
    },
    emailChangeRequest: {
      status: "",
      address: ""
    }
  };
}

function fooLinkStatus() {
  return {
    mobileLink: {
      code: 23143
    },
    emailLink: {
      status: "free",
      address: null
    },
    emailChangeRequest: {
      status: "notChanging",
      address: null
    }
  };
}

exports.getTransactions = getTransactions;
exports.getTransactionsByDate = getTransactionsByDate;
exports.getTransactionsByTags = getTransactionsByTags;
exports.createId = createId;
exports.getUserTags = getUserTags;
exports.getTotals = getTotals;
exports.getTransactionsForChart = getTransactionsForChart;
exports.qweLinkStatus = qweLinkStatus;
exports.fooLinkStatus = fooLinkStatus;
