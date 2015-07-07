Engine = require '../../engine'

module.exports = class WebGLColorShaderProgram
  constructor: (gl) ->
    @program = gl.createProgram()
    @initShaders gl
    @bindLocations gl
    @initBuffers gl
    @cache = currentBuffer: @vertexBuffer
    return

  initShaders: (gl) ->
    # Vertex shader
    vertexCode = "
      attribute vec2 a_position;
      uniform vec2 u_resolution;
      uniform mat3 u_matrix;

      void main() {
        vec2 position = (u_matrix * vec3(a_position, 1)).xy;
        vec2 zeroToOne = position / u_resolution;
        vec2 zeroToTwo = zeroToOne * 2.0;
        vec2 clipSpace = zeroToTwo - 1.0;

        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
      }
    "
    vertexShader = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource vertexShader, vertexCode
    gl.compileShader vertexShader

    # Check that the shader did compile
    # dev
    throw new Error(gl.getShaderInfoLog(vertexShader)) unless gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS) # dev
    # dev
    gl.attachShader @program, vertexShader

    # Fragment shader
    fragmentCode = "
      precision mediump float;
      uniform int u_color;
      uniform float u_alpha;

      void main() {
        float rValue = float(u_color / 256 / 256);
        float gValue = float(u_color / 256 - int(rValue * 256.0));
        float bValue = float(u_color - int(rValue * 256.0 * 256.0) - int(gValue * 256.0));
        gl_FragColor = vec4(rValue / 255.0, gValue / 255.0, bValue / 255.0, u_alpha);
      }
    "
    fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource fragmentShader, fragmentCode
    gl.compileShader fragmentShader

    # Check that the shader did compile
    # dev
    throw new Error(gl.getShaderInfoLog(fragmentShader)) unless gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS) # dev
    # dev
    gl.attachShader @program, fragmentShader
    gl.linkProgram @program
    return

  bindLocations: (gl) ->
    @locations =
      a_position: gl.getAttribLocation(@program, "a_position")
      u_resolution: gl.getUniformLocation(@program, "u_resolution")
      u_matrix: gl.getUniformLocation(@program, "u_matrix")
      u_color: gl.getUniformLocation(@program, "u_color")
      u_alpha: gl.getUniformLocation(@program, "u_alpha")

    return

  initBuffers: (gl) ->
    # Vertex buffer
    @vertexBuffer = gl.createBuffer()
    return

  # When returning to the program reset the buffer
  onSet: (gl) ->
    gl.bindBuffer gl.ARRAY_BUFFER, @vertexBuffer
    gl.enableVertexAttribArray @locations.a_position
    gl.vertexAttribPointer @locations.a_position, 2, gl.FLOAT, false, 0, 0
    return

  # Draw functions
  renderLine: (gl, object, wm) ->
    l = undefined
    len = undefined
    coords = undefined
    color = undefined
    a = undefined
    b = undefined
    c = undefined
    l = @locations

    # If the line is transparent, do nothing
    if object.strokeStyle is "transparent"
      return
    else if object.strokeStyle.length is 4
      color = object.strokeStyle
      a = color.substr(1, 1)
      b = color.substr(2, 1)
      c = color.substr(3, 1)
      color = parseInt("0x" + a + a + b + b + c + c)
    else
      color = parseInt("0x" + object.strokeStyle.substr(1, 6))

    # Set color
    gl.uniform1i l.u_color, color

    # Set geometry
    coords = object.createPolygonFromWidth(object.lineWidth, object.lineCap).getCoordinates()
    Engine.Helpers.WebGL.setConvexPolygon gl, coords

    # Set matrix
    gl.uniformMatrix3fv l.u_matrix, false, wm

    # Draw
    gl.drawArrays gl.TRIANGLE_FAN, 0, coords.length / 2
    return

  renderRectangle: (gl, object, wm) ->
    l = @locations

    # Set matrix (it is the same for both fill and stroke)
    gl.uniformMatrix3fv l.u_matrix, false, wm

    # Draw fill
    if object.fillStyle isnt "transparent"
      # Set color
      gl.uniform1i l.u_color, Engine.Helpers.WebGL.colorFromCSSString object.fillStyle

      # Set geometry (no need to set x and y as they already in the world matrix)
      Engine.Helpers.WebGL.setPlane gl, 0, 0, object.width, object.height

      # Draw
      gl.drawArrays gl.TRIANGLES, 0, 6

    # Draw stroke (if not transparent)
    if object.strokeStyle isnt "transparent"
      # Set color
      gl.uniform1i l.u_color, Engine.Helpers.WebGL.colorFromCSSString(object.strokeStyle)

      # Set geometry (no need to set x and y as they are already included in the world matrix)
      Engine.Helpers.WebGL.setPlaneOutline gl, 0, 0, object.width, object.height, object.lineWidth

      # Draw
      gl.drawArrays gl.TRIANGLES, 0, 24
    return

  renderCircle: (gl, object, wm) ->
    l = undefined
    perimeter = undefined
    segmentsCount = undefined
    l = @locations

    # Set matrix (it is the same for both fill and stroke)
    gl.uniformMatrix3fv l.u_matrix, false, wm

    # Device how many segments we want
    if object.radius < 10
      segmentsCount = 12
    else if object.radius < 50
      segmentsCount = 30
    else if object.radius < 100
      segmentsCount = 50
    else
      segmentsCount = 80

    # Draw fill
    if object.fillStyle isnt "transparent"

      # Set color
      gl.uniform1i l.u_color, Engine.Helpers.WebGL.colorFromCSSString(object.fillStyle)

      # Set geometry (no need to set x and y as they already in the world matrix)
      Engine.Helpers.WebGL.setCircle gl, 0, 0, segmentsCount, object.radius

      # Draw
      gl.drawArrays gl.TRIANGLE_FAN, 0, segmentsCount

    # Draw stroke (if not transparent)
    if object.strokeStyle isnt "transparent"

      # Set color
      gl.uniform1i l.u_color, Engine.Helpers.WebGL.colorFromCSSString(object.strokeStyle)

      # Set geometry (no need to set x and y as they already in the world matrix)
      Engine.Helpers.WebGL.setCircleOutline gl, 0, 0, segmentsCount, object.radius, object.lineWidth

      # Draw
      gl.drawArrays gl.TRIANGLE_STRIP, 0, segmentsCount * 2 + 2
    return
