nameSpace('Sound');

/**
 * Constructor for the Music class
 *
 * @name Sound.Music
 * @class A wrapper-class for audio-elements which are to be used as music.
 *
 * @property {boolean} paused Whether or not the music object is currently paused
 * @property {HTMLAudioElement} source The audio element which is used as the source of the music object
 *
 * @param {HTMLAudioElement} audioElement The Audio element to use as source for the music object
 */
Sound.Music = function (audioElement) {
	if (audioElement === undefined) {throw new Error('Missing argument: audioElement'); } //dev
	if (audioElement.toString() !== "[object HTMLAudioElement]") {throw new Error('Argument audioElement has to be of type HTMLAudioElement'); } //dev

	this.source = audioElement;
	this.paused = false;
};

Sound.Music.prototype.import(/** @lends Sound.Music.prototype */ {
	/**
	 * Starts playback of the object
	 *
	 * @param {boolean} loop Whether or not to loop the playback
	 * @return {boolean} True if the playback has started successfully, false if not
	 */
	play: function (loop) {
		if (engine.musicMuted) {return false; }

		this.source.play();
		this.paused = false;

		if (loop) {
			this.source.loop = "loop";
		}

		return true;
	},

	/**
	 * Pauses the playback of the object
	 */
	pause: function () {
		this.paused = true;
		this.source.pause();
	},

	/**
	 * Stops the playback of the object
	 */
	stop: function () {
		if (!this.source.ended) {
			this.source.pause();
			this.source.currentTime = 0;
			this.source.loop = false;
			return true;
		}

		return false;
	},

	/**
	 * Stops the playback from looping
	 */
	stopLoop: function () {
		if (this.source.started && !this.source.ended) {
			this.source.loop = false;
			return true;
		}

		return false;
	}
});
