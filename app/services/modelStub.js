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
            lat: 48.858335,
            lng: 2.294599
        }, {
            lat: 55.754069,
            lng: 37.620849
        }, {
            lat: 55.780805,
            lng: 49.214760
        }, {
            lat: 55.786657,
            lng: 49.124310
        }, {
            lat: 40.759927,
            lng: -73.985217
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
                        return pos1 == pos2 || t.text != elem.text;
                });
            });
            return array;
        }

        function _populateProperties(transactions) {
            for (var i = 0; i < transactions.length; i++) {
                transactions[i].tags = _distictTags(transactions[i].tags);
                transactions[i].Date = _randomDate(new Date(2012, 0, 1), new Date());
                transactions[i].Id = i + 1;
                var randomIndex = Math.floor((Math.random() * addresses.length));
                transactions[i].Address = addresses[randomIndex];
            }
            return transactions;
        }

        function generateTransactions() {
            var transactions = mockJson.generateFromTemplate({
                "transactions|10-100": [{
                    "Id": 0,
                    "Amount|30-3000": 250,
                    "tags|1-3": [{
                        text: "@TAG"
                    }],
                    "Date": null
                }]
            }).transactions;
            transactions = _populateProperties(transactions);
            logSuccess("generated " + transactions.length + " fake transactions", transactions, true);
            return transactions;
        }

        return service;
    }
})();
