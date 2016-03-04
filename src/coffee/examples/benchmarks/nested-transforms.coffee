class Main
  constructor: ->
    engine.loader.hideOverlay => @onLoaded()
    @lastFive = []
    @posX = 0
    @posY = 0
    @rotation = 0

    # Create rotation operation
    engine.defaultActivityLoop.attachOperation 'rotation-transform', (objects)->
      for object in objects
        object.direction += engine.perFrameSpeed object.rotationSpeed

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
    objects = @count
    frames = engine.frames - @startFrames
    fps = (engine.frames - @startFrames) / 10

    @lastFive.push frames
    @lastFive.shift() if @lastFive.length > 5
    average = @lastFive.reduce (a, b)-> a + b
    average /= @lastFive.length * 10

    console.log "Objects: #{objects} - Frames: #{frames} - FPS: #{fps} - Average: #{average}"
    @startTest()

  addObjects: (count = 10)->
    arms = 20
    subCount = Math.floor count / arms

    outerContainer = new Engine.Views.Container()
    outerContainer.x = engine.canvasResX / 2
    outerContainer.y = engine.canvasResY / 2
    outerContainer.rotationSpeed = Math.PI / 4
    outerContainer.widthScale = .85
    engine.defaultActivityLoop.subscribeToOperation 'rotation-transform', outerContainer
    engine.currentRoom.addChildren outerContainer

    sprite = new Engine.Views.Sprite 'rock', 0, 0
    outerContainer.addChildren sprite

    @count = 1
    for arm in [0...arms]
      dist = 150
      direction = Math.PI * 2 / arms * arm
      nextContainer = outerContainer

      for object in [0...subCount]
        container = new Engine.Views.Container()
        container.x = Math.cos(direction) * dist
        container.y = Math.sin(direction) * dist
        container.widthScale = nextContainer.widthScale
        container.rotationSpeed = nextContainer.rotationSpeed

        engine.defaultActivityLoop.subscribeToOperation 'rotation-transform', container
        nextContainer.addChildren container

        sprite = new Engine.Views.Sprite 'rock', 0, 0
        @count++
        container.addChildren sprite

        dist *= .9
        nextContainer = container

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
