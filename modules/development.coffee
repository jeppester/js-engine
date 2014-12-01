jade = require 'jade'
fs = require 'fs'
coffee = require 'coffee-script'
fs.rmdirRecSync = require './rmdir-recursive-sync'

cache = {}

# Middleware
middleware = (req, res, next) ->
  console.log "GET: #{req.originalUrl}"

  if req.originalUrl.match /^\/js\/.+\.js$/
    path = req.originalUrl.match(/^\/js\/(.+)\.\w+$/)[1]
    name = path.match(/([^\/]+)$/)[1]
    src = "./src/coffee/#{path}.coffee"
    stats = fs.statSync src

    if !cache[path] || stats.mtime.getTime() > cache[path].timestamp
      console.log "Compiling: #{path}"
      result = coffee.compile fs.readFileSync(src).toString(),
        sourceMap: true
        bare: true
        generatedFile: ["#{name}.js"]
        sourceFiles: ["#{name}.coffee"]

      result.coffee = fs.readFileSync(src)
      result.timestamp = new Date().getTime()
      result.js += "\n//# sourceMappingURL=#{name}.map"

      cache[path] = result
      res.end result.js
    else
      res.end cache[path].js

  else if req.originalUrl.match /^\/js\/.+\.map$/
    path = req.originalUrl.match(/^\/js\/(.+)\.\w+$/)[1]
    res.end cache[path].v3SourceMap

  else if req.originalUrl.match /^\/js\/.+\.coffee$/
    path = req.originalUrl.match(/^\/js\/(.+)\.\w+$/)[1]
    res.end cache[path].coffee

  else if req.originalUrl.match(/^\/assets/) && fs.existsSync('./src' + req.originalUrl)
    res.end fs.readFileSync('./src' + req.originalUrl)

  else if req.originalUrl.match /^\/(index\.\w*)?$/
    res.end jade.renderFile('src/jade/dev.jade')

  else if req.originalUrl.match /\.css$/
    res.end fs.readFileSync("./src#{req.originalUrl}")

  else
    next()

module.exports = middleware
