class Main
  constructor: ->
    engine.loader.hideOverlay => @onLoaded()
    setTimeout (=> @startTest()), 2000

  getSearch: ->
    s = window.location.search.replace /^\?/, ''
    parts = s.split '&'
    search = {}
    for part in parts
      [name, value] = part.split '='
      search[name] = value
    search

  onLoaded: ->
    @addObjects @getSearch()['objects'] || 8000

  startTest: ->
    @startFrames = engine.frames
    setTimeout (=> @endTest()), 10000

  endTest: ->
    console.log "Objects: #{(Object.keys(engine.objectIndex).length - 2)} - Frames: #{engine.frames - @startFrames} - FPS: #{(engine.frames - @startFrames) / 10}"
    @startTest()

  addObjects: (count = 10)->
    for i in [0...count]
      sprite = new Engine.Views.GameObject(
        'rock'
        Math.random() * 600
        Math.random() * 400
        Math.random() * Math.PI * 2
        {speed: new Engine.Geometry.Vector(-5 + Math.random() * 10, -5 + Math.random() * 10)}
      )
      sprite.checkBounce = ->
        if @x < 0
          @x = 0;
          @speed.x = -@speed.x
        else if @x > 600
          @x = 600
          @speed.x = -@speed.x

        if @y < 0
          @y = 0
          @speed.y = -@speed.y
        else if @y > 400
          @y = 400;
          @speed.y = -@speed.y

      engine.currentRoom.loops.eachFrame.attachFunction sprite, sprite.checkBounce
      engine.currentRoom.addChildren sprite

new Engine
  # Set game-class path (Look at this file to start programming your game)
  gameClass: Main

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
