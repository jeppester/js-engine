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
      wmT = Helpers.MatrixCalculation.makeTranslation(-camera.captureRegion.x, -camera.captureRegion.y)
      if camera.captureRegion.width isnt 0 and camera.captureRegion.height isnt 0
        wmS = Helpers.MatrixCalculation.makeScale(camera.projectionRegion.width / camera.captureRegion.width, camera.projectionRegion.height / camera.captureRegion.height)
      else
        wmS = Helpers.MatrixCalculation.makeIdentity()
      wm = Helpers.MatrixCalculation.matrixMultiply(wmT, wmS)
      wm = Helpers.MatrixCalculation.matrixMultiply(wm, Helpers.MatrixCalculation.makeTranslation(camera.projectionRegion.x, camera.projectionRegion.y))

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
        @renderTree rooms[ii], wm
        ii++
      c.restore()
      i++
    return

  renderTree: (object, wm) ->
    localWm = Helpers.MatrixCalculation.matrixMultiplyArray([
      Helpers.MatrixCalculation.calculateLocalMatrix(object)
      wm
    ])
    return unless object.isVisible()
    if object.renderType isnt ""
      offset = Helpers.MatrixCalculation.matrixMultiply Helpers.MatrixCalculation.makeTranslation(-object.offset.x, -object.offset.y), localWm
      @context.setTransform offset[0], offset[1], offset[3], offset[4], offset[6], offset[7]
      @context.globalAlpha = object.opacity
    switch object.renderType
      when "textblock", "sprite"
        @renderSprite object
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
        @renderTree object.children[i], localWm
        i++
    return

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
    @context.drawImage object.bm, (object.clipWidth + object.bm.spacing) * object.imageNumber, 0, object.clipWidth, object.clipHeight, 0, 0, object.clipWidth, object.clipHeight
    return

  ###
  Draws a Circle object on the canvas (if added as a child of a View)
  @private
  @param {CanvasRenderingContext2D} c A canvas 2D context on which to draw the Circle
  @param {Math.Vector} drawOffset A vector defining the offset with which to draw the object
  ###
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

  ###
  Draws a Polygon object on the canvas (if added as a child of a View)
  @private
  @param {CanvasRenderingContext2D} c A canvas 2D context on which to draw the Polygon
  @param {Vector} drawOffset A vector defining the offset with which to draw the object
  ###
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

  ###
  Draws a Line object on the canvas (if added as a child of a View)
  @private
  @param {CanvasRenderingContext2D} c A canvas 2D context on which to draw the Line
  ###
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

  ###
  Draws a Rectangle object on the canvas (if added as a child of a View)
  @private
  @param {CanvasRenderingContext2D} c A canvas 2D context on which to draw the Rectangle
  @param {Vector} cameraOffset A vector defining the offset with which to draw the object
  ###
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

module.exports:: = Object.create c::
module.exports::constructor = c

Helpers =
  MatrixCalculation: require '../helpers/matrix-calculation'
