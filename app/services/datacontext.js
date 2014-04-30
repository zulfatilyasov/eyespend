(function() {
    'use strict';

    var serviceId = 'datacontext';
    angular.module('app').factory(serviceId, ['$http', datacontext]);

    function datacontext($http) {
        function getTransaxns() {
            return $http.get('/server/getTransactions');
        }
        return {
            getTransaxns: getTransaxns
        };
    }
})();
