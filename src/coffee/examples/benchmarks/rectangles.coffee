Benchmark = require './shared/benchmark'
startEngine = require './shared/startEngine'
colorNumber = 0

class Main extends Benchmark
  # defaultObjectsCount: 1
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
    rect = new Engine.Views.Rectangle(0, 0, 10, 10, @getColor(), @getColor(), 2)
    rect.x = x
    rect.y = y
    rect

startEngine Main
