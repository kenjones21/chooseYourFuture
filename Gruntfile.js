js_files = ['Gruntfile.js', 'src/public/javascript/app.js', 'server.js', 'src/server/**/*.js'];

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
	all: js_files,
	options: {
	    asi: true
	}
    },

    stylus: {
      compile: {
        options: {

        },
        files: {
          'src/public/stylesheets/style.css': 'src/stylus/main.styl',
	  'src/public/stylesheets/other.css': 'src/stylus/other.styl'
        }
      }
    },

    watch: {
      options: {
        livereload: true,
      },

      scripts: {
        files: js_files,
        tasks: ['jshint'],
        options: {
          spawn: false
        }
      },

      css: {
        files: ['src/stylus/*.styl'],
        tasks: ['stylus'],
        options: {
          spawn: false
        }
      }
    }
  });

  require('load-grunt-tasks')(grunt);
  grunt.registerTask('default', ['jshint', 'stylus','watch']);
};
