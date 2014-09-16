module.exports = function (grunt) {
    var target = grunt.option('target') || 'dev';
    var scripts = [
            'bower_components/angular/angular.js',
            'bower_components/angular-route/angular-route.js',
            'bower_components/angular-sanitize/angular-sanitize.js',
            'bower_components/angular-animate/angular-animate.js',
            'bower_components/angular-dynamic-locale/src/tmhDynamicLocale.js',
            'bower_components/toastr/toastr.js',
            'bower_components/datetimepicker/jquery.datetimepicker.js',
            'bower_components/ngAutocomplete/src/ngAutocomplete.js',
            'bower_components/angular-local-storage/angular-local-storage.js',
            'bower_components/angular-i18n/angular-locale_ru.js',
            'bower_components/AngularGM/angular-gm.js',
            'bower_components/angular-translate/angular-translate.js',
            'bower_components/momentjs/moment.js',
            'bower_components/momentjs/locale/ru.js',
            'bower_components/momentjs/locale/en-gb.js',
            'bower_components/angularjs-geolocation/src/geolocation.js',
            'bower_components/bootstrap-daterangepicker/daterangepicker.js',
            'bower_components/d3/d3.js',
            'bower_components/n3-line-chart/dist/line-chart.js',
            'app/lib/nanoscroller/jquery.nanoscroller.js',
            'app/lib/angular-nanoscroller/scrollable.js',
            'bower_components/jquery-ui/jquery-ui.js',
            'app/lib/jquery-debounce/jquery.debounce.js',
            'bower_components/spin.js/spin.js',
            'bower_components/angular-spinner/angular-spinner.js',

            'app/lib/jQAllRangeSliders-min.js',
            'app/lib/angular-ui-mask/ng-mask.js',
            'app/lib/modernizr-custom.js',
            'app/lib/bootstrap/tooltip.js',
            'app/lib/bootstrap/popover.js',
            'app/lib/bootstrap-slider-3.0.1/bootstrap-slider.js',
            'app/lib/ng-tags-input/ng-tags-input.js',
            'app/lib/ng-bs-daterangepicker/src/ng-bs-daterangepicker.js',


            'app/app.js',
            'app/config.exceptionHandler.js',
            'app/config.js',
            'app/config.route.js',
            'app/translations.js',
            'app/services/datacontext.js',
            'app/services/statsService.js',
            'app/services/authInterceptor.js',
            'app/services/directives.js',
            'app/services/constants.js',
            'app/services/date.js',
            'app/services/transaxns.js',
            'app/services/loginService.js',
            'app/services/debounce.js',
            'app/services/map.js',
            'app/services/rcolor.js',

            'app/common/common.js',
            'app/common/logger.js',
            'app/transactions/transactions.js',
            'app/shell/shell.js',
            'app/login/login.js',
            'app/settings/settings.js',
            'app/stats/stats.js'
        ],
        styles = [
            'app/lib/ng-tags-input/ng-tags-input.css',
            'app/lib/nanoscroller/nanoscroller/bin/css/nanoscroller.css',
            'bower_components/animate.css/animate.css',
            'bower_components/toastr/toastr.css',
            'bower_components/datetimepicker/jquery.datetimepicker.css',
            'bower_components/bootstrap-daterangepicker/daterangepicker-bs3.css',
            'bower_components/jqrangeslider/css/iThing.css',
            'bower_components/nouislider/jquery.nouislider.css',
            'bower_components/jqrangeslider/demo/lib/jquery-ui/css/jquery-ui-1.8.16.custom.css',
            'bower_components/jscrollpane/style/jquery.jscrollpane.css',
            'app/css/application.css',
            'app/css/overlay.css',
            'app/css/simptip.css',
            'app/css/animations.css',
            'app/css/app.css'
        ],
        uglifyOptions = {
            mangle: false,
            compress: false
        },
        uglifyDevOptions = {
            mangle: false,
            compress: false,
            sourceMap: true
        };

    //    if (target === 'dev') {
    //        scripts.push('app/services/modelStub.js');
    //        scripts.push('app/httpBackendStub.js');
    //    }

    grunt.initConfig({
        express: {
            server: {
                options: {
                    server: 'server.js',
                    //bases: './app',
                    //livereload: true,
                    //serverreload: true,
                    open: true
                }
            }
        },
        run: {
            service: {
                cmd: 'node',
                args: ['./server.js', 'real'],
                options: {
                    passArgs: [
                        'port'
                    ],
                    wait: false
                }
            },
            stub: {
                cmd: 'node',
                args: ['./server.js'],
                options: {
                    passArgs: [
                        'port'
                    ],
                    wait: false
                }
            },
            'service-dist': {
                cmd: 'node',
                args: ['./server.js', 'real', 'dist'],
                options: {
                    passArgs: [
                        'port'
                    ],
                    wait: false
                }
            },
            'stub-dist': {
                cmd: 'node',
                args: ['./server.js', 'dist'],
                options: {
                    passArgs: [
                        'port'
                    ],
                    wait: false
                }
            }
        },
        open: {
            localhost: {
                path: 'http://127.0.0.1:3000'
            }
        },
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
        copy: {
            main: {
                cwd: 'app/',
                src: '**',
                dest: 'dist/',
                expand: true
            }
        },
        cacheBust: {
            app: {
                options: {
                    encoding: 'utf8',
                    algorithm: 'md5',
                    length: 8
                },
                files: [{
                    src: [
                        'dist/index/index.html',
                        'dist/settings/settings.html',
                        'dist/stats/stats.html',
                        'dist/shell/shell.html',
                        'dist/transactions/transactions.html']
                }]
            },
            landing: {
                options: {
                    encoding: 'utf8',
                    algorithm: 'md5',
                    length: 8,
                    baseDir: 'dist'
                },
                files: [{
                    src: [
                        'dist/landing-3/index.html']
                }]
            }
        },
        watch: {
            A: {
                files: ['Gruntfile.js',
                    'app/**/*',
                    '!app/eyeSpend.min.css',
                    '!app/eyeSpend.min.js',
                    '!app/eyeSpend.min.map'
                ],
                tasks: ['uglify:' + target, 'cssmin'],
                options: {
                    interrupt: true,
                    livereload: true
                }
            },
            B: {
                files: [
                    'app/landing-2/**/*'
                ],
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
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-cache-bust');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-express');
    grunt.loadNpmTasks('grunt-run');
    grunt.loadNpmTasks('grunt-open');

    grunt.registerTask('bust', ['cacheBust:app', 'cacheBust:landing']);
    grunt.registerTask('build', ['uglify:' + target, 'cssmin', 'copy', 'bust']);
    grunt.registerTask('start', ['run:stub', 'open:localhost', 'wait:stub']);
    grunt.registerTask('start:dist', ['run:stub-dist', 'open:localhost', 'wait:stub-dist']);
    grunt.registerTask('start:service', ['run:service', 'open:localhost', 'wait:service']);
    grunt.registerTask('start:service-dist', ['run:service-dist', 'open:localhost', 'wait:service-dist']);
    grunt.registerTask('landing', ["watch:B"]);
    grunt.registerTask('app', ["watch:A"]);

    grunt.registerTask('default', ['build']);
    grunt.registerTask('stub', ['build', 'start']);
    grunt.registerTask('stub:dist', ['build', 'start:dist']);
    grunt.registerTask('service', ['build', 'start:service']);
    grunt.registerTask('service:dist', ['build', 'start:service-dist']);
};
