Benchmark = require './shared/benchmark'
startEngine = require './shared/startEngine'

class Main extends Benchmark
  getObject: (x, y)->
    new Engine.Views.Line(new Engine.Geometry.Vector(x, y), new Engine.Geometry.Vector(x + 10, y + 10), @getColor(), 4, 'round')

startEngine Main
