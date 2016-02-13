module.exports = -> module.exports::constructor.apply @, arguments

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
    if @currentProgram isnt program
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

  render: (cameras) ->
    gl = @gl
    for camera in cameras
      # Setup camera resolution
      w = camera.captureRegion.width
      h = camera.captureRegion.height
      if @cache.currentResolution.width isnt w or @cache.currentResolution.height isnt h
        @cache.currentResolution.width = w
        @cache.currentResolution.height = h
        gl.uniform2f @currentProgram.locations.u_resolution, w, h if @currentProgram

      # Set camera position
      camera.wm ?= new Float32Array 9
      Helpers.MatrixCalculation.setTranslation(camera.wm, -camera.captureRegion.x, -camera.captureRegion.y)

      # Set camera projection viewport
      gl.viewport camera.projectionRegion.x, camera.projectionRegion.y, camera.projectionRegion.width, camera.projectionRegion.height
      rooms = [ engine.masterRoom, camera.room ]

      for room in rooms
        # Draw rooms
        @renderTree room, camera.wm
    return

  renderTree: (room, wm)->
    list = []
    @createRenderList list, room, wm
    @processRenderList list

  createRenderList: (list, object, wm)->
    return unless object.isVisible()

    # Create world matrix for object center
    object.wm ?= new Float32Array 9
    Helpers.MatrixCalculation.setLocalMatrix object.wm, object
    Helpers.MatrixCalculation.multiply object.wm, wm
    list.push object unless object.renderType == ''

    if object.children
      @createRenderList list, child, object.wm for child in object.children

  processRenderList: (list)->
    @renderObject(object, @gl, engine.drawMasks, engine.drawBoundingBoxes) for object in list

  renderObject: (object, gl, drawMasks, drawBoundingBoxes)->
    wmWithOffset = Helpers.MatrixCalculation.getTranslation -object.offset.x, -object.offset.y
    Helpers.MatrixCalculation.multiply wmWithOffset, object.wm

    # Set object alpha (because alpha is used by ALL rendered objects)
    if @cache.currentAlpha != object.opacity
      @cache.currentAlpha = object.opacity
      gl.uniform1f @currentProgram.locations.u_alpha, object.opacity if @currentProgram

    switch object.renderType
      # Texture based objects
      when "sprite"
        @setProgram @programs.texture
        @currentProgram.renderSprite gl, object, wmWithOffset
        @currentProgram.renderMask gl, object, wmWithOffset if drawMasks

        if drawBoundingBoxes
          @setProgram @programs.color
          @currentProgram.renderBoundingBox gl, object, wmWithOffset

      when "textblock"
        @setProgram @programs.texture
        @currentProgram.renderSprite gl, object, wmWithOffset

      # Geometric objects
      when "line"
        @setProgram @programs.color
        @currentProgram.renderLine gl, object, wmWithOffset
      when "rectangle"
        @setProgram @programs.color
        @currentProgram.renderRectangle gl, object, wmWithOffset
      when "circle"
        @setProgram @programs.color
        @currentProgram.renderCircle gl, object, wmWithOffset

module.exports:: = Object.create c::
module.exports::constructor = c

TextureShaderProgram = require './webgl/texture-shader-program'
ColorShaderProgram = require './webgl/color-shader-program'

Helpers =
  MatrixCalculation: require '../helpers/matrix-calculation'
