(function() {
  var Shell,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Shell = (function(_super) {
    __extends(Shell, _super);

    Shell.register();

    Shell.inject('common', 'debounce', '$rootScope', 'tmhDynamicLocale', 'config', 'login', '$translate', 'cookie');

    function Shell(common, debounce, $rootScope, tmhDynamicLocale, config, login, $translate, cookie) {
      var events, toggleSpinner;
      this.common = common;
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
      this.activate([]).then(function() {
        return $rootScope.lang = config.local;
      });
    }

    return Shell;

  })(BaseCtrl);

}).call(this);
