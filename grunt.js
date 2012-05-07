module.exports = function(grunt) {

    var sources = [
        './dist/plow.js'
    ];

    var tasks = 'lint min';

    grunt.initConfig({
        lint: {
            files : sources
        },
        min: {
            'plow.min.js': sources
        }
    });

    grunt.registerTask('default', tasks);
};