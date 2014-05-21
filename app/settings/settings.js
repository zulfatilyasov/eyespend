(function () {
    'use strict';
    var controllerId = 'settings';
    angular.module('app').controller(controllerId, ['common', '$location', 'login', '$translate', 'datacontext', settings]);

    function settings(common, $location, login, $translate, datacontext) {
        var logSuccess = common.logger.getLogFn(controllerId, 'logSuccess');
        var logError = common.logger.getLogFn(controllerId, 'logError');
        var vm = this;
        vm.link = {};
        vm.linkcode = '2061 1026';

        function validLinkEmailForm() {
            if (!vm.link.email) {
                $translate('TYPE_EMAIL')
                    .then(function (msg) {
                        vm.link.invalidEmail = true;
                        logError(msg);
                    });
                return false;
            }
            if (!login.validEmail(vm.link.email)) {
                $translate('INVALID_EMAIL')
                    .then(function (msg) {
                        vm.link.invalidEmail = true;
                        logError(msg);
                    });
                return false;
            }
            if (!vm.link.currentPassword) {
                $translate('TYPE_CURRENT_PASSWORD')
                    .then(function (msg) {
                        vm.link.invalidPassword = true;
                        logError(msg);
                    });
                return false;
            }
            return true;
        }

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

        vm.linkEmail = function () {
            if (validLinkEmailForm() == false)
                return;
            datacontext.linkEmail(vm.link.email, vm.link.currentPsw)
                .success(function (data, status) {
                    if (status === 200)
                        logSuccess('Удача');
                    else {
                        vm.link.invalidPassword = true;
                        logError(data);
                    }
                })
                .error(function (data, status) {
                    logError('Fail');
                });
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
