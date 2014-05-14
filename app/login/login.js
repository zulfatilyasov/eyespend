(function () {
    'use strict';
    var controllerId = 'login';
    angular.module('app').controller(controllerId, ['common', '$location', 'login', login]);

    function login(common, $location, login) {
        var vm = this;
        vm.isEmail = false;
        vm.user = {
            codeOrEmail: null,
            password: null
        };
        vm.submit = function () {
            if (!vm.user.codeOrEmail) {
                vm.message = "Введите email или код активации";
                return;
            }
            if(vm.isEmail && !login.validEmail(vm.user.codeOrEmail)){
                vm.message = "Некорректный email или код активации";
                return;
            }
            if (vm.isEmail && !vm.user.password) {
                vm.message = "Введите пароль";
                return;
            }

            var success = function () {
                $location.path("/");
            };
            var error = function () {
                if(vm.isEmail){
                    vm.message = "Неверный email или пароль";
                }
                else{
                    vm.message = "Неверный код активации";
                }
            };

            if (vm.isEmail) {
                login.authenticate({
                    email: vm.user.codeOrEmail,
                    password: vm.user.password
                }).then(success, error);
            } else {
                login.quickPass({psw: vm.user.codeOrEmail})
                    .then(success, error);
            }
        };

        function isNumeric(str) {
            return /^[0-9]+$/.test(str);
        }

        vm.codeOrEmailChanged = function ($event) {
            if ($event.keyCode === 9)
                return;
            vm.isEmail = !isNumeric(vm.user.codeOrEmail);
        };

        function activate() {
            var promises = [];
            common.activateController(promises, controllerId)
                .then(function () {

                });
        }

        activate();
    }
})();
