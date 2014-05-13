(function () {
    'use strict';
    var controllerId = 'login';
    angular.module('app').controller(controllerId, ['common', '$location', 'login', login]);

    function login(common, $location, login) {
        var vm = this;
        vm.isEmail = false;
        vm.user = {};
        vm.submit = function () {
            if(!vm.user.codeOrEmail && !vm.user.password){
                vm.message = "Введите email и пароль";
                return;
            }
            else if(!vm.user.codeOrEmail){
                vm.message = "Введите email";
                return;
            }
            else if(!vm.user.password) {
                vm.message = "Введите пароль";
                return;
            }

            var success = function () {
                $location.path("/");
            };
            var error = function (message) {
                vm.message = message;
            };

            login.authenticate(vm.user)
                .then(success, error);
        };

        function isNumeric(str){
            return /^[0-9]+$/.test(str);
        }

        vm.codeOrEmailChanged = function(){
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
