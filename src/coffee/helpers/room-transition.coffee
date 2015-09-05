module.exports = RoomTransitionHelper =
  slideOut: (camera, from, animOptions) ->
    switch from
      when "left"
        camera.projectionRegion.animate
          x: camera.projectionRegion.x + engine.canvasResX
        , animOptions
      when "right"
        camera.projectionRegion.animate
          x: camera.projectionRegion.x - engine.canvasResX
        , animOptions
      when "top"
        camera.projectionRegion.animate
          y: camera.projectionRegion.y + engine.canvasResY
        , animOptions
      when "bottom"
        camera.projectionRegion.animate
          y: camera.projectionRegion.y - engine.canvasResY
        , animOptions

  slideIn: (camera, from, animOptions) ->
    switch from
      when "left"
        camera.projectionRegion.x -= engine.canvasResX
        camera.projectionRegion.animate
          x: camera.projectionRegion.x + engine.canvasResX
        , animOptions
      when "right"
        camera.projectionRegion.x += engine.canvasResX
        camera.projectionRegion.animate
          x: camera.projectionRegion.x - engine.canvasResX
        , animOptions
      when "top"
        camera.projectionRegion.y -= engine.canvasResY
        camera.projectionRegion.animate
          y: camera.projectionRegion.y + engine.canvasResY
        , animOptions
      when "bottom"
        camera.projectionRegion.y += engine.canvasResY
        camera.projectionRegion.animate
          y: camera.projectionRegion.y - engine.canvasResY
        , animOptions

  squeezeOut: (camera, from, animOptions) ->
    switch from
      when "left"
        camera.projectionRegion.animate
          width: 0
          x: camera.projectionRegion.x + engine.canvasResX
        , animOptions
      when "right"
        camera.projectionRegion.animate
          width: 0
        , animOptions
      when "top"
        camera.projectionRegion.animate
          height: 0
          y: camera.projectionRegion.y + engine.canvasResY
        , animOptions
      when "bottom"
        camera.projectionRegion.animate
          height: 0
        , animOptions

  squeezeIn: (camera, from, animOptions) ->
    switch from
      when "left"
        oldWidth = camera.projectionRegion.width
        camera.projectionRegion.width = 0
        camera.projectionRegion.animate
          width: oldWidth
        , animOptions
      when "right"
        oldWidth = camera.projectionRegion.width
        camera.projectionRegion.width = 0
        camera.projectionRegion.x += engine.canvasResX
        camera.projectionRegion.animate
          x: camera.projectionRegion.x - engine.canvasResX
          width: oldWidth
        , animOptions
      when "top"
        oldHeight = camera.projectionRegion.height
        camera.projectionRegion.height = 0
        camera.projectionRegion.animate
          height: oldHeight
        , animOptions
      when "bottom"
        oldHeight = camera.projectionRegion.height
        camera.projectionRegion.height = 0
        camera.projectionRegion.y += engine.canvasResY
        camera.projectionRegion.animate
          y: camera.projectionRegion.y - engine.canvasResY
          height: oldHeight
        , animOptions

  ###
  Room transition global for entering a new room with no transition (this is default)

  @global
  @param {Room} oldRoom The room that is left
  @param {Room} newRoom The room that is entered
  ###
  roomTransitionNone: (oldRoom, newRoom, options, callback) ->
    i = 0
    while i < engine.cameras.length
      camera = engine.cameras[i]
      camera.room = newRoom if camera.room is oldRoom
      i++
    callback()

  ###
  Room transition global for entering a new room by sliding the current room to the left

  @global
  @param {Room} oldRoom The room that is left
  @param {Room} newRoom The room that is entered
  ###
  roomTransitionSlideSlide: (oldRoom, newRoom, options, callback) ->
    newCams = []
    oldRoom.pause()
    options = options or {}
    options.from = options.from or "right"
    animOptions =
      easing: options.easing or @EASING_QUAD_IN_OUT
      duration: options.duration or 2000
      loop: engine.masterRoom.loops.eachFrame

    i = 0
    while i < engine.cameras.length
      camera = engine.cameras[i]
      if camera.room is oldRoom
        @slideOut camera, options.from, animOptions
        newCam = new Camera(camera.captureRegion.copy(), camera.projectionRegion.copy(), newRoom)
        newCams.push newCam
      i++
    engine.cameras.push.apply engine.cameras, newCams
    for c in newCams
      @slideIn c, options.from, animOptions

    engine.masterRoom.loops.eachFrame.schedule oldRoom, (->
      @play()
      engine.cameras = engine.cameras.filter((camera) ->
        newCams.indexOf(camera) isnt -1
      )
      callback()
    ), animOptions.duration

  ###
  Room transition global for entering a new room by squeezing the old room out and sliding the new room in

  @global
  @param {Room} oldRoom The room that is left
  @param {Room} newRoom The room that is entered
  ###
  roomTransitionSqueezeSlide: (oldRoom, newRoom, options, callback) ->
    newCams = []
    oldRoom.pause()
    options = options or {}
    options.from = options.from or "right"
    animOptions =
      easing: options.easing or @EASING_QUAD_IN_OUT
      duration: options.duration or 2000
      loop: engine.masterRoom.loops.eachFrame

    i = 0
    while i < engine.cameras.length
      camera = engine.cameras[i]
      if camera.room is oldRoom
        @squeezeOut camera, options.from, animOptions
        newCam = new Camera(camera.captureRegion.copy(), camera.projectionRegion.copy(), newRoom)
        newCams.push newCam
      i++
    engine.cameras.push.apply engine.cameras, newCams
    for c in newCams
      @slideIn c, options.from, animOptions

    engine.masterRoom.loops.eachFrame.schedule oldRoom, (->
      @play()
      engine.cameras = engine.cameras.filter((camera) ->
        newCams.indexOf(camera) isnt -1
      )
      callback()
    ), animOptions.duration

  ###
  Room transition global for squeezing the old room out and squeezing the new room in

  @global
  @param {Room} oldRoom The room that is left
  @param {Room} newRoom The room that is entered
  ###
  roomTransitionSqueezeSqueeze: (oldRoom, newRoom, options, callback) ->
    newCams = []
    oldRoom.pause()
    options = options or {}
    options.from = options.from or "right"
    animOptions =
      easing: options.easing or @EASING_QUAD_IN_OUT
      duration: options.duration or 2000
      loop: engine.masterRoom.loops.eachFrame

    i = 0
    while i < engine.cameras.length
      camera = engine.cameras[i]
      if camera.room is oldRoom
        @squeezeOut camera, options.from, animOptions
        newCam = new Camera(camera.captureRegion.copy(), camera.projectionRegion.copy(), newRoom)
        newCams.push newCam
      i++
    engine.cameras.push.apply engine.cameras, newCams
    for c in newCams
      @squeezeIn c, options.from, animOptions

    engine.masterRoom.loops.eachFrame.schedule oldRoom, (->
      @play()
      engine.cameras = engine.cameras.filter((camera) ->
        newCams.indexOf(camera) isnt -1
      )
      callback()
    ), animOptions.duration

  ###
  Room transition global for sliding the old room out and squeezing the new room in

  @global
  @param {Room} oldRoom The room that is left
  @param {Room} newRoom The room that is entered
  ###
  roomTransitionSlideSqueeze: (oldRoom, newRoom, options, callback) ->
    newCams = []
    oldRoom.pause()
    options = options or {}
    options.from = options.from or "right"
    animOptions =
      easing: options.easing or @EASING_QUAD_IN_OUT
      duration: options.duration or 2000
      loop: engine.masterRoom.loops.eachFrame

    i = 0
    while i < engine.cameras.length
      camera = engine.cameras[i]
      if camera.room is oldRoom
        @slideOut camera, options.from, animOptions
        newCam = new Camera(camera.captureRegion.copy(), camera.projectionRegion.copy(), newRoom)
        newCams.push newCam
      i++
    engine.cameras.push.apply engine.cameras, newCams
    for c in newCams
      @squeezeIn c, options.from, animOptions

    engine.masterRoom.loops.eachFrame.schedule oldRoom, (->
      @play()
      engine.cameras = engine.cameras.filter((camera) ->
        newCams.indexOf(camera) isnt -1
      )
      callback()
    ), animOptions.duration

Camera = require '../engine/camera'
