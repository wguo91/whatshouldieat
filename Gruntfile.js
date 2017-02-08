module.exports = function(grunt) {
  // project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      all: ['Gruntfile.js', 'app.js', 'routes/*.js', 'public/**/*.js', 'config/*.js'],
      options: {
        jshintrc: '.jshintrc',
        ignores: ['**/*.min.js']
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        files: {
          'app.min.js': ['app.js'],
          'routes/index.min.js': ['routes/index.js'],
          'public/js/index.min.js': ['public/js/index.js'],
          'public/js/main.min.js': ['public/js/main.js']
        }
      }
    },
    cssmin: {
      options: {
        shorthandCompacting: false,
        roundingPrecision: -1
      },
      target: {
        files: {
          'public/css/main.min.css': ['public/css/main.css']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // default tasks
  grunt.registerTask('default', ['jshint', 'uglify', 'cssmin']);
};
