module.exports = -> module.exports::constructor.apply @, arguments

c = class WebGLRenderer
  currentAlpha: null
  currentResolution:
    width: 0
    height: 0

  constructor: (@canvas) ->
    # Cache variables
    @currentAlpha = undefined
    @currentResolution.width = 0
    @currentResolution.height = 0

    @programs = {}
    @currentProgram = false

    # Get gl context
    options =
      premultipliedAlpha: false
      alpha: false

    for context in ["webgl", "experimental-webgl"]
      @gl = @canvas.getContext context, options
      break if @gl

    # Optimize options
    @gl.pixelStorei @gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false

    # Set default blending
    @gl.blendFunc @gl.SRC_ALPHA, @gl.ONE_MINUS_SRC_ALPHA
    @gl.enable @gl.BLEND

    # Init shader programs
    @programs =
      texture: new TextureShaderProgram @gl
      color: new ColorShaderProgram @gl

  setProgram: (program) ->
    unless @currentProgram == program
      gl = @gl

      # Flush old program
      @currentProgram.flushBuffers? gl

      # Set program
      @currentProgram = program
      gl.useProgram program.program
      @currentProgram.onSet? gl

      # Bind stuff
      l = program.locations

      # Set current resolution var
      gl.uniform2f l.u_resolution, @currentResolution.width, @currentResolution.height

      # Set current alpha
      gl.uniform1f l.u_alpha, @currentAlpha
    return

  render: (cameras) ->
    gl = @gl
    for camera in cameras
      cr = camera.captureRegion
      pr = camera.projectionRegion

      # Setup camera resolution
      w = cr.width
      h = cr.height
      if @currentResolution.width isnt w or @currentResolution.height isnt h
        @currentResolution.width = w
        @currentResolution.height = h
        gl.uniform2f @currentProgram.locations.u_resolution, w, h if @currentProgram

      # Set camera position
      camera.wm ?= new Float32Array 9
      Helpers.MatrixCalculation.setTranslation(camera.wm, -cr.x, -cr.y)

      # Set camera projection viewport
      gl.viewport pr.x, pr.y, pr.width, pr.height
      rooms = [ engine.masterRoom, camera.room ]

      for room in rooms
        # Draw rooms
        @renderTree room, camera.wm
    return

  renderTree: (room, wm)->
    list = []

    @createRenderList list, room, wm
    @createMaskRenderList list, room, wm if engine.drawMasks
    @createBoundingBoxRenderList list, room, wm if engine.drawBoundingBoxes

    @processRenderList list
    return

  createRenderList: (list, object, wm)->
    return unless object.isVisible()

    # Create world matrix for object center
    object.wm ?= new Float32Array 9
    Helpers.MatrixCalculation.setLocalMatrix object.wm, object
    Helpers.MatrixCalculation.multiply object.wm, wm

    switch object.renderType
      when "sprite", "textblock"
        program = @programs.texture
        renderFunction = program.renderSprite
      when "line"
        program = @programs.color
        renderFunction = program.renderLine
      when "rectangle"
        program = @programs.color
        renderFunction = program.renderRectangle
      when "circle"
        program = @programs.color
        renderFunction = program.renderCircle
      else
        program = null

    list.push program, renderFunction, object if program

    if object.children
      @createRenderList list, child, object.wm for child in object.children
    return

  createMaskRenderList: (list, object, wm)->
    return unless object.isVisible()

    # Create world matrix for object center
    object.wm ?= new Float32Array 9
    Helpers.MatrixCalculation.setLocalMatrix object.wm, object
    Helpers.MatrixCalculation.multiply object.wm, wm

    switch object.renderType
      when "sprite"
        program = @programs.texture
        renderFunction = program.renderMask
      else
        program = null

    list.push program, renderFunction, object if program

    if object.children
      @createMaskRenderList list, child, object.wm for child in object.children
    return

  createBoundingBoxRenderList: (list, object, wm)->
    return unless object.isVisible()

    # Create world matrix for object center
    object.wm ?= new Float32Array 9
    Helpers.MatrixCalculation.setLocalMatrix object.wm, object
    Helpers.MatrixCalculation.multiply object.wm, wm

    switch object.renderType
      when "sprite"
        program = @programs.color
        renderFunction = program.renderBoundingBox
      else
        program = null

    list.push program, renderFunction, object if program

    if object.children
      @createBoundingBoxRenderList list, child, object.wm for child in object.children
    return

  processRenderList: (list)->
    gl = @gl
    i = 0
    while i < list.length
      program = list[i]
      renderFunction = list[i + 1]
      object = list[i + 2]

      wmWithOffset = Helpers.MatrixCalculation.getTranslation -object.offset.x, -object.offset.y
      Helpers.MatrixCalculation.multiply wmWithOffset, object.wm

      # Set object alpha (because alpha is used by ALL rendered objects)
      if @currentAlpha != object.opacity
        @currentAlpha = object.opacity
        gl.uniform1f @currentProgram.locations.u_alpha, object.opacity if @currentProgram

      @setProgram program
      renderFunction.call program, gl, object, wmWithOffset

      i += 3

    @currentProgram?.flushBuffers? gl
    return

module.exports:: = Object.create c::
module.exports::constructor = c

TextureShaderProgram = require './webgl/texture-shader-program'
ColorShaderProgram = require './webgl/color-shader-program'

Helpers =
  MatrixCalculation: require '../helpers/matrix-calculation'
