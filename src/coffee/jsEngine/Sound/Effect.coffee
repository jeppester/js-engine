nameSpace "Sound"

###
Constructor for the sound class

@name Sound.Effect
@class A wrapper-class for audio-elements. A Sound object stores multiple copies of the same sound to enable multiple simultaneous playbacks, and provides functions for controlling (start, stop) each playback.

@property {HTMLAudioElement} source The audio element which is used as the source of the music object

@param {HTMLAudioElement} audioElement The Audio element to use as source for the sound object
###
class Sound.Effect
  constructor: (audioElement) ->
    throw new Error("Missing argument: audioElement")  if audioElement is undefined #dev
    throw new Error("Argument audioElement has to be of type HTMLAudioElement")  if audioElement.toString() isnt "[object HTMLAudioElement]" #dev
    snd = undefined
    @source = audioElement
    @playbackId = 0

    # When ready for playback, prepare copies of the element, to be used for simultaneous playback
    @elements = []
    snd = this
    @source.addEventListener "canplaythrough", (->
      snd.cacheCopies()
      return
    ), false
    return

  ###
  Caches copies of the sound element, to enable simultaneous playback of the sound.
  This function is automatically called when the source sound is ready for playback.

  @private
  ###
  cacheCopies: ->
    i = undefined
    i = 0
    while i < engine.cachedSoundCopies
      @elements.push @source.cloneNode()
      @elements[i].started = false
      i++
    return

  ###
  Starts a playback of the object. The object supports multiple playbacks. Therefore a playback ID is issued for each playback, making it possible to stop a specific playback, or stop it from looping.

  @param {boolean} loop Whether or not to loop the playback
  @return {number|boolean} If playback succeeds: a playback ID representing the playback, else: false
  ###
  play: (loop_) ->
    i = undefined
    sound = undefined
    return false  if engine.soundsMuted
    i = 0
    while i < @elements.length
      sound = @elements[i]
      if (sound.started is false or sound.ended) and not sound.loop
        sound.started = true
        sound.volume = 1
        sound.play()
        sound.loop = "loop"  if loop_
        @playbackId++
        sound.playbackId = @playbackId
        return @playbackId
      i++
    console.log "Too many playbacks of the same sound: " + @source.src # dev
    false

  ###
  Stops a specific playback of the object

  @param {number} playbackId The playback ID of the playback to stop. The ID is generated when a playback is started, and is returned by the play-function
  ###
  stop: (playbackId) ->
    throw new Error("Missing argument: playbackId")  if playbackId is undefined #dev
    i = undefined
    sound = undefined
    i = 0
    while i < @elements.length
      sound = @elements[i]
      if sound.playbackId is playbackId and sound.started and not sound.ended
        sound.volume = 0
        sound.loop = false
        return true
      i++
    false

  ###
  Stops all playbacks of the object
  ###
  stopAll: ->
    i = undefined
    sound = undefined
    i = 0
    while i < @elements.length
      sound = @elements[i]
      if sound.started and not sound.ended
        sound.volume = 0
        sound.loop = false
      i++
    return

  ###
  Stops a specific playback from looping

  @param {number} playbackId The playback ID of the playback to stop from looping. The ID is generated when a playback is started, and is returned by the play-function
  ###
  stopLoop: (playbackId) ->
    throw new Error("Missing argument: playbackId")  if playbackId is undefined #dev
    i = undefined
    sound = undefined
    i = 0
    while i < @elements.length
      sound = @elements[i]
      if sound.playbackId is playbackId and sound.started and not sound.ended
        sound.loop = false
        return true
      i++
    false
