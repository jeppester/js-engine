/*
JsEngine:
Loads all objects required by the engine, sets core functions, and runs the core loop.

Game specific behavior should not be added in this file, but instead to the Game class.

Requires:
	Keyboard
	Mouse
	Loader
	Animator
*/

JsEngine = function (_opt) {
	// Define all used vars
	var copyOpt, i, opt, req, resize, gc;

	// Set global engine variable
	engine = this;

	// Load default options
	this.loopSpeed = 1;
	this.manualRedrawDepths = [];
	this.canvasResX = 800;
	this.canvasResY = 600;
	this.enginePath = 'js/JsEngine';
	this.themesPath = 'themes'
	this.arena = document.getElementById('arena');
	this.autoResize = true;
	this.autoResizeLimitToResolution = true;
	this.compositedDepths = [];
	this.gameClassPath = "js/Game.js";
	this.backgroundColor = "#FFF";

	// Copy options to engine (except those which are only used for engine initialization)
	this.options = _opt ? _opt: {};
	copyOpt = ['backgroundColor','arena', 'loopSpeed', 'loopsPerColCheck', 'manualRedrawDepths', 'compositedDepths', 'canvasResX', 'canvasResY', 'autoResize', 'autoResizeLimitToResolution', 'enginePath', 'themesPath', 'gameClassPath'];
	for (i = 0; i < copyOpt.length; i ++) {
		opt = copyOpt[i];
		if (this.options[opt] !== undefined) {
			this[opt] = this.options[opt];
			delete this.options[opt];
		}
	}

	// Detect host information
	audioFormats = ['mp3', 'ogg', 'wav'];
	supportedFormats = [];
	for (i = 0; i < audioFormats.length; i++) {
		if (document.createElement('audio').canPlayType('audio/'+audioFormats[i])) {
			supportedFormats.push(audioFormats[i]);
		}
	}
	this.host = {
		hasTouch: 'ontouchstart' in document,
		hasMouse: false,
		supportedAudio: supportedFormats
	};

	// If autoresize is set to true, set up autoresize
	if (this.autoResize) {
		resize = function () {
			var h, w, windowWH, gameWH;

			// Check if the window is wider og heigher than the game's canvas
			windowWH = window.innerWidth / window.innerHeight;
			gameWH = engine.canvasResX / engine.canvasResY;

			if (windowWH > gameWH) {
				h = window.innerHeight;
				w = engine.canvasResX / engine.canvasResY * h;
			} else {
				w = window.innerWidth;
				h = engine.canvasResY / engine.canvasResX * w;
			}

			if (engine.autoResizeLimitToResolution) {
				w = Math.min(w, engine.canvasResX);
				h = Math.min(h, engine.canvasResY);
			}

			engine.arena.style.top = "50%";
			engine.arena.style.left = "50%";
			engine.arena.style.marginTop = -h / 2 + "px";
			engine.arena.style.marginLeft = -w / 2 + "px";
			engine.arena.style.height = h + "px";
			engine.arena.style.width = w + "px";
		};
		
		resize();
		window.addEventListener('resize', resize, false);
		window.addEventListener('load', resize, false);
	}

	// If JsEngine functions are not loaded, load them
	if (typeof jseCreateClass === "undefined") {
		req = new XMLHttpRequest();
		req.open('GET', this.enginePath + '/jseFunctions.js', false);
		req.send();
		eval(req.responseText);
	}

	// If Javascript Extensions has not been loaded, load them
	if (typeof Array.prototype.getElementByPropertyValue === "undefined") {
		jseSyncLoad(this.enginePath + '/jseExtensions.js');
	}

	// Load global vars
	if (typeof KEY_UP === "undefined") {
		jseSyncLoad(this.enginePath + '/jseGlobals.js');
	}

	// If the loader class does not exist, load it
	if (typeof Loader === "undefined") {
		jseSyncLoad(this.enginePath + '/classes/Loader.js');
	}

	// Create loader object
	loader = new Loader();
	
	// Load engine classes
	loader.loadClasses([
		this.enginePath + '/classes/Animation.js',
		this.enginePath + '/classes/Animator.js',
		this.enginePath + '/classes/View.js',
		this.enginePath + '/classes/Director.js',
		this.enginePath + '/classes/Sprite.js',
		this.enginePath + '/classes/Collidable.js',
		this.enginePath + '/classes/TextBlock.js',
		this.enginePath + '/classes/GameObject.js',
		this.enginePath + '/classes/GravityObject.js',
		this.enginePath + '/classes/Keyboard.js',
		this.enginePath + '/classes/Mouse.js',
	]);

	gc = this.gameClassPath;
	loader.loadClasses([gc]);
	this.gameClassName = gc.match(/(\w*)\.\w+$/)[1];

	// Load themes
	this.defaultTheme = this.options.themes[0];
	loader.onthemesloaded = function () {
		engine.initialize();
	};
	loader.loadThemes(this.options.themes);
};

JsEngine.prototype.initialize = function () {
	var i, d, objectName, c, audioFormats, supportedFormats;

	// Make array for containing references to all game objects
	this.objectIndex = {};

	// Set variables required by the engine
	this.frames = 0;
	this.last = new Date().getTime();
	this.now = this.last;
	this.gameTime = 0;
	this.executingLoops = false;
	this.currentId = 0;
	this.drawing = 0;


	this.fps = 0;
	this.fpsCounter = 0;
	this.fpsSecCounter = 0;

	// Depth layers for drawing operations
	this.depth = [];

	// Arrays for update operations, an object can belong to both !
	this.loops = {};
	this.newLoop('eachFrame');
	this.defaultAnimationLoop = 'eachFrame';
	this.defaultActivityLoop = 'eachFrame';

	// Create the depths
	this.depthMap = [];
	lastIsManualRedrawed = -1;
	lastIsComposited = false;

	// Make main canvas
	this.mainCanvas = document.createElement("canvas");
	this.mainCanvas.setAttribute('style', "position: absolute;left: 0px;top: 0px;width: 100%;height: 100%");
	this.mainCanvas.width = this.canvasResX;
	this.mainCanvas.height = this.canvasResY;
	this.arena.appendChild(this.mainCanvas);

	// Create canvases for each depth and set the depth's main canvas, based on their composite- and manualRedraw settings
	for (i = 0; i < this.options.depths; i ++) {
		d = new View(i);
		d.manualRedraw = this.manualRedrawDepths.indexOf(i) !== -1;
		d.composited = this.compositedDepths.indexOf(i) !== -1;
		d.ownCanvas = this.makeCanvas();

		if (d.manualRedraw || d.composited) {
			d.ctx = d.ownCanvas.getContext('2d');
		}
		else {
			d.ctx = this.mainCanvas.getContext('2d');
		}
		this.depth.push(d);
	}

	// Disable right click inside arena
	this.arena.oncontextmenu = function () {
		return false;
	};

	// Create objects required by the engine
	keyboard = new Keyboard();
	mouse = new Mouse();
	animator = new Animator();

	// Create game object
	if (window[this.gameClassName] !== "undefined") {
		objectName = this.gameClassName.substr(0, 1).toLowerCase() + this.gameClassName.substr(1);
		eval(objectName + " = new " + this.gameClassName + '()');
	}
	else {
		console.log('No game class found');
		loader.hideOverlay();
	}
	engine.startMainLoop();
	console.log('JsEngine ready');
};

// Prepare canvas rendering
JsEngine.prototype.makeCanvas = function () {
	var c;

	c = document.createElement("canvas");
	c.width = this.canvasResX;
	c.height = this.canvasResY;

	return c;
};

// Function for converting between speed units
JsEngine.prototype.convertSpeed = function (speed, from, to) {
	if (speed === undefined) {throw new Error('Missing argument: speed'); }

	from = from !== undefined ? from : SPEED_PIXELS_PER_SECOND;
	to = to !== undefined ? to : SPEED_PIXELS_PER_FRAME;
	
	// Convert all formats to pixels per frame
	switch (from) {
	case SPEED_PIXELS_PER_SECOND:
		speed = speed * (engine.now - engine.last) / 1000
		break;
	case SPEED_PIXELS_PER_FRAME:
		break;
	}

	// Convert pixels per frame to the output format
	switch (to) {
	case SPEED_PIXELS_PER_SECOND:
		speed = speed / (engine.now - engine.last) * 1000
		break;
	case SPEED_PIXELS_PER_FRAME:
		break;
	}

	return speed;
}

// clearStage removes all traces of a game - session
JsEngine.prototype.clearStage = function () {
	// Clear all layers
	var depthId;

	for (depthId = 0; depthId < this.depth.length; depthId ++) {
		this.depth[depthId].remove();
	}
};

JsEngine.prototype.setDefaultTheme = function (themeName, enforce) {
	if (themeName === undefined) {throw new Error('Missing argument: themeName'); }
	if (loader.themes[themeName] === undefined) {throw new Error('Trying to set unexisting theme: '+themeName); }
	var i;

	enforce = enforce !== undefined ? enforce : false

	this.defaultTheme = themeName;

	i = this.depth.length;

	while (i --) {
		if (enforce) {
			this.depth[i].setTheme(undefined, enforce);
		}
		else {
			this.depth[i].applyToThisAndChildren(function () {
				if (this.refreshSource) {
					this.refreshSource();
				}
			});
		}
	}

	this.redraw(1);
};

JsEngine.prototype.newLoop = function (name, framesPerLoop, mask) {
	if (name === undefined) {throw new Error('Missing argument: object'); }

	mask = mask !== undefined  ?  mask : function () {return 1; };
	framesPerLoop = framesPerLoop !== undefined  ?  framesPerLoop : 1;

	this.loops[name] = {
		framesPerLoop: framesPerLoop,
		mask: mask,
		activitiesQueue: [],
		activities: [],
		animations: [],
		lastFrame: this.frames,
		last: this.now  ?  this.now : new Date().getTime(),
		time: 0,
		execTime: 0
	};
};

JsEngine.prototype.attachFunctionToLoop = function (caller, func, loop) {
	if (caller === undefined) {throw new Error('Missing argument: caller'); }
	if (func === undefined) {throw new Error('Missing argument: func'); }
	if (loop === undefined) {throw new Error('Missing argument: loop'); }

	this.loops[loop].activitiesQueue.push({
		object: caller,
		activity: func
	});
};

JsEngine.prototype.detachFunctionFromLoop = function (caller, func, loop) {
	if (caller === undefined) {throw new Error('Missing argument: caller'); }
	if (func === undefined) {throw new Error('Missing argument: func'); }
	if (loop === undefined) {throw new Error('Missing argument: loop'); }

	var removeArray, i, a;

	removeArray = [];
	for (i = 0; i < this.loops[loop].activities.length; i ++) {
		a = this.loops[loop].activities[i];

		if (a.object === caller && a.activity === func) {
			removeArray.push(this.loops[loop].activities.splice(i, 1));
		}
	}

	if (removeArray.length) {
		return removeArray;
	}
	else {
		return false;
	}
};

JsEngine.prototype.startMainLoop = function () {
	// Restart the now - last cycle
	this.last = new Date().getTime();
	this.now = this.last;

	// Start mainLoop
	this.loop = setInterval(function () {
		engine.mainLoop();
	}, this.loopSpeed);
};

JsEngine.prototype.stopMainLoop = function () {
	clearInterval(this.loop);
};

// The main loop
JsEngine.prototype.mainLoop = function () {
	var name, timer, loop, f, i;

	// Get the current time (for calculating movement based on the precise time change)
	this.now = new Date().getTime();

	this.executingLoops = true;
	this.frames ++;

	// Update animations that runs even if the game is paused
	animator.updateAllLoops(1);

	// Add queued activities to loops
	for (name in this.loops) {
		if (this.loops.hasOwnProperty(name)) {
			loop = this.loops[name];
			loop.activities = loop.activities.concat(loop.activitiesQueue);
			loop.activitiesQueue = [];
		}
	}

	// Do loops
	for (name in this.loops) {
		if (this.loops.hasOwnProperty(name)) {
			timer = new Date().getTime();
			loop = this.loops[name];

			if (!loop.mask() || this.frames % loop.framesPerLoop) {continue; }

			if (this.frames - loop.lastFrame === loop.framesPerLoop) {
				loop.time += this.now - loop.last;
			}

			loop.lastFrame = this.frames;
			loop.last = this.now;

			for (i = 0; i < loop.activities.length; i ++) {
				f = loop.activities[i];
				if (!f.activity) {
					console.log(f);
					continue;
				}
				f.activity.call(f.object);
			}
			loop.execTime = (new Date().getTime()) - timer;
		}
	}

	// Update the game time
	this.gameTime += this.now - this.last;

	this.executingLoops = false;

	// Set last loop time, for next loop
	this.lastLoopTime = this.now - this.last;
	this.last = this.now;

	// Draw game objects (asynchroneous)
	engine.redraw(0);

	// Count frames per second
	if (this.fpsMsCounter < 1000) {
		this.fpsCounter ++;
		this.fpsMsCounter += this.lastLoopTime;
	}
	else {
		this.fps = this.fpsCounter;
		this.fpsCounter = 0;
		this.fpsMsCounter = 0;
		/*if (this.fps < Math.floor(1000 / this.loopSpeed) - 1) {
			console.log(this.fps);
		}*/
	}
};

JsEngine.prototype.registerObject = function (obj, id) {
	if (obj === undefined) {throw new Error('Missing argument: obj'); }

	if (id === undefined) {
		this.currentId ++;
		id = "obj" + (this.currentId - 1);
	} else if (this.objectIndex[id] !== undefined) {
		throw new Error('Object id already taken: ' + id);
	}
	this.objectIndex[id] = obj;
	obj.id = id;
	return id;
};

// Function for redrawing the depths
JsEngine.prototype.redraw = function (drawManualRedrawDepths) {
	if (drawManualRedrawDepths === undefined) {throw new Error('Missing argument: manualRedrawDepths'); }
	var i, d, ctx;

	this.mainCanvas.getContext('2d').fillStyle = this.backgroundColor;
	this.mainCanvas.getContext('2d').fillRect(0, 0, this.canvasResX, this.canvasResY);
	for (i = 0; i < this.depth.length; i ++) {
		d = this.depth[i];

		if (d.manualRedraw || d.composited) {
			if (d.manualRedraw) {
				if (drawManualRedrawDepths) {
					d.ctx.clearRect(0, 0, this.canvasResX, this.canvasResY);
					d.drawChildren();
				}
			}
			else {
				d.ctx.clearRect(0, 0, this.canvasResX, this.canvasResY);
				d.drawChildren();
			}

			this.mainCanvas.getContext('2d').drawImage(d.ownCanvas, 0, 0, this.canvasResX, this.canvasResY);
		}
		else {
			d.drawChildren();
		}
	}
};