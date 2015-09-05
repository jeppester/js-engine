module.exports = -> c.apply @, arguments

###
Constructor for the sound class

@name Sound.Effect
@class A wrapper-class for audio-elements. A Sound object stores multiple copies of the same sound to enable multiple simultaneous playbacks, and provides functions for controlling (start, stop) each playback.

@property {HTMLAudioElement} source The audio element which is used as the source of the music object

@param {HTMLAudioElement} audioElement The Audio element to use as source for the sound object
###
c = class Effect
  constructor: (audioElement) ->
    throw new Error("Missing argument: audioElement") if audioElement is undefined #dev
    throw new Error("Argument audioElement has to be of type HTMLAudioElement") if audioElement.toString() isnt "[object HTMLAudioElement]" #dev
    @source = audioElement
    @playbackId = 0

    # When ready for playback, prepare copies of the element, to be used for simultaneous playback
    @elements = []
    @source.addEventListener "canplaythrough", =>
      @cacheCopies()
      return
    , false
    return

  ###
  Caches copies of the sound element, to enable simultaneous playback of the sound.
  This function is automatically called when the source sound is ready for playback.

  @private
  ###
  cacheCopies: ->
    i = 0
    while i < engine.cachedSoundCopies
      @elements.push @source.cloneNode()
      @elements[i].started = false
      i++

  ###
  Starts a playback of the object. The object supports multiple playbacks. Therefore a playback ID is issued for each playback, making it possible to stop a specific playback, or stop it from looping.

  @param {boolean} loop Whether or not to loop the playback
  @return {number|boolean} If playback succeeds: a playback ID representing the playback, else: false
  ###
  play: (loop_) ->
    return false if Engine.Sounds.Muted

    for sound in @elements
      if (sound.started is false or sound.ended) and not sound.loop
        sound.started = true
        sound.volume = 1
        sound.play()
        sound.loop = "loop" if loop_
        @playbackId++
        sound.playbackId = @playbackId
        return @playbackId
    console.log "Too many playbacks of the same sound: " + @source.src # dev
    false

  ###
  Stops a specific playback of the object

  @param {number} playbackId The playback ID of the playback to stop. The ID is generated when a playback is started, and is returned by the play-function
  ###
  stop: (playbackId) ->
    throw new Error("Missing argument: playbackId") if playbackId is undefined #dev
    for sound in @elements
      if sound.playbackId is playbackId and sound.started and not sound.ended
        sound.volume = 0
        sound.loop = false
        return true
    false

  ###
  Stops all playbacks of the object
  ###
  stopAll: ->
    for sound in @elements
      if sound.started and not sound.ended
        sound.volume = 0
        sound.loop = false
    return

  ###
  Stops a specific playback from looping

  @param {number} playbackId The playback ID of the playback to stop from looping. The ID is generated when a playback is started, and is returned by the play-function
  ###
  stopLoop: (playbackId) ->
    throw new Error("Missing argument: playbackId") if playbackId is undefined #dev
      for sound in @elements
        if sound.playbackId is playbackId and sound.started and not sound.ended
          sound.loop = false
          true
      false

module.exports:: = c::

module.exports[name] = value for name, value of c
