(function () {
    'use strict';

    var serviceId = 'datacontext';
    angular.module('app').factory(serviceId, ['$http', datacontext]);

    function datacontext($http) {
        function getTransaxns() {
            return $http.get('/api/secure/transactions');
        }

        function updateTransaction(transaction) {
            return $http.post('/api/secure/updateTransaction', {transaction: transaction});
        }

        function createTransaction(transaction) {
            return $http.post('/api/secure/createTransaction', {transaction: transaction});
        }

        function deleteTransaction(tansaxnGuid) {
            return $http.post('/api/secure/deleteTransaction', {guid: tansaxnGuid});
        }

        return {
            getTransaxns: getTransaxns,
            updateTransaction: updateTransaction,
            createTransaction: createTransaction,
            deleteTransaction: deleteTransaction
        };
    }
})();
