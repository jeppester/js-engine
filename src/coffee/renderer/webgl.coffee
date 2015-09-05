module.exports = -> c.apply @, arguments

Engine = require '../engine'
TextureShaderProgram = require './webgl/texture-shader-program'
ColorShaderProgram = require './webgl/color-shader-program'

c = class WebGLRenderer
  constructor: (@canvas) ->
    # Cache variables
    @cache =
      currentAlpha: undefined
      currentResolution:
        width: 0
        height: 0

    @programs = {}
    @currentProgram = false

    # Get gl context
    options =
      premultipliedAlpha: false
      alpha: false

    @gl = @canvas.getContext("webgl", options) or @canvas.getContext("experimental-webgl", options)
    gl = @gl

    # Optimize options
    gl.pixelStorei gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false

    # Set default blending
    gl.blendFunc gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA
    gl.enable gl.BLEND

    # Init shader programs
    @programs =
      texture: new TextureShaderProgram(gl)
      color: new ColorShaderProgram(gl)

    return

  setProgram: (program) ->
    if @currentProgram isnt program
      gl = undefined
      gl = @gl

      # Set program
      @currentProgram = program
      gl.useProgram program.program

      # Bind stuff
      program.onSet gl

      # Set current resolution var
      gl.uniform2f program.locations.u_resolution, @cache.currentResolution.width, @cache.currentResolution.height

      # Set current alpha
      gl.uniform1f @currentProgram.locations.u_alpha, @cache.currentAlpha
    return

  render: (cameras) ->
    gl = @gl
    camerasLength = cameras.length
    i = 0
    while i < camerasLength
      camera = cameras[i]

      # Setup camera resolution
      w = camera.captureRegion.width
      h = camera.captureRegion.height
      if @cache.currentResolution.width isnt w or @cache.currentResolution.height isnt h
        @cache.currentResolution.width = w
        @cache.currentResolution.height = h
        gl.uniform2f @currentProgram.locations.u_resolution, w, h if @currentProgram

      # Set camera position
      wm = Engine.Helpers.MatrixCalculation.makeTranslation(-camera.captureRegion.x, -camera.captureRegion.y)

      # Set camera projection viewport
      gl.viewport camera.projectionRegion.x, camera.projectionRegion.y, camera.projectionRegion.width, camera.projectionRegion.height
      rooms = [
        engine.masterRoom
        camera.room
      ]
      roomsLength = rooms.length
      ii = 0
      while ii < roomsLength
        # Draw rooms
        console.log rooms[ii]
        @renderTree rooms[ii], wm
        ii++
      i++
    return

  renderTree: (object, wm) ->
    gl = @gl
    localWm = Engine.Helpers.MatrixCalculation.matrixMultiplyArray([
      Engine.Helpers.MatrixCalculation.calculateLocalMatrix(object)
      wm
    ])
    offset = Engine.Helpers.MatrixCalculation.makeTranslation(-object.offset.x, -object.offset.y)
    return unless object.isVisible()

    # Set object alpha (because alpha is used by ALL rendered objects)
    if @cache.currentAlpha isnt object.opacity
      @cache.currentAlpha = object.opacity
      gl.uniform1f @currentProgram.locations.u_alpha, object.opacity if @currentProgram
    switch object.renderType

      # Texture based objects
      when "textblock", "sprite"
        @setProgram @programs.texture
        @currentProgram.renderSprite gl, object, Engine.Helpers.MatrixCalculation.matrixMultiply(offset, localWm)

      # Geometric objects
      when "line"
        @setProgram @programs.color
        @currentProgram.renderLine gl, object, Engine.Helpers.MatrixCalculation.matrixMultiply(offset, localWm)
      when "rectangle"
        @setProgram @programs.color
        @currentProgram.renderRectangle gl, object, Engine.Helpers.MatrixCalculation.matrixMultiply(offset, localWm)
      when "circle"
        @setProgram @programs.color
        @currentProgram.renderCircle gl, object, Engine.Helpers.MatrixCalculation.matrixMultiply(offset, localWm)
    if object.children
      len = object.children.length
      i = 0
      while i < len
        @renderTree object.children[i], localWm
        i++
    return

module.exports:: = c::
module.exports[name] = value for name, value of c
