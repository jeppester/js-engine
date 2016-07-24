Helpers =
  Mixin: require '../helpers/mixin'

Geometry =
  Rectangle: require '../geometry/rectangle'

Views =
  Child: require './child'

###
The constructor for the Rectangle class. Uses the set-function to set the properties of the rectangle.

@name View.Rectangle
@class A class which is used for drawable non-rotated rectangles
@augments Math.Rectangle
@augments View.Child

@property {number} x The top left corner's x-coordinate
@property {number} y The top left corner's y-coordinate
@property {number} width The width of the rectangle
@property {number} height The height of the rectangle
@property {string} strokeStyle The rectangle's color if added to a view (css color string)
@property {number} lineWidth The rectangle's width if added to a view (in px)
@property {string} fillStyle The rectangle's fill color if added to a view (css color string)

@param {number} x The x-coordinate for the rectangle's top left corner
@param {number} y The y-coordinate for the rectangle's top left corner
@param {number} [width = 0] The width of the rectangle
@param {number} [height = 0] The height of the rectangle
@param {string} [fillStyle = "#000"] The rectangle's fill color if added to a view (css color string)
@param {string} [strokeStyle = "#000"] The rectangle's color if added to a view (css color string)
@param {number} [lineWidth = 1] The rectangle's width if added to a view (in px)
###
module.exports = class Rectangle extends Geometry.Rectangle
  # Mix in Child
  Helpers.Mixin.mixin @, Views.Child

  constructor: (x, y, @width = 0, @height = 0, @fillStyle = "#000", @strokeStyle = "#000", lineWidth = 0) ->
    # "Fake" extend child (to get view.child properties)
    Views.Child::constructor.call this
    @x = x
    @y = y
    @renderType = "rectangle"

    hidden =
      lineWidth: lineWidth
    Object.defineProperty @, "lineWidth",
      get: ->
        hidden.lineWidth

      set: (value) ->
        if hidden.lineWidth isnt value
          hidden.lineWidth = value
          @offset = @offsetGlobal if @offsetGlobal
        return
    return

  ###
  Parses an offset global into an actual Math.Vector offset that fits the instance

  @param  {number} offset Offset global (OFFSET_TOP_LEFT, etc.)
  @return {Math.Vector} The offset vector the offset global corresponds to for the instance
  ###
  parseOffsetGlobal: (offset) ->
    ret = new Math.Vector()

    # calculate horizontal offset
    if [
      OFFSET_TOP_LEFT
      OFFSET_MIDDLE_LEFT
      OFFSET_BOTTOM_LEFT
    ].indexOf(offset) isnt -1
      ret.x = -@lineWidth / 2
    else if [
      OFFSET_TOP_CENTER
      OFFSET_MIDDLE_CENTER
      OFFSET_BOTTOM_CENTER
    ].indexOf(offset) isnt -1
      ret.x = @width / 2
    else ret.x = @width + @lineWidth / 2 if [
      OFFSET_TOP_RIGHT
      OFFSET_MIDDLE_RIGHT
      OFFSET_BOTTOM_RIGHT
    ].indexOf(offset) isnt -1

    # calculate vertical offset
    if [
      OFFSET_TOP_LEFT
      OFFSET_TOP_CENTER
      OFFSET_TOP_RIGHT
    ].indexOf(offset) isnt -1
      ret.y = -@lineWidth / 2
    else if [
      OFFSET_MIDDLE_LEFT
      OFFSET_MIDDLE_CENTER
      OFFSET_MIDDLE_RIGHT
    ].indexOf(offset) isnt -1
      ret.y = @height / 2
    else ret.y = @height + @lineWidth / 2 if [
      OFFSET_BOTTOM_LEFT
      OFFSET_BOTTOM_CENTER
      OFFSET_BOTTOM_RIGHT
    ].indexOf(offset) isnt -1
    ret
