nameSpace "View"

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
class View.Rectangle extends Math.Rectangle
  # Mix in View.Child
  Object::import.call @::, View.Child::

  constructor: (x, y, width, height, fillStyle, strokeStyle, lineWidth) ->
    # "Fake" extend child (to get view.child properties)
    View.Child.call this
    @renderType = "rectangle"
    if engine.enableRedrawRegions
      @RectangleInitWithRedrawRegions x, y, width, height, fillStyle, strokeStyle, lineWidth
    else
      @RectangleInitWithoutRedrawRegions x, y, width, height, fillStyle, strokeStyle, lineWidth
    return

  ###
  @lends View.Rectangle.prototype
  ###
  RectangleInitWithoutRedrawRegions: (x, y, width, height, fillStyle, strokeStyle, lineWidth) ->
    hidden = undefined
    @width = width or 0
    @height = height or 0
    @fillStyle = fillStyle or "#000"
    @strokeStyle = strokeStyle or "#000"
    hidden = lineWidth: lineWidth or 1
    Object.defineProperty this, "lineWidth",
      get: ->
        hidden.lineWidth

      set: (value) ->
        if hidden.lineWidth isnt value
          hidden.lineWidth = value
          @offset = @offsetGlobal if @offsetGlobal
        return

    @set x, y, width, height
    return

  RectangleInitWithRedrawRegions: (x, y, width, height, fillStyle, strokeStyle, lineWidth) ->
    hidden = undefined
    hidden =
      width: width or 0
      height: height or 0
      fillStyle: fillStyle or "#000"
      strokeStyle: strokeStyle or "#000"
      lineWidth: lineWidth or 1


    # Put getters and setters on points values
    Object.defineProperty this, "width",
      get: ->
        hidden.width

      set: (value) ->
        if hidden.width isnt value
          hidden.width = value
          @onAfterChange()
        return


    # Put getters and setters on points values
    Object.defineProperty this, "height",
      get: ->
        hidden.height

      set: (value) ->
        if hidden.height isnt value
          hidden.height = value
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

    @set x, y, width, height
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


  ###
  Calculates the region which the object will fill out when redrawn.

  @private
  @return {Rectangle} The bounding rectangle of the redraw
  ###
  getRedrawRegion: ->
    ln = undefined

    # Get bounding rectangle
    rect = @copy()

    # line width
    ln = Math.ceil(@lineWidth / 2)
    rect.x -= ln
    rect.y -= ln
    rect.width += ln * 2
    rect.height += ln * 2
    rect.add @parent.getRoomPosition()
