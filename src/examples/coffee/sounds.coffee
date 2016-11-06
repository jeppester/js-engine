class Main
  constructor: ->
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

# Start engine
new Engine
  # Main class
  gameClass: Main

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
