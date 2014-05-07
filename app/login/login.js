(function () {
    'use strict';
    var controllerId = 'login';
    angular.module('app').controller(controllerId, ['common', '$location', 'login', login]);

    function login(common, $location, login) {
        var vm = this;

        vm.submit = function () {
            if(!vm.user.username && !vm.user.password){
                vm.message = "Введите email и пароль";
                return;
            }
            else if(!vm.user.username){
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

        function activate() {
            var promises = [];
            common.activateController(promises, controllerId)
                .then(function () {

                });
        }

        activate();
    }
})();
