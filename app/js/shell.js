(function() {
  var ShellCtrl, controllerId,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.BaseCtrl = (function() {
    function BaseCtrl(common) {
      this.common = common;
    }

    BaseCtrl.prototype.activate = function(promises, controllerId) {
      return this.common.activateController(promises, controllerId).then(function() {
        return console.log('activated ' + controllerId);
      });
    };

    BaseCtrl.prototype.register = function(deps, name, module, controller) {
      return app.module(module).controller(name, deps, controller);
    };

    return BaseCtrl;

  })();

  controllerId = 'shell';

  angular.module('app').controller(controllerId, [
    'common', 'debounce', '$rootScope', 'tmhDynamicLocale', 'config', 'login', '$translate', 'cookie', ShellCtrl = (function(_super) {
      __extends(ShellCtrl, _super);

      function ShellCtrl(common, debounce, $rootScope, tmhDynamicLocale, config, login, $translate, cookie) {
        var events, toggleSpinner;
        this.cookie = cookie;
        ShellCtrl.__super__.constructor.call(this, common);
        this.logout = login.logout;
        this.langsOpen = false;
        this.activePage = 'expenses';
        events = config.events;
        $rootScope.showSpinner = false;
        $rootScope.showSpinner = false;
        $rootScope.lang = config.local;
        tmhDynamicLocale.set(config.local);
        $rootScope.closeImageOverlay = function() {
          $rootScope.showImage = false;
          return $rootScope.imgUrl = '';
        };
        toggleSpinner = function(enable) {
          return $rootScope.showSpinner = enable;
        };
        $rootScope.$on('$routeChangeStart', function(event, next) {
          if (next.$$route.originalPath === '/') {
            return toggleSpinner(true);
          }
        });
        $rootScope.$on(events.controllerActivateSuccess, function() {
          return toggleSpinner(false);
        });
        $rootScope.$on(events.spinnerToggle, function(event, data) {
          return toggleSpinner(true);
        });
        this.activate([], controllerId).then(function() {
          return $rootScope.lang = config.local;
        });
        this.togglePopover = function() {
          return this.langsOpen = !this.langsOpen;
        };
        this.translate = function(lang) {
          config.local = lang;
          cookie.set('lang', lang);
          $translate.use(lang);
          if (lang === 'ru') {
            moment.locale(lang);
          } else {
            moment.locale('en-gb');
          }
          tmhDynamicLocale.set(lang);
          $rootScope.lang = lang;
          return this.togglePopover();
        };
      }

      return ShellCtrl;

    })(BaseCtrl)
  ]);

}).call(this);
