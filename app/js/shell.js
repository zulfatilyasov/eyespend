(function() {
  var controllerId;

  controllerId = 'shell';

  angular.module('app').controller(controllerId, [
    'common', 'debounce', '$rootScope', 'tmhDynamicLocale', 'config', 'login', '$translate', 'cookie', function(common, debounce, $rootScope, tmhDynamicLocale, config, login, $translate, cookie) {
      var activate, events, toggleSpinner, vm;
      vm = this;
      vm.logout = login.logout;
      vm.langsOpen = false;
      vm.activePage = 'expenses';
      events = config.events;
      $rootScope.showSpinner = false;
      $rootScope.showSpinner = false;
      $rootScope.lang = config.local;
      tmhDynamicLocale.set(config.local);
      activate = function() {
        var promises;
        promises = [];
        return common.activateController(promises, controllerId).then(function() {
          return $rootScope.lang = config.local;
        });
      };
      vm.togglePopover = function() {
        return vm.langsOpen = !vm.langsOpen;
      };
      $rootScope.closeImageOverlay = function() {
        $rootScope.showImage = false;
        return $rootScope.imgUrl = '';
      };
      vm.translate = function(lang) {
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
        return vm.togglePopover();
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
      activate();
    }
  ]);

}).call(this);
