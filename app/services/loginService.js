(function () {
    'use strict';

    var serviceId = 'login';
    angular.module('app').factory(serviceId, ['common', '$rootScope', '$http', '$window', '$location', login]);

    function login(common, $rootScope, $http, $window, $location) {
        var isLogged = $window.sessionStorage.token || false;

        var authenticate = function (user) {
            $http
                .post('/authenticate', user)
                .success(function (data, status, headers, config) {
                    $window.sessionStorage.token = data.token;
                    isLogged = true;
                    common.logger.logSuccess('Welcome');
                    $rootScope.hideHeader = false;
                    $location.path("/");
                })
                .error(function (data, status, headers, config) {
                    delete $window.sessionStorage.token;
                    common.logger.logSuccess('Error: Invalid user or password');
                });
        };

        var logout = function () {
            delete $window.sessionStorage.token;
            isLogged = false;
            $location.path("/login");
        };

        return {
            isLogged: isLogged,
            authenticate: authenticate,
            logout: logout
        };
    }
})();
