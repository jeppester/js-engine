new Class('Sound', {
	/**
	 * Constructor for the sound class
	 *
     * @name Sound
     * @class A wrapper-class for audio-elements. A Sound object stores multiple copies of the same sound to enable multiple simultaneous playbacks, and provides functions for controlling (start, stop) each playback.
     *
     * @property {HTMLAudioElement} source The audio element which is used as the source of the music object
     *
	 * @param {HTMLAudioElement} audioElement The Audio element to use as source for the sound object
     */
	Sound: function (audioElement) {
		if (audioElement === undefined) {throw new Error('Missing argument: audioElement'); }
		if (audioElement.toString() !== "[object HTMLAudioElement]") {throw new Error('Argument audioElement has to be of type HTMLAudioElement'); }

		var snd;

		this.source = audioElement;
		this.playbackId = 0;

		// When ready for playback, prepare copies of the element, to be used for simultaneous playback
		this.elements = [];
		snd = this;
		this.source.addEventListener("canplaythrough", function () {
			snd.cacheCopies();
		}, false);
	},
    /** @scope Sound */

	/**
	 * Caches copies of the sound element, to enable simultaneous playback of the sound.
	 * This function is automatically called when the source sound is ready for playback.
	 * 
	 * @private
	 */
	cacheCopies: function () {
        var i;

		for (i = 0; i < engine.cachedSoundCopies; i ++) {
			this.elements.push(this.source.cloneNode());
			this.elements[i].started = false;
		}
	},

	/**
	 * Starts a playback of the object. The object supports multiple playbacks. Therefore a playback ID is issued for each playback, making it possible to stop a specific playback, or stop it from looping.
	 * 
	 * @param {boolean} loop Whether or not to loop the playback
	 * @return {number|boolean} If playback succeeds: a playback ID representing the playback, else: false
	 */
	play: function (loop) {
		var i, sound;

		if (engine.soundsMuted) {return false; }

		for (i = 0; i < this.elements.length; i++) {
			sound = this.elements[i];
			if ((sound.started === false || sound.ended) && !sound.loop) {
				sound.started = true;
				sound.volume = 1;
				sound.play();

				if (loop) {
					sound.loop = 'loop';
				}

				this.playbackId++;
				sound.playbackId = this.playbackId;
				return this.playbackId;
			}
		}

		//console.log('To many playbacks of the same sound: ' + this.source.src);
		return false;
	},

	/**
	 * Stops a specific playback of the object
	 * 
	 * @param {number} playbackId The playback ID of the playback to stop. The ID is generated when a playback is started, and is returned by the play-function
	 */
	stop: function (playbackId) {
		if (playbackId === undefined) {throw new Error('Missing argument: playbackId'); }

		var i, sound;

		for (i = 0; i < this.elements.length; i++) {
			sound = this.elements[i];
			if (sound.playbackId === playbackId && sound.started && !sound.ended) {
				sound.volume = 0;
				sound.loop = false;
				return true;
			}
		}

		return false;
	},

	/**
	 * Stops all playbacks of the object
	 */
	stopAll: function () {
		var i, sound;

		for (i = 0; i < this.elements.length; i++) {
			sound = this.elements[i];
			if (sound.started && !sound.ended) {
				sound.volume = 0;
				sound.loop = false;
			}
		}
	},

	/**
	 * Stops a specific playback from looping
     *
	 * @param {number} playbackId The playback ID of the playback to stop from looping. The ID is generated when a playback is started, and is returned by the play-function
	 */
	stopLoop: function (playbackId) {
		if (playbackId === undefined) {throw new Error('Missing argument: playbackId'); }

		var i, sound;

		for (i = 0; i < this.elements.length; i++) {
			sound = this.elements[i];
			if (sound.playbackId === playbackId && sound.started && !sound.ended) {
				sound.loop = false;
				return true;
			}
		}

		return false;
	}
});