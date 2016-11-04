Benchmark = require './shared/benchmark'
startEngine = require './shared/startEngine'

class Main extends Benchmark
  getObject: (x, y, direction)->
    opacity = (x / engine.canvasResX + y / engine.canvasResY) / 5
    new Engine.Views.Sprite('rock', x, y, 0, { opacity })

startEngine Main
