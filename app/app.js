(function () {
    'use strict';

    var app = angular.module('app', [
        // Custom modules 
        "ngRoute",
        "common",
        "ngSanitize",
        "ngTagsInput",
        "ngAutocomplete",
        "sticky",
        "AngularGM",
        "ngAnimate",
        "pascalprecht.translate",
        "ngCookies"
    ]);

    app.run(['$rootScope', '$location', '$window', 'login', function ($rootScope, $location, $window, login) {
        $rootScope.$on('$locationChangeStart', function (event, currRoute, prevRoute) {
            if (!login.authenticated()) {
                $rootScope.hideHeader = true;
                if (currRoute.indexOf('quickpass') < 0 && currRoute.indexOf('login') < 0) {
                    $location.path("/login");
                    console.log('user is not logged redirecting');
                }
            }
        });
    }]);
})();