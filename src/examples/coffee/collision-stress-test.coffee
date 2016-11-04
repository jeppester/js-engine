class CollisionStressTest
  constructor: ->
    # Make a global reference to the game object
    engine.loader.hideOverlay => @onLoaded()

  onLoaded: ->
    @objectView = new Engine.Views.Container()
    @hudView = new Engine.Views.Container()
    engine.currentRoom.addChildren @objectView, @hudView

    @fpsCounter = new Engine.Views.TextBlock 'FPS: 0', 10, 10, 150, {color: '#FFF'}
    @objectCounter = new Engine.Views.TextBlock 'Objects: 0', 10, 30, 150, {color: '#FFF'}
    @collisionDisplay = new Engine.Views.TextBlock 'Collides: No', 10, 50, 150, {color: '#FFF'}
    global.collider = @collider = new Engine.Views.Collidable 'character', 300, 200

    @hudView.addChildren @collider, @fpsCounter, @objectCounter, @collisionDisplay

    engine.currentRoom.addLoop 'each20Frames', new Engine.CustomLoop(20)
    engine.currentRoom.loops.each20Frames.attachFunction @, @updateFPS
    engine.currentRoom.loops.eachFrame.attachFunction @, @controls
    engine.currentRoom.loops.eachFrame.attachFunction @, @checkCollision
    @addObjects 400

  checkCollision: ->
    if @collider.collidesWith @objectView.getChildren(), 1
      @collisionDisplay.set string: 'Collides: Yes'
    else
      @collisionDisplay.set string: 'Collides: No'

  updateFPS: ->
    @fpsCounter.set string: 'FPS: ' + engine.fps
    @objectCounter.set string: 'Objects: ' + @objectView.children.length

  addObjects: (count = 10)->
    for i in [0...count]
      sprite = new Engine.Views.GameObject(
        'rock'
        Math.random() * 600
        Math.random() * 400
      )
      @objectView.addChildren sprite

  removeObjects: (count = 10)->
    objects = @objectView.getChildren()
    count = Math.min count, objects.length

    for i in [0...count]
      engine.purge objects.shift()

  controls: ->
    # Add objects when arrow up key is down
    if engine.keyboard.isDown Engine.Globals.KEY_UP
      @addObjects()

    # Remove objects when arrow down key is down
    if engine.keyboard.isDown Engine.Globals.KEY_DOWN
      @removeObjects()

    # When clicking somewhere, move the collision object to that position
    pointers = engine.pointer.isPressed(Engine.Globals.MOUSE_TOUCH_ANY) || engine.pointer.isDown(Engine.Globals.MOUSE_TOUCH_ANY)
    if pointers
      @collider.x = pointers[0].x
      @collider.y = pointers[0].y

new Engine
  # Set game-class path (Look at this file to start programming your game)
  gameClass: CollisionStressTest

  # Set themes to load
  themes: ['example']

  # Set arena background-color
  backgroundColor: "#000"

  # Disable webgl using "canvas" search param
  disableWebGL: /canvas/.test window.location.search

  # Disable pause on blur (so that JavaScript profiling can be done easier)
  pauseOnBlur: false

  # Set resolution of the game
  canvasResX: 600
  canvasResY: 400
