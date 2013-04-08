/**
 * Engine:
 * The main game engine object.
 * Responsible for depths, custom loops, the main loop, the main canvas, etc.
 */

Engine = function (options) {
	this.engine(options);
};

/**
 * The constructor for the Engine object.
 * @param {object} options An object containing key-value pairs that will be used as launch options for the engine.
 */
Engine.prototype.engine = function (options) {
	this.options = options ? options: {};
	this.load();
};

/**
 * Load all files and functions, that are needed before the engine can start.
 * 
 * @private
 */
Engine.prototype.load = function () {
	// Define all used vars
	var copyOpt, audioFormats, i, opt, req, gc;

	// Set global engine variable
	engine = this;

	// Detect host information
	this.host = {
		hasTouch: 'ontouchstart' in document,
		hasMouse: false,
		browserEngine: 'Unknown',
		device: 'Unknown',
		supportedAudio: []
	};
	if (navigator.userAgent.match(/Firefox/)) {
		this.host.browserEngine = 'Gecko';
	} else if (navigator.userAgent.match(/AppleWebKit/)) {
		this.host.browserEngine = 'WebKit';

		if (navigator.userAgent.match(/iPad|iPhone/)) {
			this.host.device = 'iDevice';
		} else if (navigator.userAgent.match(/Android/)) {
			this.host.device = 'Android';
		}
	} else if (navigator.userAgent.match(/Trident/)) {
		this.host.browserEngine = 'Trident';
	}
	audioFormats = ['mp3', 'ogg', 'wav'];
	for (i = 0; i < audioFormats.length; i++) {
		if (document.createElement('audio').canPlayType('audio/' + audioFormats[i])) {
			this.host.supportedAudio.push(audioFormats[i]);
		}
	}

	// Load default options
	// Optimize default options for each browser
	this.avoidSubPixelRendering = true;
	this.loopSpeed = 10;
	this.preloadSounds = true;

	switch (this.host.browserEngine) {
	case 'Gecko':
		// Firefox usually performs very bad with a low loopspeed
		this.loopSpeed = 20;
		break;
	case 'WebKit':
		// WebKit renders subpixels much better (and faster) than the other browsers
		this.avoidSubPixelRendering = false;
		break;
	case 'Trident':
		break;
	}

	switch (this.host.device) {
	case 'iDevice':
		// iDevices cannot preload sounds (which is utter crap), so disable preloading to make the engine load without sounds
		this.preloadSounds = false;
		break;
	case 'Android':
		this.avoidSubPixelRendering = true;
		break;
	}
	this.running = false;
	this.manualRedrawDepths = [];
	this.canvasResX = 800;
	this.canvasResY = 600;
	this.enginePath = 'js/jsEngine';
	this.themesPath = 'themes';
	this.drawBBoxes = false;
	this.drawMasks = false;
	this.useRotatedBoundingBoxes = true;
	this.pauseOnBlur = true;
	this.disableRightClick = true;
	this.arena = document.getElementById('arena');
	this.autoResize = true;
	this.autoResizeLimitToResolution = true;
	this.compositedDepths = [];
	this.cachedSoundCopies = 5;
	this.gameClassPath = "js/Game.js";
	this.backgroundColor = "#FFF";
	this.timeFactor = 1;

	this.soundsMuted = false;
	this.musicMuted = false;

	// Copy options to engine (except those which are only used for engine initialization)
	copyOpt = ['backgroundColor', 'soundsMuted', 'musicMuted', 'cacheSounds', 'cachedSoundCopies', 'avoidSubPixelRendering', 'arena', 'disableRightClick', 'useRotatedBoundingBoxes', 'pauseOnBlur', 'drawBBoxes', 'drawMasks', 'loopSpeed', 'loopsPerColCheck', 'manualRedrawDepths', 'compositedDepths', 'canvasResX', 'canvasResY', 'autoResize', 'autoResizeLimitToResolution', 'enginePath', 'themesPath', 'gameClassPath'];
	for (i = 0; i < copyOpt.length; i ++) {
		opt = copyOpt[i];
		if (this.options[opt] !== undefined) {
			this[opt] = this.options[opt];
			delete this.options[opt];
		}
	}

	// Make main canvas
	this.mainCanvas = document.createElement("canvas");
	this.mainCanvas.style.display = "block";
	this.mainCanvas.width = this.canvasResX;
	this.mainCanvas.height = this.canvasResY;
	this.arena.appendChild(this.mainCanvas);

	// If autoresize is set to true, set up autoresize
	if (this.autoResize) {
		this.autoResizeCanvas();
		window.addEventListener('resize', function () {engine.autoResizeCanvas(); }, false);
		window.addEventListener('load', function () {engine.autoResizeCanvas(); }, false);
	}

	// If jsEngine functions are not loaded, load them
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
		jseSyncLoad(this.enginePath + '/objects/Loader.js');
	}

	// Create loader object
	loader = new Loader();

	// Load engine classes
	loader.loadObjects([
		this.enginePath + '/objects/Animatable.js',
		this.enginePath + '/objects/Animator.js',
		this.enginePath + '/objects/Vector2D.js',
		this.enginePath + '/objects/Line.js',
		this.enginePath + '/objects/Polygon.js',
		this.enginePath + '/objects/Rectangle.js',
		this.enginePath + '/objects/View.js',
		this.enginePath + '/objects/CustomLoop.js',
		this.enginePath + '/objects/Sprite.js',
		this.enginePath + '/objects/Collidable.js',
		this.enginePath + '/objects/TextBlock.js',
		this.enginePath + '/objects/GameObject.js',
		this.enginePath + '/objects/Keyboard.js',
		this.enginePath + '/objects/Mouse.js',
		this.enginePath + '/objects/Sound.js',
		this.enginePath + '/objects/Music.js'
	]);

	gc = this.gameClassPath;
	loader.loadObjects([gc]);
	this.gameClassName = gc.match(/(\w*)\.\w+$/)[1];

	// Load themes
	this.defaultTheme = this.options.themes[0];
	loader.onthemesloaded = function () {
		engine.initialize();
	};
	loader.loadThemes(this.options.themes);
};

/**
 * Starts the engine
 * 
 * @private
 */
Engine.prototype.initialize = function () {
	var i, d, objectName;

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
	this.loops = {};

	this.fps = 0;
	this.fpsCounter = 0;
	this.fpsSecCounter = 0;

	// Depth layers for drawing operations
	this.depth = [];

	// Setup default loop
	this.addLoop('eachFrame', new CustomLoop());
	this.defaultAnimationLoop = 'eachFrame';
	this.defaultActivityLoop = 'eachFrame';

	// Create the depths
	this.depthMap = [];

	// Create canvases for each depth and set the depth's main canvas, based on their composite- and manualRedraw settings
	for (i = 0; i < this.options.depths; i ++) {
		d = new View();
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
	if (this.disableRightClick) {
		this.arena.oncontextmenu = function () {
			return false;
		};
	}

	// Create objects required by the engine
	keyboard = new Keyboard();
	mouse = new Mouse();
	animator = new Animator();

	// Set listeners for pausing the engine when the window looses focus (if pauseOnBlur is true)
	if (this.pauseOnBlur) {
		window.addEventListener('blur', function () {
			engine.stopMainLoop();
		});
		window.addEventListener('focus', function () {
			engine.startMainLoop();
		});
	}

	// Create game object
	if (window[this.gameClassName] !== "undefined") {
		objectName = this.gameClassName.substr(0, 1).toLowerCase() + this.gameClassName.substr(1);
		eval(objectName + " = new " + this.gameClassName + '()');
	}
	else {
		console.log('No game class found');
		loader.hideOverlay();
	}

	this.startMainLoop();

	console.log('jsEngine started');
};

/**
 * Function for resizing the canvas. Not used if engine option "autoResizeCanvas" is false.
 * 
 * @private
 */
Engine.prototype.autoResizeCanvas = function () {
	var h, w, windowWH, gameWH;

	// Check if the window is wider og heigher than the game's canvas
	windowWH = window.innerWidth / window.innerHeight;
	gameWH = this.canvasResX / this.canvasResY;

	if (windowWH > gameWH) {
		h = window.innerHeight;
		w = this.canvasResX / this.canvasResY * h;
	} else {
		w = window.innerWidth;
		h = this.canvasResY / this.canvasResX * w;
	}

	if (this.autoResizeLimitToResolution) {
		w = Math.min(w, this.canvasResX);
		h = Math.min(h, this.canvasResY);
	}

	this.arena.style.top = "50%";
	this.arena.style.left = "50%";
	this.arena.style.marginTop = -h / 2 + "px";
	this.arena.style.marginLeft = -w / 2 + "px";
	this.mainCanvas.style.height = h + "px";
	this.mainCanvas.style.width = w + "px";
};

/**
 * Function for creating canvases for the engine depths.
 * 
 * @private
 * @return {object} The created canvas
 */
Engine.prototype.makeCanvas = function () {
	var c;

	c = document.createElement("canvas");
	c.width = this.canvasResX;
	c.height = this.canvasResY;

	return c;
};

/**
 * Function for converting between speed units
 * 
 * @param {number} speed The value to convert
 * @param {unit} from The unit to convert from. Can be SPEED_PIXELS_PER_SECOND or SPEED_PIXELS_PER_FRAME
 * @param {unit} to The unit to convert to. Can be SPEED_PIXELS_PER_SECOND or SPEED_PIXELS_PER_FRAME
 * @return {number} The resulting value of the conversion
 */
Engine.prototype.convertSpeed = function (speed, from, to) {
	if (speed === undefined) {throw new Error('Missing argument: speed'); }
	if (speed.implements(Vector2D)) {
		return new Vector2D(this.convertSpeed(speed.x, from, to), this.convertSpeed(speed.y, from, to));
	}

	from = from !== undefined ? from : SPEED_PIXELS_PER_SECOND;
	to = to !== undefined ? to : SPEED_PIXELS_PER_FRAME;

	// Convert all formats to pixels per frame
	switch (from) {
	case SPEED_PIXELS_PER_SECOND:
		speed = speed * this.timeIncrease / 1000;
		break;
	case SPEED_PIXELS_PER_FRAME:
		break;
	}

	// Convert pixels per frame to the output format
	switch (to) {
	case SPEED_PIXELS_PER_SECOND:
		speed = speed / this.timeIncrease * 1000;
		break;
	case SPEED_PIXELS_PER_FRAME:
		break;
	}

	return speed;
};

/**
 * Removes all objects from the stage
 */
Engine.prototype.clearStage = function () {
	// Clear all layers
	var depthId;

	for (depthId = 0; depthId < this.depth.length; depthId ++) {
		this.depth[depthId].removeAllChildren();
	}
};

/**
 * Sets the engine's targetted loopspeed.
 * 
 * @param {number} loopSpeed The loopspeed to set for the engine
 */
Engine.prototype.setLoopSpeed = function (loopSpeed) {
	if (loopSpeed === undefined) {throw new Error('Missing argument: loopSpeed'); }

	this.loopSpeed = loopSpeed;
};

/**
 * Toggles if all sound effects should be muted.
 * 
 * @param {boolean} muted Wether of not the sound effects should be muted
 */
Engine.prototype.setSoundsMuted = function (muted) {
	muted = muted !== undefined ? muted : true;

	// If muting, check all sounds whether they are being played, if so stop the playback
	if (muted) {
		loader.getAllSounds().forEach(function () {
			this.stopAll();
		});
	}

	this.soundsMuted = muted;
};

/**
 * Toggles if all music should be muted.
 * 
 * @param {boolean} muted Wether of not the music should be muted
 */
Engine.prototype.setMusicMuted = function (muted) {
	muted = muted !== undefined ? muted : true;

	// If muting, check all sounds whether they are being played, if so stop the playback
	if (muted) {
		loader.getAllMusic().forEach(function () {
			this.stop();
		});
	}

	this.musicMuted = muted;
};

/**
 * Sets the default theme for the engine objects
 * 
 * @param {string} themeName A string representing the name of the theme
 * @param {boolean} enforce Whether or not the enforce the theme on objects for which another theme has already been set
 */
Engine.prototype.setDefaultTheme = function (themeName, enforce) {
	if (themeName === undefined) {throw new Error('Missing argument: themeName'); }
	if (loader.themes[themeName] === undefined) {throw new Error('Trying to set unexisting theme: ' + themeName); }
	var i, refreshSource;

	enforce = enforce !== undefined ? enforce : false;

	this.defaultTheme = themeName;

	i = this.depth.length;

	refreshSource = function () {
		if (this.refreshSource) {
			this.refreshSource();
		}
	};

	while (i --) {
		if (enforce) {
			this.depth[i].setTheme(undefined, enforce);
		}
		else {
			this.depth[i].applyToThisAndChildren(refreshSource);
		}
	}

	this.redraw(1);
};

/**
 * Adds a custom loop to the engine.
 * After being added, the loop will be executed in each frame.
 * 
 * @param {string} name The name the use for the custom loop within the engine. When added the loop can be accessed with: engine.loops[name]
 * @param {object} loop The loop to add
 */
Engine.prototype.addLoop = function (name, loop) {
	if (loop === undefined) {throw new Error('Missing argument: loop'); }
	if (name === undefined) {throw new Error('Missing argument: name'); }

	this.loops[name] = loop;
};

/**
 * Removes a custom loop from the engine.
 * 
 * @param {string} name The name that the custom loop has been added as
 */
Engine.prototype.removeLoop = function (name) {
	if (name === undefined) {throw new Error('Missing argument: name'); }

	delete this.loops[name];
};

/**
 * Starts the engine's main loop
 */
Engine.prototype.startMainLoop = function () {
	if (this.running) {return; }

	// Restart the now - last cycle
	this.last = new Date().getTime();
	this.now = this.last;
	this.running = true;

	// Start mainLoop
	this.loop = setTimeout(function () {
		engine.mainLoop();
	}, this.loopSpeed);
};

/**
 * Stops the engine's main loop
 */
Engine.prototype.stopMainLoop = function () {
	if (!this.running) {return; }
	this.running = false;
};

/**
 * The engine's main loop function (should not be called manually)
 * 
 * @private
 */
Engine.prototype.mainLoop = function () {
	var name;

	if (!this.running) {return; }

	// Get the current time (for calculating movement based on the precise time change)
	this.now = new Date().getTime();
	this.timeIncrease = (this.now - this.last) * this.timeFactor;

	this.executingLoops = true;
	this.frames ++;

	// Update animations
	animator.updateAllLoops();

	// Do loops
	for (name in this.loops) {
		if (this.loops.hasOwnProperty(name)) {
			this.loops[name].execute();
		}
	}

	// Update the game time
	this.gameTime += this.timeIncrease;

	this.executingLoops = false;

	// Set last loop time, for next loop
	this.lastLoopTime = this.now - this.last;
	this.last = this.now;

	// Draw game objects (asynchroneous)
	this.redraw(0);

	// Count frames per second
	if (this.fpsMsCounter < 1000) {
		this.fpsCounter ++;
		this.fpsMsCounter += this.lastLoopTime;
	}
	else {
		this.fps = this.fpsCounter;
		this.fpsCounter = 0;
		this.fpsMsCounter = 0;
	}

	// Schedule next execution
	this.loop = setTimeout(function () {
		engine.mainLoop();
	}, this.loopSpeed);
};

/**
 * Sets the horisontal resolution of the main canvas
 * 
 * @param {number} res The new horisontal resolution
 */
Engine.prototype.setCanvasResX = function (res) {
	this.mainCanvas.width = res;
	this.canvasResX = res;

	if (this.autoResize) {
		this.autoResizeCanvas();
	}
};

/**
 * Sets the vertical resolution of the main canvas
 * 
 * @param {number} res The new vertical resolution
 */
Engine.prototype.setCanvasResY = function (res) {
	this.mainCanvas.height = res;
	this.canvasResY = res;
	if (this.autoResize) {
		this.autoResizeCanvas();
	}
};

/**
 * Registers an object to the engine. This will give the object an id which can be used for accessing it at a later time.
 * Sprites, TextBlock and objects inheriting those objects, are automatically registered when created.
 * 
 * @param {object} obj The object to register in the engine
 * @param {string} id A string with the desired id
 * @return {string} The registered id
 */
Engine.prototype.registerObject = function (obj, id) {
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

/**
 * Redraws all automatically redrawn depths (will be called by the engine), or all manually redrawn depths.
 * 
 * @param {boolean} drawManualRedrawDepths Whether or not the manually redrawn depths should be drawn instead of the automaticaly redrawn depths
 */
Engine.prototype.redraw = function (drawManualRedrawDepths) {
	if (drawManualRedrawDepths === undefined) {throw new Error('Missing argument: manualRedrawDepths'); }
	var i, d;

	this.mainCanvas.getContext('2d').fillStyle = this.backgroundColor;
	this.mainCanvas.getContext('2d').fillRect(0, 0, this.canvasResX, this.canvasResY);
	for (i = 0; i < this.depth.length; i ++) {
		d = this.depth[i];

		if (d.manualRedraw || d.composited) {
			if (d.manualRedraw) {
				if (drawManualRedrawDepths) {
					d.ctx.clearRect(0, 0, this.canvasResX, this.canvasResY);
					d.drawChildren(d.ctx);
				}
			}
			else {
				d.ctx.clearRect(0, 0, this.canvasResX, this.canvasResY);
				d.drawChildren(d.ctx);
			}

			this.mainCanvas.getContext('2d').drawImage(d.ownCanvas, 0, 0, this.canvasResX, this.canvasResY);
		}
		else {
			d.drawChildren(d.ctx);
		}
	}
};