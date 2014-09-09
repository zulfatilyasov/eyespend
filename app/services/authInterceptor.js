(function() {
  'use strict';

  var serviceId = 'authInterceptor';
  angular.module('app').factory(serviceId, function($rootScope, $q, $window, $location, localStorageService, cookie) {

    function removeCookieAndReload() {
      cookie.remove('isAuthenticated');
      location.reload();
    }

    var token = localStorageService.get('token');

    return {
      request: function(config) {
        config.headers = config.headers || {};
        if (token) {
          config.headers.Authorization = 'Bearer ' + token;
        } else {
          removeCookieAndReload();
        }
        console.log(config.url);
        return config;
      },
      responseError: function(response) {
        if (response.status === 401) {
          removeCookieAndReload();
        }
        return response || $q.when(response);
      }
    };
  });

})();
