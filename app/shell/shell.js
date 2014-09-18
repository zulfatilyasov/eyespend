(function() {
    'use strict';

    var controllerId = 'shell';
    angular.module('app').controller(controllerId, ['common', 'debounce', '$rootScope', 'tmhDynamicLocale', 'config', 'login', '$translate', 'cookie', shell]);

    function shell(common, debounce, $rootScope, tmhDynamicLocale, config, login, $translate, cookie) {
        var vm = this;
        var events = config.events;
        vm.logout = login.logout;
        vm.langsOpen = false;
        vm.activePage = 'expenses';

        $rootScope.showSpinner = false;

        $rootScope.lang = config.local;
        tmhDynamicLocale.set(config.local);

        function activate() {
            var promises = [];
            common.activateController(promises, controllerId)
                .then(function() {
                    $rootScope.lang = config.local;
                });
        }

        vm.togglePopover = function() {
            vm.langsOpen = !vm.langsOpen;
        };

        $rootScope.closeImageOverlay = function() {
            $rootScope.showImage = false;
            $rootScope.imgUrl = '';
        };

        vm.translate = function(lang) {
            config.local = lang;

            cookie.set('lang', lang);
            $translate.use(lang);

            if (lang == 'ru')
                moment.locale('ru');
            else
                moment.locale('en-gb');

            tmhDynamicLocale.set(lang);
            $rootScope.lang = lang;
            vm.togglePopover();
        };

        function toggleSpinner(on) {
            $rootScope.showSpinner = on;
        }

        $rootScope.$on('$routeChangeStart',
            function(event, next) {
                if (next.$$route.originalPath === '/')
                    toggleSpinner(true);
            }
        );

        $rootScope.$on(events.controllerActivateSuccess,
            function() {
                toggleSpinner(false);
            }
        );

        $rootScope.$on(events.spinnerToggle,
            function(event, data) {
                toggleSpinner(data.show);
            }
        );

        activate();
    }

})();
