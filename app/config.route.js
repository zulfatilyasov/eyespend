(function () {
    'use strict';

    var app = angular.module('app');

    app.constant('routes', getRoutes());

    app.config(['$routeProvider', 'routes', routeConfigurator]);

    function routeConfigurator($routeProvider, routes) {

        routes.forEach(function (r) {
            $routeProvider.when(r.url, r.config);
        });
        $routeProvider.otherwise({
            redirectTo: '/'
        });
    }

    function getRoutes() {
        return [{
            url: '/',
            config: {
                templateUrl: 'transactions/transactions.html',
                title: 'transactions'
            }
        }, {
            url: '/login',
            config: {
                templateUrl: 'login/login.html',
                title: 'login'
            }
        }, {
            url: '/quickpass',
            config: {
                templateUrl: 'quickpass/quickpass.html',
                title: 'quickpass'
            }
        }, {
            url: '/settings',
            config: {
                templateUrl: 'settings/settings.html',
                title: 'settings'
            }
        }, {
            url: '/tagstats',
            config: {
                templateUrl: 'tagstats/tagstats.html',
                title: 'tagstats'
            }
        }, {
            url: '/stats',
            config: {
                templateUrl: 'stats/stats.html',
                title: 'stats'
            }
            // }, {
            //   url: '/',
            //   config: {
            //     templateUrl: 'menu/menu.html',
            //     title: 'menu'
            //   }
            // }
        }];
    }
})();
