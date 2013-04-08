/**
 * Mouse:
 * An object containing the current state of all buttons.
 */

jseCreateClass('Mouse');

/**
 * Constructor for the Mouse object (which is automatically created by the engine on launch)
 * 
 * @private
 */
Mouse.prototype.mouse = function () {
	if (engine.host.hasTouch) {
		// Add listeners for touch events
		engine.arena.addEventListener('touchstart', function (event) {
			mouse.onTouchStart.call(mouse, event);
		}, false);
		engine.arena.addEventListener('touchend', function (event) {
			mouse.onTouchEnd.call(mouse, event);
		}, false);
		document.addEventListener('touchmove', function (event) {
			mouse.onTouchMove.call(mouse, event);
			this.touches = event.touches;
		}, false);
	}
	else {
		// Add listeners for mouse events
		engine.arena.addEventListener('mousedown', function (event) {
			mouse.onMouseDown.call(mouse, event);
		}, false);
		engine.arena.addEventListener('mouseup', function (event) {
			mouse.onMouseUp.call(mouse, event);
		}, false);
		document.addEventListener('mousemove', function (event) {
			engine.host.hasMouse = true;
			mouse.onMouseMove.call(mouse, event);
		}, false);

		// Set mouse cursor
		if (engine.options.cursor) {
			/* this.cursor = engine.depth[8].addChildren(new Sprite(engine.options.cursor, 0, 0, 0, {offset: new Vector2D()}));
			engine.arena.style.cursor = 'none';*/
			engine.arena.style.cursor = "url('" + loader.getImage(engine.options.cursor).src + "') 0 0, auto";
		}
	}

	// Set x and y (the mouse position, relative to the arena)
	this.x = 0;
	this.y = 0;

	// Set x and y (the mouse position, relative to the window)
	this.windowX = 0;
	this.windowY = 0;

	// Create key event array
	this.events = [];

	// Set last moved var (for checking when the mouse last moved)
	this.lastMoved = 0;
};

/**
 * Registers every onmousedown event to the Mouse object.
 * 
 * @private
 * @param {object} event Event object passed by the onmousedown event
 */
Mouse.prototype.onMouseDown = function (event) {
	if (event === undefined) {throw new Error('Missing argument: event'); }
	var frame = engine.frames;

	if (engine.updatesPerformed) {
		frame ++;
	}

	this.cleanUp(event.which);
	this.events.push({'button': event.which, 'frame': frame, 'type': 'pressed'});
};

/**
 * Registers every onmouseup event to the Mouse object.
 * 
 * @private
 * @param {object} event Event object passed by the onmouseup event
 */
Mouse.prototype.onMouseUp = function (event) {
	if (event === undefined) {throw new Error('Missing argument: event'); }
	var frame, evt, i;

	frame = engine.frames;
	for (i = this.events.length - 1; i >= 0; i --) {
		evt = this.events[i];

		if (evt.button === event.which) {
			if (evt.frame >= engine.frames) {
				frame = evt.frame + 1;
			}
		}
	}

	this.cleanUp(event.which);
	this.events.push({'button': event.which, 'frame': frame, 'type': 'released'});
};

/**
 * Registers every onmousemove event to the Mouse object.
 * 
 * @private
 * @param {object} event Event object passed by the onmousemove event
 */
Mouse.prototype.onMouseMove = function (event) {
	if (event === undefined) {throw new Error('Missing argument: event'); }

	this.windowX = event.pageX;
	this.windowY = event.pageY;

	this.x = this.windowX - engine.arena.offsetLeft + document.body.scrollLeft;
	this.y = this.windowY - engine.arena.offsetTop + document.body.scrollTop;

	this.x = this.x / engine.arena.offsetWidth * engine.canvasResX;
	this.y = this.y / engine.arena.offsetHeight * engine.canvasResY;

	this.lastMoved = engine.frames;

	if (this.cursor) {
		this.cursor.x = this.x;
		this.cursor.y = this.y;
	}
};

/**
 * Registers every ontouchstart event to the Mouse object.
 * 
 * @private
 * @param {object} event Event object passed by the ontouchstart event
 */
Mouse.prototype.onTouchStart = function (event) {
	if (event === undefined) {throw new Error('Missing argument: event'); }
	var frame = engine.frames;

	this.touches = event.touches;

	if (engine.updatesPerformed) {
		frame ++;
	}

	// Update "mouse" position
	this.onTouchMove(event);

	this.cleanUp(1);
	this.events.push({'button': 1, 'frame': frame, 'type': 'pressed'});
};

/**
 * Registers every ontouchend event to the Mouse object.
 * 
 * @private
 * @param {object} event Event object passed by the ontouchend event
 */
Mouse.prototype.onTouchEnd = function (event) {
	if (event === undefined) {throw new Error('Missing argument: event'); }
	var frame, evt, i;

	this.touches = event.touches;

	frame = engine.frames;
	for (i = this.events.length - 1; i >= 0; i --) {
		evt = this.events[i];

		if (evt.button === 1) {
			if (evt.frame >= engine.frames) {
				frame = evt.frame + 1;
			}
		}
	}

	// Update "mouse" position
	this.onTouchMove(event);

	this.cleanUp(1);
	this.events.push({'button': 1, 'frame': frame, 'type': 'released'});
};

/**
 * Registers every ontouchmove event to the Mouse object.
 * 
 * @private
 * @param {object} event Event object passed by the ontouchmove event
 */
Mouse.prototype.onTouchMove = function (event) {
	if (event === undefined) {throw new Error('Missing argument: event'); }

	this.touches = event.touches;

	this.windowX = event.targetTouches[0].pageX;
	this.windowY = event.targetTouches[0].pageY;

	this.x = this.windowX - engine.arena.offsetLeft + document.body.scrollLeft;
	this.y = this.windowY - engine.arena.offsetTop + document.body.scrollTop;

	this.x = this.x / engine.arena.offsetWidth * engine.canvasResX;
	this.y = this.y / engine.arena.offsetHeight * engine.canvasResY;
};

/**
 * Removes obsolete button events for a button
 * 
 * @private
 * @param {mixed} button A number representing the mouse button
 */
Mouse.prototype.cleanUp = function (button) {
	if (button === undefined) {throw new Error('Missing argument: button'); }
	var clean, evt, i;

	clean = false;
	for (i = this.events.length - 1; i >= 0; i --) {
		evt = this.events[i];

		if (evt.button === button) {
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
 * Checks if the pointer (mouse or touch) has been moved between the last and the current frame.
 * 
 * @return {boolean} True if the pointer has been moved, false if not
 */
Mouse.prototype.hasMoved = function () {
	if (engine.frames === this.lastMoved + 1) {
		return true;
	}

	return false;
};

/**
 * Checks if a mouse button is currently down. Touch events are always registered as button 1.
 * 
 * @param {number} button The button to check
 * @return {boolean} True if the checked button is down, false if not
 */
Mouse.prototype.isDown = function (button) {
	if (button === undefined) {throw new Error('Missing argument: button'); }
	var evt, i;

	for (i = this.events.length - 1; i >= 0; i --) {
		evt = this.events[i];

		if (evt.button === button && evt.frame <= engine.frames) {
			return (evt.type === 'pressed');
		}
	}
	return false;
};

/**
 * Checks if a mouse button has just been pressed (between the last and the current frame). Touch events are always registered as button 1.
 * 
 * @param {number} button The button to check
 * @return {boolean} True if the checked button has just been pressed, false if not
 */
Mouse.prototype.isPressed = function (button) {
	if (button === undefined) {throw new Error('Missing argument: button'); }
	var evt, i;

	for (i = this.events.length - 1; i >= 0; i --) {
		evt = this.events[i];

		if (evt.button === button) {
			if (evt.frame === engine.frames - 1 && evt.type === 'pressed') {
				return evt;
			}
		}
	}
	return false;
};

/**
 * Checks if an area defined by a geometric shape, or its outside, has just been pressed (between the last and the current frame), by any button.
 * The shape can be any geometric object that has a contains function (Rectangle, Polygon).
 * 
 * @param {mixed} shape A geometric shape defining the area to check: Rectangle or Polygon
 * @return {boolean} True if the a button has just been pressed inside the shape, false if not
 */
Mouse.prototype.shapeIsPressed = function (shape, outside) {
	if (shape === undefined) {throw new Error('Missing argument: shape'); }
	if (typeof shape.contains !== 'function') {throw new Error('Argument shape has implement a "contains"-function'); }

	var btn, i;

	btn = false;
	for (i = 1; i < 4; i ++) {
		if (this.isPressed(i)) {
			btn = i;
			break;
		}
	}
	if (!outside && (btn && shape.contains(new Vector2D(this.x, this.y)))) {
		return btn;
	}
	else if (outside && (btn && !shape.contains(new Vector2D(this.x, this.y)))) {
		return btn;
	}

	return false;
};

/**
 * Checks if an area defined by a geometric shape, or its outside, is hovered.
 * The shape can be any geometric object that has a contains function (Rectangle, Polygon).
 * 
 * @param {mixed} shape A geometric shape defining the area to check: Rectangle or Polygon
 * @return {boolean} True if the shape if hovered, false if not
 */
Mouse.prototype.shapeIsHovered = function (shape, outside) {
	if (!outside && (shape.contains(new Vector2D(this.x, this.y)))) {
		return true;
	}
	else if (outside && (!shape.contains(new Vector2D(this.x, this.y)))) {
		return true;
	}

	return false;
};

/**
 * Unpresses a button, and thereby prevents the button from being detected as "pressed" by the isPressed function.
 * This function is very usable for preventing one button press from having multiple effects inside the game. For instance on buttons that are placed on top of each other.
 * 
 * @param {number} button The button to unpress
 * @return {boolean} True if the button has now been unpressed, false if the button was not already pressed
 */
Mouse.prototype.unPress = function (button) {
	if (button === undefined) {throw new Error('Missing argument: button'); }
	var evt, i;

	for (i = this.events.length - 1; i >= 0; i --) {
		evt = this.events[i];

		if (evt.button === button) {
			if (evt.frame === engine.frames - 1 && evt.type === 'pressed') {
				evt.frame --;
				return true;
			}
		}
	}
	return false;
};

/**
 * Checks if the pointer is outside the game arena.
 * 
 * @return {boolean} True if the pointer is outside, false if not
 */
Mouse.prototype.outside = function () {
	return this.x < 0 || this.x > engine.arena.offsetWidth || this.y < 0 || this.y > engine.arena.offsetHeight;
};