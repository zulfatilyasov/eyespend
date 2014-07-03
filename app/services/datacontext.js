(function () {
    'use strict';

    var serviceId = 'datacontext';
    angular.module('app').factory(serviceId, ['$http', datacontext]);

    function datacontext($http) {
        function getTransaxns(sorting, desc, offset, count, fromDate, toDate, tags, withPhoto) {
            var params = {
                sorting: sorting,
                desc: desc,
                offset: offset,
                count: count,
                fromDate: fromDate,
                toDate: toDate,
                'tags[]': tags,
                withPhotoOnly: withPhoto
            };
            return $http.get('/api/secure/transactions', { params: params });
        }

        function getTransactionsAndTotals(count) {
            var params = {
                count: count
            };
            return $http.get('/api/secure/transactionsExtended', { params: params });
        }

        function updateTransaction(transaction) {
            return $http.put('/api/secure/transactions/' + transaction.id, transaction);
        }

        function createTransaction(transaction) {
            return $http.post('/api/secure/transactions/', transaction);
        }

        function deleteTransaction(transactionId) {
            return $http.delete('/api/secure/transactions/' + transactionId);
        }

        function getExcelFileUrl(sorting, desc, offset, count, fromDate, toDate, tags, withPhoto) {
            var params = {
                sorting: sorting,
                desc: desc,
                offset: offset,
                count: count,
                fromDate: fromDate,
                toDate: toDate,
                'tags[]': tags,
                withPhotoOnly: withPhoto
            };
            return $http.get('/api/secure/excelFileUrl', { params: params });
        }

        function authenticate(user) {
            return $http.post('/api/users/login', { authCodeOrEmail: user.email, password: user.password });
        }

        function quickPass(authCode) {
            return $http.post('/api/users/login', { authCodeOrEmail: authCode });
        }

        function linkEmailOrPhone(emailOrPhone, currentPsw) {
            return $http.post('/api/secure/change_email', {email: emailOrPhone, password: currentPsw});
        }

        function changePsw(psw) {
            return $http.post('/api/changePassword', psw);
        }

        function getUserTags() {
            return $http.get('/api/secure/getUserTags');
        }

        function getSettings() {
            return $http.get('/api/secure/settings');
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
            getUserTags: getUserTags,
            getExcelFileUrl: getExcelFileUrl,
            getSettings: getSettings,
            getTransactionsAndTotals: getTransactionsAndTotals
        };
    }
})();
