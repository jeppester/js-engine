fs = require 'fs'

module.exports = (path) ->
  files = fs.readdirSync(path)
  # Delete contents
  files.forEach (name) ->
    subPath = "#{path}/#{name}"
    if ['.', '..'].indexOf path == -1
      if fs.statSync(subPath).isDirectory()
        fs.rmdirRecSync subPath
      else
        fs.unlinkSync subPath
  # Delete folder
  fs.rmdirSync path
