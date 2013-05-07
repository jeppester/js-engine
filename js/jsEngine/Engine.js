/**
 * Engine:
 * The main game engine class.
 * Responsible for depths, custom loops, the main loop, the main canvas, etc.
 */

/**
 * Creates a new jsEngine class
 *
 * @param {string} className The name of the new class
 * @param {mixed} inherits A class or an array of classes to inherit functions from (to actually extend an inherited class, run the class' constructor from inside the extending class)
 */
NewClass = function (className, inherits) {
	var i, inheritClass, newClass;

	if (!/^\w*$/.test(className)) {throw new Error("Invalid class name: " + className); }

	eval('window.' + className + ' = function () {this.' + className + '.apply(this, arguments); }');
	window[className].prototype[className] = function () {};

	newClass = window[className];
	newClass.prototype.className = className;
	newClass.prototype.inheritedClasses = [];

	function inherit(newClass, inheritClass) {
		var functionName;

		newClass.prototype.inheritedClasses.push(inheritClass);
		Array.prototype.push.apply(newClass.prototype.inheritedClasses, inheritClass.prototype.inheritedClasses);

		for (functionName in inheritClass.prototype) {
			if (typeof inheritClass.prototype[functionName] === "function") {
				newClass.prototype[functionName] = inheritClass.prototype[functionName];
			}
		}
	}

	if (inherits) {
		if (!Array.prototype.isPrototypeOf(inherits)) {throw new Error("Arguments inherits is not an array"); }

		for (i = 0; i < inherits.length; i ++) {
			inheritClass = inherits[i];
			inherit(newClass, inheritClass);
		}
	}
};

NewClass('Engine');

/**
 * The constructor for the Engine class.
 * 
 * @param {object} options An object containing key-value pairs that will be used as launch options for the engine.
 * The default options are:
 * <code>{
 * 	"arena": document.getElementById('arena'), // The element to use as game arena
 * 	"avoidSubPixelRendering": true, // If subpixelrendering should be avoided
 * 	"autoResize": true, // If the arena should autoresize to fit the window (or iframe)
 * 	"autoResizeLimitToResolution": true, // If the autoresizing should be limited to the game's resolution
 * 	"backgroundColor": "#FFF", // The color of the arena's background
 * 	"cachedSoundCopies": 5, // How many times sounds should be ducplicated to allow multiple playbacks
 * 	"canvasResX": 800, // The horizontal resolution to set for the game's main canvas
 * 	"canvasResY": 600, // The vertical resolution to set for the game's main canvas
 * 	"compositedDepths": [], // Id's of depth's for which compositing effects should be available
 * 	"disableRightClick": true, // If right clicks inside the arena should be disabled
 * 	"disableTouchScroll": true, // If touch scroll on tablets and phones should be disable
 * 	"drawBBoxes": false, // If Collidable object's bounding boxes should be drawn (good for debugging)
 * 	"drawMasks": false, // If Collidable object's masks should be drawn (good for debugging)
 * 	"enginePath": "js/jsEngine", // The path for the engine classes' directory
 * 	"gameClassPath": "js/Game.js", // The path for the game's main class
 * 	"manualRedrawDepths": [], // Id's of depth's which should not be automatically redrawn
 * 	"musicMuted": false, // If all music playback should be initially muted
 * 	"pauseOnBlur": true, // If the engine should pause when the browser window loses its focus
 * 	"soundsMuted": false, // If all sound effects should be initially muted
 * 	"themesPath": "themes", // The path to the themes-directory
 * 	"useRotatedBoundingBoxes": true, // If the engine should use rotated bounding boxes
 * }</code>
 */
Engine.prototype.Engine = function (options) {
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
	var copyOpt, audioFormats, i, opt, gc;

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
	this.preloadSounds = true;

	switch (this.host.browserEngine) {
	case 'Gecko':
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
	this.disableTouchScroll = true;

	this.soundsMuted = false;
	this.musicMuted = false;

	// Copy options to engine (except those which are only used for engine initialization)
	copyOpt = ['backgroundColor', 'disableTouchScroll', 'soundsMuted', 'musicMuted', 'cachedSoundCopies', 'avoidSubPixelRendering', 'arena', 'disableRightClick', 'useRotatedBoundingBoxes', 'pauseOnBlur', 'drawBBoxes', 'drawMasks', 'manualRedrawDepths', 'compositedDepths', 'canvasResX', 'canvasResY', 'autoResize', 'autoResizeLimitToResolution', 'enginePath', 'themesPath', 'gameClassPath'];
	for (i = 0; i < copyOpt.length; i ++) {
		opt = copyOpt[i];
		if (this.options[opt] !== undefined) {
			this[opt] = this.options[opt];
			delete this.options[opt];
		}
	}

	// Set style for arena
	this.arena.style.position = "absolute";
	this.arena.style.background = "#fff";

	// Make main canvas
	this.mainCanvas = document.createElement("canvas");
	this.mainCanvas.style.display = "block";
	this.mainCanvas.width = this.canvasResX;
	this.mainCanvas.height = this.canvasResY;
	this.arena.appendChild(this.mainCanvas);

	// If autoresize is set to true, set up autoresize
	if (this.autoResize) {
		this.autoResize = false;
		this.setAutoResize(true);
	}
	else {
		this.autoResize = true;
		this.setAutoResize(false);
	}

	// If disableTouchScroll is set to true, disable touch scroll
	if (this.disableTouchScroll) {
		document.addEventListener('touchmove', function (event) {
			event.preventDefault();
		}, false);
		document.addEventListener('touchstart', function (event) {
			event.preventDefault();
		}, false);
	}

	// If Javascript Extensions has not been loaded, load them
	if (typeof Array.prototype.getElementByPropertyValue === "undefined") {
		this.loadFiles(this.enginePath + '/jseExtensions.js');
	}

	// Load polyfills
	if (window.polyfillsLoaded === undefined) {
		this.loadFiles(this.enginePath + '/jsePolyfills.js');
	}

	// Load global vars
	if (typeof KEY_UP === "undefined") {
		this.loadFiles(this.enginePath + '/jseGlobals.js');
	}

	// If the loader class does not exist, load it
	if (typeof Loader === "undefined") {
		this.loadFiles(this.enginePath + '/classes/Loader.js');
	}

	// Create loader object
	loader = new Loader();

	// Load engine classes
	loader.loadClasses([
		this.enginePath + '/classes/Animatable.js',
		this.enginePath + '/classes/Animator.js',
		this.enginePath + '/classes/View.js',
		this.enginePath + '/classes/Vector.js',
		this.enginePath + '/classes/Line.js',
		this.enginePath + '/classes/Polygon.js',
		this.enginePath + '/classes/Rectangle.js',
		this.enginePath + '/classes/Circle.js',
		this.enginePath + '/classes/CustomLoop.js',
		this.enginePath + '/classes/Sprite.js',
		this.enginePath + '/classes/Collidable.js',
		this.enginePath + '/classes/TextBlock.js',
		this.enginePath + '/classes/GameObject.js',
		this.enginePath + '/classes/Keyboard.js',
		this.enginePath + '/classes/Pointer.js',
		this.enginePath + '/classes/Sound.js',
		this.enginePath + '/classes/Music.js'
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
	this.options.depths = this.options.depths !== undefined ? this.options.depths : 1;
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
	pointer = new Pointer();
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

	if (this.onStarted) {
		this.onStarted();
	}
};

/**
 * Enables or disables canvas autoresize.
 *
 * @param {boolean} enable Decides whether autoresize should be enabled or disabled
 */
Engine.prototype.setAutoResize = function (enable) {
	if (enable && !this.autoResize) {
		this.autoResize = true;
		this.autoResizeCanvas();
		window.addEventListener('resize', engine.autoResizeCanvas, false);
		window.addEventListener('load', engine.autoResizeCanvas, false);
	}
	else if (!enable && this.autoResize) {
		this.autoResize = false;
		window.removeEventListener('resize', engine.autoResizeCanvas, false);
		window.removeEventListener('load', engine.autoResizeCanvas, false);

		// Reset canvas size
		this.arena.style.top = "50%";
		this.arena.style.left = "50%";
		this.arena.style.marginLeft = -this.canvasResX / 2 + "px";
		this.arena.style.marginTop = -this.canvasResY / 2 + "px";
		this.mainCanvas.style.width = this.canvasResX + "px";
		this.mainCanvas.style.height = this.canvasResY + "px";
	}
};

/**
 * Function for resizing the canvas. Not used if engine option "autoResizeCanvas" is false.
 * 
 * @private
 */
Engine.prototype.autoResizeCanvas = function () {
	if (this !== engine) {engine.autoResizeCanvas(); return; }

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
	if (speed.implements(Vector)) {
		return new Vector(this.convertSpeed(speed.x, from, to), this.convertSpeed(speed.y, from, to));
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

	while (i--) {
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
	this.running = true;

	// Start mainLoop
	engine.mainLoop();
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

	// Draw game objects
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

	// Schedule the loop to run again
	requestAnimationFrame(function (time) {
		engine.mainLoop(time);
	});
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
 * Loads and executes one or multiple JavaScript file synchroneously
 * 
 * @param {mixed} filePaths A file path (string), or an array of file paths to load and execute as JavaScript
 */
Engine.prototype.loadFiles = function (filePaths) {
	var i, req, codeString;

	if (typeof filePaths === "string") {
		filePaths = [filePaths];
	}

	for (i = 0; i < filePaths.length; i ++) {
		// console.log('Loading: ' + filePaths[i])
		req = new XMLHttpRequest();
		req.open('GET', filePaths[i], false);
		req.send();
		codeString = req.responseText + "\n//@ sourceURL=/" + filePaths[i];
		try {
			eval.call(window, codeString);
		}
		catch (e) {
			throw new Error('Failed loading "' + filePaths[i]);
		}
	}

	if (window.loadedFiles === undefined) {window.loadedFiles = []; }
	window.loadedFiles = window.loadedFiles.concat(filePaths);
};

/**
 * Uses an http request to fetch the data from a file and runs a callback function with the file data as first parameter
 * 
 * @param {string} url A URL path for the file to load
 * @param {mixed} params A parameter string or an object to JSON-stringify and use as URL parameter (will be send as "data=[JSON String]")
 * @param {boolean} async Whether or not the request should be synchroneous.
 * @param {function} callback A callback function to run when the request has finished
 * @param {object} caller An object to call the callback function as.
 */
Engine.prototype.ajaxRequest = function (url, params, async, callback, caller) {
	if (url === undefined) {throw new Error('Missing argument: url'); }
	if (callback === undefined) {throw new Error('Missing argument: callback'); }

	params = params !== undefined ? params : '';
	async = async !== undefined ? async : true;
	caller = caller !== undefined ? caller : window;

	// If params is not a string, json-stringify it
	if (typeof params !== 'string') {
		params = 'data=' + JSON.stringify(params);
	}


	var req;

	req = new XMLHttpRequest();

	if (async) {
		req.onreadystatechange = function () {
			if (req.readyState === 4 && req.status === 200) {
				callback.call(caller, req.responseText);
			}
		};
	}

	req.open('POST', url, async);
	req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	req.send(params);

	if (!async) {
		if (req.readyState === 4 && req.status === 200) {
			callback(req.responseText);
		}
		else {
			throw new Error('XMLHttpRequest failed: ' + url);
		}
	}
};

/**
 * Removes an object from all engine loops, views, and from the object index
 *
 * param {object} obj The object to remove
 */
Engine.prototype.purge = function (obj) {
	var name, loop, i;

	if (obj === undefined) {throw new Error(obj); }
	if (typeof obj === "string") {
		obj = this.objectIndex[obj];
	}

	// Delete all references from loops
	for (name in this.loops) {
		if (this.loops.hasOwnProperty(name)) {
			loop = this.loops[name];

			// From activities
			i = loop.activities.length;
			while (i--) {
				if (obj === loop.activities[i].object) {
					loop.activities.splice(i, 1);
				}
			}

			// From activities queue
			i = loop.activitiesQueue.length;
			while (i--) {
				if (obj === loop.activitiesQueue[i].object) {
					loop.activitiesQueue.splice(i, 1);
				}
			}

			// From animations
			i = loop.animations.length;
			while (i--) {
				if (obj === loop.animations[i].obj) {
					loop.animations.splice(i, 1);
				}
			}
		}
	}

	// Delete from viewlist
	if (obj.parent) {
		obj.parent.removeChildren(obj);
	}

	delete this.objectIndex[obj.id];
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

/**
 * Downloads a screen dump of the arena. Very usable for creating game screenshots from browser consoles.
 */
Engine.prototype.dumpScreen = function () {
	var dataString, a;

	dataString = this.mainCanvas.toDataURL().replace(/image\/png/, 'image/octet-stream');

	a = document.createElement('a');
	a.href = dataString;
	a.setAttribute('download', 'screendump.png');
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a, document.body);
};