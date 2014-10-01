﻿(function() {
    'use strict';

    var app = angular.module('app');

    app.config(['$provide',
        function($provide) {
            $provide.decorator('$exceptionHandler', ['$delegate', 'config', 'logger', extendExceptionHandler]);
        }
    ]);

    function extendExceptionHandler($delegate, config, logger) {
        var appErrorPrefix = config.appErrorPrefix;
        var logError = logger.getLogFn('app', 'error');
        return function(exception, cause) {
            $delegate(exception, cause);
            throw exception;
            //            if (appErrorPrefix && exception.message.indexOf(appErrorPrefix) === 0) { return; }
            //
            //            var errorData = { exception: exception, cause: cause };
            //            var msg = appErrorPrefix + exception.message;
            //            logError(msg, errorData, true);
        };
    }
})();
