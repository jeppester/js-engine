###
The constructor for the Engine class.

@constructor
@name Engine
@class The main game engine class.
Responsible for the main loop, the main canvas, etc.

@property {boolean} running Whether or not the engine is currently running
@property {int} canvasResX The main canvas horizontal resolution
@property {int} canvasResY The main canvas vertical resolution
@property {string} enginePath The url to jsEngine's source folder
@property {boolean} focusOnLoad If the engine should focus itself when loaded
@property {string} themesPath The url to jsEngine's theme folder
@property {boolean} drawBoundingBoxes Whether or not the bounding boxes of all collidable objects are drawn
@property {boolean} drawMasks Whether or not the masks of all collidable objects are drawn
@property {boolean} pauseOnBlur Whether or the engine will pause itself when the window is blurred
@property {boolean} disableRightClick Whether or not right click context menu is disabled inside the main canvas
@property {boolean} preventDefaultKeyboard Whether or not preventDefault is called for keyboard events
@property {HTMLElement} arena The HTML element to use as parent to the main canvas
@property {boolean} autoResize Whether or not the arena will autoresize itself to fit the window
@property {boolean} autoResizeLimitToResolution Whether or not the arena should not autoresize itself to be bigger than the main canvas' resolution
@property {int} cachedSoundCopies The number of copies each sound object caches of it's source to enable multiple playbacks
@property {string} loadText The text shown while loading the engine
@property {string} backgroundColor A CSS color string which is used as the background color of the main canvas
@property {number} timeFactor The factor to multiply the time increase with. A factor of 2 will make everything happen with double speed
@property {boolean} resetCursorOnEachFrame Whether or not the mouse cursor will be reset on each frame
@property {boolean} disableTouchScroll Whether or not touch scroll has been disabled
@property {Camera[]} cameras An array containing the engine's cameras
@property {int} defaultCollisionResolution The collision resolution set for all created collidable objects
@property {boolean} soundsMuted Whether or not all sound effects are currently muted
@property {boolean} musicMuted Whether or not all music is currently muted

@param {object} options An object containing key-value pairs that will be used as launch options for the engine.
The default options are:
<code>{
"arena": document.getElementById('arena'), // The element to use as game arena
"avoidSubPixelRendering": true, // If subpixelrendering should be avoided
"autoResize": true, // If the arena should autoresize to fit the window (or iframe)
"autoResizeLimitToResolution": true, // If the autoresizing should be limited to the game's resolution
"backgroundColor": "#000", // The color of the arena's background
"cachedSoundCopies": 5, // How many times sounds should be duplicated to allow multiple playbacks
"canvasResX": 800, // The horizontal resolution to set for the game's main canvas
"canvasResY": 600, // The vertical resolution to set for the game's main canvas
"defaultCollisionResolution": 6, // Res. of collision checking, by default every 6th px is checked
"disableRightClick": true, // If right clicks inside the arena should be disabled
"disableWebGL": false, // If WebGL rendering should be disabled
"preventDefaultKeyboard": false, // Whether or not preventDefault should be called for keyboard events
"disableTouchScroll": true, // If touch scroll on tablets and phones should be disable
"drawBoundingBoxes": false, // If Collidable object's bounding boxes should be drawn
"drawMasks": false, // If Collidable object's masks should be drawn
"enginePath": "js/jsEngine", // The path for the engine classes' directory
"focusOnLoad": true, // Whether or not to focus the engine's window when the engine is ready
"loadText": 'jsEngine loading...'
"musicMuted": false, // If all music playback should be initially muted
"pauseOnBlur": true, // If the engine should pause when the browser window loses its focus
"resetCursorOnEachFrame": true // Whether or not the mouse cursor should be reset on each frame
"soundsMuted": false, // If all sound effects should be initially muted
"themesPath": "themes", // The path to the themes-directory
"enableRedrawRegions": false, // Whether the engine should use redraw regions for drawing or not
}</code>
###
class Engine
  constructor: (options) ->
    # Set global engine variable
    ###
    Global engine var set upon engine initialization
    @global
    ###
    window.engine = this
    @options = options || {}
    @load()
    return

  ###
  Load all files and functions, that are needed before the engine can start.
  @private
  ###
  load: ->

    # Define all used vars
    copyOpt = undefined
    audioFormats = undefined
    i = undefined
    opt = undefined

    # Detect host information
    @host =
      hasTouch: "ontouchstart" of document
      hasMouse: false
      browserEngine: "Unknown"
      device: "Unknown"
      supportedAudio: []

    if navigator.userAgent.match(/Firefox/)
      @host.browserEngine = "Gecko"
    else if navigator.userAgent.match(/AppleWebKit/)
      @host.browserEngine = "WebKit"
      if navigator.userAgent.match(/iPad|iPhone/)
        @host.device = "iDevice"
      else @host.device = "Android"  if navigator.userAgent.match(/Android/)
    else @host.browserEngine = "Trident"  if navigator.userAgent.match(/Trident/)
    audioFormats = [
      "mp3"
      "ogg"
      "wav"
    ]
    i = 0
    while i < audioFormats.length
      @host.supportedAudio.push audioFormats[i]  if document.createElement("audio").canPlayType("audio/" + audioFormats[i])
      i++

    # Load default options
    # Optimize default options for each browser
    @avoidSubPixelRendering = true
    @preloadSounds = true
    switch @host.device
      when "iDevice"
        # iDevices cannot preload sounds (which is utter crap), so disable preloading to make the engine load without sounds
        @preloadSounds = false
    @running = false
    @canvasResX = 800
    @canvasResY = 600
    @enginePath = "js/jsEngine"
    @focusOnLoad = true
    @themesPath = "assets"
    @drawBoundingBoxes = false
    @drawMasks = false
    @pauseOnBlur = true
    @disableRightClick = true
    @preventDefaultKeyboard = false
    @arena = document.getElementById("arena")
    @autoResize = true
    @autoResizeLimitToResolution = true
    @cachedSoundCopies = 5
    @loadText = "jsEngine loading..."
    @backgroundColor = "#000"
    @timeFactor = 1
    @disableTouchScroll = true
    @resetCursorOnEachFrame = true
    @cameras = []
    @defaultCollisionResolution = 6
    @redrawObjects = []
    @enableRedrawRegions = false
    @disableWebGL = false
    @soundsMuted = false
    @musicMuted = false

    # Copy options to engine (except those which are only used for engine initialization)
    copyOpt = [
      "arena"
      "autoResize"
      "autoResizeLimitToResolution"
      "avoidSubPixelRendering"
      "backgroundColor"
      "cachedSoundCopies"
      "canvasResX"
      "canvasResY"
      "defaultCollisionResolution"
      "disableWebGL"
      "disableRightClick"
      "disableTouchScroll"
      "drawBoundingBoxes"
      "drawMasks"
      "enableRedrawRegions"
      "enginePath"
      "focusOnLoad"
      "gameClass"
      "loadText"
      "musicMuted"
      "pauseOnBlur"
      "preventDefaultKeyboard"
      "resetCursorOnEachFrame"
      "soundsMuted"
      "themesPath"
    ]
    i = 0
    while i < copyOpt.length
      opt = copyOpt[i]
      if @options[opt] isnt undefined
        this[opt] = @options[opt]
        delete @options[opt]
      i++

    # Check if options are valid
    throw new Error('Game class missing') unless @gameClass

    # Set style for arena
    @arena.style.position = "absolute"
    @arena.style.backgroundColor = "#000"
    @arena.style.userSelect = "none"
    @arena.style.webkitUserSelect = "none"
    @arena.style.MozUserSelect = "none"
    @createCanvas()
    @initRenderer()

    # If autoresize is set to true, set up autoresize
    if @autoResize
      @autoResize = false
      @setAutoResize true
    else
      @autoResize = true
      @setAutoResize false

    # If disableTouchScroll is set to true, disable touch scroll
    if @disableTouchScroll
      document.addEventListener "touchmove", ((event) ->
        event.preventDefault()
        return
      ), false
      document.addEventListener "touchstart", ((event) ->
        event.preventDefault()
        return
      ), false

    # Create loader object
    ###
    Global Engine.Loader instance which is created upon engine initialization
    @global
    ###
    @loader = new Engine.Loader()

    # Load themes
    @defaultTheme = @options.themes[0]
    @loader.onthemesloaded = ->
      engine.initialize()
      return

    @loader.loadThemes @options.themes
    return

  ###
  Starts the engine

  @private
  ###
  initialize: ->
    objectName = undefined

    # Make array for containing references to all game objects
    @objectIndex = {}

    # Set variables required by the engine
    @frames = 0
    @last = new Date().getTime()
    @now = @last
    @gameTime = 0
    @currentId = 0
    @fps = 0
    @fpsCounter = 0
    @drawTime = 0
    @drawTimeCounter = 0
    @drawCalls = 0

    # Create a room list (All rooms will add themselves to this list)
    @roomList = []

    # Create master room
    @masterRoom = new Engine.Room("master")

    # Make main room
    @currentRoom = new Engine.Room("main")

    # Set default custom loops
    @defaultAnimationLoop = @currentRoom.loops.eachFrame
    @defaultActivityLoop = @currentRoom.loops.eachFrame

    # Make main camera
    @cameras.push new Engine.Camera(new Math.Rectangle(0, 0, @canvasResX, @canvasResY), new Math.Rectangle(0, 0, @canvasResX, @canvasResY))

    # Disable right click inside arena
    if @disableRightClick
      @arena.oncontextmenu = ->
        false

    # Create objects required by the engine
    ###
    Global instance of Input.Keyboard which is created upon engine initialization
    @global
    ###
    @keyboard = new Input.Keyboard()

    ###
    Global instance of Input.Pointer which is created upon engine initialization
    @global
    ###
    @pointer = new Input.Pointer()

    # Set listeners for pausing the engine when the window looses focus (if pauseOnBlur is true)
    if @pauseOnBlur
      window.addEventListener "blur", ->
        engine.stopMainLoop()
        return

      window.addEventListener "focus", ->
        engine.startMainLoop()
        return

    # Create game object
    new @gameClass()
    @startMainLoop()
    window.focus()  if @focusOnLoad
    @onload()  if @onload
    console.log "jsEngine started" #dev
    return

  ###
  Creates and prepares the game canvas for being used
  ###
  createCanvas: ->
    gl = undefined

    # Make main canvas
    @canvas = document.createElement("canvas")
    @canvas.style.display = "block"
    @canvas.width = @canvasResX
    @canvas.height = @canvasResY
    @arena.appendChild @canvas
    return

  initRenderer: ->
    if not @disableWebGL and (@canvas.getContext("webgl") or @canvas.getContext("experimental-webgl"))
      @renderer = new Renderer.WebGL(@canvas)
    else
      @renderer = new Renderer.Canvas(@canvas)
    return

  ###
  Enables or disables canvas autoresize.

  @param {boolean} enable Decides whether autoresize should be enabled or disabled
  ###
  setAutoResize: (enable) ->
    if enable and not @autoResize
      @autoResize = true
      @autoResizeCanvas()
      window.addEventListener "resize", engine.autoResizeCanvas, false
      window.addEventListener "load", engine.autoResizeCanvas, false
    else if not enable and @autoResize
      @autoResize = false
      window.removeEventListener "resize", engine.autoResizeCanvas, false
      window.removeEventListener "load", engine.autoResizeCanvas, false

      # Reset canvas size
      @arena.style.top = "50%"
      @arena.style.left = "50%"
      @arena.style.marginLeft = -@canvasResX / 2 + "px"
      @arena.style.marginTop = -@canvasResY / 2 + "px"
      @canvas.style.width = @canvasResX + "px"
      @canvas.style.height = @canvasResY + "px"
    return

  ###
  Function for resizing the canvas. Not used if engine option "autoResizeCanvas" is false.

  @private
  ###
  autoResizeCanvas: ->
    if this isnt engine
      engine.autoResizeCanvas()
      return
    h = undefined
    w = undefined
    windowWH = undefined
    gameWH = undefined

    # Check if the window is wider og higher than the game's canvas
    windowWH = window.innerWidth / window.innerHeight
    gameWH = @canvasResX / @canvasResY
    if windowWH > gameWH
      h = window.innerHeight
      w = @canvasResX / @canvasResY * h
    else
      w = window.innerWidth
      h = @canvasResY / @canvasResX * w
    if @autoResizeLimitToResolution
      w = Math.min(w, @canvasResX)
      h = Math.min(h, @canvasResY)
    @arena.style.top = "50%"
    @arena.style.left = "50%"
    @arena.style.marginTop = -h / 2 + "px"
    @arena.style.marginLeft = -w / 2 + "px"
    @canvas.style.height = h + "px"
    @canvas.style.width = w + "px"
    return

  ###
  Function for converting between speed units

  @param {number} speed The value to convert
  @param {number} from The unit to convert from. Can be SPEED_PIXELS_PER_SECOND or SPEED_PIXELS_PER_FRAME
  @param {number} to The unit to convert to. Can be SPEED_PIXELS_PER_SECOND or SPEED_PIXELS_PER_FRAME
  @return {number} The resulting value of the conversion
  ###
  convertSpeed: (speed, from, to) ->
    throw new Error("Missing argument: speed")  if speed is undefined #dev
    return new Math.Vector(@convertSpeed(speed.x, from, to), @convertSpeed(speed.y, from, to))  if speed instanceof Math.Vector
    from = (if from isnt undefined then from else SPEED_PIXELS_PER_SECOND)
    to = (if to isnt undefined then to else SPEED_PIXELS_PER_FRAME)

    # Convert all formats to pixels per frame
    switch from
      when SPEED_PIXELS_PER_SECOND
        speed = speed * @gameTimeIncrease / 1000
      # Convert pixels per frame to the output format
      when SPEED_PIXELS_PER_FRAME
        speed

    switch to
      when SPEED_PIXELS_PER_SECOND
        speed = speed / @gameTimeIncrease * 1000
      when SPEED_PIXELS_PER_FRAME
        speed

  ###
  Leaves the current room and opens another room

  @param {Room|string} room A pointer to the desired room, or a string representing the name of the room
  @param {number} transition A room transition constant or function
  ###
  goToRoom: (room, transition, transitionOptions) ->
    return false if @changingRoom
    throw new Error("Missing argument: room")  if room is undefined #dev

    # If a string has been specified, find the room by name
    if typeof room is "string"
      room = @roomList.filter((r) ->
        r.name is room
      )[0]
      throw new Error("Could not find a room with the specified name")  unless room #dev

    # Else, check if the room exists on the room list, and if not, throw an error
    else
      throw new Error("Room is not on room list, has it been removed?")  if @roomList.indexOf(room) is -1 #dev
    transition = (if transition then transition else ROOM_TRANSITION_NONE)
    oldRoom = @currentRoom
    engine.changingRoom = true
    transition oldRoom, room, transitionOptions, ->
      engine.changingRoom = false
      engine.currentRoom = room
      return

    oldRoom

  ###
  Adds a room to the room list. This function is automatically called by the Room class' constructor.

  @private
  @param {Room} room The room which should be added
  ###
  addRoom: (room) ->
    throw new Error("Missing argument: room")  if room is undefined #dev
    #dev
    throw new Error("Room is already on room list, rooms are automatically added upon instantiation")  if @roomList.indexOf(room) isnt -1 #dev
    #dev
    @roomList.push room
    return

  ###
  Removes a room from the room list.

  @param {Room|string} room A pointer to the room, or a string representing the name of the room, which should be removed
  ###
  removeRoom: (room) ->
    throw new Error("Missing argument: room")  if room is undefined #dev
    index = undefined

    # If a string has been specified, find the room by name
    if typeof room is "string"
      room = @roomList.getElementByPropertyValue("name", room)
      throw new Error("Could not find a room with the specified name")  unless room #dev

    # Else, check if the room exists on the room list, and if not, throw an error
    index = @roomList.indexOf(room)
    throw new Error("Room is not on room list, has it been removed?")  if index is -1 #dev

    # Make sure we are not removing the current room, or the master room
    if room is @masterRoom
      throw new Error("Cannot remove master room") #dev
    else throw new Error("Cannot remove current room, remember to leave the room first, by entering another room (use engine.goToRoom)")  if room is @currentRoom #dev
    @roomList.splice i, 1
    return

  ###
  Toggles if all sound effects should be muted.

  @param {boolean} muted Whether or not the sound effects should be muted
  ###
  setSoundsMuted: (muted) ->
    muted = (if muted isnt undefined then muted else true)

    # If muting, check all sounds whether they are being played, if so stop the playback
    if muted
      loader.getAllSounds().forEach (s) ->
        s.stopAll()
        return

    @soundsMuted = muted
    return

  ###
  Toggles if all music should be muted.

  @param {boolean} muted Whether of not the music should be muted
  ###
  setMusicMuted: (muted) ->
    muted = (if muted isnt undefined then muted else true)

    # If muting, check all sounds whether they are being played, if so stop the playback
    if muted
      loader.getAllMusic().forEach (m) ->
        m.stop()
        return

    @musicMuted = muted
    return

  ###
  Sets the default theme for the engine objects

  @param {string} themeName A string representing the name of the theme
  @param {boolean} enforce Whether or not the enforce the theme on objects for which another theme has already been set
  ###
  setDefaultTheme: (themeName, enforce) ->
    throw new Error("Missing argument: themeName")  if themeName is undefined #dev
    throw new Error("Trying to set nonexistent theme: " + themeName)  if loader.themes[themeName] is undefined #dev
    enforce = (if enforce isnt undefined then enforce else false)
    @defaultTheme = themeName
    @currentRoom.setTheme undefined, enforce
    return

  ###
  Starts the engine's main loop
  ###
  startMainLoop: ->
    return  if @running

    # Restart the now - last cycle
    @now = new Date().getTime()
    @running = true

    # Start mainLoop
    engine.mainLoop()
    return

  ###
  Stops the engine's main loop
  ###
  stopMainLoop: ->
    return  unless @running
    @running = false
    return

  ###
  The engine's main loop function (should not be called manually)

  @private
  ###
  mainLoop: ->
    return  unless @running
    drawTime = undefined

    # Get the current time (for calculating movement based on the precise time change)
    @last = @now
    @now = new Date().getTime()
    @timeIncrease = @now - @last
    @gameTimeIncrease = @timeIncrease * @timeFactor

    # Update the game time and frames
    @gameTime += @gameTimeIncrease
    @frames++

    # Reset mouse cursor (if told to)
    @pointer.resetCursor()  if @resetCursorOnEachFrame

    # Execute loops
    @masterRoom.update()
    @currentRoom.update()

    # Draw game objects
    @drawCalls = 0 #dev
    drawTime = new Date().getTime() #dev
    @renderer.render @cameras
    drawTime = new Date().getTime() - drawTime #dev

    # Count frames per second and calculate mean redraw time
    if @fpsMsCounter < 1000 #dev
      @fpsCounter++ #dev
      @drawTimeCounter += drawTime #dev
      @fpsMsCounter += @timeIncrease #dev
    else #dev
      @fps = @fpsCounter #dev
      @drawTime = @drawTimeCounter / @fpsCounter #dev
      @fpsCounter = 0 #dev
      @drawTimeCounter = 0 #dev
      @fpsMsCounter = 0 #dev

    # Schedule the loop to run again
    requestAnimationFrame (time) ->
      engine.mainLoop time
      return

    return

  ###
  Sets the horizontal resolution of the main canvas

  @param {number} res The new horizontal resolution
  ###
  setCanvasResX: (res) ->
    @canvas.width = res
    @canvasResX = res
    @autoResizeCanvas()  if @autoResize
    return

  ###
  Sets the vertical resolution of the main canvas

  @param {number} res The new vertical resolution
  ###
  setCanvasResY: (res) ->
    @canvas.height = res
    @canvasResY = res
    @autoResizeCanvas()  if @autoResize
    return

  ###
  Registers an object to the engine. This will give the object an id which can be used for accessing it at a later time.
  Sprites, TextBlock and objects inheriting those objects, are automatically registered when created.

  @param {Object} obj The object to register in the engine
  @param {string} id A string with the desired id
  @return {string} The registered id
  ###
  registerObject: (obj, id) ->
    throw new Error("Missing argument: obj")  if obj is undefined #dev
    if id is undefined
      @currentId++
      id = "obj" + (@currentId - 1)
    #dev
    else throw new Error("Object id already taken: " + id)  if @objectIndex[id] isnt undefined #dev
    #dev
    @objectIndex[id] = obj
    obj.id = id
    id

  loadFileContent: (filePath) ->
    req = new XMLHttpRequest()
    req.open "GET", filePath, false
    req.send()
    req.responseText

  ###
  Loads and executes one or multiple JavaScript file synchronously

  @param {string|string[]} filePaths A file path (string), or an array of file paths to load and execute as JavaScript
  ###
  loadFiles: (filePaths) ->
    i = undefined
    req = undefined
    script = undefined
    filePaths = [filePaths]  if typeof filePaths is "string"

    # Load first file
    i = 0
    while i < filePaths.length
      req = new XMLHttpRequest()
      req.open "GET", filePaths[i], false
      req.send()
      script = document.createElement("script")
      script.type = "text/javascript"
      script.text = req.responseText + "\n//# sourceURL=/" + filePaths[i]
      document.body.appendChild script
      i++
    window.loadedFiles = []  if window.loadedFiles is undefined
    window.loadedFiles = window.loadedFiles.concat(filePaths)
    return

  ###
  Uses an http request to fetch the data from a file and runs a callback function with the file data as first parameter

  @param {string} url A URL path for the file to load
  @param {string|Object} params A parameter string or an object to JSON-stringify and use as URL parameter (will be send as "data=[JSON String]")
  @param {boolean} async Whether or not the request should be synchronous.
  @param {function} callback A callback function to run when the request has finished
  @param {object} caller An object to call the callback function as.
  ###
  ajaxRequest: (url, params, async, callback, caller) ->
    throw new Error("Missing argument: url")  if url is undefined #dev
    throw new Error("Missing argument: callback")  if callback is undefined #dev
    params = (if params isnt undefined then params else "")
    async = (if async isnt undefined then async else true)
    caller = (if caller isnt undefined then caller else window)

    # If params is not a string, json-stringify it
    params = "data=" + JSON.stringify(params)  if typeof params isnt "string"
    req = undefined
    req = new XMLHttpRequest()
    if async
      req.onreadystatechange = ->
        callback.call caller, req.responseText  if req.readyState is 4 and req.status is 200
        return
    req.open "POST", url, async
    req.setRequestHeader "Content-type", "application/x-www-form-urlencoded"
    req.send params
    unless async
      if req.readyState is 4 and req.status is 200 #dev
        callback.call caller, req.responseText #dev
      else #dev
        throw new Error("XMLHttpRequest failed: " + url) #dev
    return

  ###
  Removes an object from all engine loops, views, and from the object index

  param {Object} obj The object to remove
  ###
  purge: (obj) ->
    len = undefined
    name = undefined
    loop_ = undefined
    roomId = undefined
    room = undefined
    throw new Error("Cannot purge object: " + obj)  if obj is undefined #dev
    obj = @objectIndex[obj]  if typeof obj is "string"

    # Purge ALL children
    if obj.children
      len = obj.children.length
      engine.purge obj.children[len]  while len--

    # Delete all references from rooms and their loops
    roomId = 0
    while roomId < @roomList.length
      room = @roomList[roomId]
      for name of room.loops
        if room.loops.hasOwnProperty(name)
          loop_ = room.loops[name]
          loop_.detachFunctionsByCaller obj
          loop_.unscheduleByCaller obj
          loop_.removeAnimationsOfObject obj
      roomId++

    # Delete from viewlist
    obj.parent.removeChildren obj  if obj.parent

    # Delete from object index
    delete @objectIndex[obj.id]

    return

  ###
  Downloads a screen dump of the main canvas. Very usable for creating game screenshots directly from browser consoles.
  ###
  dumpScreen: ->
    dataString = undefined
    a = undefined
    dataString = @canvas.toDataURL().replace(/image\/png/, "image/octet-stream")
    a = document.createElement("a")
    a.href = dataString
    a.setAttribute "download", "screendump.png"
    document.body.appendChild a
    a.click()
    document.body.removeChild a, document.body
    return
