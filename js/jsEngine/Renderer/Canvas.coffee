nameSpace "Renderer"
Renderer.Canvas = (canvas) ->
  gl = undefined
  options = undefined
  @canvas = canvas
  @context = canvas.getContext("2d")
  return

Renderer.Canvas::import Mixin.MatrixCalculation
Renderer.Canvas::import ###*
@lends Renderer.Canvas.prototype
###
  render: (cameras) ->
    camerasLength = undefined
    roomsLength = undefined
    i = undefined
    ii = undefined
    wm = undefined
    wmT = undefined
    wmS = undefined
    c = undefined
    w = undefined
    h = undefined
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
      wmT = @makeTranslation(-camera.captureRegion.x, -camera.captureRegion.y)
      if camera.captureRegion.width isnt 0 and camera.captureRegion.height isnt 0
        wmS = @makeScale(camera.projectionRegion.width / camera.captureRegion.width, camera.projectionRegion.height / camera.captureRegion.height)
      else
        wmS = @makeIdentity()
      wm = @matrixMultiply(wmT, wmS)
      wm = @matrixMultiply(wm, @makeTranslation(camera.projectionRegion.x, camera.projectionRegion.y))
      
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
    i = undefined
    len = undefined
    child = undefined
    localWm = undefined
    offset = undefined
    localWm = @matrixMultiplyArray([
      @calculateLocalMatrix(object)
      wm
    ])
    return  unless object.isVisible()
    if object.renderType isnt ""
      offset = @matrixMultiply(@makeTranslation(-object.offset.x, -object.offset.y), localWm)
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
        else object.imageNumber = (if object.animationLoops then object.imageLength - 1 else 0)  if object.imageNumber is -1
    
    # Draw bm
    @context.drawImage object.bm, (object.clipWidth + object.bm.spacing) * object.imageNumber, 0, object.clipWidth, object.clipHeight, 0, 0, object.clipWidth, object.clipHeight
    return

  
  ###*
  Draws a Circle object on the canvas (if added as a child of a View)
  
  @private
  @param {CanvasRenderingContext2D} c A canvas 2D context on which to draw the Circle
  @param {Math.Vector} drawOffset A vector defining the offset with which to draw the object
  ###
  renderCircle: (object) ->
    c = undefined
    c = @context
    c.strokeStyle = object.strokeStyle
    c.fillStyle = object.fillStyle
    c.beginPath()
    c.arc 0, 0, object.radius, 0, Math.PI * 2, true
    c.lineWidth = object.lineWidth
    c.globalAlpha = object.opacity
    c.fill()
    c.stroke()
    return

  
  ###*
  Draws a Polygon object on the canvas (if added as a child of a View)
  
  @private
  @param {CanvasRenderingContext2D} c A canvas 2D context on which to draw the Polygon
  @param {Vector} drawOffset A vector defining the offset with which to draw the object
  ###
  renderPolygon: (object) ->
    c = undefined
    i = undefined
    len = undefined
    c = @context
    c.strokeStyle = object.strokeStyle
    c.fillStyle = object.fillStyle
    c.setLineDash object.lineDash  if object.lineDash isnt [] and c.setLineDash
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
      c.stroke()
    else
      c.fill()
      c.stroke()
      c.closePath()
    return

  
  ###*
  Draws a Line object on the canvas (if added as a child of a View)
  
  @private
  @param {CanvasRenderingContext2D} c A canvas 2D context on which to draw the Line
  ###
  renderLine: (object) ->
    c = undefined
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

  
  ###*
  Draws a Rectangle object on the canvas (if added as a child of a View)
  
  @private
  @param {CanvasRenderingContext2D} c A canvas 2D context on which to draw the Rectangle
  @param {Vector} cameraOffset A vector defining the offset with which to draw the object
  ###
  renderRectangle: (object) ->
    c = undefined
    c = @context
    c.strokeStyle = object.strokeStyle
    c.fillStyle = object.fillStyle
    c.beginPath()
    c.moveTo 0, 0
    c.lineTo object.width, 0
    c.lineTo object.width, object.height
    c.lineTo 0, object.height
    c.closePath()
    c.lineWidth = object.lineWidth
    c.fill()
    c.stroke()
    return

