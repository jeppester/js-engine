module.exports =
  options:
    port: 8000
    livereload: false
    keepalive: true
    middleware: (connect, options, middlewares) ->
      # inject a custom middleware into the array of default middlewares
      middlewares.unshift require("../modules/development.coffee")
      return middlewares

  livereload:
    options:
      open: false
      base: ["tmp"]
