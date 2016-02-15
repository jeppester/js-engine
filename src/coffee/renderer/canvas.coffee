module.exports = -> module.exports::constructor.apply @, arguments

c = class CanvasRenderer
  constructor: (@canvas) ->
    @context = @canvas.getContext("2d")
    return

  render: (cameras) ->
    camerasLength = cameras.length
    c = @context
    c.clearRect 0, 0, @canvas.width, @canvas.height
    i = 0
    while i < camerasLength
      camera = cameras[i]

      # Save/restore routine is needed for resetting the clip
      c.save()

      # Setup camera resolution
      w = camera.captureRegion.width
      h = camera.captureRegion.height

      # Set camera position
      camera.wm ?= new Float32Array 9
      Helpers.MatrixCalculation.setTranslation camera.wm, -camera.captureRegion.x, -camera.captureRegion.y
      if camera.captureRegion.width != 0 && camera.captureRegion.height != 0
        sx = camera.projectionRegion.width / camera.captureRegion.width
        sy = camera.projectionRegion.height / camera.captureRegion.height
        Helpers.MatrixCalculation.multiply camera.wm, Helpers.MatrixCalculation.getScale(sx, sy)

      Helpers.MatrixCalculation.multiply camera.wm, Helpers.MatrixCalculation.getTranslation(camera.projectionRegion.x, camera.projectionRegion.y)

      # Set camera projection viewport
      c.beginPath()
      c.moveTo camera.projectionRegion.x, camera.projectionRegion.y
      c.lineTo camera.projectionRegion.x + camera.projectionRegion.width, camera.projectionRegion.y
      c.lineTo camera.projectionRegion.x + camera.projectionRegion.width, camera.projectionRegion.y + camera.projectionRegion.height
      c.lineTo camera.projectionRegion.x, camera.projectionRegion.y + camera.projectionRegion.height
      c.closePath()
      c.clip()
      rooms = [
        engine.masterRoom
        camera.room
      ]
      roomsLength = rooms.length
      ii = 0
      while ii < roomsLength

        # Draw rooms
        @renderTree rooms[ii], camera.wm
        ii++
      c.restore()
      i++
    return

  renderTree: (object, wm) ->
    object.wm ?= new Float32Array 9
    Helpers.MatrixCalculation.setLocalMatrix object.wm, object
    Helpers.MatrixCalculation.multiply object.wm, wm

    return unless object.isVisible()
    if object.renderType != ""
      wmWithOffset = Helpers.MatrixCalculation.getTranslation -object.offset.x, -object.offset.y
      Helpers.MatrixCalculation.multiply wmWithOffset, object.wm
      @context.setTransform wmWithOffset[0], wmWithOffset[1], wmWithOffset[3], wmWithOffset[4], wmWithOffset[6], wmWithOffset[7]
      @context.globalAlpha = object.opacity

    switch object.renderType
      when "textblock"
        @renderSprite object
      when "sprite"
        @renderSprite object
        @renderMask object if engine.drawMasks
        @renderBoundingBox object if engine.drawBoundingBoxes
      when "circle"
        @renderCircle object
      when "line"
        @renderLine object
      when "rectangle"
        @renderRectangle object
      when "polygon"
        @renderPolygon object

    if object.children
      len = object.children.length
      i = 0
      while i < len
        @renderTree object.children[i], object.wm
        i++

  renderSprite: (object) ->
    # Set the right sub image
    if object.imageLength isnt 1 and object.animationSpeed isnt 0
      if engine.gameTime - object.animationLastSwitch > 1000 / object.animationSpeed
        object.imageNumber = object.imageNumber + ((if object.animationSpeed > 0 then 1 else -1))
        object.animationLastSwitch = engine.gameTime
        if object.imageNumber is object.imageLength
          object.imageNumber = (if object.animationLoops then 0 else object.imageLength - 1)
        else object.imageNumber = (if object.animationLoops then object.imageLength - 1 else 0) if object.imageNumber is -1

    # Draw bm
    @context.drawImage object.texture, (object.clipWidth + object.texture.spacing) * object.imageNumber, 0, object.clipWidth, object.clipHeight, 0, 0, object.clipWidth, object.clipHeight
    return

  renderCircle: (object) ->
    c = @context
    c.strokeStyle = object.strokeStyle
    c.fillStyle = object.fillStyle
    c.beginPath()
    c.arc 0, 0, object.radius, 0, Math.PI * 2, true
    c.globalAlpha = object.opacity
    c.fill()
    if object.lineWidth
      c.lineWidth = object.lineWidth
      c.stroke()
    return

  renderPolygon: (object) ->
    c = @context
    c.strokeStyle = object.strokeStyle
    c.fillStyle = object.fillStyle
    c.setLineDash object.lineDash if object.lineDash isnt [] and c.setLineDash
    c.beginPath()
    len = object.points.length
    i = 0
    while i < len
      c.lineTo object.points[i].x, object.points[i].y
      i++
    c.lineWidth = object.lineWidth
    c.globalAlpha = object.opacity
    if object.closed
      c.closePath()
      c.fill()
      c.stroke() if object.lineWidth
    else
      c.fill()
      c.stroke() if object.lineWidth
      c.closePath()
    return

  renderLine: (object) ->
    c = @context
    c.strokeStyle = object.strokeStyle
    c.globalAlpha = object.opacity
    c.beginPath()
    c.moveTo object.a.x, object.a.y
    c.lineTo object.b.x, object.b.y
    c.lineWidth = object.lineWidth
    c.lineCap = object.lineCap
    c.stroke()
    return

  renderRectangle: (object) ->
    c = @context
    c.strokeStyle = object.strokeStyle
    c.fillStyle = object.fillStyle
    c.beginPath()
    c.moveTo 0, 0
    c.lineTo object.width, 0
    c.lineTo object.width, object.height
    c.lineTo 0, object.height
    c.closePath()
    c.fill()
    if object.lineWidth
      c.lineWidth = object.lineWidth
      c.stroke()
    return

  renderMask: (object)->
    mask = engine.loader.getMask object.source, object.getTheme()

    # Set the right sub image
    if object.imageLength isnt 1 and object.animationSpeed isnt 0
      if engine.gameTime - object.animationLastSwitch > 1000 / object.animationSpeed
        object.imageNumber = object.imageNumber + ((if object.animationSpeed > 0 then 1 else -1))
        object.animationLastSwitch = engine.gameTime
        if object.imageNumber is object.imageLength
          object.imageNumber = (if object.animationLoops then 0 else object.imageLength - 1)
        else object.imageNumber = (if object.animationLoops then object.imageLength - 1 else 0) if object.imageNumber is -1

    # Draw bm
    @context.drawImage mask, (object.clipWidth + object.texture.spacing) * object.imageNumber, 0, object.clipWidth, object.clipHeight, 0, 0, object.clipWidth, object.clipHeight

  renderBoundingBox: (object)->
    mask = engine.loader.getMask object.source, object.getTheme()
    box = mask.boundingBox

    c = @context
    c.strokeStyle = '#0F0'
    c.setLineDash []
    c.beginPath()

    for point in box.points
      c.lineTo point.x, point.y

    c.lineWidth = 1
    c.globalAlpha = 1
    c.closePath()
    c.stroke()

module.exports:: = Object.create c::
module.exports::constructor = c

Helpers =
  MatrixCalculation: require '../helpers/matrix-calculation'
