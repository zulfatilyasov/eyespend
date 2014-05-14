(function () {
    'use strict';
    var controllerId = 'settings';
    angular.module('app').controller(controllerId, ['common', '$location', 'login', settings]);

    function settings(common, $location, login) {
        var logSuccess = common.logger.getLogFn(controllerId, 'logSuccess');
        var logError = common.logger.getLogFn(controllerId, 'logError');
        var vm = this;

        vm.changePassword = function () {
            var setErrorMessage = function (message) {
                vm.error = true;
                logError(message);
//                vm.message = message;
            };
            if (!vm.psw) {
                setErrorMessage("Введите пароль");
                return;
            }
            if (!vm.confirmation) {
                setErrorMessage("Введите подтверждение пароля");
                return;
            }
            if (vm.psw !== vm.confirmation) {
                setErrorMessage("Пароли не совпадают");
                return;
            }

            var success = function (message) {
                vm.error = false;
                logSuccess(message);
//                vm.message = message;
            };
            var error = function (message) {
                setErrorMessage(message);
            };

            login.changePassword({psw: vm.psw})
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
