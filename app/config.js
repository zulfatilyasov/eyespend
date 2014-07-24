(function () {
    'use strict';

    var app = angular.module('app');

    toastr.options.timeOut = 4000;
    toastr.options.positionClass = 'toast-top-right';

    var events = {
        controllerActivateSuccess: 'controller.activateSuccess',
        spinnerToggle: 'spinner.toggle',
        locationSet: 'location.set'
    };

    var lang = getCookie('lang');
    if (!lang)
        lang = 'ru';

    var config = {
        appErrorPrefix: '[HT Error] ',
        events: events,
        version: '1.0',
        local: lang
    };

    app.value('config', config);

    app.config(['$logProvider', function ($logProvider) {
        if ($logProvider.debugEnabled) {
            $logProvider.debugEnabled(true);
        }
    }]);
    app.config(['tmhDynamicLocaleProvider', function (tmhDynamicLocaleProvider) {
        tmhDynamicLocaleProvider.localeLocationPattern('locales/angular-locale_{{locale}}.js');
    }]);

    app.config(['commonConfigProvider', function (cfg) {
        cfg.config.controllerActivateSuccessEvent = config.events.controllerActivateSuccess;
        cfg.config.spinnerToggleEvent = config.events.spinnerToggle;
    }]);

    app.config(['$translateProvider', function ($translateProvider) {
        $translateProvider
            .translations('ru', translationsRu)
            .translations('en', translationsEn)
            .preferredLanguage(config.local);
    }]);

    app.config(function ($httpProvider) {
        $httpProvider.interceptors.push('authInterceptor');
    });

    function getCookie(name) {
        var matches = document.cookie.match(new RegExp(
                "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ))
        return matches ? decodeURIComponent(matches[1]) : undefined
    }
})();
