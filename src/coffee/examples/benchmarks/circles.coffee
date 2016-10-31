Benchmark = require './shared/benchmark'
startEngine = require './shared/startEngine'

class Main extends Benchmark
  getObject: (x, y)->
    new Engine.Views.Circle(x, y, 4, @getColor(), @getColor(), 2)

startEngine Main
