(function () {
    'use strict';
    var controllerId = 'login';
    angular.module('app').controller(controllerId, ['common', '$location', 'login', '$translate', login]);

    function login(common, $location, login, $translate) {
        var vm = this;
        vm.isEmail = false;
        vm.user = {
            codeOrEmail: null,
            password: null
        };
        var setMessage = function (messageCode) {
            $translate(messageCode).then(function(msg){
                vm.message = msg;
            });
        };
        vm.submit = function () {
            if (!vm.user.codeOrEmail) {
                setMessage('ENTER_CODE_OR_EMAIL');
                return;
            }
            if (vm.isEmail && !login.validEmail(vm.user.codeOrEmail)) {
                setMessage('INVALID_CODE_OR_EMAIL');
                return;
            }
            if (vm.isEmail && !vm.user.password) {
                setMessage('PASSORD_REQUIRED');
                return;
            }

            var success = function () {
                $location.path("/");
            };
            var error = function () {
                if (vm.isEmail) {
                    setMessage('INVALID_EMAIL_OR_PASSWORD');
                }
                else {
                    setMessage('INVALID_ACTIVATION_CODE');
                }
            };

            if (vm.isEmail) {
                login.authenticate({
                    email: vm.user.codeOrEmail,
                    password: vm.user.password
                }).then(success, error);
            } else {
                login.quickPass(vm.user.codeOrEmail)
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
