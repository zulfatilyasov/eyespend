module.exports = function (grunt) {
    var target = grunt.option('target') || 'dev';
    var scripts = [
            'bower_components/jquery/dist/jquery.js',
            'bower_components/angular/angular.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'bower_components/angular-route/angular-route.js',
            'bower_components/angular-sanitize/angular-sanitize.js',
            'bower_components/angular-animate/angular-animate.js',
            'bower_components/angular-dynamic-locale/src/tmhDynamicLocale.js',
//            'bower_components/angular-touch/angular-touch.js',
            'bower_components/toastr/toastr.js',
            'app/lib/select2.js',
            'app/lib/angular-ui-mask/ng-mask.js',
            'app/lib/modernizr-custom.js',
            'app/lib/bootstrap/tooltip.js',
            'app/lib/bootstrap/popover.js',
            'app/lib/bootstrap-slider-3.0.1/bootstrap-slider.js',
            'app/lib/ng-tags-input/ng-tags-input.js',
            'bower_components/datetimepicker/jquery.datetimepicker.js',
            'bower_components/switchery/dist/switchery.js',
            'bower_components/ng-switchery/src/ng-switchery.js',
            'bower_components/ngAutocomplete/src/ngAutocomplete.js',
            'bower_components/angular-local-storage/angular-local-storage.js',
            'bower_components/angular-i18n/angular-locale_ru.js',
            'bower_components/RandomColor/rcolor.js',
            'bower_components/AngularGM/angular-gm.js',
            'bower_components/angular-translate/angular-translate.js',
            'bower_components/angular-inview/angular-inview.js',
            'bower_components/momentjs/moment.js',
            'bower_components/momentjs/lang/ru.js',
            'bower_components/angularjs-geolocation/src/geolocation.js',
            'bower_components/bootstrap-daterangepicker/daterangepicker.js',
//            'bower_components/fastclick/lib/fastclick.js',
            'app/lib/ng-bs-daterangepicker/src/ng-bs-daterangepicker.js',

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
            'app/services/debounce.js',
            'app/services/map.js',
            'app/common/common.js',
            'app/common/logger.js',
            'app/transactions/transactions.js',
            'app/shell/shell.js',
            'app/login/login.js',
            'app/settings/settings.js'
        ],
        styles = [
            'app/css/application.css',
            'bower_components/animate.css/animate.css',
            'bower_components/toastr/toastr.css',

            'app/lib/ng-tags-input/ng-tags-input.css',
            'bower_components/switchery/dist/switchery.css',
            'bower_components/datetimepicker/jquery.datetimepicker.css',
            'bower_components/bootstrap-daterangepicker/daterangepicker-bs3.css',
            'app/css/app.css',
            'app/css/overlay.css',
            'app/css/simptip.css',
            'app/lib/sticky/sticky.css',
            'app/css/animations.css'
        ],
        uglifyOptions = {
            mangle: false,
            compress: false
        },
        uglifyDevOptions= {
            mangle: false,
            compress: false,
            sourceMap : true
        };

//    if (target === 'dev') {
//        scripts.push('app/services/modelStub.js');
//        scripts.push('app/httpBackendStub.js');
//    }

    grunt.initConfig({
        uglify: {
            dev: {
                options: uglifyDevOptions,
                files: {
                    'app/eyeSpend.min.js': scripts
                }
            },
            prod: {
                options: uglifyOptions,
                files: {
                    'app/eyeSpend.min.js': scripts
                }
            }
        },
        cssmin: {
            combine: {
                files: {
                    'app/eyeSpend.min.css': styles
                }
            }
        },
        watch: {
            scripts: {
                files: ['Gruntfile.js',
                    'app/**/*',
                    '!app/eyeSpend.min.css',
                    '!app/eyeSpend.min.js',
                    '!app/eyeSpend.min.map'
                ],
                tasks: ['default'],
                options: {
                    interrupt: true,
                    livereload: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.registerTask('default', ['uglify:' + target, 'cssmin']);
};
