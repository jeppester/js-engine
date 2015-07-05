Line = require '../geometry/line'
Child = require './child'
MixinHelper = require '../helpers/mixin'

###
Constructor for the Line class. Uses setFromVectors to create the line's start and end points

@name View.Line
@class A class which is used for handling lines
@augments View.Child
@augments Mixin.Animatable

@property {View.Vector} a The line's starting point
@property {View.Vector} b The line's ending point
@property {string} strokeStyle The line's color if added to a view (css color string)
@property {string} lineWidth The line's width if added to a view (in px)
@property {string} lineCap The line's cap style if added to a view

@param {View.Vector} startVector A Vector representing the start point of the line
@param {View.Vector} endVector A Vector representing the end point of the line
@param {string} [strokeStyle="#000"] The line's color if added to a view (css color string)
@param {number} [lineWidth=1] The line's width if added to a view (in px)
@param {string} [lineCap='butt'] The line's cap style if added to a view
###
module.exports = class LineView extends Line
  # Mix in Child
  MixinHelper.mixin @, Child

  constructor: (startVector, endVector, strokeStyle, lineWidth, lineCap) ->
    Child.call this
    @renderType = "line"
    if engine.enableRedrawRegions
      @LineInitWithRedrawRegions startVector, endVector, strokeStyle, lineWidth, lineCap
    else
      @LineInitWithoutRedrawRegions startVector, endVector, strokeStyle, lineWidth, lineCap
    return

  LineInitWithoutRedrawRegions: (startVector, endVector, strokeStyle, lineWidth, lineCap) ->
    @strokeStyle = strokeStyle or "#000"
    @lineWidth = lineWidth or 1
    @lineCap = lineCap or "butt"
    @setFromVectors startVector or new Math.Vector(), endVector or new Math.Vector()
    return

  LineInitWithRedrawRegions: (startVector, endVector, strokeStyle, lineWidth, lineCap) ->

    # Create getters and setters for line ends
    hidden = undefined
    hidden =
      strokeStyle: strokeStyle or "#000"
      lineWidth: lineWidth or 1
      lineCap: lineCap or "butt"
      a: undefined
      b: undefined
      parentObject: this

    Object.defineProperty this, "strokeStyle",
      get: ->
        hidden.strokeStyle

      set: (value) ->
        if hidden.strokeStyle isnt value
          hidden.strokeStyle = value
          @onAfterChange()
        return

    Object.defineProperty this, "lineCap",
      get: ->
        hidden.lineCap

      set: (value) ->
        if hidden.lineCap isnt value
          hidden.lineCap = value
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

    Object.defineProperty this, "a",
      get: ->
        hidden.a

      set: (value) ->
        if hidden.a isnt value
          hidden.a = value
          xHidden = undefined
          yHidden = undefined
          xHidden = hidden.a.x
          yHidden = hidden.a.y

          # Put getters and setters on points values
          Object.defineProperty hidden.a, "x",
            get: ->
              xHidden

            set: (value) ->
              if xHidden isnt value
                xHidden = value
                hidden.parentObject.onAfterChange()
              return


          # Put getters and setters on points values
          Object.defineProperty hidden.a, "y",
            get: ->
              yHidden

            set: (value) ->
              if yHidden isnt value
                yHidden = value
                hidden.parentObject.onAfterChange()
              return

          @onAfterChange()
        return

    Object.defineProperty this, "b",
      get: ->
        hidden.b

      set: (value) ->
        if hidden.b isnt value
          hidden.b = value
          xHidden = undefined
          yHidden = undefined
          xHidden = hidden.b.x
          yHidden = hidden.b.y

          # Put getters and setters on points values
          Object.defineProperty hidden.b, "x",
            get: ->
              xHidden

            set: (value) ->
              if xHidden isnt value
                xHidden = value
                hidden.parentObject.onAfterChange()
              return


          # Put getters and setters on points values
          Object.defineProperty hidden.b, "y",
            get: ->
              yHidden

            set: (value) ->
              if yHidden isnt value
                yHidden = value
                hidden.parentObject.onAfterChange()
              return

          @onAfterChange()
        return

    @setFromVectors startVector or new Math.Vector(), endVector or new Math.Vector()
    return


  ###
  Calculates the region which the object will fill out when redrawn.

  @private
  @return {Math.Rectangle} The bounding rectangle of the redraw
  ###
  getRedrawRegion: ->
    box = undefined
    parents = undefined
    parent = undefined
    i = undefined
    ln = undefined
    box = @getPolygon()
    parents = @getParents()
    parents.unshift this
    i = 0
    while i < parents.length
      parent = parents[i]
      box.scale parent.size * parent.widthScale, parent.size * parent.heightScale
      box.rotate parent.direction
      box.move parent.x, parent.y
      i++
    box = box.getBoundingRectangle()
    ln = Math.ceil(@lineWidth / 2)
    box.x = Math.floor(box.x - ln)
    box.y = Math.floor(box.y - ln)
    box.width = Math.ceil(box.width + ln * 2 + 1)
    box.height = Math.ceil(box.height + ln * 2 + 1)
    box #


  ###
  Override View.Child's isVisible-function, making the line invisible if its points share the same coordinates
  Above is how canvas does by default (but other renderers should do this by default as well)

  @return {Boolean} Whether or not the line is "visible" (if not, renderers will not try to draw it)
  ###
  isVisible: ->
    View.Child::isVisible.call(this) and (@a.x isnt @b.x or @a.y isnt @b.y)
