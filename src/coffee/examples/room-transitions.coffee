class RoomTransitions
  constructor: ->
    # Add five objects to the engine's default room and change the name of the room
    engine.currentRoom.name = 'room1'
    engine.currentRoom.addChildren new JSEngine.Views.Rectangle(0, 0, 600, 400, '#F00')
    for i in [0...5]
      engine.currentRoom.addChildren new JSEngine.Views.Sprite('Character', 100 + Math.random() * 400, 100 + Math.random() * 200)

    # Create second room
    room = new JSEngine.Room 'room2'
    room.addChildren new JSEngine.Views.Rectangle(0, 0, 600, 400, '#0F0')
    for i in [0...5]
      room.addChildren new JSEngine.Views.Sprite('Rock', 100 + Math.random() * 400, 100 + Math.random() * 200)

    # Create third room
    room = new JSEngine.Room 'room3'
    room.addChildren new JSEngine.Views.Rectangle(0, 0, 600, 400, '#00F')
    for i in [0...10]
      room.addChildren new JSEngine.Views.Sprite('Folder.Star2', 100 + Math.random() * 400, 100 + Math.random() * 200)

    # Create fourth room
    room = new JSEngine.Room 'room4'
    room.addChildren new JSEngine.Views.Rectangle(0, 0, 600, 400, '#FFF')
    for i in [0...20]
      room.addChildren new JSEngine.Views.Sprite('Folder.Star3', 100 + Math.random() * 400, 100 + Math.random() * 200)

    # Hide loader overlay
    engine.loader.hideOverlay =>
      # Start keyboard listener (The listener is placed in the persistent master room)
      engine.masterRoom.loops.eachFrame.attachFunction @, @doKeyboardControl

  doKeyboardControl: ->
    if engine.keyboard.isPressed JSEngine.Globals.KEY_SPACE
      if engine.currentRoom.name == 'room1'
        engine.goToRoom 'room2', JSEngine.Globals.ROOM_TRANSITION_SLIDE_SLIDE, {duration: 1000, from: ['left', 'right', 'top', 'bottom'][Math.floor(Math.random() * 4)]}
      else if engine.currentRoom.name == 'room2'
        engine.goToRoom 'room3', JSEngine.Globals.ROOM_TRANSITION_SQUEEZE_SQUEEZE, {duration: 1000, from: ['left', 'right', 'top', 'bottom'][Math.floor(Math.random() * 4)]}
      else if engine.currentRoom.name == 'room3'
        engine.goToRoom 'room4', JSEngine.Globals.ROOM_TRANSITION_SLIDE_SQUEEZE, {duration: 1000, from: ['left', 'right', 'top', 'bottom'][Math.floor(Math.random() * 4)]}
      else
        engine.goToRoom 'room1', JSEngine.Globals.ROOM_TRANSITION_SQUEEZE_SLIDE, {duration: 1000, from: ['left', 'right', 'top', 'bottom'][Math.floor(Math.random() * 4)]}

new JSEngine
	# Set main class to load
	gameClass: RoomTransitions

	# Set themes to load
	themes: ['Example']

	# disableWebGL: true,

	# Set resolution of the game
	canvasResX: 600
	canvasResY: 400
