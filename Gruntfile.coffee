coffeeify = require('coffeeify')

module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON('package.json')

    stylus:
      options:
        paths: ['src/stylus']
      development:
        files: 'www/engine.css': 'src/stylus/engine.styl'

    browserify:
      engine:
        options:
          browserifyOptions:
            extensions: ['.coffee']
            paths: ['./node_modules', './src']
            transform: [coffeeify]
            standalone: 'Engine'
            plugin: ['browserify-derequire']
        files: [
          'www/engine.js': ['src/coffee/engine.coffee']
        ]
      examples:
        options:
          browserifyOptions:
            extensions: ['.coffee']
            paths: ['./src/examples']
            transform: [coffeeify]
        files: [
          expand: true
          cwd: "src/examples/coffee"
          src: "**/*.coffee"
          dest: "www/examples/js"
          ext: ".js"
        ]

    jade:
      examples:
        files: [
          expand: true
          cwd: "src/examples/jade"
          src: "**/[^_]*.jade"
          dest: "www/examples"
          ext: ".html"
        ]

    watch:
      options:
        livereload: true
      jade:
        files: [ 'src/**/*.jade' ]
        tasks: [ 'jade', 'browserify' ]
      stylus:
        files: [ 'src/**/*.styl' ]
        tasks: [ 'stylus' ]
      browserifyEngine:
        files: [ 'src/coffee/**/*.coffee' ]
        tasks: [ 'browserify:engine' ]
      browserifyExamples:
        files: [ 'src/exmpales/coffee/**/*.coffee' ]
        tasks: [ 'browserify:examples' ]

    connect:
      server:
        options:
          livereload: true
          port: 8000
          base: 'www'

    open:
      development:
        path: 'http://localhost:8000/examples'

  grunt.loadNpmTasks 'grunt-browserify'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-stylus'
  grunt.loadNpmTasks 'grunt-contrib-jade'
  grunt.loadNpmTasks 'grunt-contrib-connect'
  grunt.loadNpmTasks 'grunt-open'

  grunt.registerTask 'compile', ['jade', 'stylus', 'browserify']
  grunt.registerTask 'start', ['compile', 'connect', 'open', 'watch']
