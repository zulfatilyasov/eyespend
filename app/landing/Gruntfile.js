module.exports = function(grunt) {
    grunt.initConfig({
        watch: {
            scripts: {
                tasks: ['default'],
                options: {
                    interrupt: true,
                    livereload: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('default', []);
};
