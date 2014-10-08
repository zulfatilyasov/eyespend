(function() {
    'use strict';

    var serviceId = 'stats.service';
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
                            x: new Date(data[i].date)
                        });
                    }
                    def.resolve(transactions);
                })
                .error(function() {
                    def.reject();
                });

            return def.promise;
        }

        function changeDateRange(fromDate, toDate, interval) {
            var source = interval === 'day' ? transactions : reducedTransactions;
            if (!fromDate && !toDate)
                return source;
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

        Date.prototype.addDays = function(days) {
            var dat = new Date(this.valueOf());
            dat.setDate(dat.getDate() + days);
            return dat;
        };

        Date.prototype.getMonday = function() {
            var d = new Date(this.valueOf());
            var day = d.getDay(),
                diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
            return new Date(d.setDate(diff));
        };

        Date.prototype.getFirstDayOfMonth = function() {
            var date = new Date(this.valueOf()),
                y = date.getFullYear(),
                m = date.getMonth();
            return new Date(y, m, 1);
        };

        Date.prototype.getLastDayOfMonth = function() {
            var date = new Date(this.valueOf()),
                y = date.getFullYear(),
                m = date.getMonth();
            return new Date(y, m + 1, 0);
        };

        Date.prototype.getNextDate = function(interval) {
            var curDate = new Date(this.valueOf());
            if (interval === 'week')
                return curDate.addDays(6);
            if (interval === 'month')
                return curDate.getLastDayOfMonth();
        };

        function sumOnInterval(fromDate, toDate) {
            var intervalSum = 0;
            for (var i = 0; i < transactions.length; i++) {
                if (transactions[i].x <= toDate && transactions[i].x >= fromDate) {
                    intervalSum += transactions[i].value;
                }
            }
            return intervalSum;
        }

        function reducePoints(interval) {
            if (!interval || interval === 'day') {
                return transactions;
            }
            reducedTransactions = [];
            var minDateUnix = minDate();
            var maxDateUnix = maxDate();
            var minD = new Date(minDateUnix);
            var curDate = interval === 'week' ? minD.getMonday() : minD.getFirstDayOfMonth();
            var curDateUnix = curDate.getTime();

            for (var i = 0; curDateUnix < maxDateUnix; i++) {
                var nextDate = curDate.getNextDate(interval);
                var intervalSum = sumOnInterval(curDateUnix, nextDate.getTime());
                reducedTransactions.push({
                    value: Math.floor(intervalSum),
                    x: new Date(curDateUnix)
                });
                curDate = nextDate.addDays(1);
                curDateUnix = curDate.getTime();
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
