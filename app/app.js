(function () {
    'use strict';

    var app = angular.module('app', [
        "ngRoute",
        "common",
        "ngSanitize",
        "ngTagsInput",
        "ui.mask",
        "ngAutocomplete",
        "AngularGM",
        "ngAnimate",
        "pascalprecht.translate",
        "angular-inview",
        "tmh.dynamicLocale",
        "ngBootstrap",
        "NgSwitchery",
        "geolocation",
        "LocalStorageModule",
        "n3-line-chart",
        "nouislider"
    ]);

    app.run(['$rootScope', '$location', '$window', 'login', function ($rootScope, $location, $window, login) {
        $rootScope.$on('$locationChangeStart', function (event, currRoute, prevRoute) {
            if (!login.authenticated()) {
                $rootScope.hideHeader = true;
                if (currRoute.indexOf('quickpass') < 0 && currRoute.indexOf('login') < 0) {
                    $location.path("/login");
                }
            }
        });
    }]);
})();