(function () {
    'use strict';

    var serviceId = 'datacontext';
    angular.module('app').factory(serviceId, ['$http', datacontext]);

    function datacontext($http) {
        function getTransaxns(sorting, desc, offset, count) {
            return $http.get('/api/secure/transactions?sorting=' + sorting + '&desc=' + desc + '&offset=' + offset + '&count=' + count);
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

        function authenticate(user) {
            return $http.post('/api/users/login', { authCodeOrEmail: user.email, password: user.password });
        }

        function quickPass(psw) {
            return $http.post('/quickpass', psw);
        }

        function linkEmail(email, currentPsw) {
            return $http.post('/api/user/linkEmail', {email: email, currentPsw: currentPsw});
        }

        function changePsw(psw) {
            return $http.post('/api/changePassword', psw);
        }

        return {
            getTransaxns: getTransaxns,
            updateTransaction: updateTransaction,
            createTransaction: createTransaction,
            deleteTransaction: deleteTransaction,
            authenticate: authenticate,
            quickPass: quickPass,
            changePsw: changePsw,
            linkEmail:linkEmail
        };
    }
})();
