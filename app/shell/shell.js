(function () {
    'use strict';

    var controllerId = 'shell';
    angular.module('app').controller(controllerId, ['common', '$rootScope', 'tmhDynamicLocale', 'config', 'login', '$translate', '$timeout', shell]);

    function shell(common, $rootScope, tmhDynamicLocale, config, login, $translate, $timeout) {
        var vm = this;
        var events = config.events;
        vm.logout = login.logout;
        vm.langsOpen = false;

        $rootScope.showSpinner = false;
        $rootScope.lang = config.local;
        tmhDynamicLocale.set(config.local);

        function activate() {
            var promises = [];
            common.activateController(promises, controllerId)
                .then(function () {
                    $rootScope.lang = config.local;
                    //@todo: Переместить в директивы.
                    $('div.overlay').css('display', 'block');
                });
        }

        vm.togglePopover = function () {
            vm.langsOpen = !vm.langsOpen;
        };

        vm.translate = function (lang) {
            config.local = lang;
            var now = new Date();
            var yearAfterNow = new Date(new Date(now).setMonth(now.getMonth() + 12));
            document.cookie = "lang=" + lang + "; path=/; expires=" + yearAfterNow.toUTCString();
            $translate.use(lang);
            tmhDynamicLocale.set(lang);
            $rootScope.lang = lang;
            vm.togglePopover();
        };

        function toggleSpinner(on) {
            $rootScope.showSpinner = on;
            $rootScope.hideContent = on;
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

})
();
