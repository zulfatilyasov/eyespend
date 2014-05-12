(function() {
    'use strict';

    var serviceId = 'datacontext';
    angular.module('app').factory(serviceId, ['$http', datacontext]);

    function datacontext($http) {
        function getTransaxns() {
            return $http.get('/api/secure/transactions');
        }
        return {
            getTransaxns: getTransaxns
        };
    }
})();
