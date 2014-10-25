(function() {
    'use strict';

    var serviceId = 'datacontext';
    angular.module('app').factory(serviceId, ['$http', datacontext]);

    function datacontext($http) {
        function getTransaxns(sorting, desc, offset, count, fromDate, toDate, tags, withPhoto) {
            if (fromDate == toDate)
                fromDate = toDate = '';
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
            return $http.get('/api/secure/transactions', {
                params: params
            });
        }

        function getTransactionsAndTotals(count) {
            var params = {
                count: count
            };
            return $http.get('/api/secure/transactionsExtended', {
                params: params
            });
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
            return $http.get('/api/secure/excelFileUrl', {
                params: params
            });
        }

        function authenticate(user) {
            return $http.post('/api/users/login', {
                authCodeOrEmail: user.email,
                password: user.password
            });
        }

        function quickPass(authCode) {
            return $http.post('/api/users/login', {
                authCodeOrEmail: authCode
            });
        }

        function linkInit(email, password) {
            return $http.post('/api/secure/linkInit', {
                email: email,
                password: password
            });
        }

        function changeEmail(email) {
            return $http.post('/api/secure/emailChangeInit', {
                email: email
            });
        }

        function changePsw(psw, oldPsw) {
            return $http.post('/api/secure/changePassword', {
                oldPassword: oldPsw,
                newPassword: psw
            });
        }

        function getUserTags() {
            return $http.get('/api/secure/getUserTags');
        }

        function getSettings() {
            return $http.get('/api/secure/settings');
        }

        function getTransactionsForChart() {
            return $http.get('/api/secure/stats/dailyExpenses');
        }

        function getTagsExpenses(dateFrom, dateTo, includeTags, excludeTags) {
            var params = {
                dateFrom: dateFrom,
                dateTo: dateTo,
                'includeTags[]': includeTags,
                'excludeTags[]': excludeTags
            };
            console.log(params);
            return $http.get('/api/secure/stats/tagsExpenses', {
                params: params
            });
        }

        return {
            getTransaxns: getTransaxns,
            updateTransaction: updateTransaction,
            createTransaction: createTransaction,
            deleteTransaction: deleteTransaction,
            authenticate: authenticate,
            quickPass: quickPass,
            changePsw: changePsw,
            linkInit: linkInit,
            changeEmail: changeEmail,
            getUserTags: getUserTags,
            getExcelFileUrl: getExcelFileUrl,
            getSettings: getSettings,
            getTransactionsAndTotals: getTransactionsAndTotals,
            getTransactionsForChart: getTransactionsForChart,
            getTagsExpenses: getTagsExpenses
        };
    }
})();
