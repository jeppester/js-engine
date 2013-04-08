/**
 * Keyboard:
 * An object containing the current state of all keys.
 */

jseCreateClass('Keyboard');

/**
 * Constructor for the Keyboard object (which is automatically created by the engine on launch)
 * 
 * @private
 */
Keyboard.prototype.keyboard = function () {
	document.addEventListener('keydown', function (event) {
		keyboard.onKeyDown.call(keyboard, event);
	}, false);
	document.addEventListener('keyup', function (event) {
		keyboard.onKeyUp.call(keyboard, event);
	}, false);

	// Create key event array
	this.events = [];
};

/**
 * Registers every onkeydown event to the Keyboard object.
 * 
 * @private
 * @param {object} event Event object passed by the onkeydown event
 */
Keyboard.prototype.onKeyDown = function (event) {
	if (event === undefined) {throw new Error('Missing argument: event'); }
	var frame;

	if (this.isDown(event.keyCode)) {
		return;
	}

	frame = engine.frames;

	if (engine.updatesPerformed) {
		frame ++;
	}

	this.cleanUp(event.keyCode);
	this.events.push({'key': event.keyCode, 'frame': frame, 'type': 'pressed'});
};

/**
 * Registers every onkeyup event to the Keyboard object.
 * 
 * @private
 * @param {object} event Event object passed by the onkeyup event
 */
Keyboard.prototype.onKeyUp = function (event) {
	if (event === undefined) {throw new Error('Missing argument: event'); }
	var frame, evt, i;

	frame = engine.frames;
	for (i = this.events.length - 1; i >= 0; i --) {
		evt = this.events[i];

		if (evt.key === event.keyCode) {
			if (evt.frame >= engine.frames) {
				frame = evt.frame + 1;
			}
		}
	}

	this.cleanUp(event.keyCode);

	this.events.push({'key': event.keyCode, 'frame': frame, 'type': 'released'});
};

/**
 * Removes obsolete key events for a key
 * 
 * @private
 * @param {mixed} key A charcode or a string representing the key
 */
Keyboard.prototype.cleanUp = function (key) {
	if (key === undefined) {throw new Error('Missing argument: key'); }
	var clean, evt, i;

	if (typeof key === 'string') {
		key = key.toUpperCase().charCodeAt(0);
	}

	clean = false;
	for (i = this.events.length - 1; i >= 0; i --) {
		evt = this.events[i];

		if (evt.key === key) {
			if (clean) {
				this.events.splice(i, 1);
			}

			if (evt.frame <= engine.frames) {
				clean = true;
			}
		}
	}
};

/**
 * Checks if a given key is down.
 * 
 * @param {mixed} key A charcode or a string representing the key
 * @return {boolean} True if the key is down, false if not
 */
Keyboard.prototype.isDown = function (key) {
	if (key === undefined) {throw new Error('Missing argument: key'); }
	var evt, i;

	if (typeof key === 'string') {
		key = key.toUpperCase().charCodeAt(0);
	}

	for (i = this.events.length - 1; i >= 0; i --) {
		evt = this.events[i];

		if (evt.key === key && evt.frame <= engine.frames) {
			return (evt.type === 'pressed');
		}
	}
	return false;
};

/**
 * Checks if a given key has been pressed (in the current frame).
 * 
 * @param {mixed} key A charcode or a string representing the key
 * @return {boolean} True if the key has been pressed, false if not
 */
Keyboard.prototype.isPressed = function (key) {
	if (key === undefined) {throw new Error('Missing argument: key'); }
	var evt, i;

	if (typeof key === 'string') {
		key = key.toUpperCase().charCodeAt(0);
	}

	for (i = this.events.length - 1; i >= 0; i --) {
		evt = this.events[i];

		if (evt.key === key) {
			if (evt.frame === engine.frames - 1 && evt.type === 'pressed') {
				return true;
			}
		}
	}
	return false;
};