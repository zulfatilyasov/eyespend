(function() {
  'use strict';

  var serviceId = 'login';
  angular.module('app').factory(serviceId, ['common', 'datacontext', 'localStorageService', 'cookie', login]);

  function login(common, datacontext, localStorageService, cookie) {
    function setAuthenticated(token) {
      localStorageService.set('token', token);
      cookie.set('isAuthenticated', 'true');
    }

    function removeAuthenticated() {
      cookie.remove('isAuthenticated');
      localStorageService.remove('token');
    }

    var userTags = null;
    var totals = null;

    var success = function(def) {
      return function(data, status) {
        if (status == 401) {
          error(def)();
        } else {
          setAuthenticated(data.token);
          userTags = data.userTags;
          totals = data.totals;
          def.resolve();
        }
      };
    };

    var error = function(def) {
      return function(data, status, headers, config) {
        removeAuthenticated();
        def.reject();
      };
    };

    var authenticate = function(user) {
      var def = common.$q.defer();
      datacontext.authenticate(user)
        .success(success(def))
        .error(error(def));
      return def.promise;
    };

    var quickPass = function(psw) {
      var def = common.$q.defer();
      datacontext.quickPass(psw)
        .success(success(def))
        .error(error(def));
      return def.promise;
    };

    var logout = function() {
      removeAuthenticated();
      location.reload();
    };

    var authenticated = function() {
      var token = localStorageService.get('token');
      return !!token;
    };

    var changeSuccess = function(def) {
      return function(data, status) {
        if (status !== 200 && status !== 201) {
          def.reject(data);
          return;
        }
        def.resolve();
      };
    };

    var changeError = function(def) {
      return function(data)  {
        def.reject(data);
      };
    };

    var changePassword = function(data) {
      var def = common.$q.defer();
      datacontext.changePsw(data.psw, data.old)
        .success(changeSuccess(def))
        .error(changeError(def));
      return def.promise;
    };

    function validEmail(email) {
      var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    }

    function getUserTags() {
      if (userTags)
        return common.$q.when(userTags);

      var def = common.defer();
      datacontext.getUserTags()
        .success(function(data) {
          userTags = data;
          def.resolve(userTags);
        });
      return def.promise;
    }

    return {
      authenticate: authenticate,
      logout: logout,
      removeAuthenticated: removeAuthenticated,
      quickPass: quickPass,
      authenticated: authenticated,
      changePassword: changePassword,
      validEmail: validEmail,
      getUserTags: getUserTags
    };
  }
})();
