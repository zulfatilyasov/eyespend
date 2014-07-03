(function () {
    'use strict';
    var controllerId = 'settings';
    angular.module('app').controller(controllerId, ['common', '$location', 'login', '$translate', 'datacontext', settings]);

    function settings(common, $location, login, $translate, datacontext) {
        var logSuccess = common.logger.getLogFn(controllerId, 'logSuccess');
        var logError = common.logger.getLogFn(controllerId, 'logError');
        var vm = this;
        vm.link = {};
        vm.email = {};
        vm.linkcode = '2061 1026';

        function validLinkEmailForm() {
            vm.link.invalidEmail = false;
            vm.link.invalidPassword = false;
            if (!vm.link.emailOrPhone) {
                $translate('TYPE_EMAIL')
                    .then(function (msg) {
                        vm.link.invalidEmail = true;
                        logError(msg);
                    });
                return false;
            }
            if (!login.validEmail(vm.link.emailOrPhone)) {
                $translate('INVALID_EMAIL')
                    .then(function (msg) {
                        vm.link.invalidEmail = true;
                        logError(msg);
                    });
                return false;
            }
            if (vm.email.address && !vm.link.currentPsw) {
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
            vm.passwordError = false;
            vm.confirmationError = false;
            var setErrorMessage = function (message) {
                vm.error = true;
                logError(message);
//                vm.message = message;
            };
            if (!vm.currentPsw) {
                setErrorMessage("Введите текущий пароль");
                vm.currentPswError = true;
                return;
            }
            if (!vm.psw) {
                setErrorMessage("Введите пароль");
                vm.passwordError = true;
                return;
            }
            if (!vm.confirmation) {
                vm.confirmationError = true;
                setErrorMessage("Введите подтверждение пароля");
                return;
            }
            if (vm.psw !== vm.confirmation) {
                vm.passwordError = true;
                vm.confirmationError = true;
                setErrorMessage("Пароли не совпадают");
                return;
            }

            var success = function (message) {
                vm.error = false;
                logSuccess(message);
            };
            var error = function (message) {
                setErrorMessage(message);
            };

            login.changePassword({newPsw: vm.psw, currentPsw: vm.currentPsw})
                .then(success, error);
        };

        vm.linkEmail = function () {
            if (validLinkEmailForm() == false)
                return;
            datacontext.linkEmailOrPhone(vm.link.emailOrPhone, vm.link.currentPsw)
                .success(function (data, status) {
                    if (status === 400) {
                        $translate('INVALID_PASSWORD')
                            .then(function (msg) {
                                vm.link.invalidPassword = true;
                                logError(msg);
                            });
                    }
                    else {
                        logSuccess('Отправлено письмо.<br/>Активируйте e-mail');
                        vm.email.address = vm.link.emailOrPhone;
                        vm.email.verified = false;
                    }
                })
                .error(function (data, status) {
                    logError('Fail');
                });
        };

        function getSettings() {
            var def = common.defer();
            datacontext.getSettings()
                .success(function (data) {
                    vm.linkcode = data.linkcode;
                    vm.email = data.email;
//                    vm.email.verified = data.verified;
                    def.resolve();
                });
            return def.promise;
        }

        function activate() {
            var promises = [getSettings()];
            common.activateController(promises, controllerId)
                .then(function () {

                });
        }

        activate();
    }
})();
