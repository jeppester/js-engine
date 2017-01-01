class Main
  constructor: ->
    engine.loader.hideOverlay => @onLoaded()

    @objectView = new Engine.Views.Container()
    @hudView = new Engine.Views.Container()
    engine.currentRoom.addChildren @objectView, @hudView

    @fpsCounter = new Engine.Views.TextBlock 'FPS: 0', 10, 10, 150, {color: '#FFF'}
    @objectCounter = new Engine.Views.TextBlock 'Objects: 0', 10, 30, 150, {color: '#FFF'}
    @hudView.addChildren @fpsCounter, @objectCounter

    engine.currentRoom.addLoop 'each20Frames', new Engine.CustomLoop(20)
    engine.currentRoom.loops.each20Frames.attachFunction @, @updateFPS
    engine.currentRoom.loops.eachFrame.attachFunction @, @controls

  onLoaded: ->
    @addObjects 4000

  updateFPS: ->
    @fpsCounter.set string: 'FPS: ' + engine.fps
    @objectCounter.set string: 'Objects: ' + @objectView.children.length

  addObjects: (count = 10)->
    for i in [0...count]
      sprite = new Engine.Views.GameObject(
        'rock'
        Math.random() * 600
        Math.random() * 400
        Math.random() * Math.PI * 2
        {speed: new Engine.Geometry.Vector(-5 + Math.random() * 10, -5 + Math.random() * 10)}
      )
      sprite.checkBounce = ->
        if @x < 0
          @x = 0;
          @speed.x = -@speed.x
        else if @x > 600
          @x = 600
          @speed.x = -@speed.x

        if @y < 0
          @y = 0
          @speed.y = -@speed.y
        else if @y > 400
          @y = 400;
          @speed.y = -@speed.y

      engine.currentRoom.loops.eachFrame.attachFunction sprite, sprite.checkBounce
      @objectView.addChildren sprite

  removeObjects: (count = 10)->
    objects = @objectView.getChildren()
    count = Math.min count, objects.length

    for i in [0...count]
      engine.purge objects.shift()

  controls: ->
    # Add objects when arrow up key is down
    @addObjects() if engine.keyboard.isDown Engine.Globals.KEY_UP

    # Remove objects when arrow down key is down
    @removeObjects() if engine.keyboard.isDown Engine.Globals.KEY_DOWN

# Start engine
new Engine
  # Main class
  mainClass: Main

  # Themes to load
  themes: ['example']

  # Container
  container: document.getElementById('container')

  # Container background-color
  backgroundColor: "#000"

  # Disable webgl using "canvas" search param
  disableWebGL: /canvas/.test window.location.search

  # Resolution of the game
  canvasResX: 600
  canvasResY: 400
