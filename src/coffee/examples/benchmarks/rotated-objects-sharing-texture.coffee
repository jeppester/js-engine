Benchmark = require './shared/benchmark'
startEngine = require './shared/startEngine'

class Main extends Benchmark
  getObject: (x, y, direction)-> new Engine.Views.Sprite('rock', x, y, direction)

startEngine Main
