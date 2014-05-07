(function () {
    'use strict';
    var controllerId = 'quickPass';
    angular.module('app').controller(controllerId, ['common', '$location', 'login', quickPass]);

    function quickPass(common, $location, login) {
        var vm = this;

        vm.submit = function () {
            var success = function () {
                $location.path("/");
            };
            var error = function (message) {
                vm.message = message;
            };
            login.quickPass({psw:vm.password})
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
