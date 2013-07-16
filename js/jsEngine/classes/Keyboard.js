/**
 * Keyboard:
 * An class that eases checking of the current state of all keys.
 */

NewClass('Keyboard');

/**
 * Constructor for the Keyboard class (which is automatically created by the engine on launch)
 * 
 * @private
 */
Keyboard.prototype.Keyboard = function () {
	var key;

	document.addEventListener('keydown', function (event) {
		keyboard.onKeyDown(event);
		event.preventDefault();
		return false;
	}, false);
	document.addEventListener('keyup', function (event) {
		keyboard.onKeyUp(event);
		event.preventDefault();
		return false;
	}, false);

	// Create key array
	this.keys = new Array(200);
	for (key = 0; key < this.keys.length; key ++) {
		this.keys[key] = {
			events: []
		};
	}
};

/**
 * Registers every onkeydown event to the Keyboard object.
 * 
 * @private
 * @param {object} event Event object passed by the onkeydown event
 */
Keyboard.prototype.onKeyDown = function (event) {
	var key;

	if (event === undefined) {throw new Error('Missing argument: event'); }

	if (!this.isDown(event.keyCode)) {
		key = this.keys[event.keyCode];
		key.events = key.events.slice(0, 1);
		key.events.unshift(new Date().getTime());
	}
};

/**
 * Registers every onkeyup event to the Keyboard object.
 * 
 * @private
 * @param {object} event Event object passed by the onkeyup event
 */
Keyboard.prototype.onKeyUp = function (event) {
	var key;

	if (event === undefined) {throw new Error('Missing argument: event'); }

	if (this.isDown(event.keyCode)) {
		key = this.keys[event.keyCode];
		key.events = key.events.slice(0, 1);
		key.events.unshift(-new Date().getTime());
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

	if (typeof key === 'string') {
		key = key.toUpperCase().charCodeAt(0);
	}

	return this.keys[key].events.length && this.keys[key].events[0] > 0;
};

/**
 * Checks if a given key has been pressed (between last and current frame).
 * 
 * @param {mixed} key A charcode or a string representing the key
 * @return {boolean} True if the key has been pressed, false if not
 */
Keyboard.prototype.isPressed = function (key) {
	if (key === undefined) {throw new Error('Missing argument: key'); }

	if (typeof key === 'string') {
		key = key.toUpperCase().charCodeAt(0);
	}

	return this.keys[key].events.length && this.keys[key].events[0] > engine.last;
};

/**
 * Checks if a given key has been released (between last and current frame).
 * 
 * @param {mixed} key A charcode or a string representing the key
 * @return {boolean} True if the key has been pressed, false if not
 */
Keyboard.prototype.isReleased = function (key) {
	if (key === undefined) {throw new Error('Missing argument: key'); }

	if (typeof key === 'string') {
		key = key.toUpperCase().charCodeAt(0);
	}

	return this.keys[key].events.length && -this.keys[key].events[0] > engine.last;
};