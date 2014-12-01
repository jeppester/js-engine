fs = require 'fs'
UglifyJS = require 'uglify-js'
concat = require 'concat'
copy = require 'directory-copy'
fs.rmdirRecSync = require './rmdir-recursive-sync'
jade = require 'jade'
coffee = require 'coffee-script'

jsEngineBuilder =
  minifyJsEngine: (outFile, callback, engineOnly) ->
    # Read dev.jade-file to find necessary files
    if engineOnly
      regex = /"js\/(jsEngine\/.+)\.js"/g
    else
      regex = /"js\/(.+)\.js"/g

    contents = fs.readFileSync('src/jade/dev.jade').toString().match regex

    # Compile and concatenate files
    contents = contents.map (name)->
      name = name.replace /"js\/(.+).js"/, '$1'
      console.log "Compiling: #{name}"
      coffee.compile fs.readFileSync("src/coffee/#{name}.coffee").toString(),
        bare: true
    contents = contents.join "\n"
    fs.writeFileSync "#{outFile}.src", contents

    # Minify compiled files
    result = UglifyJS.minify "#{outFile}.src",
      compress:
        drop_console: true
    fs.writeFileSync outFile, result.code

    # Delete unminified files
    fs.unlinkSync "#{outFile}.src"

    callback()

  buildHTML: (outFile, callback) ->
    fs.writeFile outFile, jade.renderFile('src/jade/dist.jade'), callback

  copyAssets: (outDir, callback) ->
    copy
      src: 'src/assets'
      dest: outDir
    , callback

  dist: (outDir, callback) ->
    outDir = outDir || 'dist'

    # Create out folder
    fs.rmdirRecSync outDir if fs.existsSync outDir
    fs.mkdirSync outDir
    fs.mkdirSync "#{outDir}/assets"

    # Minify phaser
    @minifyJsEngine "#{outDir}/game.dist.js", =>
      # Compile HTML and copy assets
      @buildHTML "#{outDir}/index.html", =>
        @copyAssets "#{outDir}/assets", =>
          # Copy css
          fs.writeFileSync "#{outDir}/game.dist.css", fs.readFileSync('src/css/style.css')
          callback()

module.exports = jsEngineBuilder
