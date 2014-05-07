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
    
     app.run(['$rootScope', '$location','$window', function ($rootScope, $location, $window) {
         $rootScope.$on('$locationChangeStart', function (event, currRoute, prevRoute) {
             if (!$window.sessionStorage.token && currRoute.indexOf('quickpass') < 0){
                 console.log('user is not logged redirecting');
                 $rootScope.hideHeader = true;
                 $location.path("/login");
             }
         });
     }]);
})();