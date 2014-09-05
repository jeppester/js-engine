new Class('Input.Pointer', {
	/**
	 * Constructor for the Pointer class
	 *
     * @name Input.Pointer
     * @class A class that eases the use of mouse and touch, by providing functions for checking the current state of both.
	 */
	Pointer: function () {
		var button;

		if (engine.host.hasTouch) {
			// Add listeners for touch events
			document.addEventListener('touchstart', function (event) {
				pointer.onTouchStart(event);
			}, false);
			document.addEventListener('touchend', function (event) {
				pointer.onTouchEnd(event);
			}, false);
			document.addEventListener('touchmove', function (event) {
				pointer.onTouchMove(event);
			}, false);
		}
		else {
			// Add listeners for mouse events
			document.addEventListener('mousedown', function (event) {
				pointer.onMouseDown(event);
			}, false);
			document.addEventListener('mouseup', function (event) {
				pointer.onMouseUp(event);
			}, false);
			document.addEventListener('mousemove', function (event) {
				engine.host.hasMouse = true;
				pointer.onMouseMove(event);
			}, false);
		}

		// Setup mouse device
		this.mouse = new Math.Vector();
		this.mouse.window = new Math.Vector();
		this.mouse.buttons = new Array(11);
		for (button = 0; button < this.mouse.buttons.length; button++) {
			this.mouse.buttons[button] = new Math.Vector();
			this.mouse.buttons[button].events = new Array(2);
		}
		this.mouse.lastMoved = 0;

		// Setup touches
		this.touches = new Array(10);
		for (button = 0; button < this.touches.length; button++) {
			this.touches[button] = new Math.Vector();
			this.touches[button].x = undefined;
			this.touches[button].y = undefined;
			this.touches[button].events = new Array(2);
		}
	},
    /** @scope Input.Pointer */

	/**
	 * Registers every onmousedown event to the Mouse object.
	 *
	 * @private
	 * @param {MouseEvent} event Event object passed by the onmousedown event
	 */
	onMouseDown: function (event) {
		if (event === undefined) {throw new Error('Missing argument: event'); } //dev
		var button;

		this.onMouseMove(event);

		if (!this.isDown(event.which)) {
			button = this.mouse.buttons[event.which];
			button.events = button.events.slice(0, 1);
			button.events.unshift(new Date().getTime());
		}
	},

	/**
	 * Registers every onmouseup event to the Mouse object.
	 *
	 * @private
	 * @param {MouseEvent} event Event object passed by the onmouseup event
	 */
	onMouseUp: function (event) {
		if (event === undefined) {throw new Error('Missing argument: event'); } //dev
		var button;

		this.onMouseMove(event);

		if (this.isDown(event.which)) {
			button = this.mouse.buttons[event.which];
			button.events = button.events.slice(0, 1);
			button.events.unshift(-new Date().getTime());
		}
	},

	/**
	 * Registers every onmousemove event to the Mouse object.
	 *
	 * @private
	 * @param {MouseEvent} event Event object passed by the onmousemove event
	 */
	onMouseMove: function (event) {
		if (event === undefined) {throw new Error('Missing argument: event'); } //dev

		var roomPos;

		this.mouse.window.set(event.pageX, event.pageY);
		this.mouse.set(this.mouse.window.x - engine.arena.offsetLeft - engine.canvas.offsetLeft + document.body.scrollLeft, this.mouse.window.y - engine.arena.offsetTop - engine.canvas.offsetTop + document.body.scrollTop);

		// Find the mouse position relative to the arena
		this.mouse.x = this.mouse.x / engine.arena.offsetWidth * engine.canvasResX;
		this.mouse.y = this.mouse.y / engine.arena.offsetHeight * engine.canvasResY;

		// Convert the position to make it relative to the room
		roomPos = this.calculateRoomPosition(this.mouse);
		this.mouse.x = roomPos.x;
		this.mouse.y = roomPos.y;

		this.mouse.buttons.forEach(function () {
			this.x = pointer.mouse.x;
			this.y = pointer.mouse.y;
		});

		this.mouse.lastMoved = new Date().getTime();

		if (this.cursor) {
			this.cursor.x = this.mouse.x;
			this.cursor.y = this.mouse.y;
		}
	},

	/**
	 * Registers every ontouchstart event to the Mouse object.
	 *
	 * @private
	 * @param {TouchEvent} event Event object passed by the ontouchstart event
	 */
	onTouchStart: function (event) {
		if (event === undefined) {throw new Error('Missing argument: event'); } //dev
		var i, eventTouch, pointerTouch, touchNumber;

		// Update pressed touches
		for (i = 0; i < event.changedTouches.length; i++) {
			if (i !== "length") {
				eventTouch = event.changedTouches[i];

				if (event.changedTouches[i].identifier > 20) {
					touchNumber = this.findTouchNumber();
				}
				else {
					touchNumber = eventTouch.identifier;
				}

				pointerTouch = this.touches[touchNumber];
				pointerTouch.identifier = eventTouch.identifier;

				pointerTouch.events = pointerTouch.events.slice(0, 1);
				pointerTouch.events.unshift(new Date().getTime());
			}
		}

		// Update all touch positions
		this.onTouchMove(event);
	},

	/**
	 * Registers every ontouchend event to the Mouse object.
	 *
	 * @private
	 * @param {TouchEvent} event Event object passed by the ontouchend event
	 */
	onTouchEnd: function (event) {
		if (event === undefined) {throw new Error('Missing argument: event'); } //dev
		var i, eventTouch, pointerTouch;

		// Update unpressed touches
		for (i = 0; i < event.changedTouches.length; i++) {
			eventTouch = event.changedTouches[i];

			if (event.changedTouches[i].identifier > 20) {
				pointerTouch = this.touches.filter(function (t) {
					return t.identifier === eventTouch.identifier
				})[0];
			}
			else {
				pointerTouch = this.touches[eventTouch.identifier];
			}

			pointerTouch.events = pointerTouch.events.slice(0, 1);
			pointerTouch.events.unshift(-new Date().getTime());
		}

		// Update all touch positions
		this.onTouchMove(event);
	},

	/**
	 * Registers every ontouchmove event to the Mouse object.
	 *
	 * @private
	 * @param {TouchEvent} event Event object passed by the ontouchmove event
	 */
	onTouchMove: function (event) {
		if (event === undefined) {throw new Error('Missing argument: event'); } //dev
		var i, eventTouch, pointerTouch, roomPos;

		for (i = 0; i < event.touches.length; i++) {
			eventTouch = event.touches[i];

			if (event.touches[i].identifier > 20) {
				pointerTouch = this.touches.filter(function (t) {
					return t.identifier === eventTouch.identifier;
				})[0]
			}
			else {
				pointerTouch = this.touches[eventTouch.identifier];
			}


			pointerTouch.set(eventTouch.pageX - engine.arena.offsetLeft - engine.canvas.offsetLeft + document.body.scrollLeft, eventTouch.pageY - engine.arena.offsetTop - engine.canvas.offsetTop + document.body.scrollTop);
			pointerTouch.x = pointerTouch.x / engine.arena.offsetWidth * engine.canvasResX;
			pointerTouch.y = pointerTouch.y / engine.arena.offsetHeight * engine.canvasResY;

			// Convert the position to make it relative to the room
			roomPos = this.calculateRoomPosition(pointerTouch);
			pointerTouch.x = roomPos.x;
			pointerTouch.y = roomPos.y;
		}
	},

	/**
	 * Checks if the mouse has been moved between the last and the current frame.
	 *
	 * @return {boolean} True if the pointer has been moved, false if not
	 */
	mouseHasMoved: function () {
		return engine.last < this.mouse.lastMoved;
	},

	/**
	 * Checks if a mouse button or touch is currently down.
	 *
	 * @param {number} button A pointer constant representing the pointer to check
	 * @return {Object[]|boolean} Returns an array containing the pointers that are currently down, or false if no pointers are down
	 */
	isDown: function (button) {
		if (button === undefined) {throw new Error('Missing argument: button'); } //dev
		var pointers;

		switch (this.getButtonType(button)) {
		case "mouse":
			pointers = button === MOUSE_ANY ? this.mouse.buttons : this.mouse.buttons[button];
			break;
		case "touch":
			pointers = button === TOUCH_ANY ? this.touches : this.touches[button - TOUCH_1];
			break;
		case "any":
			pointers = this.mouse.buttons.concat(this.touches);
		}

		return this.checkPointer(pointers, "down");
	},

	/**
	 * Checks if a mouse button or touch has just been pressed (between the last and the current frame).
	 *
	 * @param {number} button A pointer constant representing the pointer to check
	 * @return {Object[]|boolean} Returns an array containing the pointers that have just been pressed, or false if no pressed pointers where detected
	 */
	isPressed: function (button) {
		if (button === undefined) {throw new Error('Missing argument: button'); } //dev
		var pointers;

		switch (this.getButtonType(button)) {
		case "mouse":
			pointers = button === MOUSE_ANY ? this.mouse.buttons : this.mouse.buttons[button];
			break;
		case "touch":
			pointers = button === TOUCH_ANY ? this.touches : this.touches[button - TOUCH_1];
			break;
		case "any":
			pointers = this.mouse.buttons.concat(this.touches);
		}

		return this.checkPointer(pointers, "pressed");
	},

	/**
	 * Checks if a mouse button or touch just been released (between the last and the current frame).
	 *
	 * @param {number} button A pointer constant representing the pointer to check
	 * @return {Object[]|boolean} Returns an array containing the pointers that have just been released, or false if no released pointers where detected
	 */
	isReleased: function (button) {
		if (button === undefined) {throw new Error('Missing argument: button'); } //dev
		var pointers;

		switch (this.getButtonType(button)) {
		case "mouse":
			pointers = button === MOUSE_ANY ? this.mouse.buttons : this.mouse.buttons[button];
			break;
		case "touch":
			pointers = button === TOUCH_ANY ? this.touches : this.touches[button - TOUCH_1];
			break;
		case "any":
			pointers = this.mouse.buttons.concat(this.touches);
		}

		return this.checkPointer(pointers, "released");
	},

    /**
     * Checks if an area defined by a geometric shape, or its outside, has just been pressed (between the last and the current frame).
     * The shape can be any geometric object that has a contains function (Rectangle, Polygon).
     *
     * @param {button} button A pointer constant representing the pointers to check
     * @param {Math.Rectangle|Math.Polygon|Math.Circle} shape A geometric shape defining the area to check
     * @param {boolean} outside [Whether or not to check the outside of the specified area]
     * @return {Object[]|boolean} An array containing the pointers that have pressed the shape, or false if no presses inside the shape were detected
     */
    shapeIsPressed: function (button, shape, outside) {
		button = button !== undefined ? button : MOUSE_TOUCH_ANY;
		if (shape === undefined) {throw new Error('Missing argument: shape'); } //dev
		if (typeof shape.contains !== 'function') {throw new Error('Argument shape has implement a "contains"-function'); } //dev
		var i, pointers, pointer, ret;

		// Narrow possible presses down to the pressed pointers within the selected buttons
		pointers = this.isPressed(button);

		if (!pointers) {return false; }

		// Check each of the pointers to see if they are inside the shape
		ret = [];
		for (i = 0; i < pointers.length; i++) {
			pointer = pointers[i];
			if (pointer.x === false || pointer.y === false) {continue; }

			if (!outside && shape.contains(pointer)) {
				ret.push(pointer);
			}
			else if (outside && !shape.contains(pointer)) {
				ret.push(pointer);
			}
		}

		// Return the pointers which are inside the shape
		return ret.length ? ret : false;
	},

	/**
	 * Checks if an area defined by a geometric shape, or its outside, has just been released (between the last and the current frame).
	 * The shape can be any geometric object that has a contains function (Rectangle, Polygon).
	 *
     * @param {button} button A pointer constant representing the pointers to check
     * @param {Math.Rectangle|Math.Polygon|Math.Circle} shape A geometric shape defining the area to check
     * @param {boolean} outside [Whether or not to check the outside of the specified area]
     * @return {Object[]|boolean} An array containing the pointers that have released the shape, or false if no releases inside the shape were detected
	 */
	shapeIsReleased: function (button, shape, outside) {
		button = button !== undefined ? button : MOUSE_TOUCH_ANY;
		if (shape === undefined) {throw new Error('Missing argument: shape'); } //dev
		if (typeof shape.contains !== 'function') {throw new Error('Argument shape has implement a "contains"-function'); } //dev
		var i, pointers, pointer, ret;

		// Narrow possible presses down to the pressed pointers within the selected buttons
		pointers = this.isReleased(button);

		if (!pointers) {return false; }

		// Check each of the pointers to see if they are inside the shape
		ret = [];
		for (i = 0; i < pointers.length; i++) {
			pointer = pointers[i];
			if (pointer.x === false || pointer.y === false) {continue; }

			if (!outside && shape.contains(pointer)) {
				ret.push(pointer);
			}
			else if (outside && !shape.contains(pointer)) {
				ret.push(pointer);
			}
		}

		// Return the pointers which are inside the shape
		return ret.length ? ret : false;
	},

	/**
	 * Checks if an area defined by a geometric shape, or its outside, is down (currently clicked by mouse or touch).
	 * The shape can be any geometric object that has a contains function (Rectangle, Polygon).
	 *
     * @param {button} button A pointer constant representing the pointers to check
     * @param {Math.Rectangle|Math.Polygon|Math.Circle} shape A geometric shape defining the area to check
     * @param {boolean} outside [Whether or not to check the outside of the specified area]
     * @return {Object[]|boolean} An array containing the pointers that are currently pressing the shape, or false if no pointers inside the shape were detected
	 */
	shapeIsDown: function (button, shape, outside) {
		button = button !== undefined ? button : MOUSE_TOUCH_ANY;
		if (shape === undefined) {throw new Error('Missing argument: shape'); } //dev
		if (typeof shape.contains !== 'function') {throw new Error('Argument shape has implement a "contains"-function'); } //dev
		var i, pointers, pointer, ret;

		// Narrow possible pointers down to the pointers which are down within the selected buttons
		pointers = this.isDown(button);
		if (!pointers) {return false; }

		// Check each of the pointers to see if they are inside the shape
		ret = [];
		for (i = 0; i < pointers.length; i++) {
			pointer = pointers[i];
			if (pointer.x === false || pointer.y === false) {continue; }

			if (!outside && shape.contains(pointer)) {
				ret.push(pointer);
			}
			else if (outside && !shape.contains(pointer)) {
				ret.push(pointer);
			}
		}

		// Return the pointers which are inside the shape
		return ret.length ? ret : false;
	},

	/**
	 * Returns a string representing the button type.
	 *
	 * @private
	 * @param {number} button A pointer button constant representing the button
	 * @return {string} A string representing the type of button ("mouse", "touch" or "any")
	 */
	getButtonType: function (button) {
		if (button >= MOUSE_ANY && button <= MOUSE_10) {
			return "mouse";
		}
		else if (button >= TOUCH_ANY && button <= TOUCH_10) {
			return "touch";
		}
		else if (button === MOUSE_TOUCH_ANY) {
			return "any";
		}
		else { //dev
			throw new Error('Argument button has to be a pointer constant (see jseGlobals.js)'); //dev
		} //dev
	},

	/**
	 * Checks the state of a pointer object
	 *
	 * @private
	 * @param {Object|Object[]} pointers A pointer object or an array of pointer objects to check the state of
	 * @param {string} state A state to check for "pressed", "released" or "down"
	 * @return {boolean} Whether or not the pointer or one of the pointers has the provided state
	 */
	checkPointer: function (pointers, state) {
		if (pointers === "undefined") {throw new Error("Missing argument: pointers"); } //dev
		if (state === "undefined") {throw new Error("Missing argument: state"); } //dev
		if (['pressed', 'released', 'down'].indexOf(state) === -1) {throw new Error('Argument state must be one of the following values: "pressed", "released" or "down"'); } //dev
		var i, pointer, ret;

		if (!Array.prototype.isPrototypeOf(pointers)) {
			pointers = [pointers];
		}

		// Check each pointer, to see in it has the right state
		ret = [];
		for (i = 0; i < pointers.length; i++) {
			pointer = pointers[i];

			switch (state) {
			case "pressed":
				if (pointer.events[0] > engine.last || pointer.events[1] > engine.last) {ret.push(pointer); }
				break;
			case "released":
				if (-pointer.events[0] > engine.last || -pointer.events[1] > engine.last) {ret.push(pointer); }
				break;
			case "down":
				if (pointer.events[0] > 0) {ret.push(pointer); }
				break;
			}
		}

		return ret.length ? ret : false;
	},

	/**
	 * Converts a coordinate which is relative to the main canvas to a position in the room (based on the room's cameras)
	 *
	 * @private
	 * @param {Math.Vector} vector A vector representing a position which is relative to the main canvas
	 * @return {Math.Vector} vector A vector representing the calculated position relative to the room
	 */
	calculateRoomPosition: function (vector) {
		var ret, len, camera;

		ret = vector.copy();

		// Find the first camera which covers the position
		len = engine.cameras.length;
		while (len --) {
			camera = engine.cameras[len];

			// If the position is covered by the camera, or we have reached the last camera, base the calculation on that camera
			if (camera.projectionRegion.contains(vector) || len === 0) {
				// Find the position relative to the projection region
				ret.subtract(camera.projectionRegion);

				// Transform the position, based on the relation between the capture region and the projection region
				ret.x *= camera.captureRegion.width / camera.projectionRegion.width;
				ret.y *= camera.captureRegion.height / camera.projectionRegion.height;

				// The position is now relative to the capture region, move it to make it relative to the room
				ret.add(camera.captureRegion);

				// Return the calculated room position
				return ret;
			}
		}

		return ret;
	},

	/**
	 * Finds the first available spot in the Pointer.touches-array, used for registering the touches as numbers from 0-9.
	 * In Google Chrome, each touch's identifier can be used directly since the numbers - starting from 0 - are reused, when the a touch is released.
	 * In Safari however each touch has a unique id (a humongous number), and a function (this) is therefore needed for identifying the touches as the numbers 0-9, which can be used in the Pointer.touches-array.
	 *
	 * @private
	 * @return {number|boolean} The first available spot in the Pointer.touches-array where a new touch can be registered. If no spot is available, false is returned
	 */
	findTouchNumber: function () {
		var i;
		for (i = 0; i < this.touches.length; i++) {
			if (!this.checkPointer(this.touches[i], 'down')) {
				return i;
			}
		}
        return false;
	},

	/**
	 * Checks if an area defined by a geometric shape, or its outside, is hovered by the mouse pointer.
	 * The shape can be any geometric object that has a contains function (Rectangle, Polygon).
	 *
	 * @param {Math.Rectangle|Math.Polygon|Math.Circle} shape A geometric shape defining the area to check
     * @param {boolean} outside [Whether or not to check the outside of the specified area]
	 * @return {boolean} True if the shape if hovered, false if not
	 */
	shapeIsHovered: function (shape, outside) {
		if (!outside && (shape.contains(this.mouse))) {
			return true;
		}
		else if (outside && (!shape.contains(this.mouse))) {
			return true;
		}

		return false;
	},

	/**
	 * Releases a button, and thereby prevents the button from being detected as "pressed" by the isPressed function.
	 * This function is very useful for preventing one button press from having multiple effects inside the game. For instance on buttons that are placed on top of each other.
	 *
	 * @param {number} button The button to release
	 * @return {boolean} True if the button has now been released, false if the button was not already pressed
	 */
	release: function (button) {
		if (button === undefined) {throw new Error('Missing argument: button'); } //dev
		var i, pointers, events, unpressed;

		// Find pressed pointers that are covered by the given button
		pointers = this.isPressed(button);
		if (!pointers) {return false; }

		// Unpress all of the pointers
		for (i = 0; i < pointers.length; i++) {
			events = pointers[i].events;
			if (events[0] > engine.last) {
				events.shift();
				events.push(undefined);
				unpressed = true;
			}
			if (events[1] > engine.last) {
				events.pop();
				events.push(undefined);
				unpressed = true;
			}
		}
		return unpressed;
	},

	/**
	 * Checks if the mouse pointer is outside the game arena.
	 *
	 * @return {boolean} True if the pointer is outside, false if not
	 */
	outside: function () {
		return new Math.Rectangle(engine.arena.offsetLeft, engine.arena.offsetTop, engine.arena.offsetWidth, engine.arena.offsetHeight).contains(this.mouse.window) === false;
	},

	/**
	 * Resets the mouse cursor, automatically called by the engine before each frame i executed, unless engine.resetCursorOnEachFrame is set to false
	 *
	 * @private
	 */
	resetCursor: function () {
		engine.arena.style.cursor = 'default';
	},

	/**
	 * Sets the mouse cursor for the arena.
	 * By default the mouse cursor will be reset on each frame (this can be changed with the "resetCursorOnEachFrame" engine option)
	 * Please be aware that not all images can be used as cursor. Not all sizes and formats are supported by all browsers.
	 *
	 * @param {string} A resource string, image path string or css cursor of the cursor
	 */
	setCursor: function (cursor) {
		if (cursor === undefined) {throw new Error('Missing argument: cursor'); } //dev
		if (typeof cursor !== 'string') {throw new Error('Argument cursor should be of type: string'); } //dev

		var resource;

		// Check if "cursor" is a resource string
		resource = loader.getImage(cursor);

		// If the cursor string corresponded to a resource, use the resource's src as cursor
		if (resource) {
			cursor = "url('" + resource.src + "') 0 0, auto";
		}
		// Else, if the cursor is not a single word (a css cursor), use the cursor var as direct image path
		else if (!/^\w*$/.test(cursor)) {
			cursor = "url('" + cursor + "') 0 0, auto";
		}

		// Finally: set the cursor
		engine.arena.style.cursor = cursor;
	}
});
