(function () {
    'use strict';

    var serviceId = 'datacontext';
    angular.module('app').factory(serviceId, ['$http', datacontext]);

    function datacontext($http) {
        function getTransaxns(sorting, offset, count) {
            return $http.get('/api/secure/transactions?sorting=' + sorting + '&offset=' + offset + '&count=' + count);
        }

        function updateTransaction(transaction) {
            return $http.post('/api/secure/updateTransaction', {transaction: transaction});
        }

        function createTransaction(transaction) {
            return $http.post('/api/secure/createTransaction', {transaction: transaction});
        }

        function deleteTransaction(tansaxnGuid) {
            return $http.post('/api/secure/deleteTransaction', {id: tansaxnGuid});
        }

        function sortTransactions(sortOptions,count) {
            return $http.get('/api/secure/sortTransactions?column=' + sortOptions.column + '&descending=' + sortOptions.descending + '&count=' + count);
        }

        function authenticate(user) {
            return $http.post('/api/users/login', { authCodeOrEmail: user.email, password: user.password });
        }

        function quickPass(psw) {
            return $http.post('/quickpass', psw);
        }

        function changePsw(psw) {
            return $http.post('/api/changePassword', psw);
        }

        return {
            getTransaxns: getTransaxns,
            updateTransaction: updateTransaction,
            createTransaction: createTransaction,
            deleteTransaction: deleteTransaction,
            sortTransactions:sortTransactions,
            authenticate: authenticate,
            quickPass: quickPass,
            changePsw: changePsw
        };
    }
})();
