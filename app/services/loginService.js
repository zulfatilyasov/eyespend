(function () {
    'use strict';

    var serviceId = 'login';
    angular.module('app').factory(serviceId, ['common', '$rootScope', '$http', '$window', '$location', login]);

    function login(common, $rootScope, $http, $window, $location) {
        var isLogged = $window.sessionStorage.token || false;

        var authenticate = function (user) {
            var def = common.$q.defer();
            $http
                .post('/authenticate', user)
                .success(function (data, status, headers, config) {
                    if (status == 401) {
                        delete $window.sessionStorage.token;
                        def.reject("Неверный email или пароль");
                    }
                    else {
                        $window.sessionStorage.token = data.token;
                        isLogged = true;
                        common.logger.logSuccess('Welcome');
                        $rootScope.hideHeader = false;
                        def.resolve();
                    }
                })
                .error(function (data, status, headers, config) {
                    delete $window.sessionStorage.token;
                    def.reject("Неверный email или пароль");
                });
            return def.promise;
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
