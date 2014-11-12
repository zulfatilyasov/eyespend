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

    commonModule.factory('common', ['$q', '$rootScope', '$timeout', 'commonConfig', 'config', 'logger', '$translate', 'cookie', 'tmhDynamicLocale', common]);

    function common($q, $rootScope, $timeout, commonConfig, config, logger, $translate, cookie, tmhDynamicLocale) {

        var log = logger.getLogFn();

        function defer() {
            var d = $q.defer();
            decoratePromise(d.promise);
            return d;
        }

        function decoratePromise(promise) {
            promise.success = function(fn) {
                promise.then(function(response) {
                    if (response && response.data) {
                        fn(response.data, response.status, response.headers, response.config);
                    } else {
                        fn(response);
                    }

                });
                return promise;
            };

            promise.error = function(fn) {
                promise.then(null, function(response) {
                    if (response)
                        fn(response.data, response.status, response.headers, response.config);
                    else
                        console.error('response undefined');
                });
                return promise;
            };
            return promise;
        }

        function activateController(promises, controllerId) {
            //$broadcast(commonConfig.config.spinnerToggle, {
            //  show: false
            //});
            // log('Activated ' + controllerId);
            return $q.all(promises).then(function() {
                var data = {
                    controllerId: controllerId
                };
                $broadcast(commonConfig.config.controllerActivateSuccessEvent, data);
            });
        }

        function translate(lang) {
            $rootScope.lang = config.local = lang;
            cookie.set('lang', lang);
            $translate.use(lang);
            if (lang === 'ru') {
                moment.locale(lang);
            } else {
                moment.locale('en-gb');
            }
            tmhDynamicLocale.set(lang);
            $broadcast(commonConfig.config.localeChange, {
                locale: lang
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

        return {
            $broadcast: $broadcast,
            translate: translate,
            $q: $q,
            $timeout: $timeout,
            activateController: activateController,
            logger: logger,
            clone: clone,
            defer: defer
        };
    }
})();
