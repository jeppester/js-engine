/** For making the engine var unreachable **/
(function () {
/*var main;/**/

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
     * @property {boolean} preventDefaultKeyboard Whether or not preventDefault is called for keyboard events
     * @property {HTMLElement} arena The HTML element to use as parent to the main canvas
     * @property {boolean} autoResize Whether or not the arena will autoresize itself to fit the window
     * @property {boolean} autoResizeLimitToResolution Whether or not the arena should not autoresize itself to be bigger than the main canvas' resolution
     * @property {int} cachedSoundCopies The number of copies each sound object caches of it's source to enable multiple playbacks
     * @property {string} gameClassPath The URL of the game's main class
     * @property {string} loadText The text shown while loading the engine
     * @property {string} backgroundColor A CSS color string which is used as the background color of the main canvas
     * @property {number} timeFactor The factor to multiply the time increase with. A factor of 2 will make everything happen with double speed
     * @property {boolean} resetCursorOnEachFrame Whether or not the mouse cursor will be reset on each frame
     * @property {boolean} disableTouchScroll Whether or not touch scroll has been disabled
     * @property {Camera[]} cameras An array containing the engine's cameras
     * @property {int} defaultCollisionResolution The collision resolution set for all created collidable objects
     * @property {boolean} soundsMuted Whether or not all sound effects are currently muted
     * @property {boolean} musicMuted Whether or not all music is currently muted
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
	 *                  "preventDefaultKeyboard": false, // Whether or not preventDefault should be called for keyboard events
	 * 	                "disableTouchScroll": true, // If touch scroll on tablets and phones should be disable
	 * 	                "drawBoundingBoxes": false, // If Collidable object's bounding boxes should be drawn
	 * 	                "drawMasks": false, // If Collidable object's masks should be drawn
	 * 	                "enginePath": "js/jsEngine", // The path for the engine classes' directory
	 * 	                "focusOnLoad": true, // Whether or not to focus the engine's window when the engine is ready
	 * 	                "gameClassPath": "js/Game.js", // The path for the game's main class
	 * 	                "loadText": 'jsEngine loading...'
	 * 	                "musicMuted": false, // If all music playback should be initially muted
	 * 	                "pauseOnBlur": true, // If the engine should pause when the browser window loses its focus
	 *					"resetCursorOnEachFrame": true // Whether or not the mouse cursor should be reset on each frame
	 * 	                "soundsMuted": false, // If all sound effects should be initially muted
	 * 	                "themesPath": "themes", // The path to the themes-directory
	 * 	                "enableRedrawRegions": false, // Whether the engine should use redraw regions for drawing or not
	 *                 }</code>
	 */
	Engine: function (options) {
        // Set global engine variable
        /**
         * Global engine var set upon engine initialization
         * @global
         */
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
		var copyOpt, audioFormats, i, opt;

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
		this.preventDefaultKeyboard = false;
		this.arena = document.getElementById('arena');
		this.autoResize = true;
		this.autoResizeLimitToResolution = true;
		this.cachedSoundCopies = 5;
		this.gameClassPath = "js/Game.js";
		this.loadText = "jsEngine loading...";
		this.backgroundColor = "#FFF";
		this.timeFactor = 1;
		this.disableTouchScroll = true;
		this.resetCursorOnEachFrame = true;
		this.cameras = [];
		this.defaultCollisionResolution = 6;
        this.redrawObjects = [];
        this.enableRedrawRegions = false;

		this.soundsMuted = false;
		this.musicMuted = false;

		// Copy options to engine (except those which are only used for engine initialization)
		copyOpt = ['backgroundColor', 'preventDefaultKeyboard', 'enableRedrawRegions', 'resetCursorOnEachFrame', 'disableTouchScroll', 'defaultCollisionResolution', 'focusOnLoad', 'loadText', 'soundsMuted', 'musicMuted', 'cachedSoundCopies', 'avoidSubPixelRendering', 'arena', 'disableRightClick', 'pauseOnBlur', 'drawBoundingBoxes', 'drawMasks', 'canvasResX', 'canvasResY', 'autoResize', 'autoResizeLimitToResolution', 'enginePath', 'themesPath', 'gameClassPath'];
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

		// Create loader object
        /**
         * Global Engine.Loader instance which is created upon engine initialization
         * @global
         */
		loader = new Engine.Loader();

		loader.loadClasses([this.gameClassPath]);
		this.gameClassName = this.gameClassPath.match(/(\w*)\.\w+$/)[1];

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
		this.defaultAnimationLoop = this.currentRoom.loops.eachFrame;
		this.defaultActivityLoop = this.currentRoom.loops.eachFrame;

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
        /**
         * Global instance of Input.Keyboard which is created upon engine initialization
         * @global
         */
		keyboard = new Input.Keyboard();
        /**
         * Global instance of Input.Pointer which is created upon engine initialization
         * @global
         */
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

		console.log('jsEngine started'); //dev
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
		if (speed === undefined) {throw new Error('Missing argument: speed'); } //dev
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
	 * @param {number} transition A room transition constant or function
	 */
	goToRoom: function (room, transition, transitionOptions) {
		var oldRoom;

		if (this.changingRoom) {
			return false;
		}

		if (room === undefined) {throw new Error ('Missing argument: room'); } //dev

		// If a string has been specified, find the room by name
		if (typeof room === "string") {
			room = this.roomList.getElementByPropertyValue('name', room);
			if (!room) {throw new Error('Could not find a room with the specified name'); } //dev
		}
		// Else, check if the room exists on the room list, and if not, throw an error
		else {
			if (this.roomList.indexOf(room) === -1) {
				throw new Error('Room is not on room list, has it been removed?'); //dev
			}
		}

		transition = transition ? transition : ROOM_TRANSITION_NONE;

		oldRoom = this.currentRoom;
		engine.changingRoom = true;
		transition(oldRoom, room, transitionOptions, function () {
			engine.changingRoom = false;
			engine.currentRoom = room;
		});
		return oldRoom;
	},

	/**
	 * Adds a room to the room list. This function is automatically called by the Room class' constructor.
	 * 
	 * @private
	 * @param {Room} room The room which should be added
	 */
	addRoom: function (room) {
		if (room === undefined) {throw new Error ('Missing argument: room'); } //dev
		if (this.roomList.indexOf(room) !== -1) { //dev
			throw new Error('Room is already on room list, rooms are automatically added upon instantiation'); //dev
		} //dev

		this.roomList.push(room);
	},

	/**
	 * Removes a room from the room list.
	 * 
	 * @param {Room|string} room A pointer to the room, or a string representing the name of the room, which should be removed
	 */
	removeRoom: function(room) {
		if (room === undefined) {throw new Error ('Missing argument: room'); } //dev
		var index;

		// If a string has been specified, find the room by name
		if (typeof room === "string") {
			room = this.roomList.getElementByPropertyValue('name', room);
			if (!room) {throw new Error('Could not find a room with the specified name'); } //dev
		}
		// Else, check if the room exists on the room list, and if not, throw an error
		index = this.roomList.indexOf(room);

		if (index === -1) {
			throw new Error('Room is not on room list, has it been removed?'); //dev
		}

		// Make sure we are not removing the current room, or the master room
		if (room === this.masterRoom) {
			throw new Error('Cannot remove master room'); //dev
		}
		else if (room === this.currentRoom) {
			throw new Error('Cannot remove current room, remember to leave the room first, by entering another room (use engine.goToRoom)'); //dev
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
		if (themeName === undefined) {throw new Error('Missing argument: themeName'); } //dev
		if (loader.themes[themeName] === undefined) {throw new Error('Trying to set nonexistent theme: ' + themeName); } //dev

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

		// Reset mouse cursor (if told to)
		if (this.resetCursorOnEachFrame) {
			pointer.resetCursor();
		}

		// Execute loops
		this.masterRoom.update();
		this.currentRoom.update();

		// Draw game objects
        this.drawCalls = 0; //dev
        drawTime = new Date().getTime(); //dev
        this.redraw();
        drawTime = new Date().getTime() - drawTime; //dev

        // Count frames per second and calculate mean redraw time
        if (this.fpsMsCounter < 1000) { //dev
            this.fpsCounter ++; //dev
            this.drawTimeCounter += drawTime; //dev
            this.fpsMsCounter += this.timeIncrease; //dev
        } //dev
        else { //dev
            this.fps = this.fpsCounter; //dev
            this.drawTime = this.drawTimeCounter / this.fpsCounter; //dev
            this.fpsCounter = 0; //dev
            this.drawTimeCounter = 0; //dev
            this.fpsMsCounter = 0; //dev
        } //dev

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
		if (obj === undefined) {throw new Error('Missing argument: obj'); } //dev

		if (id === undefined) {
			this.currentId ++;
			id = "obj" + (this.currentId - 1);
		}
		else if (this.objectIndex[id] !== undefined) { //dev
			throw new Error('Object id already taken: ' + id); //dev
		} //dev

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
			try { //dev
				eval(codeString);
			} //dev
			catch (e) { //dev
				console.log('Failed loading "' + filePaths[i]); //dev
				throw new Error(e); //dev
			} //dev
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
		if (url === undefined) {throw new Error('Missing argument: url'); } //dev
		if (callback === undefined) {throw new Error('Missing argument: callback'); } //dev

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
			if (req.readyState === 4 && req.status === 200) { //dev
				callback.call(caller, req.responseText);
			} //dev
			else { //dev
				throw new Error('XMLHttpRequest failed: ' + url); //dev
			} //dev
		}
	},

	/**
	 * Removes an object from all engine loops, views, and from the object index
	 *
	 * param {Object} obj The object to remove
	 */
	purge: function (obj) {
		var len, name, loop, roomId, room;

		if (obj === undefined) {throw new Error('Cannot purge object: ' + obj); } //dev
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

        this.lastRedrawObjects = this.redrawObjects; //dev
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
}());/**/