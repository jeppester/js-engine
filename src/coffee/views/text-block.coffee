module.exports = -> module.exports::constructor.apply @, arguments

Helpers =
  Mixin: require '../helpers/mixin'

Mixins =
  Animatable: require '../mixins/animatable'

Views =
  Container: require './container'

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
@param {number} [x=0] The x-position of the object in the game arena, in pixels
@param {number} [y=0] The y-position of the object in the game arena, in pixels
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
c = class TextBlock extends Views.Container
  # Mix in Child
  Helpers.Mixin.mixin @, Mixins.Animatable

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
    @bm = document.createElement("canvas")
    @bmCtx = @bm.getContext("2d")
    @bm.width = @clipWidth
    @bm.height = 10
    @bm.spacing = 0

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
    offset = Globals.OFFSET_TOP_LEFT
    if additionalProperties and additionalProperties.offset
      offset = additionalProperties.offset
      delete additionalProperties.offset

    # Load additional properties
    Helpers.Mixin.import @, additionalProperties

    # Set offset after the source has been set (otherwise the offset cannot be calculated correctly)
    @offsetFromGlobal offset
    if engine.avoidSubPixelRendering
      @offset.x = Math.round(@offset.x)
      @offset.y = Math.round(@offset.y)

    @updateCache()
    return

  ###
  Parses an offset global into an actual Vector offset that fits the instance

  @param  {number} offset Offset global (OFFSET_TOP_LEFT, etc.)
  @return {Vector} The offset vector the offset global corresponds to for the instance
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
      ret.x = @clipWidth / 2
    else ret.x = @clipWidth if [
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
      ret.y = @clipHeight / 2
    else ret.y = @clipHeight if [
      Globals.OFFSET_BOTTOM_LEFT
      Globals.OFFSET_BOTTOM_CENTER
      Globals.OFFSET_BOTTOM_RIGHT
    ].indexOf(offset) isnt -1
    ret


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
    @bm.height = (@lines.length - 1) * @lineHeight + @font.match(/[0.0-9]+/) * 1.25
    @clipHeight = @bm.height
    return

  ###
  Does the actual rendering of the text, and caches it (for huge performance gains). This function is automatically called each time a property which affects the rendering has been changed (via the right setter functions).

  @private
  ###
  updateCache: ->
    # Use simple hashing for avoiding unnecessary cache updates
    # The "src" attribute is used because WebGL renderer uses it
    # as an identifier for cached textures
    hash = @createHash()
    return if hash == @bm.src
    @bm.oldSrc = @bm.src
    @bm.src = hash

    @stringToLines()
    @bmCtx.clearRect 0, 0, @bm.width, @bm.height
    @bmCtx.font = @font
    @bmCtx.fillStyle = @color
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
      @bmCtx.fillText @lines[i], xOffset, @lineHeight * i + @font.match(/[0.0-9]+/) * 1 if @lines[i]
      i++
    return

  update: (settings)->
    @[name] = value for name, value of settings
    @updateCache()
    return

  createHash: ->
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

  ###
  Calculates a bounding non-rotated rectangle that the text block will fill when drawn.

  @private
  @return {Rectangle} The bounding rectangle of the text block when drawn.
  ###
  getRedrawRegion: ->
    ret = undefined
    ret = new Math.Rectangle(-@offset.x, -@offset.y, @clipWidth, @clipHeight)
    ret = ret.getPolygon()
    ret = ret.scale(@size * @widthScale, @size * @heightScale)
    ret = ret.rotate(@direction)
    ret = ret.getBoundingRectangle().add(@getRoomPosition())
    ret.x = Math.floor(ret.x - 1)
    ret.y = Math.floor(ret.y - 1)
    ret.width = Math.ceil(ret.width + 2)
    ret.height = Math.ceil(ret.height + 2)
    ret

module.exports:: = Object.create c::
module.exports::constructor = c

Geometry =
  Vector: require '../geometry/vector'

Globals = require '../engine/globals'
