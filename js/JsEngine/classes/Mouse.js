/*
buttonIndex:
An object containing the current state of all buttons.

Requires:
	arena to be set
*/

jseCreateClass('Mouse');

Mouse.prototype.mouse = function () {
	if (engine.host.hasTouch) {
		// Add listeners for touch events
		arena.addEventListener('touchstart', function (event) {
			mouse.onTouchStart.call(mouse, event);
		}, false);
		arena.addEventListener('touchend', function (event) {
			mouse.onTouchEnd.call(mouse, event);
		}, false);
		document.addEventListener('touchmove', function (event) {
			mouse.onTouchMove.call(mouse, event);
			this.touches = event.touches;
		}, false);
	}
	else {
		// Add listeners for mouse events
		arena.addEventListener('mousedown', function (event) {
			mouse.onMouseDown.call(mouse, event);
		}, false);
		arena.addEventListener('mouseup', function (event) {
			mouse.onMouseUp.call(mouse, event);
		}, false);
		document.addEventListener('mousemove', function (event) {
			engine.host.hasMouse = true;
			mouse.onMouseMove.call(mouse, event);
		}, false);

		// Set mouse cursor
		if (engine.options.cursor) {
			/* this.cursor = engine.depth[8].addChild(new Sprite(engine.options.cursor, 0, 0, 0, {xOff: 0, yOff: 0}));
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
};

Mouse.prototype.onMouseDown = function (event) {
	if (event === undefined) {throw new Error('Missing argument: event'); }
	var frame = engine.frames;

	if (engine.updatesPerformed) {
		frame ++;
	}

	this.cleanUp(event.which);
	this.events.push({'button': event.which, 'frame': frame, 'type': 'pressed'});
};

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

Mouse.prototype.onMouseMove = function (event) {
	if (event === undefined) {throw new Error('Missing argument: event'); }
	this.windowX = event.pageX;
	this.windowY = event.pageY;

	this.x = this.windowX - arena.offsetLeft + document.body.scrollLeft;
	this.y = this.windowY - arena.offsetTop + document.body.scrollTop;

	this.x = this.x / arena.offsetWidth * engine.canvasResX;
	this.y = this.y / arena.offsetHeight * engine.canvasResY;

	if (this.cursor) {
		this.cursor.x = this.x;
		this.cursor.y = this.y;
	}
};

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

Mouse.prototype.onTouchMove = function (event) {
	if (event === undefined) {throw new Error('Missing argument: event'); }
	
	this.touches = event.touches;
	
	this.windowX = event.targetTouches[0].pageX;
	this.windowY = event.targetTouches[0].pageY;

	this.x = this.windowX - arena.offsetLeft + document.body.scrollLeft;
	this.y = this.windowY - arena.offsetTop + document.body.scrollTop;

	this.x = this.x / arena.offsetWidth * engine.canvasResX;
	this.y = this.y / arena.offsetHeight * engine.canvasResY;
};

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

Mouse.prototype.squareIsPressed = function (x, y, w, h) {
	if (x === undefined) {throw new Error('Missing argument: x'); }
	if (y === undefined) {throw new Error('Missing argument: y'); }
	if (w === undefined) {throw new Error('Missing argument: w'); }
	if (h === undefined) {throw new Error('Missing argument: h'); }
	var btn, i;

	btn = false;
	for (i = 1; i < 4; i ++) {
		if (this.isPressed(i)) {
			btn = i;
			break;
		}
	}
	if (btn && this.x > x && this.x < x + w && this.y > y && this.y < y + h) {
		return btn;
	}
};

Mouse.prototype.squareOutsideIsPressed = function (x, y, w, h) {
	if (x === undefined) {throw new Error('Missing argument: x'); }
	if (y === undefined) {throw new Error('Missing argument: y'); }
	if (w === undefined) {throw new Error('Missing argument: w'); }
	if (h === undefined) {throw new Error('Missing argument: h'); }

	return this.isPressed(1) && (this.x < x || this.x > x + w || this.y < y || this.y > y + h);
};

Mouse.prototype.circleIsPressed = function (x, y, r) {
	if (x === undefined) {throw new Error('Missing argument: x'); }
	if (y === undefined) {throw new Error('Missing argument: y'); }
	if (r === undefined) {throw new Error('Missing argument: r'); }
	var dX, dY;

	dX = this.x - x;
	dY = this.y - y;

	btn = false;
	for (i = 1; i < 4; i ++) {
		if (this.isPressed(i)) {
			btn = i;
			break;
		}
	}
	if (this.isPressed(1) && r > Math.sqrt(dX * dX + dY * dY)) {
		return btn;
	}
};

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

Mouse.prototype.outside = function () {
	return this.x < 0 || this.x > arena.offsetWidth || this.y < 0 || this.y > arena.offsetHeight;
};