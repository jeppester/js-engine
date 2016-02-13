module.exports = -> module.exports::constructor.apply @, arguments

Helpers =
  Mixin: require '../helpers/mixin'

Mixins =
  Animatable: require '../mixins/animatable'

Views =
  Container: require './container'


###
The constructor for Sprite objects.

@name View.Sprite
@class Class for drawing bitmaps with rotation and size.
Usually all graphical objects in a game are sprites or extends this class.
@augments View.Container
@augments Mixin.Animatable

@property {string} source A resource string representing the bitmap source of the sprite, use setSource() to set the source (do not set it directly)
@property {number} direction The direction of the sprite (in radians)
@property {int} imageNumber The current image in the animation (0 the source is not an animation)
@property {int} imageLength The number of images in the source (1 the source is not an animation)
@property {Vector} offset The offset with which the sprite will be drawn (to its position)
@property {number} animationSpeed The number of images / second in the animation (only relevant if the source is an animation)
@property {boolean} animationLoops Whether or not the animation should loop (only relevant if the source is an animation)
@property {number} size A size modifier which modifies both the width and the height of the sprite
@property {number} widthScale A size modifier which modifies the width of the sprite
@property {number} heightScale A size modifier which modifies the height of the object
@property {number} opacity The opacity of the sprite

@param {string} source A string representing the source of the object's bitmap
@param {number} [x=0] The x-position of the object in the game arena, in pixels
@param {number} [y=0] The y-position of the object in the game arena, in pixels
@param {number} [direction=0] The rotation (in radians) of the object when drawn in the game arena
@param {Object} [additionalProperties] An object containing additional properties to assign to the created object.
The default is:<code>
{
size: 1,
opacity: 1,
composite: 'source-over',
offset: new Math.Vector('center', 'center')
}</code>
###
c = class Sprite extends Views.Container
  # Mix in animatable
  Helpers.Mixin.mixin @, Mixins.Animatable

  constructor: (source, x, y, direction, additionalProperties) ->
    throw new Error("Missing argument: source") if source is undefined #dev

    # Call Vector's and view's constructors
    super()
    @renderType = "sprite"
    @x = (if x isnt undefined then x else 0)
    @y = (if y isnt undefined then y else 0)

    # Load default options
    @source = source
    @direction = (if direction isnt undefined then direction else 0)

    # Animation options
    @imageNumber = 0
    @imageLength = 1
    @animationSpeed = 30
    @animationLastSwitch = engine.gameTime
    @animationLoops = true
    @clipWidth
    @clipHeight

    # Define pseudo properties
    Object.defineProperty this, "width",
      get: ->
        Math.abs @clipWidth * @size * @widthScale

      set: (value) ->
        sign = (if @widthScale > 0 then 1 else -1)
        @widthScale = sign * Math.abs(value / (@clipWidth * @size))
        value

    Object.defineProperty this, "height",
      get: ->
        Math.abs @clipHeight * @size * @heightScale

      set: (value) ->
        sign = (if @heightScale > 0 then 1 else -1)
        @heightScale = sign * Math.abs(value / (@clipHeight * @size))
        value


    # If an offset static var is used, remove it for now, and convert it later
    offset = Globals.OFFSET_MIDDLE_CENTER
    if additionalProperties and additionalProperties.offset
      offset = additionalProperties.offset
      delete additionalProperties.offset

    # Load additional properties
    Helpers.Mixin.import @, additionalProperties
    throw new Error("Sprite source was not successfully loaded: " + source) unless @refreshSource() #dev

    # Set offset after the source has been set (otherwise the offset cannot be calculated correctly)
    @offsetFromGlobal offset
    if engine.avoidSubPixelRendering
      @offset.x = Math.round(@offset.x)
      @offset.y = Math.round(@offset.y)
    return

  ###
  Parses an offset global into an actual Math.Vector offset that fits the instance

  @param  {number} offset Offset global (OFFSET_TOP_LEFT, etc.)
  @return {Math.Vector} The offset vector the offset global corresponds to for the instance
  ###
  parseOffsetGlobal: (offset) ->
    ret = new Geometry.Vector()

    # calculate horizontal offset
    if [
      Globals.OFFSET_TOP_LEFT
      Globals.OFFSET_MIDDLE_LEFT
      Globals.OFFSET_BOTTOM_LEFT
    ].indexOf(offset) isnt -1
      ret.x = 0
    else if [
      Globals.OFFSET_TOP_CENTER
      Globals.OFFSET_MIDDLE_CENTER
      Globals.OFFSET_BOTTOM_CENTER
    ].indexOf(offset) isnt -1
      ret.x = @bm.width / @imageLength / 2
    else ret.x = @bm.width / @imageLength if [
      Globals.OFFSET_TOP_RIGHT
      Globals.OFFSET_MIDDLE_RIGHT
      Globals.OFFSET_BOTTOM_RIGHT
    ].indexOf(offset) isnt -1

    # calculate vertical offset
    if [
      Globals.OFFSET_TOP_LEFT
      Globals.OFFSET_TOP_CENTER
      Globals.OFFSET_TOP_RIGHT
    ].indexOf(offset) isnt -1
      ret.y = 0
    else if [
      Globals.OFFSET_MIDDLE_LEFT
      Globals.OFFSET_MIDDLE_CENTER
      Globals.OFFSET_MIDDLE_RIGHT
    ].indexOf(offset) isnt -1
      ret.y = @bm.height / 2
    else ret.y = @bm.height if [
      Globals.OFFSET_BOTTOM_LEFT
      Globals.OFFSET_BOTTOM_CENTER
      Globals.OFFSET_BOTTOM_RIGHT
    ].indexOf(offset) isnt -1
    ret

  ###
  Fetches the name of the theme which currently applies to the object.

  @return {string} The name of the object's current theme
  ###
  getTheme: ->
    parent = undefined
    theme = undefined
    theme = @theme
    parent = this
    while theme is undefined
      if parent.theme
        theme = parent.theme
      else
        if parent.parent
          parent = parent.parent
        else
          break
    (if theme then theme else engine.defaultTheme)

  ###
  Updates the source bitmap of the object to correspond to it's current theme (set with setTheme or inherited).
  Calling this function is usually not necessary since it is automatically called when setting the theme of the object itself or it's parent object.

  @private
  ###
  refreshSource: ->
    theme = @getTheme()
    @bm = engine.loader.getImage(@source, theme)
    @imageLength = @bm.imageLength
    @imageNumber = Math.min(@imageLength - 1, @imageNumber)
    @clipWidth = Math.floor(@bm.width / @imageLength)
    @clipHeight = @bm.height
    @offset = @offsetGlobal if @offsetGlobal
    @bm

  ###
  Sets the bitmap-source of the object. For more information about bitmaps and themes, see themes.

  @param {string} source The resource string of the bitmap-source to use for the object
  ###
  setSource: (source) ->
    throw new Error("Missing argument: source") if source is undefined #dev
    return if @source is source
    @source = source
    @refreshSource()
    return

  updateSubImage: ->
    # Set the right sub image
    if engine.gameTime - @animationLastSwitch > 1000 / @animationSpeed
      @imageNumber = @imageNumber + ((if @animationSpeed > 0 then 1 else -1))
      @animationLastSwitch = @gameTime
      if @imageNumber is @imageLength
        @imageNumber = (if @animationLoops then 0 else @imageLength - 1)
      else @imageNumber = (if @animationLoops then @imageLength - 1 else 0) if @imageNumber is -1
    return

  ###
  Calculates the region which the sprite will fill out when redrawn.

  @private
  @return {Rectangle} The bounding rectangle of the sprite's redraw
  ###
  getRedrawRegion: ->
    box = undefined
    parents = undefined
    parent = undefined
    i = undefined
    box = new Geometry.Rectangle(-@offset.x, -@offset.y, @clipWidth, @clipHeight).getPolygon()
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
    box.x = Math.floor(box.x)
    box.y = Math.floor(box.y)
    box.width = Math.ceil(box.width + 1)
    box.height = Math.ceil(box.height + 1)
    box

module.exports:: = Object.create c::
module.exports::constructor = c

Geometry =
  Vector: require '../geometry/vector'
  Rectangle: require '../geometry/rectangle'

Globals = require '../engine/globals'
