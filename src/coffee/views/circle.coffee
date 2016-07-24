module.exports = -> module.exports::constructor.apply @, arguments

Helpers =
  Mixin: require '../helpers/mixin'

Geometry =
  Circle: require '../geometry/circle'

Views =
  Child: require './child'

###
Constructor for Circle class, uses the set function, to set the properties of the circle.

@name View.Circle
@class A class which is used for handling circles
@augments Math.Circle
@augments View.Child

@property {number} x The circle's horizontal position
@property {number} y The circle's vertical position
@property {number} radius The circle's radius
@property {string} strokeStyle The circle's color if added to a view (css color string)
@property {number} lineWidth The circle's width if added to a view (in px)
@property {string} fillStyle The circle's fill color if added to a view (css color string)

@param {number} x The x-coordinate for the center of the circle
@param {number} y The y-coordinate for the center of the circle
@param {number} radius The radius for the circle
@param {string} [fillStyle = "#000"] The circle's fill color if added to a view (css color string)
@param {string} [strokeStyle = "#000"] The circle's color if added to a view (css color string)
@param {number} [lineWidth = 1] The circle's width if added to a view (in px)
###
c = class Circle extends Geometry.Circle
  # Mix in Child
  Helpers.Mixin.mixin @, Views.Child

  constructor: (x, y, radius, fillStyle = "#000", strokeStyle = "#000", lineWidth = 0)->
    Views.Child::constructor.call this

    @renderType = "circle"
    if engine.enableRedrawRegions
      @CircleInitWithRedrawRegions x, y, radius, fillStyle, strokeStyle, lineWidth
    else
      @CircleInitWithoutRedrawRegions x, y, radius, fillStyle, strokeStyle, lineWidth
    return

  CircleInitWithoutRedrawRegions: (x, y, radius, @fillStyle, @strokeStyle, @lineWidth)->
    @set x, y, radius
    return

  CircleInitWithRedrawRegions: (x, y, radius, fillStyle, strokeStyle, lineWidth)->
    hidden =
      radius: radius
      fillStyle: fillStyle
      strokeStyle: strokeStyle
      lineWidth: lineWidth

    # Put getters and setters on points values
    Object.defineProperty this, "radius",
      get: ->
        hidden.radius

      set: (value) ->
        if hidden.radius isnt value
          hidden.radius = value
          @onAfterChange()
        return

    Object.defineProperty this, "fillStyle",
      get: ->
        hidden.fillStyle

      set: (value) ->
        if hidden.fillStyle isnt value
          hidden.fillStyle = value
          @onAfterChange()
        return

    Object.defineProperty this, "strokeStyle",
      get: ->
        hidden.strokeStyle

      set: (value) ->
        if hidden.strokeStyle isnt value
          hidden.strokeStyle = value
          @onAfterChange()
        return

    Object.defineProperty this, "lineWidth",
      get: ->
        hidden.lineWidth

      set: (value) ->
        if hidden.lineWidth isnt value
          hidden.lineWidth = value
          @onAfterChange()
        return

    @set x, y, radius
    return

  ###
  Calculates the region which the object will fill out when redrawn.

  @private
  @return {Math.Rectangle} The bounding rectangle of the redraw
  ###
  getRedrawRegion: ->
    ln = Math.ceil(@lineWidth / 2)
    rect = new Geometry.Rectangle(Math.floor(@x - (@radius + ln + 5)), Math.floor(@y - (@radius + ln + 5)), Math.ceil((@radius + ln + 5) * 2), Math.ceil((@radius + ln + 5) * 2))
    rect.add @parent.getRoomPosition()

module.exports:: = Object.create c::
module.exports::constructor = c

Geometry.Rectangle = require '../geometry/rectangle'
