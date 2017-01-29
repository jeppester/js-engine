class Main
  constructor: (@engine)->
    # Add five objects to the engine's default room and change the name of the room
    @engine.currentRoom.name = 'room1'
    @engine.currentRoom.addChildren new Engine.Views.Rectangle(0, 0, 600, 400, '#F00')
    for i in [0...5]
      @engine.currentRoom.addChildren new Engine.Views.Sprite('character', 100 + Math.random() * 400, 100 + Math.random() * 200)
    window.engine = @engine

    # Create second room
    room = new Engine.Room 'room2'
    @engine.addRoom(room)
    room.addChildren new Engine.Views.Rectangle(0, 0, 600, 400, '#0F0')
    for i in [0...5]
      room.addChildren new Engine.Views.Sprite('rock', 100 + Math.random() * 400, 100 + Math.random() * 200)

    # Create third room
    room = new Engine.Room 'room3'
    @engine.addRoom(room)
    room.addChildren new Engine.Views.Rectangle(0, 0, 600, 400, '#00F')
    for i in [0...10]
      room.addChildren new Engine.Views.Sprite('folder/star2', 100 + Math.random() * 400, 100 + Math.random() * 200)

    # Create fourth room
    room = new Engine.Room 'room4'
    @engine.addRoom(room)
    room.addChildren new Engine.Views.Rectangle(0, 0, 600, 400, '#FFF')
    for i in [0...20]
      room.addChildren new Engine.Views.Sprite('folder/star3', 100 + Math.random() * 400, 100 + Math.random() * 200)

    # Hide loader overlay
    @engine.loader.hideOverlay =>
      # Start keyboard listener (The listener is placed in the persistent master room)
      @engine.masterRoom.loops.eachFrame.attachFunction @, @doKeyboardControl

  doKeyboardControl: ->
    if @engine.keyboard.isPressed Engine.Globals.KEY_SPACE
      if @engine.currentRoom.name == 'room1'
        @engine.goToRoom 'room2', Engine.Globals.ROOM_TRANSITION_SLIDE_SLIDE, {duration: 1000, from: ['left', 'right', 'top', 'bottom'][Math.floor(Math.random() * 4)]}
      else if @engine.currentRoom.name == 'room2'
        @engine.goToRoom 'room3', Engine.Globals.ROOM_TRANSITION_SQUEEZE_SQUEEZE, {duration: 1000, from: ['left', 'right', 'top', 'bottom'][Math.floor(Math.random() * 4)]}
      else if @engine.currentRoom.name == 'room3'
        @engine.goToRoom 'room4', Engine.Globals.ROOM_TRANSITION_SLIDE_SQUEEZE, {duration: 1000, from: ['left', 'right', 'top', 'bottom'][Math.floor(Math.random() * 4)]}
      else
        @engine.goToRoom 'room1', Engine.Globals.ROOM_TRANSITION_SQUEEZE_SLIDE, {duration: 1000, from: ['left', 'right', 'top', 'bottom'][Math.floor(Math.random() * 4)]}

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
