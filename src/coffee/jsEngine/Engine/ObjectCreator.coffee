nameSpace "Engine"
class Engine.ObjectCreator
  constructor: (container)->
    @container = container
  Container: (children...) ->
    a = arguments
    o = new View.Container
    o.addChildren.apply o, children
    @container.addChildren o
    o

  # Geometric objects
  Circle: (x, y, radius, fillStyle, strokeStyle, lineWidth) ->
    o = new View.Circle x, y, radius, fillStyle, strokeStyle, lineWidth
    @container.addChildren o
    o

  Line: (startVector, endVector, strokeStyle, lineWidth, lineCap) ->
    o = new View.Line startVector, endVector, strokeStyle, lineWidth, lineCap
    @container.addChildren o
    o

  Polygon: (points, fillStyle, strokeStyle, lineWidth) ->
    o = new View.Polygon points, fillStyle, strokeStyle, lineWidth
    @container.addChildren o
    o

  Rectangle: (x, y, width, height, fillStyle, strokeStyle, lineWidth) ->
    o = new View.Rectangle x, y, width, height, fillStyle, strokeStyle, lineWidth
    @container.addChildren o
    o

  # Text
  TextBlock: (string, x, y, width, additionalProperties) ->
    o = new View.TextBlock string, x, y, width, additionalProperties
    @container.addChildren o
    o

  # Bitmap based objects
  Sprite: (source, x, y, direction, additionalProperties) ->
    o = new View.Sprite source, x, y, direction, additionalProperties
    @container.addChildren o
    o

  Collidable: (source, x, y, direction, additionalProperties) ->
    o = new View.Collidable source, x, y, direction, additionalProperties
    @container.addChildren o
    o

  GameObject: (source, x, y, direction, additionalProperties) ->
    o = new View.GameObject source, x, y, direction, additionalProperties
    @container.addChildren o
    o
