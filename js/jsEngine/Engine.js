/** For making the engine var unreachable **/
/*(function () {
var engine, loader, pointer, keyboard;/**/

/**
 * Creates a new jsEngine class
 *
 * @param {string} className The name of the new class
 * @param {Class|Class[]|Object} [inherits] A class or an array of classes to inherit functions from (to actually extend an inherited class, run the class' constructor from inside the extending class)
 * @param {Object} functions A map of functions to add to the new class, functions can also be added by using [Class name].prototype.[Function name] = function () {}
 */
function Class(className, inherits, functions) {
	var name, constructor, str, i, ii, inheritClass, newClass, propName;

    // Check if the class is inside a name space
    name = className.split('.');
    constructor = name[name.length - 1];

    // Create name space if missing
    for (i = 0; i < name.length - 1; i++) {
        // Create eval string
        str = name.slice(0, i - 1).join('.');
        if (eval('window.' + str) === undefined) {
            eval(str + ' = {}');
        }
    }

	// Check if inherits can be used as argument, otherwise inherits will be used as the properties argument
	if (inherits !== undefined && !Array.prototype.isPrototypeOf(inherits) && inherits.prototype === undefined) {
		functions = inherits;
		inherits = undefined;
	}

    eval('\
    ' + className + ' = function () {\
        this.'+ name[name.length - 1] +'.apply(this, arguments);\
    }');

	newClass = eval('window.' + className);

    newClass.prototype[constructor] = function () {};
    newClass.prototype.className = className;
    newClass.prototype.inheritedClasses = [];

	function inherit(newClass, inheritClass) {
		var functionName;

		newClass.prototype.inheritedClasses.push(inheritClass);
		Array.prototype.push.apply(newClass.prototype.inheritedClasses, inheritClass.prototype.inheritedClasses);

		for (functionName in inheritClass.prototype) {
            if (inheritClass.prototype.hasOwnProperty(functionName)) {
                if (typeof inheritClass.prototype[functionName] === "function") {
                    newClass.prototype[functionName] = inheritClass.prototype[functionName];
                }
            }
        }
    }
	// Inherit functions

    if (inherits) {
        if (!Array.prototype.isPrototypeOf(inherits)) {throw new Error("Arguments inherits is not an array"); }

        for (i = 0; i < inherits.length; i ++) {
            inheritClass = inherits[i];
            inherit(newClass, inheritClass);
        }
    }
	// Define functions and properties

    for (propName in functions) {
        if (functions.hasOwnProperty(propName)) {
            newClass.prototype[propName] = functions[propName];
        }
	}
};

new Class('Engine', {
	/**
	 * The constructor for the Engine class.
     *
     * @name Engine
     * @class The main game engine class.
     *        Responsible for the main loop, the main canvas, etc.
     *
     * @property {boolean} running Whether or not the engine is currently running
     * @property {int} canvasResX The main canvas horizontal resolution
     * @property {int} canvasResY The main canvas vertical resolution
     * @property {string} enginePath The url to jsEngine's source folder
     * @property {boolean} focusOnLoad If the engine should focus itself when loaded
     * @property {string} themesPath The url to jsEngine's theme folder
     * @property {boolean} drawBoundingBoxes Whether or not the bounding boxes of all collidable objects are drawn
     * @property {boolean} drawMasks Whether or not the masks of all collidable objects are drawn
     * @property {boolean} pauseOnBlur Whether or the engine will pause itself when the window is blurred
     * @property {boolean} disableRightClick Whether or not right click context menu is disabled inside the main canvas
     * @property {HTMLElement} arena The HTML element to use as parent to the main canvas
     * @property {boolean} autoResize Whether or not the arena will autoresize itself to fit the window
     * @property {boolean} autoResizeLimitToResolution Whether or not the arena should not autoresize itself to be bigger than the main canvas' resolution
     * @property {int} cachedSoundCopies The number of copies each sound object caches of it's source to enable multiple playbacks
     * @property {string} gameClassPath The URL of the game's main class
     * @property {string} loadText The text shown while loading the engine
     * @property {string} backgroundColor A CSS color string which is used as the background color of the main canvas
     * @property {number} timeFactor The factor to multiply the time increase with. A factor of 2 will make everything happen with double speed
     * @property {boolean} disableTouchScroll Whether or not touch scroll has been disabled
     * @property {Camera[]} cameras An array containing the engine's cameras
     * @property {int} defaultCollisionResolution The collision resolution set for all created collidable objects
     * @property {boolean} soundsMuted Whether or not all sound effects are currently muted
     * @property {boolean} musicMuted Whether or not all music is currently muted
     * @property {boolean} debug Whether or not debug information is collected (fps, draw times)
     *
	 * @param {object} options An object containing key-value pairs that will be used as launch options for the engine.
	 *                 The default options are:
	 *                 <code>{
	 * 	                "arena": document.getElementById('arena'), // The element to use as game arena
	 * 	                "avoidSubPixelRendering": true, // If subpixelrendering should be avoided
	 * 	                "autoResize": true, // If the arena should autoresize to fit the window (or iframe)
	 * 	                "autoResizeLimitToResolution": true, // If the autoresizing should be limited to the game's resolution
	 * 	                "backgroundColor": "#FFF", // The color of the arena's background
	 * 	                "cachedSoundCopies": 5, // How many times sounds should be duplicated to allow multiple playbacks
	 * 	                "canvasResX": 800, // The horizontal resolution to set for the game's main canvas
	 * 	                "canvasResY": 600, // The vertical resolution to set for the game's main canvas
	 * 	                "defaultCollisionResolution": 6, // Res. of collision checking, by default every 6th px is checked
	 * 	                "disableRightClick": true, // If right clicks inside the arena should be disabled
	 * 	                "disableTouchScroll": true, // If touch scroll on tablets and phones should be disable
	 * 	                "drawBoundingBoxes": false, // If Collidable object's bounding boxes should be drawn
	 * 	                "drawMasks": false, // If Collidable object's masks should be drawn
	 * 	                "enginePath": "js/jsEngine", // The path for the engine classes' directory
	 * 	                "focusOnLoad": true, // Whether or not to focus the engine's window when the engine is ready
	 * 	                "gameClassPath": "js/Game.js", // The path for the game's main class
	 * 	                "loadText": 'jsEngine loading...'
	 * 	                "musicMuted": false, // If all music playback should be initially muted
	 * 	                "pauseOnBlur": true, // If the engine should pause when the browser window loses its focus
	 * 	                "soundsMuted": false, // If all sound effects should be initially muted
	 * 	                "themesPath": "themes", // The path to the themes-directory
	 * 	                "debug": false, // Whether or not debug information should be collected (fps, draw times)
	 *                 }</code>
	 */
	Engine: function (options) {
        // Set global engine variable
        /** @global */
        engine = this;

		this.options = options ? options: {};
		this.load();
	},
    /** @scope Engine */

	/**
	 * Load all files and functions, that are needed before the engine can start.
	 *
	 * @private
	 */
	load: function () {
		// Define all used vars
		var copyOpt, audioFormats, i, opt, gc;

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

		switch (this.host.device) {
		case 'iDevice':
			// iDevices cannot preload sounds (which is utter crap), so disable preloading to make the engine load without sounds
			this.preloadSounds = false;
			break;
		}

		this.running = false;
		this.canvasResX = 800;
		this.canvasResY = 600;
		this.enginePath = 'js/jsEngine';
		this.focusOnLoad = true;
		this.themesPath = 'themes';
		this.drawBoundingBoxes = false;
		this.drawMasks = false;
		this.pauseOnBlur = true;
		this.disableRightClick = true;
		this.arena = document.getElementById('arena');
		this.autoResize = true;
		this.autoResizeLimitToResolution = true;
		this.cachedSoundCopies = 5;
		this.gameClassPath = "js/Game.js";
		this.loadText = "jsEngine loading...";
		this.backgroundColor = "#FFF";
		this.timeFactor = 1;
		this.disableTouchScroll = true;
		this.cameras = [];
		this.defaultCollisionResolution = 6;
        this.debug = false;
        this.redrawObjects = [];

		this.soundsMuted = false;
		this.musicMuted = false;

		// Copy options to engine (except those which are only used for engine initialization)
		copyOpt = ['backgroundColor', 'debug', 'disableTouchScroll', 'defaultCollisionResolution', 'focusOnLoad', 'loadText', 'soundsMuted', 'musicMuted', 'cachedSoundCopies', 'avoidSubPixelRendering', 'arena', 'disableRightClick', 'pauseOnBlur', 'drawBoundingBoxes', 'drawMasks', 'canvasResX', 'canvasResY', 'autoResize', 'autoResizeLimitToResolution', 'enginePath', 'themesPath', 'gameClassPath'];
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
		this.arena.style.userSelect = "none";
		this.arena.style.webkitUserSelect = "none";
		this.arena.style.MozUserSelect = "none";

		// Make main canvas
		this.mainCanvas = document.createElement("canvas");
		this.mainCanvas.style.display = "block";
		this.mainCanvas.width = this.canvasResX;
		this.mainCanvas.height = this.canvasResY;
		this.mainCtx = this.mainCanvas.getContext('2d');
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
			this.loadFiles(this.enginePath + '/Extension/Array.js');
		}
        if (typeof Object.prototype.importProperties === "undefined") {
            this.loadFiles(this.enginePath + '/Extension/Object.js');
        }

		// Load polyfills
		if (window.requestAnimationFrame === undefined) {
			this.loadFiles(this.enginePath + '/Polyfill/requestAnimationFrame.js');
		}

		// Load global vars
		if (typeof KEY_UP === "undefined") {
			this.loadFiles(this.enginePath + '/Globals.js');
		}

		// If the loader class does not exist, load it
		if (typeof Loader === "undefined") {
			this.loadFiles(this.enginePath + '/Engine/Loader.js');
		}

		// Create loader object
        /** @global */
		loader = new Engine.Loader();

		// Load engine classes
		loader.loadClasses([
			this.enginePath + '/Lib/Animatable.js',
			this.enginePath + '/Math/Vector.js',
            this.enginePath + '/Math/Line.js',
            this.enginePath + '/Math/Circle.js',
            this.enginePath + '/Math/Rectangle.js',
            this.enginePath + '/Math/Polygon.js',
            this.enginePath + '/View/Child.js',
            this.enginePath + '/View/Line.js',
            this.enginePath + '/View/Circle.js',
            this.enginePath + '/View/Rectangle.js',
            this.enginePath + '/View/Polygon.js',
            this.enginePath + '/View/Container.js',
            this.enginePath + '/View/Sprite.js',
            this.enginePath + '/View/Collidable.js',
            this.enginePath + '/View/TextBlock.js',
            this.enginePath + '/View/GameObject.js',
            this.enginePath + '/Engine/Room.js',
            this.enginePath + '/Engine/Camera.js',
            this.enginePath + '/Engine/CustomLoop.js',
            this.enginePath + '/Input/Keyboard.js',
			this.enginePath + '/Input/Pointer.js',
			this.enginePath + '/Sound/Effect.js',
			this.enginePath + '/Sound/Music.js'
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
	},

	/**
	 * Starts the engine
	 * 
	 * @private
	 */
	initialize: function () {
		var objectName;

		// Make array for containing references to all game objects
		this.objectIndex = {};

		// Set variables required by the engine
		this.frames = 0;
		this.last = new Date().getTime();
		this.now = this.last;
		this.gameTime = 0;
		this.currentId = 0;

		this.fps = 0;
		this.fpsCounter = 0;
        this.drawTime = 0;
        this.drawTimeCounter = 0;
        this.drawCalls = 0;

		// Create a room list (All rooms will add themselves to this list)
		this.roomList = [];

		// Create master room
		this.masterRoom = new Engine.Room('master');

		// Make main room
		this.currentRoom = new Engine.Room('main');

		// Set default custom loops
		this.defaultAnimationLoop = this.masterRoom.loops.eachFrame;
		this.defaultActivityLoop = this.masterRoom.loops.eachFrame;

		// Make main camera
		this.cameras.push(
			new Engine.Camera(
				new Math.Rectangle(0, 0, this.canvasResX, this.canvasResY),
				new Math.Rectangle(0, 0, this.canvasResX, this.canvasResY)
			)
		);

		// Disable right click inside arena
		if (this.disableRightClick) {
			this.arena.oncontextmenu = function () {
				return false;
			};
		}

		// Create objects required by the engine
        /** @global */
		keyboard = new Input.Keyboard();
        /** @global */
		pointer = new Input.Pointer();

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

		if (this.focusOnLoad) {
			window.focus();
		}

		if (this.onload) {
			this.onload();
		}

		console.log('jsEngine started');
	},

	/**
	 * Enables or disables canvas autoresize.
	 *
	 * @param {boolean} enable Decides whether autoresize should be enabled or disabled
	 */
	setAutoResize: function (enable) {
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
	},

	/**
	 * Function for resizing the canvas. Not used if engine option "autoResizeCanvas" is false.
	 * 
	 * @private
	 */
	autoResizeCanvas: function () {
		if (this !== engine) {engine.autoResizeCanvas(); return; }

		var h, w, windowWH, gameWH;

		// Check if the window is wider og higher than the game's canvas
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
	},

	/**
	 * Function for converting between speed units
	 * 
	 * @param {number} speed The value to convert
	 * @param {number} from The unit to convert from. Can be SPEED_PIXELS_PER_SECOND or SPEED_PIXELS_PER_FRAME
	 * @param {number} to The unit to convert to. Can be SPEED_PIXELS_PER_SECOND or SPEED_PIXELS_PER_FRAME
	 * @return {number} The resulting value of the conversion
	 */
	convertSpeed: function (speed, from, to) {
		if (speed === undefined) {throw new Error('Missing argument: speed'); }
		if (speed.implements(Math.Vector)) {
			return new Math.Vector(this.convertSpeed(speed.x, from, to), this.convertSpeed(speed.y, from, to));
		}

		from = from !== undefined ? from : SPEED_PIXELS_PER_SECOND;
		to = to !== undefined ? to : SPEED_PIXELS_PER_FRAME;

		// Convert all formats to pixels per frame
		switch (from) {
		case SPEED_PIXELS_PER_SECOND:
			speed = speed * this.gameTimeIncrease / 1000;
			break;
		case SPEED_PIXELS_PER_FRAME:
			break;
		}

		// Convert pixels per frame to the output format
		switch (to) {
		case SPEED_PIXELS_PER_SECOND:
			speed = speed / this.gameTimeIncrease * 1000;
			break;
		case SPEED_PIXELS_PER_FRAME:
			break;
		}

		return speed;
	},

	/**
	 * Leaves the current room and opens another room
	 * 
	 * @param {Room|string} room A pointer to the desired room, or a string representing the name of the room
	 */
	goToRoom: function (room) {
		if (room === undefined) {throw new Error ('Missing argument: room'); }

		// If a string has been specified, find the room by name
		if (typeof room === "string") {
			room = this.roomList.getElementByPropertyValue('name', room);
			if (!room) {throw new Error('Could not find a room with the specified name'); }
		}
		// Else, check if the room exists on the room list, and if not, throw an error
		else {
			if (this.roomList.indexOf(room) === -1) {
				throw new Error('Room is not on room list, has it been removed?');
			}
		}

		this.currentRoom.onLeave();
		this.currentRoom = room;
		this.currentRoom.onEnter();
	},

	/**
	 * Adds a room to the room list. This function is automatically called by the Room class' constructor.
	 * 
	 * @private
	 * @param {Room} room The room which should be added
	 */
	addRoom: function (room) {
		if (room === undefined) {throw new Error ('Missing argument: room'); }
		if (this.roomList.indexOf(room) !== -1) {
			throw new Error('Room is already on room list, rooms are automatically added upon instantiation');
		}

		this.roomList.push(room);
	},

	/**
	 * Removes a room from the room list.
	 * 
	 * @param {Room|string} room A pointer to the room, or a string representing the name of the room, which should be removed
	 */
	removeRoom: function(room) {
		if (room === undefined) {throw new Error ('Missing argument: room'); }
		var index;

		// If a string has been specified, find the room by name
		if (typeof room === "string") {
			room = this.roomList.getElementByPropertyValue('name', room);
			if (!room) {throw new Error('Could not find a room with the specified name'); }
		}
		// Else, check if the room exists on the room list, and if not, throw an error
		index = this.roomList.indexOf(room);

		if (index === -1) {
			throw new Error('Room is not on room list, has it been removed?');
		}

		// Make sure we are not removing the current room, or the master room
		if (room === this.masterRoom) {
			throw new Error('Cannot remove master room');
		}
		else if (room === this.currentRoom) {
			throw new Error('Cannot remove current room, remember to leave the room first, by entering another room (use engine.goToRoom)');
		}

		this.roomList.splice(i, 1);
	},

	/**
	 * Toggles if all sound effects should be muted.
	 * 
	 * @param {boolean} muted Whether or not the sound effects should be muted
	 */
	setSoundsMuted: function (muted) {
		muted = muted !== undefined ? muted : true;

		// If muting, check all sounds whether they are being played, if so stop the playback
		if (muted) {
			loader.getAllSounds().forEach(function () {
				this.stopAll();
			});
		}

		this.soundsMuted = muted;
	},

	/**
	 * Toggles if all music should be muted.
	 *
	 * @param {boolean} muted Whether of not the music should be muted
	 */
	setMusicMuted: function (muted) {
		muted = muted !== undefined ? muted : true;

		// If muting, check all sounds whether they are being played, if so stop the playback
		if (muted) {
			loader.getAllMusic().forEach(function () {
				this.stop();
			});
		}

		this.musicMuted = muted;
	},

	/**
	 * Sets the default theme for the engine objects
	 * 
	 * @param {string} themeName A string representing the name of the theme
	 * @param {boolean} enforce Whether or not the enforce the theme on objects for which another theme has already been set
	 */
	setDefaultTheme: function (themeName, enforce) {
		if (themeName === undefined) {throw new Error('Missing argument: themeName'); }
		if (loader.themes[themeName] === undefined) {throw new Error('Trying to set nonexistent theme: ' + themeName); }

		enforce = enforce !== undefined ? enforce : false;

		this.defaultTheme = themeName;
		this.currentRoom.setTheme(undefined, enforce);
	},

	/**
	 * Starts the engine's main loop
	 */
	startMainLoop: function () {
		if (this.running) {return; }

		// Restart the now - last cycle
		this.now = new Date().getTime();
		this.running = true;

		// Start mainLoop
		engine.mainLoop();
	},

	/**
	 * Stops the engine's main loop
	 */
	stopMainLoop: function () {
		if (!this.running) {return; }
		this.running = false;
	},

	/**
	 * The engine's main loop function (should not be called manually)
	 * 
	 * @private
	 */
	mainLoop: function () {
		if (!this.running) {return; }

        var drawTime;

		// Get the current time (for calculating movement based on the precise time change)
		this.last = this.now;
		this.now = new Date().getTime();
		this.timeIncrease = this.now - this.last;
		this.gameTimeIncrease = this.timeIncrease * this.timeFactor;

		// Update the game time and frames
		this.gameTime += this.gameTimeIncrease;
		this.frames ++;

		// Execute loops
		this.masterRoom.update();
		this.currentRoom.update();

		// Draw game objects
        if (!this.debug) {
            this.redraw();
        }
        else {
            this.drawCalls = 0;
            drawTime = new Date().getTime();
            this.redraw();
            drawTime = new Date().getTime() - drawTime;

            // Count frames per second and calculate mean redraw time
            if (this.fpsMsCounter < 1000) {
                this.fpsCounter ++;
                this.drawTimeCounter += drawTime;
                this.fpsMsCounter += this.timeIncrease;
            }
            else {
                this.fps = this.fpsCounter;
                this.drawTime = this.drawTimeCounter / this.fpsCounter;
                this.fpsCounter = 0;
                this.drawTimeCounter = 0;
                this.fpsMsCounter = 0;
            }
        }

		// Schedule the loop to run again
		requestAnimationFrame(function (time) {
			engine.mainLoop(time);
		});
	},

	/**
	 * Sets the horizontal resolution of the main canvas
	 * 
	 * @param {number} res The new horizontal resolution
	 */
	setCanvasResX: function (res) {
		this.mainCanvas.width = res;
		this.canvasResX = res;

		if (this.autoResize) {
			this.autoResizeCanvas();
		}
	},

	/**
	 * Sets the vertical resolution of the main canvas
	 * 
	 * @param {number} res The new vertical resolution
	 */
	setCanvasResY: function (res) {
		this.mainCanvas.height = res;
		this.canvasResY = res;
		if (this.autoResize) {
			this.autoResizeCanvas();
		}
	},

	/**
	 * Registers an object to the engine. This will give the object an id which can be used for accessing it at a later time.
	 * Sprites, TextBlock and objects inheriting those objects, are automatically registered when created.
	 * 
	 * @param {Object} obj The object to register in the engine
	 * @param {string} id A string with the desired id
	 * @return {string} The registered id
	 */
	registerObject: function (obj, id) {
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
	},

	/**
	 * Loads and executes one or multiple JavaScript file synchronously
	 * 
	 * @param {string|string[]} filePaths A file path (string), or an array of file paths to load and execute as JavaScript
	 */
	loadFiles: function (filePaths) {
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
				eval(codeString);
			}
			catch (e) {
				console.log('Failed loading "' + filePaths[i]);
				throw new Error(e);
			}
		}

		if (window.loadedFiles === undefined) {window.loadedFiles = []; }
		window.loadedFiles = window.loadedFiles.concat(filePaths);
	},

	/**
	 * Uses an http request to fetch the data from a file and runs a callback function with the file data as first parameter
	 * 
	 * @param {string} url A URL path for the file to load
	 * @param {string|Object} params A parameter string or an object to JSON-stringify and use as URL parameter (will be send as "data=[JSON String]")
	 * @param {boolean} async Whether or not the request should be synchronous.
	 * @param {function} callback A callback function to run when the request has finished
	 * @param {object} caller An object to call the callback function as.
	 */
	ajaxRequest: function (url, params, async, callback, caller) {
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
				callback.call(caller, req.responseText);
			}
			else {
				throw new Error('XMLHttpRequest failed: ' + url);
			}
		}
	},

	/**
	 * Removes an object from all engine loops, views, and from the object index
	 *
	 * param {Object} obj The object to remove
	 */
	purge: function (obj) {
		var len, name, loop, roomId, room;

		if (obj === undefined) {throw new Error(obj); }
		if (typeof obj === "string") {
			obj = this.objectIndex[obj];
		}

		// Purge ALL children
		if (obj.children) {
			len = obj.children.length;
			while (len --) {
				engine.purge(obj.children[len]);
			}
		}

		// Delete all references from rooms and their loops
		for (roomId = 0; roomId < this.roomList.length; roomId ++) {
			room = this.roomList[roomId];
			for (name in room.loops) {
				if (room.loops.hasOwnProperty(name)) {
					loop = room.loops[name];

					loop.detachFunctionsByCaller(obj);
					loop.unscheduleByCaller(obj);
					loop.removeAnimationsOfObject(obj);
				}
			}
		}

		// Delete from viewlist
		if (obj.parent) {
			obj.parent.removeChildren(obj);
		}

		// Delete from object index
		delete this.objectIndex[obj.id];
	},

	/**
	 * Redraws the canvas by redrawing all cameras
	 */
	redraw: function () {
		var i, c;

		c = this.mainCtx


        for (i = 0; i < this.cameras.length; i++) {
            //this.mainCanvas.getContext('2d').clearRect(0, 0, this.canvasResX, this.canvasResY);
			this.cameras[i].capture();
            this.cameras[i].draw(c);
        }

        if (this.debug) {
        	this.lastRedrawObjects = this.redrawObjects;
        }
        this.redrawObjects = [];
    },

	/**
	 * Downloads a screen dump of the main canvas. Very usable for creating game screenshots directly from browser consoles.
	 */
	dumpScreen: function () {
		var dataString, a;

		dataString = this.mainCanvas.toDataURL().replace(/image\/png/, 'image/octet-stream');

		a = document.createElement('a');
		a.href = dataString;
		a.setAttribute('download', 'screendump.png');
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a, document.body);
	},

	/**
	 * Tweens an animation of a number between a start point and an end point
	 *
	 * @param {string} type The easing function to use. Available functions are:
	 * "linear"
	 * "quadIn"
	 * "quadOut"
	 * "quadInOut"
	 * "powerIn"
	 * "powerOut"
	 * "powerInOut"
	 * "sinusInOut"
	 * 
	 * @param {number} t The current time (of the animation)
	 * @param {number} b The start value
	 * @param {number} c The end value
	 * @param {number} d The animation time
	 * @return {number} The current value (at the given time in the animation)
	 */
	ease: function (type, t, b, c, d) {
		var a;

		switch (type) {
		case "linear":
			t /= d;
			return b + c * t;
		case "quadIn":
			t /= d;
			return b + c * t * t;
		case "quadOut":
			t /= d;
			return b - c * t * (t - 2);
		case "quadInOut":
			t = t / d * 2;
			if (t < 1) {
				return b + c * t * t / 2;
			} else {
				t --;
				return b + c * (1 - t * (t - 2)) / 2;
			}
		case "powerIn":
			t /= d;
			// a determines if c is positive or negative
			a = c / Math.abs(c);
			return b + a * Math.pow(Math.abs(c), t);
		case "powerOut":
			t /= d;
			// a determines if c is positive or negative
			a = c / Math.abs(c);
			return b + c - a * Math.pow(Math.abs(c), 1 - t);
		case "powerInOut":
			t = t / d * 2;
			// a determines if c is positive or negative
			a = c / Math.abs(c);
			if (t < 1) {
				return b + a * Math.pow(Math.abs(c), t) / 2;
			} else {
				t --;
				return b + c - a * Math.pow(Math.abs(c), 1 - t) / 2;
			}
		case "sinusInOut":
			t /= d;
			return b + c * (1 + Math.cos(Math.PI * (1 + t))) / 2;
		}
		return b + c;
	}
});
/** For making the engine var unreachable **/
/*}());/**/