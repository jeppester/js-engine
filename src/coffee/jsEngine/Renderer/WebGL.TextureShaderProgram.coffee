nameSpace "Renderer.WebGL"
class Renderer.WebGL.TextureShaderProgram
  # Import WebGL helpers
  Object::import.call @::, Mixin.WebGLHelpers

  constructor: (gl) ->
    initShaders = undefined
    initBuffers = undefined
    program = undefined
    locations = undefined

    # Init program
    @cache =
      regularTextCoordBuffer: false
      animatedTextCoordBuffer: false
      rectangleCornerBuffer: false
      currentBuffer: false
      currentTexture: undefined
      textures: {}

    @program = gl.createProgram()
    @initShaders gl
    @bindLocations gl
    @initBuffers gl
    return

  initShaders: (gl) ->
    vertexCode = undefined
    fragmentCode = undefined
    vertexShader = undefined
    fragmentShader = undefined

    # Vertex shader
    vertexCode = "
      attribute vec2 a_position;
      attribute vec2 a_texCoord;

      uniform vec2 u_resolution;
      uniform mat3 u_matrix;

      varying vec2 v_texCoord;

      void main() {
        vec2 position = (u_matrix * vec3(a_position, 1)).xy;
        vec2 zeroToOne = position / u_resolution;
        vec2 zeroToTwo = zeroToOne * 2.0;
        vec2 clipSpace = zeroToTwo - 1.0;

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
    @locations =
      a_texCoord: gl.getAttribLocation(@program, "a_texCoord")
      a_position: gl.getAttribLocation(@program, "a_position")
      u_resolution: gl.getUniformLocation(@program, "u_resolution")
      u_matrix: gl.getUniformLocation(@program, "u_matrix")
      u_alpha: gl.getUniformLocation(@program, "u_alpha")

    return

  initBuffers: (gl) ->
    # Regular texture coordinate buffer (the coordinates are always the same)
    @cache.regularTextCoordBuffer = gl.createBuffer()
    gl.bindBuffer gl.ARRAY_BUFFER, @cache.regularTextCoordBuffer
    gl.bufferData gl.ARRAY_BUFFER, new Float32Array([
      0.0
      0.0
      1.0
      0.0
      0.0
      1.0
      0.0
      1.0
      1.0
      0.0
      1.0
      1.0
    ]), gl.STATIC_DRAW

    # Animated texture coordinate (the coordinates will be unique for each draw)
    @cache.animatedTextCoordBuffer = gl.createBuffer()

    # Rectangle corner buffer
    @cache.rectangleCornerBuffer = gl.createBuffer()
    return

  # Use the same texture coordinate buffer for all non-animated sprites
  setRegularTextCoordBuffer: (gl) ->
    # Enable the texture coord buffer
    if @cache.currentBuffer isnt @cache.regularTextCoordBuffer
      gl.bindBuffer gl.ARRAY_BUFFER, @cache.regularTextCoordBuffer
      gl.enableVertexAttribArray @locations.a_texCoord
      gl.vertexAttribPointer @locations.a_texCoord, 2, gl.FLOAT, false, 0, 0
      @cache.currentBuffer = @cache.regularTextCoordBuffer

      # Bind rectangle corner buffer again (when needed instead of all the time)
      gl.bindBuffer gl.ARRAY_BUFFER, @cache.rectangleCornerBuffer
    return

  # Set a texture coordinate buffer for a specific animated object
  setAnimatedTextCoordBuffer: (gl, object) ->
    x1 = (object.clipWidth + object.bm.spacing) * object.imageNumber
    x2 = x1 + object.clipWidth
    x1 /= object.bm.width
    x2 /= object.bm.width
    y1 = 0
    y2 = 1

    # Enable the texture coord buffer
    gl.bindBuffer gl.ARRAY_BUFFER, @cache.animatedTextCoordBuffer
    gl.bufferData gl.ARRAY_BUFFER, new Float32Array([
      x1
      y1
      x2
      y1
      x1
      y2
      x1
      y2
      x2
      y1
      x2
      y2
    ]), gl.STATIC_DRAW
    gl.enableVertexAttribArray @locations.a_texCoord
    gl.vertexAttribPointer @locations.a_texCoord, 2, gl.FLOAT, false, 0, 0
    @cache.currentBuffer = @cache.animatedTextCoordBuffer

    # Bind rectangle corner buffer again (when needed instead of all the time)
    gl.bindBuffer gl.ARRAY_BUFFER, @cache.rectangleCornerBuffer
    return

  # When returning to the program reset the buffer
  onSet: (gl) ->
    gl.bindBuffer gl.ARRAY_BUFFER, @cache.rectangleCornerBuffer
    gl.enableVertexAttribArray @locations.a_position
    gl.vertexAttribPointer @locations.a_position, 2, gl.FLOAT, false, 0, 0
    return

  # Draw functions
  renderSprite: (gl, object, wm) ->
    l = @locations
    delete @cache.textures[object.bm.oldSrc]  if object.renderType is "textblock" and @cache.textures[object.bm.oldSrc]

    # Bind the texture (if it is not already the binded)
    t = @getSpriteTexture(gl, object)
    if @cache.currentTexture isnt t
      @cache.currentTexture = t

      # Set the correct texture coordinate buffer
      if object.imageLength is 1
        @setRegularTextCoordBuffer gl
      else

        # Set the right sub image
        if engine.gameTime - object.animationLastSwitch > 1000 / object.animationSpeed
          object.imageNumber = object.imageNumber + ((if object.animationSpeed > 0 then 1 else -1))
          object.animationLastSwitch = engine.gameTime
          if object.imageNumber is object.imageLength
            object.imageNumber = (if object.animationLoops then 0 else object.imageLength - 1)
          else object.imageNumber = (if object.animationLoops then object.imageLength - 1 else 0)  if object.imageNumber is -1

        # Set create and set texture coordinate buffer for the object
        @setAnimatedTextCoordBuffer gl, object

      # Set a rectangle the same size as the image
      gl.bindTexture gl.TEXTURE_2D, t
      @setPlane gl, 0, 0, object.clipWidth, object.clipHeight

    # Set matrix
    gl.uniformMatrix3fv l.u_matrix, false, wm

    # Draw the rectangle.
    gl.drawArrays gl.TRIANGLES, 0, 6
    return

  getSpriteTexture: (gl, object) ->
    @cache.textures[object.bm.src] or @createSpriteTexture(gl, object.bm)

  createSpriteTexture: (gl, image) ->
    texture = undefined

    # Create a texture.
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
    @cache.textures[image.src] = texture
    texture
