module.exports = -> c.apply @, arguments

Views =
  Circle: require '../views/circle'
  Collidable: require '../views/collidable'
  Container: require '../views/container'
  GameObject: require '../views/game-object'
  Line: require '../views/line'
  Polygon: require '../views/polygon'
  Rectangle: require '../views/rectangle'
  Sprite: require '../views/sprite'
  TextBlock: require '../views/text-block'

c = class ObjectCreator
  constructor: (container)->
    @container = container

  Container: (children...) ->
    a = arguments
    o = new Views.Container
    o.addChildren.apply o, children
    @container.addChildren o
    o

  # Geometric objects
  Circle: (x, y, radius, fillStyle, strokeStyle, lineWidth) ->
    o = new Views.Circle x, y, radius, fillStyle, strokeStyle, lineWidth
    @container.addChildren o
    o

  Line: (startVector, endVector, strokeStyle, lineWidth, lineCap) ->
    o = new Views.Line startVector, endVector, strokeStyle, lineWidth, lineCap
    @container.addChildren o
    o

  Polygon: (points, fillStyle, strokeStyle, lineWidth) ->
    o = new Views.Polygon points, fillStyle, strokeStyle, lineWidth
    @container.addChildren o
    o

  Rectangle: (x, y, width, height, fillStyle, strokeStyle, lineWidth) ->
    o = new Views.Rectangle x, y, width, height, fillStyle, strokeStyle, lineWidth
    @container.addChildren o
    o

  # Text
  TextBlock: (string, x, y, width, additionalProperties) ->
    o = new Views.TextBlock string, x, y, width, additionalProperties
    @container.addChildren o
    o

  # Bitmap based objects
  Sprite: (source, x, y, direction, additionalProperties) ->
    o = new Views.Sprite source, x, y, direction, additionalProperties
    @container.addChildren o
    o

  Collidable: (source, x, y, direction, additionalProperties) ->
    o = new Views.Collidable source, x, y, direction, additionalProperties
    @container.addChildren o
    o

  GameObject: (source, x, y, direction, additionalProperties) ->
    o = new Views.GameObject source, x, y, direction, additionalProperties
    @container.addChildren o
    o

module.exports:: = c::

module.exports[name] = value for name, value of c
