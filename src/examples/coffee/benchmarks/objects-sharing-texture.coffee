Benchmark = require './shared/benchmark'
startEngine = require './shared/startEngine'

class Main extends Benchmark
  getObject: (x, y)-> new Engine.Views.Sprite('rock', x, y)

startEngine Main
