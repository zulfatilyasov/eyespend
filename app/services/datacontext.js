(function() {
    'use strict';

    var serviceId = 'datacontext';
    angular.module('app').factory(serviceId, ['common', '$http', datacontext]);
   
    function datacontext(common, $http) {

        var service = {
            getTransaxns: getTransaxns
        };

        function getTransaxns() {
            return $http.get('/server/getTransactions');
        }

        return service;
    }
})();
