module.exports = function (config) {
    config.set({

        basePath: '../',

        files: [
            'bower_components/angular/angular.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'bower_components/angular-route/angular-route.js',
            'bower_components/angular-sanitize/angular-sanitize.js',
            'bower_components/angular-animate/angular-animate.js',
            'bower_components/angular-cookies/angular-cookies.js',

            'bower_components/jquery/dist/jquery.js',
            'bower_components/toastr/toastr.js',
            'app/lib/select2.js',
            'app/lib/modernizr-custom.js',
            'app/lib/sticky/sticky.js',
            'app/lib/bootstrap/tooltip.js',
            'app/lib/bootstrap/popover.js',
            'bower_components/datetimepicker/jquery.datetimepicker.js',
            'bower_components/mockJSON/js/jquery.mockjson.js',
            'bower_components/ng-tags-input/ng-tags-input.js',
            'bower_components/ngAutocomplete/src/ngAutocomplete.js',
            'bower_components/angular-i18n/angular-locale_ru-ru.js',
            'app/lib/sticky/sticky.js',
            'bower_components/RandomColor/rcolor.js',
            'bower_components/AngularGM/angular-gm.js',
            'bower_components/angular-translate/angular-translate.js',

            'app/app.js',
            'app/config.exceptionHandler.js',
            'app/config.js',
            'app/config.route.js',
            'app/translations.js',
            'app/services/datacontext.js',
            'app/services/directives.js',
            'app/services/constants.js',
            'app/services/date.js',
            'app/services/transaxns.js',
            'app/services/loginService.js',
            'app/common/common.js',
            'app/common/logger.js',
            'app/transactions/transactions.js',
            'app/shell/shell.js',
            'app/login/login.js',
            'app/quickPass/quickPass.js',
            'app/settings/settings.js',

            'app/services/modelStub.js',
            'test/unit/transactionsCtrlSpec.js',
            'test/unit/loginCtrlSpec.js'
        ],

        autoWatch: true,

        frameworks: ['jasmine'],

        browsers: ['Chrome'],

        plugins: [
            'karma-chrome-launcher',
            'karma-safari-launcher',
            'karma-jasmine'
        ],

        junitReporter: {
            outputFile: 'test_out/unit.xml',
            suite: 'unit'
        }

    });
};