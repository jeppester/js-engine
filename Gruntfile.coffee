module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON('package.json')

    jade:
      development:
        files: 'www/index.html': 'src/jade/index.jade'

    stylus:
      options:
        paths: ['src/stylus']
      development:
        files: 'www/engine.css': 'src/stylus/engine.styl'

    browserify:
      options:
        browserifyOptions:
          extensions: ['.coffee', '.jade']
          paths: ['./node_modules','./src']
      development:
        files: 'www/engine.js': ['src/coffee/engine.coffee']

    watch:
      options:
        livereload: true
      jade:
        files: [ 'src/**/*.jade' ]
        tasks: [ 'jade', 'browserify' ]
      stylus:
        files: [ 'src/**/*.styl' ]
        tasks: [ 'stylus' ]
      browserify:
        files: [
          'src/**/*.coffee'
          'src/**/*.js'
        ]
        tasks: [ 'browserify' ]

    connect:
      server:
        options:
          livereload: true
          port: 8000
          base: 'www'

    open:
      development:
        path: 'http://localhost:8000'

  grunt.loadNpmTasks 'grunt-browserify'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-stylus'
  grunt.loadNpmTasks 'grunt-contrib-jade'
  grunt.loadNpmTasks 'grunt-contrib-connect'
  grunt.loadNpmTasks 'grunt-open'

  grunt.registerTask 'compile', ['jade', 'stylus', 'browserify']
  grunt.registerTask 'start', ['compile', 'connect', 'open', 'watch']
