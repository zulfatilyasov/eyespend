(function () {
    'use strict';
    var controllerId = 'login';
    angular.module('app').controller(controllerId, ['common', '$http', '$window', '$location', '$rootScope', 'login', login]);

    function login(common, $http, $window, $location, $rootScope, login) {
        var vm = this;

        vm.submit = function () {
            login.authenticate(vm.user);
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
