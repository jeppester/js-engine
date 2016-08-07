module.exports = class Benchmark
  defaultObjectsCount: 8000

  constructor: ->
    engine.loader.hideOverlay => @onLoaded()
    @lastFive = []
    @posX = 0
    @posY = 0
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
    @addObjects @getSearch()['objects'] || @defaultObjectsCount

  startTest: ->
    @startFrames = engine.frames
    setTimeout (=> @endTest()), 1000

  endTest: ->
    objectsCount = @getObjectsCount()
    frames = engine.frames - @startFrames
    fps = (engine.frames - @startFrames)

    @lastFive.push frames
    @lastFive.shift() if @lastFive.length > 5
    average = @lastFive.reduce (a, b)-> a + b
    average /= @lastFive.length

    console.log "Objects: #{objectsCount} - FPS: #{fps} - Average: #{average}"
    @startTest()

  getObjectsCount: -> engine.currentRoom.children.length

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
      engine.currentRoom.addChildren @getObject(x, y, direction)

      direction += directionInt
      ++row
      if row > rows
        row = 0
        ++col

  getObject: (x, y)-> throw new Error 'getObject must be overwritten'
