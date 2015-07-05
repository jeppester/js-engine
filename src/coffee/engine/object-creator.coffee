Engine = require '../engine'

module.exports = class ObjectCreator
  constructor: (container)->
    @container = container

  Container: (children...) ->
    a = arguments
    o = new Engine.Views.Container
    o.addChildren.apply o, children
    @container.addChildren o
    o

  # Geometric objects
  Circle: (x, y, radius, fillStyle, strokeStyle, lineWidth) ->
    o = new Engine.Views.Circle x, y, radius, fillStyle, strokeStyle, lineWidth
    @container.addChildren o
    o

  Line: (startVector, endVector, strokeStyle, lineWidth, lineCap) ->
    o = new Engine.Views.Line startVector, endVector, strokeStyle, lineWidth, lineCap
    @container.addChildren o
    o

  Polygon: (points, fillStyle, strokeStyle, lineWidth) ->
    o = new Engine.Views.Polygon points, fillStyle, strokeStyle, lineWidth
    @container.addChildren o
    o

  Rectangle: (x, y, width, height, fillStyle, strokeStyle, lineWidth) ->
    o = new Engine.Views.Rectangle x, y, width, height, fillStyle, strokeStyle, lineWidth
    @container.addChildren o
    o

  # Text
  TextBlock: (string, x, y, width, additionalProperties) ->
    o = new Engine.Views.TextBlock string, x, y, width, additionalProperties
    @container.addChildren o
    o

  # Bitmap based objects
  Sprite: (source, x, y, direction, additionalProperties) ->
    o = new Engine.Views.Sprite source, x, y, direction, additionalProperties
    @container.addChildren o
    o

  Collidable: (source, x, y, direction, additionalProperties) ->
    o = new Engine.Views.Collidable source, x, y, direction, additionalProperties
    @container.addChildren o
    o

  GameObject: (source, x, y, direction, additionalProperties) ->
    o = new Engine.Views.GameObject source, x, y, direction, additionalProperties
    @container.addChildren o
    o
