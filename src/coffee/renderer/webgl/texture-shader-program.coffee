coordsBufferLength = 5 * 6 * 20000
# 5 points per vertex (x, y + texture coords + opacity)
# 6 vertices per object (two triangles)
# 1000 objects per draw (maybe we can increase this)

module.exports = class WebGLTextureShaderProgram
  textureCache: {}
  maskCache: {}
  locations: {}
  currentTexture: document.createElement 'img'
  vertex: null
  program: null
  coordsCount: 0
  coords: new Float32Array coordsBufferLength
  coordsBuffer: null
  cornerCoords: new Float32Array 8

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
      attribute float a_opacity;

      uniform vec2 u_resolution;

      varying vec2 v_texCoord;
      varying float v_opacity;

      void main() {
        vec2 clipSpace = a_position / u_resolution * 2.0 - 1.0;

        gl_Position = vec4(clipSpace * vec2(1, -1), 0.0, 1.0);

        v_texCoord = a_texCoord;
        v_opacity = a_opacity;
      }
    "
    vertexShader = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource vertexShader, vertexCode
    gl.compileShader vertexShader
    gl.attachShader @program, vertexShader

    # Check the compile status
    compiled = gl.getShaderParameter vertexShader, gl.COMPILE_STATUS
    unless compiled
      #  Something went wrong during compilation; get the error
      console.error gl.getShaderInfoLog vertexShader

    # Fragment shader
    fragmentCode = "
      precision mediump float;

      uniform sampler2D u_image;
      varying vec2 v_texCoord;
      varying float v_opacity;

      void main() {
        vec4 textureColor = texture2D(u_image, v_texCoord);
        gl_FragColor = vec4(textureColor.rgb, textureColor.a * v_opacity);
      }
    "
    fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource fragmentShader, fragmentCode
    gl.compileShader fragmentShader

    # Check the compile status
    compiled = gl.getShaderParameter fragmentShader, gl.COMPILE_STATUS
    unless compiled
      #  Something went wrong during compilation; get the error
      console.error gl.getShaderInfoLog fragmentShader

    gl.attachShader @program, fragmentShader
    gl.linkProgram @program
    return

  bindLocations: (gl) ->
    @locations.a_position   = gl.getAttribLocation @program, "a_position"
    @locations.a_texCoord   = gl.getAttribLocation @program, "a_texCoord"
    @locations.a_opacity    = gl.getAttribLocation @program, "a_opacity"
    @locations.u_resolution = gl.getUniformLocation @program, "u_resolution"
    return

  initBuffers: (gl) ->
    # Coordinate buffer for both vertex and texture coordinates
    @coordsBuffer = gl.createBuffer()
    return

  onSet: (gl)->
    floatSize = @coords.BYTES_PER_ELEMENT
    gl.bindBuffer gl.ARRAY_BUFFER, @coordsBuffer
    gl.vertexAttribPointer @locations.a_position, 2, gl.FLOAT, false, 5 * floatSize, 0
    gl.enableVertexAttribArray @locations.a_position
    gl.vertexAttribPointer @locations.a_texCoord, 2, gl.FLOAT, false, 5 * floatSize, 2 * floatSize
    gl.enableVertexAttribArray @locations.a_texCoord
    gl.vertexAttribPointer @locations.a_opacity, 1, gl.FLOAT, false, 5 * floatSize, 4 * floatSize
    gl.enableVertexAttribArray @locations.a_opacity
    return

  # Draw functions
  renderSprite: (gl, object, wm) ->
    # Fetch/update texture
    @setSpriteTexture gl, object

    # Update corners cache with transformed object corners
    @setTransformedCorners object.clipWidth, object.clipHeight, wm

    # Buffer position
    @bufferOpacity object.opacity
    @bufferRectangle()
    if object.imageLength == 1
      @bufferTexture()
    else
      @bufferAnimatedTexture object

    @coordsCount += 30
    return

  renderTextBlock: (gl, object, wm)->
    if @textureCache[object.texture.lastCacheKey]
      gl.deleteTexture @textureCache[object.texture.lastCacheKey]
      @textureCache[object.texture.lastCacheKey] = null
    @renderSprite gl, object, wm
    return

  setSpriteTexture: (gl, object)->
    texture = object.texture
    @setTexture gl, texture
    return

  # Draw functions
  renderMask: (gl, object, wm) ->
    # Fetch/update texture
    @setMaskTexture gl, object

    # Update corners cache with transformed object corners
    @setTransformedCorners object.clipWidth, object.clipHeight, wm

    # Buffer position
    @bufferOpacity 1
    @bufferRectangle()
    if object.imageLength == 1
      @bufferTexture()
    else
      @bufferAnimatedTexture object

    @coordsCount += 30
    return

  setMaskTexture: (gl, object)->
    texture = engine.loader.getMask(object.source, object.getTheme())
    @setTexture gl, texture
    return

  setTexture: (gl, texture)->
    if @coordsCount == @coords.length || @currentTexture.cacheKey != texture.cacheKey
      # Set a rectangle the same size as the image
      @flushBuffers gl
      @currentTexture = texture
    return

  setTransformedCorners: (width, height, wm)->
    # Unreduced matrix equation:
    # x = x * wm[0] + y * wm[3] + wm[6]
    # y = x * wm[1] + y * wm[4] + wm[7]

    # Top left
    @cornerCoords[0] = wm[6] # x = 0, y = 0
    @cornerCoords[1] = wm[7] # x = 0, y = 0

    # Top right
    @cornerCoords[2] = width * wm[0] + wm[6] # y = 0
    @cornerCoords[3] = width * wm[1] + wm[7] # y = 0

    # Bottom left
    @cornerCoords[4] = height * wm[3] + wm[6] # x = 0
    @cornerCoords[5] = height * wm[4] + wm[7] # x = 0

    # Bottom right
    @cornerCoords[6] = width * wm[0] + height * wm[3] + wm[6]
    @cornerCoords[7] = width * wm[1] + height * wm[4] + wm[7]

  bufferOpacity: (opacity)->
    @coords[@coordsCount + 4] = opacity
    @coords[@coordsCount + 9] = opacity
    @coords[@coordsCount + 14] = opacity
    @coords[@coordsCount + 19] = opacity
    @coords[@coordsCount + 24] = opacity
    @coords[@coordsCount + 29] = opacity

  bufferRectangle: ->
    # Point 1
    @coords[@coordsCount]     = @cornerCoords[0]
    @coords[@coordsCount + 1] = @cornerCoords[1]

    # Point 2
    @coords[@coordsCount + 5] = @cornerCoords[2]
    @coords[@coordsCount + 6] = @cornerCoords[3]

    # Point 3
    @coords[@coordsCount + 10]  = @cornerCoords[4]
    @coords[@coordsCount + 11]  = @cornerCoords[5]

    # Point 4
    @coords[@coordsCount + 15] = @cornerCoords[4]
    @coords[@coordsCount + 16] = @cornerCoords[5]

    # Point 5
    @coords[@coordsCount + 20] = @cornerCoords[2]
    @coords[@coordsCount + 21] = @cornerCoords[3]

    # Point 6
    @coords[@coordsCount + 25] = @cornerCoords[6]
    @coords[@coordsCount + 26] = @cornerCoords[7]
    return

  bufferTexture: ->
    # Point 1
    @coords[@coordsCount + 2] = 0.0
    @coords[@coordsCount + 3] = 0.0

    # Point 2
    @coords[@coordsCount + 7] = 1.0
    @coords[@coordsCount + 8] = 0.0

    # Point 3
    @coords[@coordsCount + 12] = 0.0
    @coords[@coordsCount + 13] = 1.0

    # Point 4
    @coords[@coordsCount + 17] = 0.0
    @coords[@coordsCount + 18] = 1.0

    # Point 5
    @coords[@coordsCount + 22] = 1.0
    @coords[@coordsCount + 23] = 0.0

    # Point 6
    @coords[@coordsCount + 27] = 1.0
    @coords[@coordsCount + 28] = 1.0
    return

  bufferAnimatedTexture: (object)->
    object.updateSubImage()
    x1 = (object.clipWidth + object.texture.spacing) * object.imageNumber
    x2 = x1 + object.clipWidth
    x1 /= object.texture.width
    x2 /= object.texture.width

    # Point 1
    @coords[@coordsCount + 2] = x1
    @coords[@coordsCount + 3] = 0.0

    # Point 2
    @coords[@coordsCount + 7] = x2
    @coords[@coordsCount + 8] = 0.0

    # Point 3
    @coords[@coordsCount + 12] = x1
    @coords[@coordsCount + 13] = 1.0

    # Point 4
    @coords[@coordsCount + 17] = x1
    @coords[@coordsCount + 18] = 1.0

    # Point 5
    @coords[@coordsCount + 22] = x2
    @coords[@coordsCount + 23] = 0.0

    # Point 6
    @coords[@coordsCount + 27] = x2
    @coords[@coordsCount + 28] = 1.0
    return

  getGLTexture: (gl, texture) ->
    @textureCache[texture.cacheKey] ||
    @textureCache[texture.cacheKey] = @createGLTexture gl, texture

  createGLTexture: (gl, image) ->
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
    texture

  flushBuffers: (gl)->
    if @coordsCount
      texture = @getGLTexture(gl, @currentTexture)
      gl.bindTexture gl.TEXTURE_2D, texture
      gl.bufferData gl.ARRAY_BUFFER, @coords, gl.DYNAMIC_DRAW
      gl.drawArrays gl.TRIANGLES, 0, @coordsCount / 5
      @coordsCount = 0
    return
