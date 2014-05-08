(function() {
    'use strict';

    var serviceId = 'modelStub';

    angular.module('app').factory(serviceId, ['common', 'mockJson', modelStub]);

    function modelStub(common, mockJson) {
        var getLogFn = common.logger.getLogFn;
        var logSuccess = getLogFn(serviceId, 'success');

        mockJson.data.TAG = [
            'аптека',
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
            'аэропорт'
        ]; 
        var addresses = [{
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
        }];

        mockJson.data.DATE = [
            '1397750204',
            '1397753804',
            '1397836604',
            '1398355004',
            '1400342204',
            '1429286204'
        ];

        var service = {
            generateTransactions: generateTransactions
        };

        function _randomDate(start, end) {
            return (start.getTime() + parseInt(Math.random() * (end.getTime() - start.getTime())));
        }

        function _distictTags(array) {
            array = array.filter(function(elem, pos1) {
                return array.every(function(t, pos2) {
                        return pos1 == pos2 || t != elem;
                });
            });
            return array;
        }

        function _populateProperties(transactions) {
            for (var i = 0; i < transactions.length; i++) {
                transactions[i].tags = _distictTags(transactions[i].tags);
                transactions[i].timestamp = _randomDate(new Date(2012, 0, 1), new Date());
                transactions[i].id = i + 1;
                var randomIndex = Math.floor((Math.random() * addresses.length));
                transactions[i].latitude = addresses[randomIndex].latitude;
                transactions[i].longitude = addresses[randomIndex].longitude;
            }
            return transactions;
        }

        function generateTransactions() {
            var transactions = mockJson.generateFromTemplate({
                "transactions|10-100": [{
                    "id": 0,
                    "amountInBaseCurrency|30-3000": 250,
                    "tags|1-3": ["@TAG"],
                    "timestamp": null
                }]
            }).transactions;
            transactions = _populateProperties(transactions);
            logSuccess("generated " + transactions.length + " fake transactions ", JSON.stringify(transactions), true);
            return transactions;
        }

        return service;
    }
})();
