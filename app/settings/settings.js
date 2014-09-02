(function() {
  'use strict';
  var controllerId = 'settings';
  angular.module('app').controller(controllerId, ['common', '$location', 'login', '$translate', 'datacontext', settings]);

  function settings(common, $location, login, $translate, datacontext) {
    var logSuccess = common.logger.getLogFn(controllerId, 'logSuccess');
    var logError = common.logger.getLogFn(controllerId, 'logError');
    var vm = this;
    vm.link = {};
    vm.email = {};
    vm.changeEmail = false;

    function validLinkEmailForm() {
      vm.link.invalidEmail = false;
      vm.link.invalidPassword = false;
      if (!vm.link.email) {
        $translate('TYPE_EMAIL')
          .then(function(msg) {
            vm.link.invalidEmail = true;
            logError(msg);
          });
        return false;
      }
      if (!login.validEmail(vm.link.email)) {
        $translate('INVALID_EMAIL')
          .then(function(msg) {
            vm.link.invalidEmail = true;
            logError(msg);
          });
        return false;
      }
      if (vm.email.address && !vm.link.password) {
        $translate('TYPE_CURRENT_PASSWORD')
          .then(function(msg) {
            vm.link.invalidPassword = true;
            logError(msg);
          });
        return false;
      }
      return true;
    }

    vm.changePassword = function() {
      vm.passwordError = false;
      vm.confirmationError = false;
      var setErrorMessage = function(message) {
        vm.error = true;
        logError(message);
      };
      if (!vm.currentPsw) {
        setErrorMessage("Введите текущий пароль");
        vm.currentPswError = true;
        return;
      }
      if (!vm.psw) {
        setErrorMessage("Введите пароль");
        vm.passwordError = true;
        return;
      }
      if (!vm.confirmation) {
        vm.confirmationError = true;
        setErrorMessage("Введите подтверждение пароля");
        return;
      }
      if (vm.psw !== vm.confirmation) {
        vm.passwordError = true;
        vm.confirmationError = true;
        setErrorMessage("Пароли не совпадают");
        return;
      }

      var success = function(message) {
        vm.error = false;
        logSuccess(message);
      };
      var error = function(message) {
        setErrorMessage(message);
      };

      login.changePassword({
        psw: vm.psw,
        old: vm.currentPsw
      })
        .then(success, error);
    };

    vm.linkEmail = function() {
      if (validLinkEmailForm() == false)
        return;
      if (!vm.email.address) {
        datacontext.linkEmail(vm.link.email)
          .success(emailChangeSuccess);
      } else {
        console.log(vm.link.password);
        datacontext.changeEmail(vm.link.email, vm.link.password)
          .success(emailChangeSuccess);
      }
    };

    function emailChangeSuccess(data, status) {
      if (status !== 200 && status != 201) {
        if (vm.email.address) {
          $translate('INVALID_PASSWORD')
            .then(function(msg) {
              vm.link.invalidPassword = true;
              logError(msg);
            });
        } else {
          logError('Произошла ошибка');
        }

      } else {
        logSuccess('Отправлено письмо.<br/>Активируйте e-mail');
        vm.email.address = vm.link.email;
        vm.email.verified = false;
      }
    }

    function getSettings() {
      var def = common.defer();
      datacontext.getSettings()
        .success(function(data) {
          vm.mobileLink = data.mobileLink;
          vm.emailLink = data.emailLink;
          vm.emailChangeRequest = data.emailChangeRequest;
          // vm.linkcode = data.linkCode;
          // vm.email = data.email;
          //                    vm.email.verified = data.verified;
          def.resolve();
        });
      return def.promise;
    }

    function activate() {
      var promises = [getSettings()];
      common.activateController(promises, controllerId)
        .then(function() {

        });
    }

    activate();
  }
})();
