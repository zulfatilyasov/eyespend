
'use strict';

module.exports = function(grunt) {
    var target = grunt.option('target') || 'dev';

    //    if (target === 'dev') {
    //        scripts.push('app/services/modelStub.js');
    //        scripts.push('app/httpBackendStub.js');
    //    }

    grunt.initConfig({
        indent: {
            src: ['app/services/datepickerSrvc.coffee'],
            options: {
              style: 'space',
              size: 2,
              change: -2
            }
        },
        sprite:{
          all: {
            src: 'app/img/**/*.png',
            destImg: 'app/img/spritesheet.png',
            destCSS: 'app/css/app.css'
          }
        },
        coffee: {
            compile: {
                expand: true,
                flatten: true,
                src: ['app/**/*.coffee', '!app/bower_components/**/*', '!app/lib/**/*'],
                dest: 'app/js/',
                ext: '.js'
            }
        },
		coffeelint: {
            options:{
                   'max_line_length':{
                        value: 120
                    }
                },
            app:{
               src: ['app/**/*.coffee', '!app/bower_components/**/*', '!app/lib/**/*']
           }
		},
        useminPrepare: {
            html: './dist/app.html',
            options: {
                flow: {
                    steps: {
                        js: ['concat', 'uglifyjs'],
                        css: ['concat', 'cssmin']
                    },
                    post: {}
                }
            }
        },
        usemin: {
            html: './dist/app.html'
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
            options: {
                mangle: false,
                compress: false
            }
        },
        clean: {
            dist: {
                src: ['dist']
            },
            bower: {
                src: ['dist/bower_components']
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
                        'dist/app.html',
                        'dist/settings/settings.html',
                        'dist/stats/stats.html',
                        'dist/shell/shell.html',
                        'dist/transactions/transactions.html'
                    ]
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
                        'dist/landing-3/index.html'
                    ]
                }]
            }
        },
        watch: {
            app: {
                files: [
                    'app/**/*',
                    '!app/bower_components/**/*',
                    '!app/js/*'
                ],
                tasks: ['newer:coffeelint','newer:coffee'],
                options: {
                    interrupt: true,
                    livereload: true
                }
            },
            landing: {
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

	grunt.loadNpmTasks('grunt-newer');
    grunt.loadNpmTasks('grunt-coffeelint');
    grunt.loadNpmTasks('grunt-contrib-coffee');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-cache-bust');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-express');
    grunt.loadNpmTasks('grunt-run');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-indent');
    grunt.loadNpmTasks('grunt-spritesmith');

    grunt.registerTask('bust', ['cacheBust:app', 'cacheBust:landing']);
    grunt.registerTask('minify', ['useminPrepare', 'concat:generated', 'cssmin:generated', 'uglify:generated', 'usemin']);
    grunt.registerTask('build', ['clean:dist', 'coffee', 'copy', 'minify', 'bust', 'clean:bower']);
    // grunt.registerTask('coffee', ['coffee']);

    grunt.registerTask('start', ['run:stub', 'open:localhost', 'wait:stub']);
    grunt.registerTask('start:dist', ['run:stub-dist', 'open:localhost', 'wait:stub-dist']);
    grunt.registerTask('start:service', ['run:service', 'open:localhost', 'wait:service']);
    grunt.registerTask('start:service-dist', ['run:service-dist', 'open:localhost', 'wait:service-dist']);

    grunt.registerTask('default', ['build']);
    grunt.registerTask('stub', ['start']);
    grunt.registerTask('stub:dist', ['build', 'start:dist']);
    grunt.registerTask('service', ['start:service']);
    grunt.registerTask('service:dist', ['build', 'start:service-dist']);
	grunt.registerTask('watch'['watch:app']);
};
