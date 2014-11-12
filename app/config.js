(function() {
    'use strict';

    var app = angular.module('app');

    toastr.options.timeOut = 4000;
    toastr.options.positionClass = 'toast-top-right';

    var events = {
        controllerActivateSuccess: 'controller.activateSuccess',
        spinnerToggle: 'spinner.toggle',
        localeChange:'locale.change',
        locationSet: 'location.set'
    };

    var cookie = {
        get: function(name) {
            var matches = document.cookie.match(new RegExp(
                "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
            ))
            return matches ? decodeURIComponent(matches[1]) : undefined
        },
        set: function(name, value) {
            var now = new Date();
            var yearAfterNow = new Date(new Date(now).setMonth(now.getMonth() + 12));
            document.cookie = name + "=" + value + "; path=/; expires=" + yearAfterNow.toUTCString();
        },
        remove: function(name) {
            document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        }
    }

    app.value('cookie', cookie);

    var lang = cookie.get('lang');
    if (!lang)
        lang = 'ru';

    if (lang == 'ru')
        moment.locale('ru');
    else
        moment.locale('en-gb');

    var config = {
        appErrorPrefix: '[HT Error] ',
        events: events,
        version: '1.0',
        local: lang
    };

    app.value('config', config);

    app.config(['$logProvider',
        function($logProvider) {
            if ($logProvider.debugEnabled) {
                $logProvider.debugEnabled(true);
            }
        }
    ]);

    app.config(['tmhDynamicLocaleProvider',
        function(tmhDynamicLocaleProvider) {
            tmhDynamicLocaleProvider.localeLocationPattern('locales/angular-locale_{{locale}}.js');
        }
    ]);

    app.config(['commonConfigProvider',
        function(cfg) {
            cfg.config.controllerActivateSuccessEvent = config.events.controllerActivateSuccess;
            cfg.config.spinnerToggleEvent = config.events.spinnerToggle;
        }
    ]);

    app.config(['$translateProvider',
        function($translateProvider) {
            $translateProvider
                .translations('ru', translationsRu)
                .translations('en', translationsEn)
                .preferredLanguage(config.local);
        }
    ]);

    app.config(function($httpProvider) {
        $httpProvider.interceptors.push('authInterceptor');
    });
})();
