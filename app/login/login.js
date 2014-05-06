(function () {
    'use strict';
    var controllerId = 'login';
    angular.module('app').controller(controllerId, ['common', '$http', '$window', '$location', '$rootScope', 'login', login]);

    function login(common, $location, login) {
        var vm = this;

        vm.submit = function () {
            var success = function () {
                $location.path("/");
            };
            var error = function (message) {
                vm.message = message;
            };
            login.authenticate(vm.user)
                .then(success,error);
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
