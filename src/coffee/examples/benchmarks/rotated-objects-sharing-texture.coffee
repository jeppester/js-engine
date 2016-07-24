class Main
  constructor: ->
    engine.loader.hideOverlay => @onLoaded()
    @lastFive = []
    @posX = 0
    @posY = 0
    @rotation = 0
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
    objects = engine.currentRoom.children.length
    frames = engine.frames - @startFrames
    fps = (engine.frames - @startFrames) / 10

    @lastFive.push frames
    @lastFive.shift() if @lastFive.length > 5
    average = @lastFive.reduce (a, b)-> a + b
    average /= @lastFive.length * 10

    console.log "Objects: #{objects} - Frames: #{frames} - FPS: #{fps} - Average: #{average}"
    @startTest()

  addObjects: (count = 10)->
    cols = rows = Math.max Math.sqrt count
    col = 0
    row = 0
    direction = 0
    xInt = engine.canvasResX / cols
    yInt = engine.canvasResY / rows
    directionInt = Math.PI / 100

    for i in [0...count]
      x = col * xInt
      y = row * yInt
      sprite = new Engine.Views.Sprite('rock', x, y, direction)
      engine.currentRoom.addChildren sprite

      direction += directionInt
      ++row
      if row > rows
        row = 0
        ++col

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
