(function () {
    'use strict';

    var serviceId = 'statsService';
    angular.module('app').factory(serviceId, ['datacontext', 'common', statsService]);

    function statsService(datacontext, common) {

        var transactions = null;
        function transactionsForChart() {
            var def = common.defer();

            datacontext.getTransactionsForChart()
                .success(function(data){
                    transactions=[];
                    for (var i = 0; i < data.length; i++) {
                        transactions.push({
                            value:data[i].amountInBaseCurrency,
                            x:new Date(data[i].timestamp)
                        }); 
                    }
                    def.resolve(transactions);
                })
                .error(function(){
                    def.reject();
                });

            return def.promise;
        }

        function changeDateRange(fromDate, toDate) {
            return transactions.filter(function(t) {
                var timestamp = t.x.getTime();
                return timestamp < toDate && timestamp > fromDate;
            });
        }

        return {
            transactionsForChart: transactionsForChart,
            changeDateRange : changeDateRange
        };
    }
})();

