(function () {
    'use strict';
    var controllerId = 'settings';
    angular.module('app').controller(controllerId, ['common', '$location', 'login', settings]);

    function settings(common, $location, login) {
        var vm = this;

        vm.changePassword = function () {
            if (!vm.psw) {
                vm.message = "Введите пароль";
                return;
            }
            if (!vm.confirmation) {
                vm.message = "Введите подтверждение";
                return;
            }
            if (vm.psw !== vm.confirmaition) {
                vm.message = "Пароли не совпадают";
                return;
            }
            var success = function () {
                vm.message = "Пароль успешно изменен.";
            };
            var error = function () {
                vm.message = "Произошла ошибка. Попробуйте еще раз.";
            };
            login.changePassword(vm.psw)
                .then(success, error);
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
