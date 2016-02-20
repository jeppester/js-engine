module.exports = -> module.exports::constructor.apply @, arguments

c = class WebGLTextureShaderProgram
  textureCache: {}
  maskCache: {}
  locations: {}
  currentTexture: null
  texCoordBuffer: null
  positionBuffer: null
  vertex: null
  program: null
  positions: []
  texCoords: []
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
    # Texture coordinate buffer
    @texCoordBuffer = gl.createBuffer()

    # Position buffer
    @positionBuffer = gl.createBuffer()
    return

  onSet: (gl)->
    gl.bindBuffer gl.ARRAY_BUFFER, @texCoordBuffer
    gl.vertexAttribPointer @locations.a_texCoord, 2, gl.FLOAT, false, 0, 0
    gl.enableVertexAttribArray @locations.a_texCoord

    gl.bindBuffer gl.ARRAY_BUFFER, @positionBuffer
    gl.vertexAttribPointer @locations.a_position, 2, gl.FLOAT, false, 0, 0
    gl.enableVertexAttribArray @locations.a_position

  # Draw functions
  renderSprite: (gl, object, wm) ->
    if object.renderType == "textblock" && @textureCache[object.texture.lastCacheKey]
      gl.deleteTexture @textureCache[object.texture.lastCacheKey]
      @textureCache[object.texture.lastCacheKey] = undefined

    # Fetch/update texture
    texture = @getSpriteTexture gl, object
    @setTexture gl, texture

    # Buffer position
    @bufferPosition object.clipWidth, object.clipHeight, wm

    # Buffer texture coordinates
    if object.imageLength == 1
      @bufferTexCoord()
    else
      @bufferAnimatedTexCoord object

    return

  setTexture: (gl, texture)->
    unless @currentTexture == texture
      # Set a rectangle the same size as the image
      @currentTexture = texture
      @flushBuffers gl
      gl.bindTexture gl.TEXTURE_2D, texture

  bufferPosition: (width, height, wm)->
    @points[0][0] = 0
    @points[0][1] = 0
    @points[1][0] = width
    @points[1][1] = 0
    @points[2][0] = 0
    @points[2][1] = height
    @points[3][0] = width
    @points[3][1] = height
    Helpers.MatrixCalculation.transformCoord @points[0], wm
    Helpers.MatrixCalculation.transformCoord @points[1], wm
    Helpers.MatrixCalculation.transformCoord @points[2], wm
    Helpers.MatrixCalculation.transformCoord @points[3], wm

    @positions.push(
      @points[0][0], @points[0][1]
      @points[1][0], @points[1][1]
      @points[2][0], @points[2][1]
      @points[2][0], @points[2][1]
      @points[1][0], @points[1][1]
      @points[3][0], @points[3][1]
    )
    return

  bufferTexCoord: ->
    @texCoords.push(
      0.0, 0.0, 1.0, 0.0, 0.0, 1.0
      0.0, 1.0, 1.0, 0.0, 1.0, 1.0
    )

  bufferAnimatedTexCoord: (object)->
    object.updateSubImage()
    x1 = (object.clipWidth + object.texture.spacing) * object.imageNumber
    x2 = x1 + object.clipWidth
    x1 /= object.texture.width
    x2 /= object.texture.width
    @texCoords.push(
      x1, 0.0, x2, 0.0, x1, 1.0
      x1, 1.0, x2, 0.0, x2, 1.0
    )

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

  flushBuffers: (gl)->
    if @positions.length
      gl.bindBuffer gl.ARRAY_BUFFER, @texCoordBuffer
      gl.bufferData gl.ARRAY_BUFFER, new Float32Array(@texCoords), gl.DYNAMIC_DRAW

      gl.bindBuffer gl.ARRAY_BUFFER, @positionBuffer
      gl.bufferData gl.ARRAY_BUFFER, new Float32Array(@positions), gl.DYNAMIC_DRAW

      gl.drawArrays gl.TRIANGLES, 0, @positions.length / 2
      @positions = []
      @texCoords = []
    return

module.exports:: = Object.create c::
module.exports::constructor = c

Helpers =
  WebGL:             require '../../helpers/webgl'
  MatrixCalculation: require '../../helpers/matrix-calculation'
