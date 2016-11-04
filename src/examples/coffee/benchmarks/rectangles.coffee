Benchmark = require './shared/benchmark'
startEngine = require './shared/startEngine'

class Main extends Benchmark
  getObject: (x, y)->
    new Engine.Views.Rectangle(x, y, 10, 10, @getColor(), @getColor(), 2)

startEngine Main
