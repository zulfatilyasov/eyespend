(function() {
  'use strict';

  var serviceId = 'statsService';
  angular.module('app').factory(serviceId, ['datacontext', 'common', statsService]);

  function statsService(datacontext, common) {

    var transactions = null;
    var reducedTransactions = [];

    function transactionsForChart() {
      var def = common.defer();

      datacontext.getTransactionsForChart()
        .success(function(data) {
          transactions = [];
          for (var i = 0; i < data.length; i++) {
            transactions.push({
              value: data[i].amountInBaseCurrency,
              x: new Date(data[i].timestamp)
            });
          }
          def.resolve(transactions);
        })
        .error(function() {
          def.reject();
        });

      return def.promise;
    }

    function changeDateRange(fromDate, toDate) {
      var source = reducedTransactions.length ? reducedTransactions : transactions;
      return source.filter(function(t) {
        var timestamp = t.x.getTime();
        return timestamp <= toDate && timestamp >= fromDate;
      });
    }

    function minDate() {
      var first = transactions[0];
      return first.x.getTime();
    }

    function maxDate() {
      var last = transactions[transactions.length - 1];
      return last.x.getTime();
    }

    function reducePoints(days) {
      reducedTransactions = [];
      if (days == 1) {
        return transactions;
      }

      var sum = 0;
      for (var i = 0; i < transactions.length; i++) {
        sum += transactions[i].value;
        if (i > 0 && i % days === 0) {
          reducedTransactions.push({
            value: Math.floor(sum / days),
            x: transactions[i - days].x
          });
          sum = 0;
        }
      }
      var leftDays = transactions.length % days;
      if (leftDays > 0) {
        reducedTransactions.push({
          value: Math.floor(sum / leftDays),
          x: transactions[transactions.length - 1].x
        });
      }
      return reducedTransactions;

    }

    return {
      transactionsForChart: transactionsForChart,
      changeDateRange: changeDateRange,
      minDate: minDate,
      maxDate: maxDate,
      reducePoints: reducePoints
    };
  }
})();
