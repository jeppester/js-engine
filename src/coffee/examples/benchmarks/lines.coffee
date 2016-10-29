Benchmark = require './shared/benchmark'
startEngine = require './shared/startEngine'
colorNumber = 0

class Main extends Benchmark
  defaultObjectsCount: 1000
  getColor: ->
    colors = [
      '#FFF',
      '#BBB',
      '#F00',
      '#FF0',
      '#F0F',
      '#0F0',
      '#0FF',
      '#00F'
    ]
    color = colors[colorNumber % colors.length]
    ++colorNumber
    color

  getObject: (x, y)->
    line = new Engine.Views.Line(new Engine.Geometry.Vector(0, 0), new Engine.Geometry.Vector(10, 10), @getColor(), 5, 'round')
    line.x = x
    line.y = y
    line

startEngine Main
