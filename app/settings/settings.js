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
      var email = vm.changeEmail ? vm.link.newEmail : vm.link.email;
      if (!email) {
        $translate('TYPE_EMAIL')
          .then(function(msg) {
            vm.link.invalidEmail = true;
            logError(msg);
          });
        return false;
      }
      if (!login.validEmail(email)) {
        $translate('INVALID_EMAIL')
          .then(function(msg) {
            vm.link.invalidEmail = true;
            logError(msg);
          });
        return false;
      }
      if (!vm.link.password && vm.emailLink.status === "free") {
        $translate('TYPE_PASSWORD')
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
      if (vm.changeEmail) {
        datacontext.changeEmail(vm.link.newEmail)
          .success(emailChanged);
      } else {
        datacontext.linkInit(vm.link.email, vm.link.password)
          .success(emailChanged);
      }
    };

    function emailChangeSuccess() {
      if (vm.emailLink.status === 'linked') {
        vm.emailChangeRequest = {
          status: 'inProgress',
          address: vm.link.newEmail
        };
      } else if (vm.emailLink.status === 'free') {
        vm.emailLink = {
          address: vm.link.email,
          status: "linkPending"
        };
      } else {
        vm.emailLink = {
          address: vm.link.newEmail,
          status: "linkPending"
        };
      }

      logSuccess('Отправлено письмо.<br/>Активируйте e-mail');
      vm.changeEmail = false;
    }

    function emailChangeFail(data) {
      if (data.error && data.error.code === "invalid_email") {
        $translate('INVALID_EMAIL')
          .then(function(msg) {
            vm.link.invalidEmail = true;
            logError(msg);
          });
      } else {
        logError('Произошла ошибка');
      }
    }

    function emailChanged(data, status) {
      if (status !== 200 && status != 201) {
        emailChangeFail(data);
      } else {
        emailChangeSuccess();
      }
    }

    function getSettings() {
      var def = common.defer();
      datacontext.getSettings()
        .success(function(data) {
          vm.mobileLink = data.mobileLink;
          vm.emailLink = data.emailLink;
          vm.emailChangeRequest = data.emailChangeRequest;
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
