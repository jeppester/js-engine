Benchmark = require './shared/benchmark'
startEngine = require './shared/startEngine'

class Main extends Benchmark
  getObject: (x, y, direction)->
    new Engine.Views.TextBlock 'TEXT', x, y, 100, { direction, color: '#F00' }

startEngine Main
