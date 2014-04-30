module.exports = function (grunt) {
    var scripts = [
            'bower_components/angular/angular.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'bower_components/angular-route/angular-route.js',
            'bower_components/angular-sanitize/angular-sanitize.js',

            'bower_components/jquery/dist/jquery.js',
            'bower_components/toastr/toastr.js',
            'app/lib/select2.js',
            'app/lib/modernizr-custom.js',
            'app/lib/sticky/sticky.js',
            'bower_components/datetimepicker/jquery.datetimepicker.js',
            'bower_components/mockJSON/js/jquery.mockjson.js',
            'bower_components/ng-tags-input/ng-tags-input.js',
            'bower_components/ngAutocomplete/src/ngAutocomplete.js',
            'bower_components/angular-i18n/angular-locale_ru-ru.js',
            'app/lib/sticky/sticky.js',
            'bower_components/RandomColor/rcolor.js',
            'bower_components/AngularGM/angular-gm.js',

            'app/app.js',
            'app/config.exceptionHandler.js',
            'app/config.js',
            'app/config.route.js',
            'app/services/datacontext.js',
            'app/services/directives.js',
            'app/services/constants.js',
            'app/services/date.js',
            'app/services/transaxns.js',
            'app/common/common.js',
            'app/common/logger.js',
            'app/transactions/transactions.js',
            'app/shell/shell.js',

            'app/services/modelStub.js',
            'app/httpBackendStub.js'
        ],
        styles = [
            'app/css/application.css',
            'bower_components/toastr/toastr.css',
            'bower_components/ng-tags-input/ng-tags-input.css',
            'bower_components/datetimepicker/jquery.datetimepicker.css',
            'app/css/app.css',
            'app/css/overlay.css',
            'app/lib/sticky/sticky.css'
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
                    '!app/eyeSpend.min.js'
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

    var target = grunt.option('target') || 'dev';
    grunt.registerTask('default', ['uglify:' + target, 'cssmin']);
};
