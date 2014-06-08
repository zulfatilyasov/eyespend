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

        function updateTransaction(transaction) {
            return $http.put('/api/secure/transactions/' + transaction.id, transaction);
        }

        function createTransaction(transaction) {
            return $http.post('/api/secure/transactions/', transaction);
        }

        function deleteTransaction(transactionId) {
            return $http.delete('/api/secure/transactions/' + transactionId);
        }

        function getExcelFileUrl(sorting, desc, offset, count, fromDate, toDate, tags, withPhoto){
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

        function getSettings(){
            return $http.get('/api/secure/getSettings');
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
            getExcelFileUrl:getExcelFileUrl,
            getSettings:getSettings
        };
    }
})();
