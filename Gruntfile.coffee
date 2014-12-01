module.exports = (grunt)->
  configs = require('load-grunt-configs')(grunt)
  grunt.initConfig configs

  grunt.registerTask 'build', ->
    done = this.async()
    grunt.log.writeln 'Building jsEngine'
    require("./modules/js-engine-builder.coffee").dist 'dist', =>
      grunt.log.writeln 'Build complete'
      done true

  # Load tasks
  grunt.loadNpmTasks 'grunt-contrib-connect'
  grunt.loadNpmTasks 'grunt-pngmin'

  grunt.registerTask 'dist', ['build', 'pngmin']
