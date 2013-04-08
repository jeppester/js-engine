/**
 * Music:
 * A wrapper-class for audio-elements which are to be used as music.
 */

jseCreateClass('Music');

/**
 * Constructor for the Music object
 * 
 * @param {object} audioElement The Audio element to use as source for the music object
 */
Music.prototype.music = function (audioElement) {
	if (audioElement === undefined) {throw new Error('Missing argument: audioElement'); }
	if (audioElement.toString() !== "[object HTMLAudioElement]") {throw new Error('Argument audioElement has to be of type HTMLAudioElement'); }

	this.source = audioElement;
	this.paused = false;
};

/**
 * Starts playback of the object
 * 
 * @param {boolean} loop Whether or not to loop the playback
 * @return {boolean} True if the playback has started successfully, false if not
 */
Music.prototype.play = function (loop) {
	if (engine.musicMuted) {return false; }

	this.source.play();
	this.source.paused = false;

	if (loop) {
		this.source.loop = "loop";
	}

	return true;
};

/**
 * Pauses the playback of the object
 */
Music.prototype.pause = function () {
	this.paused = true;
	this.source.pause();
};

/**
 * Stops the playback of the object
 */
Music.prototype.stop = function () {
	if (!this.source.ended) {
		this.source.pause();
		this.source.currentTime = 0;
		this.source.loop = false;
		return true;
	}

	return false;
};

/**
 * Stops the playback from looping
 */
Music.prototype.stopLoop = function () {
	if (this.source.started && !this.source.ended) {
		this.source.loop = false;
		return true;
	}

	return false;
};