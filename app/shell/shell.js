(function() {
    'use strict';

    var controllerId = 'shell';
    angular.module('app').controller(controllerId, ['common','$rootScope', '$window', '$location','login', shell]);

    function shell(common, $rootScope, $window, $location, login) {
        var vm = this;
        vm.logout = login.logout;

        $rootScope.$watch(function () {
            return login.isLogged;
        }, function (newValue, oldValue) {
            if ( newValue !== oldValue ) {
                $rootScope.hideHeader = login.isLogged == false;
            }
        });

        function activate() {
            var promises = [];
            common.activateController(promises, controllerId)
                .then(function() {
                    common.logger.logSuccess('shell activated');
                });
        }

        activate();
    }
    
})();
