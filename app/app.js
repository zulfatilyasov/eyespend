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
        "AngularGM"
    ]);

    app.run(['$rootScope', '$location', '$window', 'login', function ($rootScope, $location, $window, login) {
        $rootScope.$on('$locationChangeStart', function (event, currRoute, prevRoute) {
            if (!login.authenticated()) {
                console.log('user is not logged redirecting');
                $rootScope.hideHeader = true;
                if (currRoute.indexOf('quickpass') < 0) {
                    $location.path("/login");
                }
            }
        });
    }]);
})();