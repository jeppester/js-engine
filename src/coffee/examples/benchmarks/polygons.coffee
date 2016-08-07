Benchmark = require './shared/benchmark'
startEngine = require './shared/startEngine'

class Main extends Benchmark
  defaultObjectsCount: 1000

  getObject: (x, y)->
    polygon = new Engine.Views.Polygon([], "#FFF", "#F00", 2)
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
