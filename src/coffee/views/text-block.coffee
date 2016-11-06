Helpers =
  Mixin: require '../helpers/mixin'

Mixins =
  Animatable: require '../mixins/animatable'
  Texture: require '../mixins/texture'

Views =
  Child: require './child'

###
The constructor for the TextBlock class.

@name View.TextBlock
@class A block of text with a limited width. If the width is reached by the text, the text will break into multiple lines.
@augments Mixin.Animatable
@augments View.Container

@property {string} font A css string representing the font of the text block
@property {number} width The width of the text block
@property {number} height The height of the text block
@property {string} alignment The text alignment of the text block, possible values are: ALIGNMENT_LEFT, ALIGNMENT_CENTER, ALIGNMENT_RIGHT
@property {string} color A css string representing the text's color
@property {Vector} offset The offset with which the sprite will be drawn (to its position)
@property {number} direction The direction of the sprite (in radians)
@property {number} size A size modifier which modifies both the width and the height of the sprite
@property {number} widthScale A size modifier which modifies the width of the sprite
@property {number} heightScale A size modifier which modifies the height of the object
@property {number} opacity The opacity of the sprite

@param {string} string The string to display inside the TextBlock
@param {number} [x=0] The x-position of the object in the game container, in pixels
@param {number} [y=0] The y-position of the object in the game container, in pixels
@param {number} [width=200] The width of the text block, in pixels. When the text reaches the width, it will break into a new line
@param {Object} [additionalProperties] An object containing additional properties to assign to the created object.
The default is:<code>
{
font: 'normal 14px Verdana',
color: '#000',
alignment: ALIGNMENT_LEFT,
size: 1,
opacity: 1,
composite: 'source-over',
offset: new Vector(0, 0)
}</code>
###
module.exports = class TextBlock extends Views.Child
  # Mix in Child
  Helpers.Mixin.mixin @, Mixins.Animatable
  Helpers.Mixin.mixin @, Mixins.Texture

  renderType: "textblock"

  constructor: (string, x, y, width, additionalProperties) ->
    throw new Error("Missing argument: string") if string is undefined #dev

    # Call Vector's and view's constructors
    super()
    @x = x || 0
    @y = y || 0

    # Animation options
    @imageLength = 1
    @imageNumber = 0

    # Load default options
    @clipWidth = width || 200
    @lines = []
    @lineWidth = []
    @texture = document.createElement("canvas")
    @textureCtx = @texture.getContext("2d")
    @texture.width = @clipWidth
    @texture.height = 10
    @texture.spacing = 0

    @string = string || ''
    @font = "normal 14px Verdana"
    @alignment = "left"
    @color = "#000000"
    @lineHeight = 0

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

    @lineHeight = (if additionalProperties and additionalProperties.lineHeight then additionalProperties.lineHeight else @font.match(/[0.0-9]+/) * 1.25)

    # If an offset global is used, remove it for now, and convert it later
    if additionalProperties && additionalProperties.offset
      if typeof additionalProperties.offset == 'number'
        offset = additionalProperties.offset
        additionalProperties.offset = undefined
    else
      offset = Globals.OFFSET_TOP_LEFT

    # Load additional properties
    Helpers.Mixin.import @, additionalProperties

    # If using an offset global, set offset
    @offsetFromGlobal offset if offset

    @updateCache()
    return

  ###
  Breaks the TextBlock's text string into lines.

  @private
  ###
  stringToLines: ->
    lt = document.createElement("span")
    lt.style.font = @font
    lt.style.visibility = "hidden"
    lt.style.position = "absolute"
    document.body.appendChild lt
    line = 0
    @lines = []
    @lines[line] = ""
    paragraphs = @string.split("\n")
    pid = 0
    while pid < paragraphs.length
      words = paragraphs[pid].split(" ")
      lt.innerHTML = ""
      @lines[line] = ""
      wid = 0
      while wid < words.length
        word = words[wid]
        lt.innerHTML += word + " "
        if lt.offsetWidth > @clipWidth
          line++
          @lines[line] = ""
          lt.innerHTML = ""
          lt.innerHTML += word + " "
          @lineWidth[line] = lt.offsetWidth
        else
          @lineWidth[line] = lt.offsetWidth
        @lines[line] += word + " "
        wid++
      line++
      pid++
    @calculateCanvasHeight()
    lt.parentNode.removeChild lt
    return

  ###
  Calculates and sets the height of the cache canvas based on the number of lines, the font height and the line height
  ###
  calculateCanvasHeight: ->
    @texture.height = (@lines.length - 1) * @lineHeight + @font.match(/[0.0-9]+/) * 1.25
    @clipHeight = @texture.height
    return

  ###
  Does the actual rendering of the text, and caches it (for huge performance gains). This function is automatically called each time a property which affects the rendering has been changed (via the right setter functions).

  @private
  ###
  updateCache: ->
    # Use simple hashing for avoiding unnecessary cache updates
    # The "src" attribute is used because WebGL renderer uses it
    # as an identifier for cached textures
    cacheKey = @createCacheKey()
    return if cacheKey == @texture.cacheKey
    @texture.lastCacheKey = @texture.cacheKey
    @texture.cacheKey = cacheKey

    @stringToLines()
    @textureCtx.clearRect 0, 0, @texture.width, @texture.height
    @textureCtx.font = @font
    @textureCtx.fillStyle = @color
    i = 0
    while i < @lines.length
      xOffset = 0
      switch @alignment
        when "left"
          xOffset = 0
        when "right"
          xOffset = @clipWidth - @lineWidth[i]
        when "center"
          xOffset = (@clipWidth - @lineWidth[i]) / 2
      @textureCtx.fillText @lines[i], xOffset, @lineHeight * i + @font.match(/[0.0-9]+/) * 1 if @lines[i]
      i++
    return

  set: (settings)->
    @[name] = value for name, value of settings
    @updateCache()
    return

  createCacheKey: ->
    [
      "string"
      "font"
      "alignment"
      "color"
      "lineHeight"
      "clipWidth"
    ].map((property)=>
      @[property]
    ).join("-|-")

  ###
  Checks if the objects is visible. This function runs before each draw to ensure that it is necessary
  @return {boolean} Whether or not the object is visible (based on its size and opacity vars)
  ###
  isVisible: ->
    # If sprites size has been modified to zero, do nothing
    not (@size is 0 or @widthScale is 0 or @heightScale is 0 or /^\s*$/.test(@string))

Geometry =
  Vector: require '../geometry/vector'

Globals = require '../engine/globals'
