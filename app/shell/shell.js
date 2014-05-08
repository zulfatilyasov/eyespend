(function () {
    'use strict';

    var controllerId = 'shell';
    angular.module('app').controller(controllerId, ['common', '$rootScope', 'config', 'login', '$translate', shell]);

    function shell(common, $rootScope, config, login, $translate) {
        var vm = this;
        var events = config.events;
        vm.logout = login.logout;
        $rootScope.showSpinner = false;
        function activate() {
            var promises = [];
            common.activateController(promises, controllerId)
                .then(function () {
                    common.logger.logSuccess('shell activated');
                });
        }

        vm.togglePopover = function () {
            $('#languages-menu').fadeToggle();
        };

        vm.translate = function(lang){
            $translate.use(lang);
            vm.togglePopover();
        };

        function toggleSpinner(on) {
            $rootScope.showSpinner = on;
        }

        $rootScope.$on('$routeChangeStart',
            function (event, next, current) {
                toggleSpinner(true);
            }
        );

        $rootScope.$on(events.controllerActivateSuccess,
            function (event, data) {
                toggleSpinner(false);
            }
        );

        $rootScope.$on(events.spinnerToggle,
            function (event, data) {
                toggleSpinner(data.show);
            }
        );

        activate();
    }

})();
