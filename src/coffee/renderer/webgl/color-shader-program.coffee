TriangleBuffer = require './triangle-buffer'

module.exports = class WebGLColorShaderProgram
  program: null
  locations: {}

  triangleBuffer: new TriangleBuffer 20000 # 20000 triangles
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
      a_position:   gl.getAttribLocation @program, "a_position"
      a_color:   gl.getAttribLocation @program, "a_color"
      a_opacity:    gl.getAttribLocation @program, "a_opacity"
      u_resolution: gl.getUniformLocation @program, "u_resolution"
    return

  initBuffers: (gl) ->
    # Vertex buffer
    @vertexBuffer = gl.createBuffer()
    return

  # When returning to the program reset the buffer
  onSet: (gl) ->
    floatSize = @triangleBuffer.getBuffer().BYTES_PER_ELEMENT
    gl.bindBuffer gl.ARRAY_BUFFER, @vertexBuffer

    # Position
    gl.vertexAttribPointer @locations.a_position, 2, gl.FLOAT, false, 6 * floatSize, 0
    gl.enableVertexAttribArray @locations.a_position

    # Color
    gl.vertexAttribPointer @locations.a_color, 3, gl.FLOAT, false, 6 * floatSize, 2 * floatSize
    gl.enableVertexAttribArray @locations.a_color

    # Opacity
    gl.vertexAttribPointer @locations.a_opacity, 1, gl.FLOAT, false, 6 * floatSize, 5 * floatSize
    gl.enableVertexAttribArray @locations.a_opacity
    return

  # Draw functions
  renderLine: (gl, object, wm) ->
    # If the line is transparent, do nothing
    return if object.strokeStyle is "transparent"

    # Set triangles
    color = Helpers.WebGL.colorFromCSSString object.strokeStyle
    coords = Helpers.WebGL.getLineCoords object
    triangleCount = coords.length / 2 - 2
    while --triangleCount
      offset = triangleCount * 2
      @flushBuffers(gl) unless @triangleBuffer.pushTriangle(
        coords[0]
        coords[1]
        coords[offset]
        coords[offset + 1]
        coords[offset + 2]
        coords[offset + 3]
        color
        object.opacity
        wm
      )
    return

  # renderRectangle: (gl, object, wm) ->
  #   l = @locations
  #   @setAlpha gl, object.opacity
  #
  #   # Set matrix (it is the same for both fill and stroke)
  #   gl.uniformMatrix3fv l.u_matrix, false, wm
  #
  #   # Draw fill
  #   if object.fillStyle isnt "transparent"
  #     # Set color
  #     gl.uniform1i l.u_color, Helpers.WebGL.colorFromCSSString object.fillStyle
  #
  #     # Set geometry (no need to set x and y as they already in the world matrix)
  #     Helpers.WebGL.setPlane gl, 0, 0, object.width, object.height
  #
  #     # Draw
  #     gl.drawArrays gl.TRIANGLES, 0, 6
  #
  #   # Draw stroke (if not transparent)
  #   if object.strokeStyle isnt "transparent"
  #     # Set color
  #     gl.uniform1i l.u_color, Helpers.WebGL.colorFromCSSString(object.strokeStyle)
  #
  #     # Set geometry (no need to set x and y as they are already included in the world matrix)
  #     Helpers.WebGL.setPlaneOutline gl, 0, 0, object.width, object.height, object.lineWidth
  #
  #     # Draw
  #     gl.drawArrays gl.TRIANGLES, 0, 24
  #   return
  #
  # renderCircle: (gl, object, wm) ->
  #   l = @locations
  #   @setAlpha gl, object.opacity
  #
  #   # Set matrix (it is the same for both fill and stroke)
  #   gl.uniformMatrix3fv l.u_matrix, false, wm
  #
  #   # Decide how many segments we want
  #   if object.radius < 10
  #     segmentsCount = 12
  #   else if object.radius < 50
  #     segmentsCount = 30
  #   else if object.radius < 100
  #     segmentsCount = 50
  #   else
  #     segmentsCount = 80
  #
  #   # Draw fill
  #   if object.fillStyle isnt "transparent"
  #
  #     # Set color
  #     gl.uniform1i l.u_color, Helpers.WebGL.colorFromCSSString(object.fillStyle)
  #
  #     # Set geometry (no need to set x and y as they already in the world matrix)
  #     Helpers.WebGL.setCircle gl, 0, 0, segmentsCount, object.radius
  #
  #     # Draw
  #     gl.drawArrays gl.TRIANGLE_FAN, 0, segmentsCount
  #
  #   # Draw stroke (if not transparent)
  #   if object.strokeStyle isnt "transparent"
  #
  #     # Set color
  #     gl.uniform1i l.u_color, Helpers.WebGL.colorFromCSSString(object.strokeStyle)
  #
  #     # Set geometry (no need to set x and y as they already in the world matrix)
  #     Helpers.WebGL.setCircleOutline gl, 0, 0, segmentsCount, object.radius, object.lineWidth
  #
  #     # Draw
  #     gl.drawArrays gl.TRIANGLE_STRIP, 0, segmentsCount * 2 + 2
  #   return
  #
  # renderPolygon: (gl, object, wm) ->
  #   l = @locations
  #   @setAlpha gl, object.opacity
  #
  #   # Set matrix (it is the same for both fill and stroke)
  #   gl.uniformMatrix3fv l.u_matrix, false, wm
  #
  #   # Draw fill
  #   if object.fillStyle isnt "transparent"
  #     # Set color
  #     gl.uniform1i l.u_color, Helpers.WebGL.colorFromCSSString object.fillStyle
  #
  #     # Set geometry (no need to set x and y as they already in the world matrix)
  #     Helpers.WebGL.setPolygon gl, object.points
  #
  #     # Draw
  #     gl.drawArrays gl.TRIANGLES, 0, (object.points.length - 2) * 3
  #
  #   if object.strokeStyle isnt "transparent"
  #     # Set color
  #     gl.uniform1i l.u_color, Helpers.WebGL.colorFromCSSString(object.strokeStyle)
  #
  #     # Set geometry (no need to set x and y as they already in the world matrix)
  #     Helpers.WebGL.setPolygonOutline gl, object.points, object.lineWidth
  #
  #     # Draw
  #     gl.drawArrays gl.TRIANGLE_STRIP, 0, object.points.length * 2 + 2
  #   return
  #
  # renderBoundingBox: (gl, object, wm)->
  #   l = @locations
  #   @setAlpha gl, 1
  #
  #   mask = engine.loader.getMask object.source, object.getTheme()
  #   box = mask.boundingBox
  #   x = box.points[0].x
  #   y = box.points[0].y
  #   width = box.points[2].x - x
  #   height = box.points[2].y - y
  #
  #   gl.uniformMatrix3fv l.u_matrix, false, wm
  #   gl.uniform1i l.u_color, Helpers.WebGL.colorFromCSSString '#0F0'
  #   Helpers.WebGL.setPlaneOutline gl, x, y, width, height, 1
  #   gl.drawArrays gl.TRIANGLES, 0, 24

  flushBuffers: (gl)->
    triangleCount = @triangleBuffer.getTriangleCount()
    if triangleCount != 0
      gl.bufferData gl.ARRAY_BUFFER, @triangleBuffer.getBuffer(), gl.DYNAMIC_DRAW
      gl.drawArrays gl.TRIANGLES, 0, triangleCount * 3 # Three points per triangle
      @triangleBuffer.resetIndex()
    return

Helpers =
  WebGL: require '../../helpers/webgl'
