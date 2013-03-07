/*
Sound:
A wrapper-class for audio-elements that stores multiple copies of the audio-element.
Makes it possible to control (start, stop) multiple playbacks of the same sound.
*/

jseCreateClass('Sound');

Sound.prototype.sound = function (audioElement) {
	if (audioElement === undefined) {throw new Error('Missing argument: audioElement'); }
	if (audioElement.toString() !== "[object HTMLAudioElement]") {throw new Error('Argument audioElement has to be of type HTMLAudioElement'); }

	var i, copies;

	this.source = audioElement;
	this.playbackId = 0;

	// Prepare copies of the element, to be used for simultaneous playback
	this.elements = [];
	for (i = 0; i < engine.cachedSoundCopies; i ++) {
		this.elements.push(this.source.cloneNode());
		this.elements[i].started = false;
	}
};

Sound.prototype.play = function (loop) {
	var i, sound;

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
};

Sound.prototype.stop = function (playbackId) {
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
};

Sound.prototype.stopLoop = function (playbackId) {
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
};