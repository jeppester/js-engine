nameSpace "View"

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
offset: new Math.Vector(0, 0)
}</code>
###
class View.TextBlock extends View.Container
  # Mix in animatable
  Object::import.call @::, Mixin.Animatable
  
  constructor: (string, x, y, width, additionalProperties) ->
    throw new Error("Missing argument: string") if string is undefined #dev

    # Call Vector's and view's constructors
    super()
    @renderType = "textblock"
    @x = (if x isnt undefined then x else 0)
    @y = (if y isnt undefined then y else 0)

    # Animation options
    @imageLength = 1
    @imageNumber = 0

    # Load default options
    @clipWidth = parseInt(width, 10) or 200
    @lines = []
    @lineWidth = []
    @bm = document.createElement("canvas")
    @bmCtx = @bm.getContext("2d")
    @bm.width = @clipWidth
    @bm.height = 10
    @bm.spacing = 0

    # Create getters/setters
    hidden =
      string: ""
      font: "normal 14px Verdana"
      alignment: "left"
      color: "#000000"
      lineHeight: 0

    Object.defineProperty this, "string",
      get: ->
        hidden.string

      set: (value) ->
        hidden.string = (if typeof value is "string" then value else value.toString())
        @stringToLines()
        @cacheRendering()
        engine.enableRedrawRegions and @onAfterChange()
        value

    Object.defineProperty this, "font",
      get: ->
        hidden.font

      set: (value) ->
        throw new Error("font should be of type: string") if typeof value isnt "string" #dev
        return value if value is hidden.font
        hidden.font = value
        @stringToLines()
        @cacheRendering()
        engine.enableRedrawRegions and @onAfterChange()
        value

    Object.defineProperty this, "alignment",
      get: ->
        hidden.alignment

      set: (value) ->
        throw new Error("alignment should be one of the following: ALIGNMENT_LEFT, ALIGNMENT_CENTER, ALIGNMENT_RIGHT") if [ #dev
          "left"
          "center"
          "right"
        ].indexOf(value) is -1
        return value if value is hidden.alignment
        hidden.alignment = value
        @cacheRendering()
        engine.enableRedrawRegions and @onAfterChange()
        value

    Object.defineProperty this, "color",
      get: ->
        hidden.color

      set: (value) ->
        throw new Error("color should be a CSS color string") unless /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})/.test(value) #dev
        return value if value is hidden.color
        hidden.color = value
        @cacheRendering()
        engine.enableRedrawRegions and @onAfterChange()
        value

    Object.defineProperty this, "lineHeight",
      get: ->
        hidden.lineHeight

      set: (value) ->
        hidden.lineHeight = (if typeof value isnt "number" then value else parseFloat(value))
        @calculateCanvasHeight()
        @cacheRendering()
        engine.enableRedrawRegions and @onAfterChange()
        value


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
    offset = OFFSET_TOP_LEFT
    if additionalProperties and additionalProperties.offset
      offset = additionalProperties.offset
      delete additionalProperties.offset

    # Load additional properties
    @import additionalProperties
    @string = string

    # Set offset after the source has been set (otherwise the offset cannot be calculated correctly)
    @offset = offset
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
    ret = new Math.Vector()

    # calculate horizontal offset
    if [
      OFFSET_TOP_LEFT
      OFFSET_MIDDLE_LEFT
      OFFSET_BOTTOM_LEFT
    ].indexOf(offset) isnt -1
      ret.x = 0
    else if [
      OFFSET_TOP_CENTER
      OFFSET_MIDDLE_CENTER
      OFFSET_BOTTOM_CENTER
    ].indexOf(offset) isnt -1
      ret.x = @clipWidth / 2
    else ret.x = @clipWidth if [
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
      ret.y = 0
    else if [
      OFFSET_MIDDLE_LEFT
      OFFSET_MIDDLE_CENTER
      OFFSET_MIDDLE_RIGHT
    ].indexOf(offset) isnt -1
      ret.y = @clipHeight / 2
    else ret.y = @clipHeight if [
      OFFSET_BOTTOM_LEFT
      OFFSET_BOTTOM_CENTER
      OFFSET_BOTTOM_RIGHT
    ].indexOf(offset) isnt -1
    ret


  ###
  Breaks the TextBlock's text string into lines.

  @private
  ###
  stringToLines: ->
    lt = undefined
    line = undefined
    paragraphs = undefined
    pid = undefined
    words = undefined
    wid = undefined
    word = undefined
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
  cacheRendering: ->
    xOffset = undefined
    i = undefined
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
    @createHash()
    return

  createHash: ->
    self = undefined
    self = this
    @bm.oldSrc = @bm.src
    @bm.src = [
      "string"
      "font"
      "alignment"
      "color"
      "lineHeight"
      "clipWidth"
    ].map((property) ->
      self[property]
    ).join("-|-")
    return


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
