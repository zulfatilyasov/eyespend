(function() {
    'use strict';

    var commonModule = angular.module('common', []);

    commonModule.provider('commonConfig', function() {
        this.config = {

        };

        this.$get = function() {
            return {
                config: this.config
            };
        };
    });

    commonModule.factory('common', ['$q', '$rootScope', '$timeout', 'commonConfig', 'logger', common]);

    function common($q, $rootScope, $timeout, commonConfig, logger) {

        return {
            $broadcast: $broadcast,
            $q: $q,
            $timeout: $timeout,
            activateController: activateController,
            logger: logger,
            clone: clone
        };

        function activateController(promises, controllerId) {
            $broadcast(commonConfig.config.spinnerToggle, {show:false});
            return $q.all(promises).then(function () {
                var data = {
                    controllerId: controllerId
                };
                $broadcast(commonConfig.config.controllerActivateSuccessEvent, data);
            });
        }

        function $broadcast() {
            return $rootScope.$broadcast.apply($rootScope, arguments);
        }

        function clone(obj) {
            var copy = {};
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
            }
            return copy;
        }
    }
})();
