(function () {
    'use strict';

    var serviceId = 'login';
    angular.module('app').factory(serviceId, ['common', '$rootScope', '$location', 'datacontext', '$cookies', 'localStorageService', login]);

    function login(common, $rootScope, $location, datacontext, $cookies, localStorageService) {
        var userTags = null;
        var success = function (def) {
            return function (data, status) {
                if (status == 401) {
                    error(def)();
                }
                else {
                    localStorageService.set('token', data.token);
                    var date = new Date();
                    date.setMonth(date.getMonth() + 30);
                    console.log(date);
                    document.cookie = "isAuthenticated=" + true + "; path=/; expires=" + date.toUTCString();
                    userTags = data.userTags;
                    $rootScope.hideHeader = false;
                    def.resolve();
                }
            };
        };

        var error = function (def) {
            return function (data, status, headers, config) {
                document.cookie = 'isAuthenticated' + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                localStorageService.remove('token');
                def.reject();
            };
        };

        var authenticate = function (user) {
            var def = common.$q.defer();
            datacontext.authenticate(user)
                .success(success(def))
                .error(error(def));
            return def.promise;
        };
        var quickPass = function (psw) {
            var def = common.$q.defer();
            datacontext.quickPass(psw)
                .success(success(def))
                .error(error(def));
            return def.promise;
        };
        var logout = function () {
            document.cookie = 'isAuthenticated=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            localStorageService.remove('token');
            $location.path("/login");
        };

        var authenticated = function () {
            return !!$cookies.isAuthenticated;
        };

        var changeSuccess = function (def) {
            return function (data, status, headers, config) {
                if (status === 400) {
                    def.reject("Произошла ошибка при смене пароля");
                    return;
                }
                def.resolve("Пароль усешно изменен");
            };
        };

        var changeError = function (def) {
            return function (data, status, headers, config) {
                def.reject("Произошла ошибка при смене пароля");
            };
        };

        var changePassword = function (psw) {
            var def = common.$q.defer();
            datacontext.changePsw(psw)
                .success(changeSuccess(def))
                .error(changeError(def));
            return def.promise;
        };

        function validEmail(email) {
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        }

        function getUserTags() {
            if (userTags)
                return common.$q.when(userTags);

            var def = common.defer();
            datacontext.getUserTags()
                .success(function (data) {
                    userTags = data;
                    def.resolve(userTags);
                });
            return def.promise;
        }

        return {
            authenticate: authenticate,
            logout: logout,
            quickPass: quickPass,
            authenticated: authenticated,
            changePassword: changePassword,
            validEmail: validEmail,
            getUserTags: getUserTags
        };
    }
})();
