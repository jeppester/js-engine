module.exports = (mainClass)->
  new Engine
    # Set game-class path (Look at this file to start programming your game)
    mainClass: mainClass

    # Set themes to load
    themesPath: '../assets'
    themes: ['example']

    # Set arena background-color
    backgroundColor: "#000"

    # Disable webgl using "canvas" search param
    disableWebGL: /canvas/.test window.location.search

    # Disable pause on blur (so that JavaScript profiling can be done easier)
    pauseOnBlur: false

    # Set resolution of the game
    canvasResX: 600
    canvasResY: 400
