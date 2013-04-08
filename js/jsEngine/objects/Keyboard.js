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

	// Create key array
	this.keys = [];
	for (var key = 0; key < 200; key ++) {
		this.keys[key] = false;
	}
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

	if (!this.isDown(event.keyCode)) {
		this.keys[event.keyCode] = new Date().getTime();
	}
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

	this.keys[event.keyCode] = false;
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

	return this.keys[key] !== false;
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

	if (this.keys[key]) {
		return this.keys[key] > engine.last;
	}
	else {
		return false;
	}
};