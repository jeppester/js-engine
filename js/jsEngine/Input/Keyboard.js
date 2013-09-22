new Class('Input.Keyboard', {
	/**
	 * Constructor for the Keyboard class
	 *
     * @name Input.Keyboard
     * @class A class that eases checking of the current state of all keys.
	 */
	Keyboard: function () {
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
	},
    /** @scope Input.Keyboard */

	/**
	 * Registers every onkeydown event to the Keyboard object.
	 * 
	 * @private
	 * @param {KeyboardEvent} event Event object passed by the onkeydown event
	 */
	onKeyDown: function (event) {
		var key;

		if (event === undefined) {throw new Error('Missing argument: event'); } //dev

		if (!this.isDown(event.keyCode)) {
			key = this.keys[event.keyCode];
			key.events = key.events.slice(0, 1);
			key.events.unshift(new Date().getTime());
		}
	},

	/**
	 * Registers every onkeyup event to the Keyboard object.
	 * 
	 * @private
	 * @param {KeyboardEvent} event Event object passed by the onkeyup event
	 */
	onKeyUp: function (event) {
		var key;

		if (event === undefined) {throw new Error('Missing argument: event'); } //dev

		if (this.isDown(event.keyCode)) {
			key = this.keys[event.keyCode];
			key.events = key.events.slice(0, 1);
			key.events.unshift(-new Date().getTime());
		}
	},

	/**
	 * Checks if a given key is down.
	 * 
	 * @param {number|string} key A charcode or a string representing the key
	 * @return {boolean} True if the key is down, false if not
	 */
	isDown: function (key) {
		if (key === undefined) {throw new Error('Missing argument: key'); } //dev

		if (typeof key === 'string') {
			key = key.toUpperCase().charCodeAt(0);
		}

		return this.keys[key].events.length && this.keys[key].events[0] > 0;
	},

	/**
	 * Checks if a given key has been pressed (between last and current frame).
	 * 
	 * @param {number|string} key A charcode or a string representing the key
	 * @return {boolean} True if the key has been pressed, false if not
	 */
	isPressed: function (key) {
		if (key === undefined) {throw new Error('Missing argument: key'); } //dev

		if (typeof key === 'string') {
			key = key.toUpperCase().charCodeAt(0);
		}

		return this.keys[key].events.length && this.keys[key].events[0] > engine.last;
	},

	/**
	 * Checks if a given key has been released (between last and current frame).
	 * 
	 * @param {number|string} key A charcode or a string representing the key
	 * @return {boolean} True if the key has been pressed, false if not
	 */
	isReleased: function (key) {
		if (key === undefined) {throw new Error('Missing argument: key'); } //dev

		if (typeof key === 'string') {
			key = key.toUpperCase().charCodeAt(0);
		}

		return this.keys[key].events.length && -this.keys[key].events[0] > engine.last;
	}
});
