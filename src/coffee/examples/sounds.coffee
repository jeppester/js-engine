class Main
  constructor: ->
    console.log 'yay!'
    window.text = engine.currentRoom.create.TextBlock(
      'PRESS SPACE TO PLAY A SOUND EFFECT'
      100
      140
      400
      color: '#4F4', alignment: 'center'
    )
    window.text = engine.currentRoom.create.TextBlock(
      'PRESS ENTER TO PLAY/STOP A MUSIC TRACK'
      100
      240
      400
      color: '#AAF', alignment: 'center'
    )
    engine.loader.hideOverlay()
    engine.currentRoom.loops.eachFrame.attachFunction @, @controls

  controls: ->
    # Add objects when arrow up key is down
    @playSound() if engine.keyboard.isPressed Engine.Globals.KEY_SPACE
    @toggleMusic() if engine.keyboard.isPressed Engine.Globals.KEY_ENTER

  playSound: ->
    switch Math.floor Math.random() * 2
      when 0 then engine.loader.getSound('donk').play()
      when 1 then engine.loader.getSound('donk2').play()

  toggleMusic: ->
    m = engine.loader.getMusic('space-music')
    if m.playing
      m.stop()
    else
      m.play()

new Engine
	# Set game-class path (Look at this file to start programming your game)
	gameClass: Main

	# Set themes to load
	themes: ['example']

	# Disable webgl (to compare performance)
	#disableWebGL: true

	# Set arena background-color
	backgroundColor: "#000"

	# Disable pause on blur (so that JavaScript profiling can be done easier)
	pauseOnBlur: false

	# Set resolution of the game
	canvasResX: 600
	canvasResY: 400
