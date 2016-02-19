module.exports = -> module.exports::constructor.apply @, arguments

c = class WebGLTextureShaderProgram
  textureCache: {}
  maskCache: {}
  locations: {}
  currentTexture: null
  regularTextCoordBuffer: null
  rectangleCornerBuffer: null
  animatedTextCoordBuffer: null
  mode: null
  program: null
  drawBuffer: []
  textureBuffer: []
  points: [
    new Float32Array(2)
    new Float32Array(2)
    new Float32Array(2)
    new Float32Array(2)
  ]

  constructor: (gl) ->
    # Init program
    @program = gl.createProgram()
    @initShaders gl
    @bindLocations gl
    @initBuffers gl

  initShaders: (gl) ->
    # Vertex shader
    vertexCode = "
      attribute vec2 a_position;
      attribute vec2 a_texCoord;

      uniform vec2 u_resolution;

      varying vec2 v_texCoord;

      void main() {
        vec2 clipSpace = a_position / u_resolution * 2.0 - 1.0;

        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

        v_texCoord = a_texCoord;
      }
    "
    vertexShader = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource vertexShader, vertexCode
    gl.compileShader vertexShader
    gl.attachShader @program, vertexShader

    # Fragment shader
    fragmentCode = "
      precision mediump float;

      uniform sampler2D u_image;
      varying vec2 v_texCoord;
      uniform float u_alpha;

      void main() {
        vec4 textureColor = texture2D(u_image, v_texCoord);
        gl_FragColor = vec4(textureColor.rgb, textureColor.a * u_alpha);
      }
    "
    fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource fragmentShader, fragmentCode
    gl.compileShader fragmentShader
    gl.attachShader @program, fragmentShader
    gl.linkProgram @program
    return

  bindLocations: (gl) ->
    @locations.a_texCoord   = gl.getAttribLocation @program, "a_texCoord"
    @locations.a_position   = gl.getAttribLocation @program, "a_position"
    @locations.u_resolution = gl.getUniformLocation @program, "u_resolution"
    @locations.u_alpha      = gl.getUniformLocation @program, "u_alpha"
    return

  initBuffers: (gl) ->
    # Regular texture coordinate buffer (the coordinates are always the same)
    @regularTextCoordBuffer = gl.createBuffer()

    # Set textcoords, since they newer change
    gl.bindBuffer gl.ARRAY_BUFFER, @regularTextCoordBuffer

    # Animated texture coordinate (the coordinates will be unique for each draw)
    @animatedTextCoordBuffer = gl.createBuffer()

    # Rectangle corner buffer
    @rectangleCornerBuffer = gl.createBuffer()
    return

  # Use the same texture coordinate buffer for all non-animated sprites
  setRegularTextCoordBuffer: (gl) ->
    return if @mode == 'regular'
    @mode = 'regular'

    # Enable the texture coord buffer
    gl.bindBuffer gl.ARRAY_BUFFER, @regularTextCoordBuffer
    gl.vertexAttribPointer @locations.a_texCoord, 2, gl.FLOAT, false, 0, 0
    gl.enableVertexAttribArray @locations.a_texCoord

    # Always leave the rectangle corner buffer bound, as it is used A LOT
    # and we want to prevent too many buffer binds
    gl.bindBuffer gl.ARRAY_BUFFER, @rectangleCornerBuffer
    return

  # Set a texture coordinate buffer for a specific animated object
  setAnimatedTextCoordBuffer: (gl, object)->
    return if @mode == 'animated'
    @mode = 'animated'

    x1 = (object.clipWidth + object.texture.spacing) * object.imageNumber
    x2 = x1 + object.clipWidth
    x1 /= object.texture.width
    x2 /= object.texture.width
    y1 = 0
    y2 = 1

    # Enable the texture coord buffer
    gl.bindBuffer gl.ARRAY_BUFFER, @animatedTextCoordBuffer
    gl.bufferData gl.ARRAY_BUFFER, new Float32Array([
      # Triangle 1
      x1, y1
      x2, y1
      x1, y2

      # Triangle 2
      x1, y2
      x2, y1
      x2, y2
    ]), gl.STATIC_DRAW
    gl.vertexAttribPointer @locations.a_texCoord, 2, gl.FLOAT, false, 0, 0
    gl.enableVertexAttribArray @locations.a_texCoord

    # Always leave the rectangle corner buffer bound, as it is used A LOT
    # and we want to prevent too many buffer binds
    gl.bindBuffer gl.ARRAY_BUFFER, @rectangleCornerBuffer
    return

  # When returning to the program reset the buffer
  onSet: (gl) ->
    gl.bindBuffer gl.ARRAY_BUFFER, @rectangleCornerBuffer
    gl.enableVertexAttribArray @locations.a_position
    gl.vertexAttribPointer @locations.a_position, 2, gl.FLOAT, false, 0, 0
    return

  # Draw functions
  renderSprite: (gl, object, wm) ->
    if object.renderType == "textblock" && @textureCache[object.texture.lastCacheKey]
      gl.deleteTexture @textureCache[object.texture.lastCacheKey]
      @textureCache[object.texture.lastCacheKey] = undefined

    # Set the correct texture coordinate buffer
    if object.imageLength == 1
      @setRegularTextCoordBuffer gl
    else
      object.updateSubImage()

      # Set create and set texture coordinate buffer for the object
      @setAnimatedTextCoordBuffer gl, object

    texture = @getSpriteTexture gl, object

    @points[0][0] = 0
    @points[0][1] = 0

    @points[1][0] = object.clipWidth
    @points[1][1] = 0

    @points[2][0] = 0
    @points[2][1] = object.clipHeight

    @points[3][0] = object.clipWidth
    @points[3][1] = object.clipHeight

    Helpers.MatrixCalculation.transformCoord @points[0], wm
    Helpers.MatrixCalculation.transformCoord @points[1], wm
    Helpers.MatrixCalculation.transformCoord @points[2], wm
    Helpers.MatrixCalculation.transformCoord @points[3], wm

    @renderTexture(gl, texture, @points)
    return

  # Draw functions
  renderMask: (gl, object, wm) ->
    # Set the correct texture coordinate buffer
    if object.imageLength == 1
      @setRegularTextCoordBuffer gl
    else
      # Set create and set texture coordinate buffer for the object
      @setAnimatedTextCoordBuffer gl, object

    texture = @getMaskTexture gl, object
    @renderTexture(gl, texture, wm, object.clipWidth, object.clipHeight)
    return

  renderTexture: (gl, texture, points)->
    if @currentTexture != texture
      # Set a rectangle the same size as the image
      @currentTexture = texture
      @flushDrawBuffer gl
      gl.bindTexture gl.TEXTURE_2D, texture

    @drawBuffer.push(
      points[0][0], points[0][1], points[1][0], points[1][1], points[2][0], points[2][1]
      points[2][0], points[2][1], points[1][0], points[1][1], points[3][0], points[3][1]
    )

    @textureBuffer.push(
      0.0, 0.0, 1.0, 0.0, 0.0, 1.0
      0.0, 1.0, 1.0, 0.0, 1.0, 1.0
    )
    return

  getSpriteTexture: (gl, object) ->
    @textureCache[object.texture.cacheKey] ||
    @textureCache[object.texture.cacheKey] = @createTexture gl, object.texture

  getMaskTexture: (gl, object) ->
    @maskCache[object.texture.cacheKey] ||
    @maskCache[object.texture.cacheKey] = @createTexture gl, engine.loader.getMask(object.source, object.getTheme())

  createTexture: (gl, image) ->
    texture = undefined

    # Create a texture
    texture = gl.createTexture()

    # Bind the texture
    gl.bindTexture gl.TEXTURE_2D, texture

    # Upload the image into the texture.
    gl.texImage2D gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image

    # Set texture wrapping
    gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE
    gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE
    gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR
    if image.imageLength is 1
      gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR
    else
      # gl.NEAREST is better for drawing a part of an image
      gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST
    gl.bindTexture gl.TEXTURE_2D, null
    texture

  flushDrawBuffer: (gl)->
    if @drawBuffer.length
      gl.bindBuffer gl.ARRAY_BUFFER, @regularTextCoordBuffer
      gl.bufferData gl.ARRAY_BUFFER, new Float32Array(@textureBuffer), gl.STATIC_DRAW
      gl.vertexAttribPointer @locations.a_texCoord, 2, gl.FLOAT, false, 0, 0
      gl.enableVertexAttribArray @locations.a_texCoord

      gl.bindBuffer gl.ARRAY_BUFFER, @rectangleCornerBuffer
      gl.bufferData gl.ARRAY_BUFFER, new Float32Array(@drawBuffer), gl.STATIC_DRAW
      gl.drawArrays gl.TRIANGLES, 0, @drawBuffer.length / 2
      @drawBuffer    = []
      @textureBuffer = []

module.exports:: = Object.create c::
module.exports::constructor = c

Helpers =
  WebGL:             require '../../helpers/webgl'
  MatrixCalculation: require '../../helpers/matrix-calculation'
