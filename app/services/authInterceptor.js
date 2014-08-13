(function() {
  'use strict';

  var serviceId = 'authInterceptor';
  angular.module('app').factory(serviceId, function($rootScope, $q, $window, $location, localStorageService) {
    function removeCookieAndReload() {
      document.cookie = 'isAuthenticated' + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      location.reload();
    }
    return {
      request: function(config) {
        config.headers = config.headers || {};
        var token = localStorageService.get('token');
        if (token) {
          config.headers.Authorization = 'Bearer ' + token;
        } else {
          removeCookieAndReload();
        }
        return config;
      },
      responseError: function(response) {
        if (response.status === 401 && response.config.url.indexOf('quickpass') < 0) {
          $rootScope.hideHeader = true;
          // $location.path('/login');
          removeCookieAndReload();
        }
        return response || $q.when(response);
      }
    };
  });

})();
