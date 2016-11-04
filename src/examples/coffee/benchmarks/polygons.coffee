Benchmark = require './shared/benchmark'
startEngine = require './shared/startEngine'

class Main extends Benchmark
  getObject: (x, y)->
    polygon = new Engine.Views.Polygon([], @getColor(), @getColor(), 2)
    polygon.setFromCoordinates(
      -10, -10
      0, -2
      10, -10
      10, 10
      0, 2
      -10, 10
    )
    polygon.x = x
    polygon.y = y
    polygon

startEngine Main
