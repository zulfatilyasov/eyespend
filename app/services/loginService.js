(function () {
    'use strict';

    var serviceId = 'login';
    angular.module('app').factory(serviceId, ['common', '$rootScope', '$http', '$window', '$location', login]);

    function login(common, $rootScope, $http, $window, $location) {
        var success = function (def) {
            return function (data, status, headers, config) {
                if (status == 401) {
                    error(def)();
                }
                else {
                    $window.sessionStorage.token = data.token;
                    common.logger.logSuccess('Welcome');
                    $rootScope.hideHeader = false;
                    def.resolve();
                }
            };
        };

        var error = function (def) {
            return function (data, status, headers, config) {
                delete $window.sessionStorage.token;
                if (config.url === "/quickpass") {
                    def.reject("Неверный пароль");
                }
                else {
                    def.reject("Неверный email или пароль");
                }
            };
        };

        var authenticate = function (user) {
            var def = common.$q.defer();
            $http.post('/authenticate', user)
                .success(success(def))
                .error(error(def));
            return def.promise;
        };

        var logout = function () {
            delete $window.sessionStorage.token;
            $location.path("/login");
        };

        var quickPass = function (psw) {
            var def = common.$q.defer();
            $http.post('/quickpass', psw)
                .success(success(def))
                .error(error(def));
            return def.promise;
        };
        var authenticated = function(){
            return !!$window.sessionStorage.token;
        };

        return {
            authenticate: authenticate,
            logout: logout,
            quickPass: quickPass,
            authenticated:authenticated
        };
    }
})();
