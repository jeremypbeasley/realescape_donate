module.exports = function(grunt) {

  // 1. All configuration goes here
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    stylus: {
      options: {
        'compress': false,
        'include css': true
      },
      compile: {
        files: {
          'public/master.css': '_resources/_styles/master.styl',
        }
      }
    },
    concat: {
      dist: {
        src: [
          // 'node_modules/jquery/dist/jquery.min.js',
          'node_modules/jquery-validation/dist/jquery-validate.js',
          '_resources/_scripts/main.js'
        ],
        dest: 'public/master.js',
      }
    },
    watch: {
      scripts: {
        files: [
          '_resources/_scripts/*.js',
          'Gruntfile.js',
          '_resources/_styles/*.styl'
        ],
        tasks: ['concat', 'stylus'],
        options: {
          spawn: false
        },
      }
    },
  });

  // 2. Where we tell Grunt we plan to use this plug-in.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-stylus');

  // 3. Where we tell Grunt what to do when we type "grunt" into the terminal.
  grunt.registerTask('default', ['concat', 'stylus', 'watch']);
};
