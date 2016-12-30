###
Constructor for the Music class

@name Sound.Music
@class A wrapper-class for audio-elements which are to be used as music.

@property {boolean} paused Whether or not the music object is currently paused
@property {HTMLAudioElement} source The audio element which is used as the source of the music object

@param {HTMLAudioElement} @source The Audio element to use as source for the music object
###
module.exports = class Music
  constructor: (@engine, @source) ->
    throw new Error("Missing argument: @source") if @source is undefined #dev
    throw new Error("Missing argument: @source") if @source is undefined #dev
    throw new Error("Argument @source has to be of type HTMLAudioElement") if @source.toString() isnt "[object HTMLAudioElement]" #dev
    @source.addEventListener 'ended', => @playing = false
    @source.addEventListener 'pause', => @playing = false
    @source.addEventListener 'playing', => @playing = true
    @playing = false
    return

  ###
  Starts playback of the object

  @param {boolean} loop Whether or not to loop the playback
  @return {boolean} True if the playback has started successfully, false if not
  ###
  play: (loop_) ->
    return false if @engine.musicMuted
    @source.play()
    @source.loop = "loop" if loop_
    true

  ###
  Pauses the playback of the object
  ###
  pause: ->
    @source.pause()
    return

  ###
  Stops the playback of the object
  ###
  stop: ->
    unless @source.ended
      @source.pause()
      @source.currentTime = 0
      @source.loop = false
      return true
    false

  ###
  Stops the playback from looping
  ###
  stopLoop: ->
    if @source.started and not @source.ended
      @source.loop = false
      return true
    false
