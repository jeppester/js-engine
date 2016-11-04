Benchmark = require './shared/benchmark'
startEngine = require './shared/startEngine'

class Main extends Benchmark
  constructor: ->
    # Create rotation operation
    engine.defaultActivityLoop.attachOperation 'check-bounce', (objects)->
      for object in objects
        if object.x < 0
          object.x = 0
          object.speed.x = -object.speed.x
        else if object.x > 600
          object.x = 600
          object.speed.x = -object.speed.x

        if object.y < 0
          object.y = 0
          object.speed.y = -object.speed.y
        else if object.y > 400
          object.y = 400
          object.speed.y = -object.speed.y

    super

  getObject: (x, y, direction)->
    speed = new Engine.Geometry.Vector().setFromDirection direction, 5
    sprite = new Engine.Views.GameObject 'rock', x, y, direction, { speed }
    engine.defaultActivityLoop.subscribeToOperation 'check-bounce', sprite
    sprite

startEngine Main
