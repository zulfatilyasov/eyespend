(function () {
    'use strict';

    var serviceId = 'datacontext';
    angular.module('app').factory(serviceId, ['$http', datacontext]);

    function datacontext($http) {
        function getTransaxns(sorting, desc, offset, count, fromDate, toDate, tags) {
            var query = 'sorting=' + sorting + '&desc=' + desc + '&offset=' + offset + '&count=' + count + '&fromDate=' + fromDate + '&toDate=' + toDate + '&tags=' + tags;
            return $http.get('/api/secure/transactions?' + query);
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

        function linkEmailOrPhone(emailOrPhone, currentPsw) {
            return $http.post('/api/user/linkEmailOrPhone', {emailOrPhone: emailOrPhone, currentPsw: currentPsw});
        }

        function changePsw(psw) {
            return $http.post('/api/changePassword', psw);
        }

        function getUserTags() {
            return $http.get('/api/secure/getUserTags');
        }

        return {
            getTransaxns: getTransaxns,
            updateTransaction: updateTransaction,
            createTransaction: createTransaction,
            deleteTransaction: deleteTransaction,
            authenticate: authenticate,
            quickPass: quickPass,
            changePsw: changePsw,
            linkEmailOrPhone: linkEmailOrPhone,
            getUserTags: getUserTags
        };
    }
})();
