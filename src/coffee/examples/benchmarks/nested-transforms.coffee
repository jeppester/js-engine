Benchmark = require './shared/benchmark'
startEngine = require './shared/startEngine'

class Main extends Benchmark
  constructor: ->
    # Create rotation operation
    engine.defaultActivityLoop.attachOperation 'rotation-transform', (objects)->
      for object in objects
        object.direction += engine.perFrameSpeed object.rotationSpeed

    super

  getObjectsCount: -> @count

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

startEngine Main
