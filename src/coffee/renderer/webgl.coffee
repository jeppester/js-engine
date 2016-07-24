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
        @renderRoom room, camera.wm
    return

  renderRoom: (room, wm)->
    list = room.renderList ?= []
    unless room.parent
      room.parent = new View.Child()
      room.parent.wm = new Float32Array [1, 0, 0, 0, 1, 0, 0, 0, 1]
      room.parent.changed = false

    @updateRenderList list, room, new Uint16Array [0]
    @processRenderList list
    return

  updateRenderList: (list, object, counter)->
    return unless object.isVisible()

    # Only update the list if necessary
    last = list[counter[0]]
    unless object == last
      if last == undefined
        list.push object
      else
        list.splice counter[0], list.length - counter[0], object
    counter[0] += 1

    if object.children
      for child in object.children
        @updateRenderList list, child, counter

  processRenderList: (list)->
    gl = @gl
    for object in list
      object.wm ?= new Float32Array 9

      Helpers.MatrixCalculation.setLocalMatrix object.wm, object
      Helpers.MatrixCalculation.multiply object.wm, object.parent.wm
      offset = Helpers.MatrixCalculation.getTranslation -object.offset.x, -object.offset.y
      Helpers.MatrixCalculation.reverseMultiply object.wm, offset

      # Set object alpha (because alpha is used by ALL rendered objects)
      if @currentAlpha != object.opacity
        @currentAlpha = object.opacity
        gl.uniform1f @currentProgram.locations.u_alpha, object.opacity if @currentProgram

      switch object.renderType
        when "sprite"
          program = @programs.texture
          @setProgram program
          program.renderSprite gl, object, object.wm
        when "textblock"
          program = @programs.texture
          @setProgram program
          program.renderTextBlock gl, object, object.wm
        when "line"
          program = @programs.color
          @setProgram program
          program.renderLine gl, object, object.wm
        when "rectangle"
          program = @programs.color
          @setProgram @programs.color
          program.renderRectangle gl, object, object.wm
        when "circle"
          program = @programs.color
          @setProgram program
          program.renderCircle gl, object, object.wm

    @currentProgram?.flushBuffers? gl
    return

module.exports:: = Object.create c::
module.exports::constructor = c

TextureShaderProgram = require './webgl/texture-shader-program'
ColorShaderProgram = require './webgl/color-shader-program'

Helpers =
  MatrixCalculation: require '../helpers/matrix-calculation'

View =
  Child: require '../views/child'
