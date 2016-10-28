Benchmark = require './shared/benchmark'
startEngine = require './shared/startEngine'

class Main extends Benchmark
  defaultObjectsCount: 1000

  getObject: (x, y)->
    line = new Engine.Views.Line(new Engine.Geometry.Vector(0, 0), new Engine.Geometry.Vector(10, 10), "#FFF", 2)
    line.x = x
    line.y = y
    line

startEngine Main
