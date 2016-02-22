module.exports = -> module.exports::constructor.apply @, arguments

Helpers =
  Mixin: require '../helpers/mixin'

Mixins =
  Animatable: require '../mixins/animatable'
  Texture: require '../mixins/texture'

Views =
  Child: require './child'

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
c = class Sprite extends Views.Child
  # Mix in animatable
  Helpers.Mixin.mixin @, Mixins.Animatable
  Helpers.Mixin.mixin @, Mixins.Texture

  renderType: "sprite"

  constructor: (source, x, y, direction, additionalProperties) ->
    throw new Error("Missing argument: source") if source is undefined #dev

    # Call Vector's and view's constructors
    super()
    @x = x || 0
    @y = y || 0

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

    # If an offset global is used, remove it for now, and convert it later
    if additionalProperties && additionalProperties.offset
      if typeof additionalProperties.offset == 'number'
        offset = additionalProperties.offset
        additionalProperties.offset = undefined
    else
      offset = Globals.OFFSET_MIDDLE_CENTER

    # Load additional properties
    Helpers.Mixin.import @, additionalProperties
    unless @refreshSource() #dev
      throw new Error("Sprite source was not successfully loaded: " + source) # dev

    # If using an offset global, set offset
    @offsetFromGlobal offset if offset

  ###
  Fetches the name of the theme which currently applies to the object.

  @return {string} The name of the object's current theme
  ###
  getTheme: ->
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
    @texture = engine.loader.getImage(@source, theme)
    @imageLength = @texture.imageLength
    @imageNumber = Math.min(@imageLength - 1, @imageNumber)
    @clipWidth = Math.floor(@texture.width / @imageLength)
    @clipHeight = @texture.height
    @offsetFromGlobal @offsetGlobal if @offsetGlobal
    @texture

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
    if @animationSpeed != 0 && engine.gameTime - @animationLastSwitch > 1000 / @animationSpeed
      @imageNumber = @imageNumber + (if @animationSpeed > 0 then 1 else -1)
      @animationLastSwitch = engine.gameTime
      if @imageNumber == @imageLength
        @imageNumber = (if @animationLoops then 0 else @imageLength - 1)
      else @imageNumber = (if @animationLoops then @imageLength - 1 else 0) if @imageNumber is -1
    return

module.exports:: = Object.create c::
module.exports::constructor = c

Globals = require '../engine/globals'
