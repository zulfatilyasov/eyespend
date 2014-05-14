'use strict';

describe('login controller', function () {
    var timeout = null;
    var root = null;
    var loginCtrl;
    var loginService;
    var location;
    var app = angular.module('app');
    var correctEmail = 'foo@gmail.com';
    var correctPassword = 'bar';

    function fakeDataContext(common, $timeout, $rootScope) {
        timeout = $timeout;

        function authenticate(user) {
            var d = common.defer();
            timeout(function () {
                if (user.email !== correctEmail || user.password !== correctPassword)
                    d.reject({});
                else
                    d.resolve({data: {token: '123'}});
                $rootScope.$apply();
            }, 1);
            return d.promise;
        }

        function quickPass(data) {
            var d = common.defer();
            timeout(function () {
                if (data.psw !== '123')
                    d.reject({});
                else
                    d.resolve({data: {token: '123'}});
                $rootScope.$apply();
            }, 1);
            return d.promise;
        }

        function changePsw(psw) {
            var d = common.defer();
            timeout(function () {
                d.resolve(200);
                $rootScope.$apply();
            }, 1);
            return d.promise;
        }

        return {
            authenticate: authenticate,
            quickPass: quickPass,
            changePsw: changePsw
        };
    }

    beforeEach(function () {
        app.service('datacontext', ['common', '$timeout', '$rootScope', fakeDataContext]);
    });

    beforeEach(module('app'));
    beforeEach(inject(function ($rootScope, $location) {
        root = $rootScope;
        location = $location;
    }));

    it('should activate', inject(function ($controller, login) {
        loginCtrl = $controller('login');
        loginService = login;
        expect(loginCtrl).toBeDefined();
//        expect(loginService.authenticated()).toBeFalsy();
    }));

    it('should log in with email', function () {

        loginCtrl.submit();
        expect(loginCtrl.message).toBe('Введите email или код активации');

        loginCtrl.isEmail = true;
        loginCtrl.user.codeOrEmail = correctEmail;
        loginCtrl.submit();
        expect(loginCtrl.message).toBe('Введите пароль');

        loginCtrl.user.password = 'worngPassword';
        loginCtrl.submit();
        timeout.flush();
        expect(loginCtrl.message).toBe("Неверный email или пароль");

        loginCtrl.user.password = correctPassword;
        loginCtrl.submit();
        timeout.flush();
        expect(loginService.authenticated()).toBeTruthy();
    });

    it('should log out', function () {
        loginService.logout();
        expect(loginService.authenticated()).toBeFalsy();
    });

    it('should log in with acitivation code', function () {
        loginCtrl.isEmail = false;
        loginCtrl.user.codeOrEmail = '123';
        loginCtrl.submit();
        timeout.flush();
        expect(loginService.authenticated()).toBeTruthy();
    });
});
