coordsBufferLength = 5 * 6 * 20000

module.exports = class WebGLColorShaderProgram
  program: null
  coordsCount: 0
  locations: {}

  coords: new Float32Array coordsBufferLength
  coordsBuffer: null

  constructor: (gl) ->
    @program = gl.createProgram()
    @initShaders gl
    @bindLocations gl
    @initBuffers gl

  initShaders: (gl) ->
    # Vertex shader
    vertexCode = "
      uniform vec2 u_resolution;

      attribute vec2 a_position;
      attribute vec3 a_color;
      attribute float a_opacity;

      varying float v_opacity;
      varying vec3 v_color;

      void main() {
        vec2 clipSpace = a_position / u_resolution * 2.0 - 1.0;

        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

        v_color = a_color;
        v_opacity = a_opacity;
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

      varying vec3 v_color;
      varying float v_opacity;

      void main() {
        gl_FragColor = vec4(v_color, v_opacity);
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

  setAlpha: (gl, alpha) ->
    unless @currentAlpha == alpha
      @currentAlpha = alpha
      gl.uniform1f @locations.u_alpha, alpha

  # Draw functions
  renderLine: (gl, object, wm) ->
    l = @locations
    @setAlpha gl, object.opacity

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
    Helpers.WebGL.setConvexPolygon gl, coords

    # Set matrix
    gl.uniformMatrix3fv l.u_matrix, false, wm

    # Draw
    gl.drawArrays gl.TRIANGLE_FAN, 0, coords.length / 2
    return

  renderRectangle: (gl, object, wm) ->
    l = @locations
    @setAlpha gl, object.opacity

    # Set matrix (it is the same for both fill and stroke)
    gl.uniformMatrix3fv l.u_matrix, false, wm

    # Draw fill
    if object.fillStyle isnt "transparent"
      # Set color
      gl.uniform1i l.u_color, Helpers.WebGL.colorFromCSSString object.fillStyle

      # Set geometry (no need to set x and y as they already in the world matrix)
      Helpers.WebGL.setPlane gl, 0, 0, object.width, object.height

      # Draw
      gl.drawArrays gl.TRIANGLES, 0, 6

    # Draw stroke (if not transparent)
    if object.strokeStyle isnt "transparent"
      # Set color
      gl.uniform1i l.u_color, Helpers.WebGL.colorFromCSSString(object.strokeStyle)

      # Set geometry (no need to set x and y as they are already included in the world matrix)
      Helpers.WebGL.setPlaneOutline gl, 0, 0, object.width, object.height, object.lineWidth

      # Draw
      gl.drawArrays gl.TRIANGLES, 0, 24
    return

  renderCircle: (gl, object, wm) ->
    l = @locations
    @setAlpha gl, object.opacity

    # Set matrix (it is the same for both fill and stroke)
    gl.uniformMatrix3fv l.u_matrix, false, wm

    # Decide how many segments we want
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
      gl.uniform1i l.u_color, Helpers.WebGL.colorFromCSSString(object.fillStyle)

      # Set geometry (no need to set x and y as they already in the world matrix)
      Helpers.WebGL.setCircle gl, 0, 0, segmentsCount, object.radius

      # Draw
      gl.drawArrays gl.TRIANGLE_FAN, 0, segmentsCount

    # Draw stroke (if not transparent)
    if object.strokeStyle isnt "transparent"

      # Set color
      gl.uniform1i l.u_color, Helpers.WebGL.colorFromCSSString(object.strokeStyle)

      # Set geometry (no need to set x and y as they already in the world matrix)
      Helpers.WebGL.setCircleOutline gl, 0, 0, segmentsCount, object.radius, object.lineWidth

      # Draw
      gl.drawArrays gl.TRIANGLE_STRIP, 0, segmentsCount * 2 + 2
    return

  renderPolygon: (gl, object, wm) ->
    l = @locations
    @setAlpha gl, object.opacity

    # Set matrix (it is the same for both fill and stroke)
    gl.uniformMatrix3fv l.u_matrix, false, wm

    # Draw fill
    if object.fillStyle isnt "transparent"
      # Set color
      gl.uniform1i l.u_color, Helpers.WebGL.colorFromCSSString object.fillStyle

      # Set geometry (no need to set x and y as they already in the world matrix)
      Helpers.WebGL.setPolygon gl, object.points

      # Draw
      gl.drawArrays gl.TRIANGLES, 0, (object.points.length - 2) * 3

    if object.strokeStyle isnt "transparent"
      # Set color
      gl.uniform1i l.u_color, Helpers.WebGL.colorFromCSSString(object.strokeStyle)

      # Set geometry (no need to set x and y as they already in the world matrix)
      Helpers.WebGL.setPolygonOutline gl, object.points, object.lineWidth

      # Draw
      gl.drawArrays gl.TRIANGLE_STRIP, 0, object.points.length * 2 + 2
    return

  renderBoundingBox: (gl, object, wm)->
    l = @locations
    @setAlpha gl, 1

    mask = engine.loader.getMask object.source, object.getTheme()
    box = mask.boundingBox
    x = box.points[0].x
    y = box.points[0].y
    width = box.points[2].x - x
    height = box.points[2].y - y

    gl.uniformMatrix3fv l.u_matrix, false, wm
    gl.uniform1i l.u_color, Helpers.WebGL.colorFromCSSString '#0F0'
    Helpers.WebGL.setPlaneOutline gl, x, y, width, height, 1
    gl.drawArrays gl.TRIANGLES, 0, 24

Helpers =
  WebGL: require '../../helpers/webgl'
