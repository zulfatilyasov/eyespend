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
    
     app.run(['$route',  function ($route) {}]);
})();