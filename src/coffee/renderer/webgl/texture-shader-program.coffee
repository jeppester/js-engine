module.exports = -> module.exports::constructor.apply @, arguments

c = class WebGLTextureShaderProgram
  textureCache: {}
  maskCache: {}
  currentTexture: null
  regularTextCoordBuffer: null
  rectangleCornerBuffer: null
  animatedTextCoordBuffer: null
  currentBuffer: null
  mode: null
  program: null

  constructor: (gl) ->
    # Init program
    @program = gl.createProgram()
    @initShaders gl
    @bindLocations gl
    @initBuffers gl

  setBuffer: (gl, buffer)->
    unless @currentBuffer == buffer
      gl.bindBuffer gl.ARRAY_BUFFER, buffer
      @currentBuffer = buffer

  initShaders: (gl) ->
    # Vertex shader
    vertexCode = "
      attribute vec2 a_position;
      attribute vec2 a_texCoord;

      uniform vec2 u_resolution;
      uniform mat3 u_matrix;

      varying vec2 v_texCoord;

      void main() {
        vec2 position = (u_matrix * vec3(a_position, 1)).xy;
        vec2 clipSpace = position / u_resolution * 2.0 - 1.0;

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

  bindLocations: (gl) ->
    @locations =
      a_texCoord:   gl.getAttribLocation @program, "a_texCoord"
      a_position:   gl.getAttribLocation @program, "a_position"
      u_resolution: gl.getUniformLocation @program, "u_resolution"
      u_matrix:     gl.getUniformLocation @program, "u_matrix"
      u_alpha:      gl.getUniformLocation @program, "u_alpha"

  initBuffers: (gl) ->
    # Regular texture coordinate buffer (the coordinates are always the same)
    @regularTextCoordBuffer = gl.createBuffer()

    # Set textcoords, since they newer change
    @setBuffer gl, @regularTextCoordBuffer
    gl.bufferData gl.ARRAY_BUFFER, new Float32Array([
      0.0, 0.0, 1.0, 0.0
      0.0, 1.0, 0.0, 1.0
      1.0, 0.0, 1.0, 1.0
    ]), gl.STATIC_DRAW

    # Animated texture coordinate (the coordinates will be unique for each draw)
    @animatedTextCoordBuffer = gl.createBuffer()

    # Rectangle corner buffer
    @rectangleCornerBuffer = gl.createBuffer()

  # Use the same texture coordinate buffer for all non-animated sprites
  setRegularTextCoordBuffer: (gl) ->
    return if @mode == 'regular'
    @mode = 'regular'

    # Enable the texture coord buffer
    @setBuffer gl, @regularTextCoordBuffer
    gl.vertexAttribPointer @locations.a_texCoord, 2, gl.FLOAT, false, 0, 0
    gl.enableVertexAttribArray @locations.a_texCoord
    @setBuffer gl, @rectangleCornerBuffer

  # Set a texture coordinate buffer for a specific animated object
  setAnimatedTextCoordBuffer: (gl, object) ->
    return if @mode == 'animated'
    @mode = 'animated'

    x1 = (object.clipWidth + object.bm.spacing) * object.imageNumber
    x2 = x1 + object.clipWidth
    x1 /= object.bm.width
    x2 /= object.bm.width
    y1 = 0
    y2 = 1

    # Enable the texture coord buffer
    @setBuffer gl, @animatedTextCoordBuffer
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
    @setBuffer gl, @rectangleCornerBuffer

  # When returning to the program reset the buffer
  onSet: (gl) ->
    @setBuffer gl, @rectangleCornerBuffer
    gl.enableVertexAttribArray @locations.a_position
    gl.vertexAttribPointer @locations.a_position, 2, gl.FLOAT, false, 0, 0

  # Draw functions
  renderSprite: (gl, object, wm, mask = false) ->
    l = @locations
    delete @textureCache[object.bm.oldSrc] if object.renderType is "textblock" and @textureCache[object.bm.oldSrc]

    # Bind the texture (if it is not already bound)
    t = if mask then @getMaskTexture gl, object else @getSpriteTexture gl, object
    if @currentTexture != t
      @currentTexture = t

      # Set the correct texture coordinate buffer
      if object.imageLength == 1
        @setRegularTextCoordBuffer gl
      else
        # Set the right sub image
        if engine.gameTime - object.animationLastSwitch > 1000 / object.animationSpeed
          object.imageNumber = object.imageNumber + ((if object.animationSpeed > 0 then 1 else -1))
          object.animationLastSwitch = engine.gameTime
          if object.imageNumber is object.imageLength
            object.imageNumber = (if object.animationLoops then 0 else object.imageLength - 1)
          else object.imageNumber = (if object.animationLoops then object.imageLength - 1 else 0) if object.imageNumber is -1

        # Set create and set texture coordinate buffer for the object
        @setAnimatedTextCoordBuffer gl, object

      # Set a rectangle the same size as the image
      gl.bindTexture gl.TEXTURE_2D, t
      Helpers.WebGL.setPlane gl, 0, 0, object.clipWidth, object.clipHeight

    # Set matrix
    gl.uniformMatrix3fv l.u_matrix, gl.FALSE, wm

    # Draw the rectangle.
    gl.drawArrays gl.TRIANGLES, 0, 6
    return

  # Draw functions
  renderMask: (gl, object, wm) ->
    @renderSprite gl, object, wm, true

  getSpriteTexture: (gl, object) ->
    c = @textureCache[object.bm.src]
    if c
      c
    else
      @textureCache[object.bm.src] = @createTexture(gl, object.bm)

  getMaskTexture: (gl, object) ->
    mask = engine.loader.getMask object.source, object.getTheme()
    c = @maskCache[object.bm.src]
    if c
      c
    else
      @maskCache[object.bm.src] = @createTexture(gl, mask)

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

module.exports:: = Object.create c::
module.exports::constructor = c

Helpers =
  WebGL: require '../../helpers/webgl'
