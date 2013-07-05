/**
 * Loader:
 * Class for loading and storing resources.
 * On engine startup a Loader object is instantiated to the global variable "loader". This loader object will also create a load overlay (the overlay saying "jsEngine loading"), this overlay will not be removed untill the loader.hideOverlay() is called.
 */

NewClass('Loader');

/**
 * Constructor for the Loader class.
 * This function will also create a load overlay which will not disappear untill the hideOverlay is called.
 * Therefore, remember to call hideOverlay, when your game is ready to be shown.
 * 
 * @private
 */
Loader.prototype.Loader = function () {
	this.sounds = {};
	this.images = {};
	this.scripts = {};
	this.loaded = {
		classes: []
	};
	this.themes = {};
	this.callback = false;

	// Make load overlay
	this.loadOverlay = document.createElement('div');
	this.loadOverlay.setAttribute('style', 'border: 0;position: absolute;top: 0;left: 0;width: 100%;height: 100%;z-index: 100;opacity: 1;');
	this.loadOverlay.id = "loadOverlay";
	this.loadOverlay.innerHTML = '<div id="loadOverlayText">' + engine.loadText + '</div>';
	engine.arena.appendChild(this.loadOverlay);
};

/**
 * Fades out the load overlay (which is automatically created by Loader's constructor).
 * Remember to call this function, when your game is ready to be shown. Otherwise, the load overlay will never disappear.
 * 
 * @param {function} callback A callback function to run when the overlay has finished fading out
 */
Loader.prototype.hideOverlay = function (callback) {
	this.fadeCallback = callback;
	this.fadeOpacity = 1;
	this.fade = function () {
		var obj = loader.loadOverlay;
		loader.fadeOpacity = Math.max(0, loader.fadeOpacity - 0.1);
		loader.fadeOpacity = Math.floor(loader.fadeOpacity * 100) / 100;

		obj.style.opacity = loader.fadeOpacity;

		if (loader.fadeOpacity !== 0) {
			setTimeout(function () {
				loader.fade();
			}, 30);
		}
		else {
			engine.arena.removeChild(loader.loadOverlay);
			delete loader.fade;
			if (loader.fadeCallback) {
				loader.fadeCallback();
			}
			delete loader.fadeCallback;
		}
	};
	this.fade();
};

/**
 * Fetches an image from the Loader. This function will automatically be called by objects that implements the Sprite object.
 * 
 * @param {string} resource The resource string of the image that should be fetched
 * @param {string} themeName The name of the theme from which the image should be fetched. If unset, the engine's default theme will be used
 * @return {object} The DOM Image element corresponding to the resource string and theme
 */
Loader.prototype.getImage = function (resource, themeName) {
	if (resource === undefined) {throw new Error('Missing argument: resource'); }
	themeName = themeName !== undefined ? themeName : engine.defaultTheme;
	return this.getResource(resource, 'images', themeName);
};

/**
 * Fetches a sound from the Loader.
 * 
 * @param {string} resource The resource string of the sound that should be fetched
 * @param {string} themeName The name of the theme from which the sound should be fetched. If unset, the engine's default theme will be used
 * @return {object} A Sound object corresponding to the resource string and theme
 */
Loader.prototype.getSound = function (resource, themeName) {
	if (resource === undefined) {throw new Error('Missing argument: resource'); }
	themeName = themeName !== undefined ? themeName : engine.defaultTheme;
	return this.getResource(resource, 'sfx', themeName);
};

/**
 * Fetches a music track from the Loader.
 * 
 * @param {string} resource The resource string of the track that should be fetched
 * @param {string} themeName The name of the theme from which the track should be fetched. If unset, the engine's default theme will be used
 * @return {object} A Music object corresponding to the resource string and theme
 */
Loader.prototype.getMusic = function (resource, themeName) {
	if (resource === undefined) {throw new Error('Missing argument: resource'); }
	themeName = themeName !== undefined ? themeName : engine.defaultTheme;
	return this.getResource(resource, 'music', themeName);
};

/**
 * Creates (or loads from cache) a mask for an image which is loaded by the Loader.
 * This function is automatically used by the Collidable object for fetching masks for collision checking.
 * 
 * @param {string} resource The resource string of the image that should be fetched
 * @param {string} themeName The name of the theme from which the image should be fetched. If unset, the engine's default theme will be used
 * @return {object} A generated mask (canvas element) for the image element corresponding to the resource string and theme
 */
Loader.prototype.getMask = function (resource, themeName) {
	if (resource === undefined) {throw new Error('Missing argument: resource'); }
	themeName = themeName !== undefined ? themeName : engine.defaultTheme;

	var mask;

	// Check if the mask has been generated
	mask = this.getResource(resource, 'masks', themeName);
	if (mask) {
		// If yes, return the mask
		return mask;
	}
	// Otherwise, generate the mask and return it
	else {
		mask = this.generateMask(resource);
		this.themes[themeName].masks[resource] = mask;
		return mask;
	}
};

/**
 * Fetches a resource from the Loader's cache. Used by the getImage-, getImage- and getMusic functions.
 * 
 * @private
 * @param {string} resource The resource string of the resource that should be fetched
 * @param {string} typeString A string representing the resource type, possible values are: "image", "sfx" and "music"
 * @param {string} themeName The name of the theme from which the image should be fetched. If unset, the engine's default theme will be used
 * @return {mixed} The resource corresponding to the provided resource string, resource type and theme name
 */
Loader.prototype.getResource = function (resource, typeString, themeName) {
	if (resource === undefined) {throw new Error('Missing argument: resource'); }
	if (typeString === undefined) {throw new Error('Missing argument: typeString'); }
	if (themeName === undefined) {throw new Error('Missing argument: themeName'); }
	var res, inh, i;

	if (resource.indexOf('/') !== -1) {
		resource = resource.replace(/\//g, '.');
	}

	res = this.themes[themeName][typeString][resource];

	// Search for the resource in inherited themes
	if (res === undefined) {
		for (i = 0; i < this.themes[themeName].inherit.length; i ++) {
			inh = this.themes[themeName].inherit[i];
			if (this.themes[inh]) {
				res = this.themes[inh][typeString][resource];

				if (res) {
					break;
				}
			}
		}
	}

	return res === undefined ? false : res;
};

/**
 * Fetches all loaded images' resource strings (from all themes).
 * 
 * @return {array} An array containing all loaded images' resource strings
 */
Loader.prototype.getImageSources = function () {
	var object, sourceStrings, currentDir, loopThrough, inheritTheme, i;

	object = this.themes[engine.defaultTheme].images;
	sourceStrings = [];
	currentDir = [];
	loopThrough = function (object) {
		var pushStr, name;
		if (object.src !== undefined) {
			pushStr = currentDir.join('.');
			if (sourceStrings.indexOf(pushStr) === -1) {
				sourceStrings.push(pushStr);
			}
		}
		else {
			for (name in object) {
				if (object.hasOwnProperty(name)) {
					currentDir.push(name);
					loopThrough(object[name]);
					currentDir.pop();
				}
			}
		}
	};

	loopThrough(object);

	for (i = 0; i < this.themes[engine.defaultTheme].inherit.length; i ++) {
		inheritTheme = this.themes[this.themes[engine.defaultTheme].inherit[i]];
		if (inheritTheme !== undefined && inheritTheme.images !== undefined) {
			loopThrough(inheritTheme.images);
		}
	}

	return sourceStrings;
};

/**
 * Fetches all loaded sounds' resource strings (from all themes).
 * 
 * @return {array} An array containing all loaded sounds' resource strings
 */
Loader.prototype.getAllSounds = function () {
	var res, themeName, theme, resourceString, resource;

	res = [];

	for (themeName in this.themes) {
		if (this.themes.hasOwnProperty(themeName)) {
			theme = this.themes[themeName];

			for (resourceString in theme.sfx) {
				if (theme.sfx.hasOwnProperty(resourceString)) {
					res.push(theme.sfx[resourceString]);
				}
			}
		}
	}

	return res;
};

/**
 * Fetches all loaded music tracks' resource strings (from all themes).
 * 
 * @return {array} An array containing all loaded music tracks' resource strings
 */
Loader.prototype.getAllMusic = function () {
	var res, themeName, theme, resourceString, resource;

	res = [];

	for (themeName in this.themes) {
		if (this.themes.hasOwnProperty(themeName)) {
			theme = this.themes[themeName];

			for (resourceString in theme.music) {
				if (theme.music.hasOwnProperty(resourceString)) {
					res.push(theme.music[resourceString]);
				}
			}
		}
	}

	return res;
};

/**
 * Loads JavaScript classes from files. The loaded classes' names must follow the following format: [ClassName].js 
 * 
 * @param {array} paths An array of paths to JavaScripts - containing classes - which should be loaded
 * @return {boolean} True, when the classes has been loaded without any errors
 */
Loader.prototype.loadClasses = function (paths) {
	if (paths === undefined) {throw new Error('Missing argument: paths'); }
	var objectName, i;

	for (i in paths) {
		if (paths.hasOwnProperty(i)) {
			// Check that the object is not already loaded
			objectName = paths[i].match(/(\w*)\.\w+$/)[1];
			if (window[objectName]) {continue; }

			engine.loadFiles(paths[i]);
			this.loaded.classes[objectName] = paths[i];
		}
	}
	return true;
};

/**
 * Reloades all classes. This function is very useful for applying code changes without having to refresh the browser, usually it has to be run multiple times though, to force the browser not to just load the files from its cache.
 */
Loader.prototype.reloadAllClasses = function () {
	var i;

	for (i in this.loaded.classes) {
		if (this.loaded.classes.hasOwnProperty(i)) {
			engine.loadFiles(this.loaded.classes[i]);
		}
	}
};

/**
 * Loads a list of themes. This function is automatically called by the Engine during its startup, for loading the themes specified by the launch options.
 * 
 * @private
 * @param {array} themeNames An array of theme names (as strings) to load
 * @param {function} callback A callback function to run when all the themes has been loaded
 */
Loader.prototype.loadThemes = function (themeNames, callback) {
	if (themeNames === undefined) {throw new Error('Missing argument: themeNames'); }
	if (callback !== undefined) {this.onthemesloaded = callback; }

	var name, req, i, total, theme, codeString;

	for (i = 0; i < themeNames.length; i ++) {
		name = themeNames[i];

		// Check that the theme is not already loaded
		if (this.themes[name]) {continue; }

		// Fetch theme details
		req = new XMLHttpRequest();
		req.open('GET', engine.themesPath + '/' + name + '/theme.json', false);
		req.send();

		// Check that the theme is actually there
		if (req.status === 404) {console.log('Theme not found: ' + name); continue; }

		// Get theme details
		codeString = 'theme = ' + req.responseText + "\n//@ sourceURL=/" + engine.themesPath + '/' + name + '/theme.json';
		eval(codeString);

		// Load inherited themes
		if (theme.inherit.length) {
			this.loadThemes(theme.inherit);
		}

		// Create new theme
		this.themes[name] = theme;
		theme.resourcesCount = 0;
		theme.resourcesLoaded = 0;
		theme.masks = {};
		theme.bBoxes = {};

		// Load all images
		this.loadResources(theme, theme.images, 'images');
		this.loadResources(theme, theme.sfx, 'sfx');
		this.loadResources(theme, theme.music, 'music');
	}

	// Check if the theme was empty, if so, run callback
	total = 0;
	for (i in this.themes) {
		if (this.themes.hasOwnProperty(i)) {
			total += this.themes[i].resourcesCount;
		}
	}
	if (total === 0) {
		if (this.onthemesloaded) {
			this.onthemesloaded();
		}
	}
};

/**
 * Loads resources to a theme. This function is used by loadThemes for caching the theme resources.
 * 
 * @private
 * @param {object} theme A theme object to load the resources to
 * @param {object} object An object containing references to theme resources (like the subcategories of theme files)
 * @param {string} typeString A string defining the resource type. Supported types are: "images", "sfx" and "music"
 */
Loader.prototype.loadResources = function (theme, object, typeString) {
	if (theme === undefined) {throw new Error('Missing argument: theme'); }
	if (object === undefined) {throw new Error('Missing argument: object'); }
	if (typeString === undefined) {throw new Error('Missing argument: typeString'); }

	var onload, res, path, i, format, images;

	onload = function () {
		var resourceString, theme, i;
		if (this.hasAttribute('data-loaded')) {return; }

		this.setAttribute('data-loaded', 'true');
		theme = loader.themes[this.getAttribute('data-theme')];
		theme.resourcesLoaded ++;

		loader.checkAllLoaded();
	};

	for (path in object) {
		if (object.hasOwnProperty(path)) {
			switch (typeString) {
			case 'images':
				res = new Image();
				res.src = engine.themesPath + "/" + theme.name + "/images/" + path.replace(/\./g, '/') + '.png';

				images = object[path].match(/; *(\d+) *images?/);
				if (images) {
					res.imageLength = images[1] * 1;
				}
				else {
					res.imageLength = 1;
				}

				if (object[path].match(/; *bordered/)) {
					res.spacing = 1;
				}
				else {
					res.spacing = 0;
				}
				theme.images[path] = res;
				theme.bBoxes[path] = [];
				for (i = 0; i < 100; i++) {
					theme.bBoxes[path].push(false);
				}

				res.onload = onload;
				theme.resourcesCount ++;
				break;

			case 'sfx':
				format = false;
				for (i = 0; i < engine.host.supportedAudio.length; i++) {
					if (object[path].search(engine.host.supportedAudio[i]) !== -1) {
						format = engine.host.supportedAudio[i];
					}
				}
				if (!format) {
					console.log('Sound was not available in a supported format: ' + theme.name + "/sfx/" + path.replace(/\./g, '/'));
					continue;
				}
				res = new Audio(engine.themesPath + "/" + theme.name + "/sfx/" + path.replace(/\./g, '/') + '.' + format);
				theme.sfx[path] = new Sound(res);

				if (engine.preloadSounds) {
					res.setAttribute('preload', 'auto');
					res.addEventListener("canplaythrough", onload, false);
					theme.resourcesCount ++;
				}
				break;

			case 'music':
				format = false;
				for (i = 0; i < engine.host.supportedAudio.length; i++) {
					if (object[path].search(engine.host.supportedAudio[i]) !== -1) {
						format = engine.host.supportedAudio[i];
					}
				}
				if (!format) {
					console.log('Sound was not available in a supported format: ' + theme.name + "/sfx/" + path.replace(/\./g, '/'));
					continue;
				}
				res = new Audio(engine.themesPath + "/" + theme.name + "/music/" + path.replace(/\./g, '/') + '.' + format);
				theme.music[path] = new Music(res);

				if (engine.preloadSounds) {
					res.setAttribute('preload', 'auto');
					res.addEventListener("canplaythrough", onload, false);
					theme.resourcesCount ++;
				}
				break;
			}

			res.setAttribute('data-theme', theme.name);
			res.setAttribute('data-resourceString', path.replace(/\./g, '/'));
		}
	}
};

/**
 * Generates a mask for an image specified by its resource string.
 * This function is used by getMask to fetch and cache masks for each of the loaded images.
 * 
 * @param {string} resourceString A resource string specifying the image to generate a mask for
 * @param {number} alphaLimit An alpha value (0-255). Pixel having this alpha value or larger will become black on the mask, pixels with a value below the limit will become completely transparent
 * @return {object} A canvas element with the generated mask
 */
Loader.prototype.generateMask = function (resourceString, alphaLimit) {
	if (resourceString === undefined) {throw new Error('Missing argument: resourceString'); }
	alphaLimit = alphaLimit !== undefined ? alphaLimit : 255;

	var image, canvas, ctx, bitmap, data, length, pixel, top, bottom, left, right, x, y;

	image = loader.getImage(resourceString);

	canvas = document.createElement('canvas');
	canvas.width = image.width;
	canvas.height = image.height;
	canvas.imageLength = image.imageLength;
	ctx = canvas.getContext('2d');

	if (image === false) {
		throw new Error('Trying to create mask for non-existing resource: ' + resourceString);
	}
	ctx.drawImage(
		image,
		0,
		0,
		image.width,
		image.height
	);

	bitmap = ctx.getImageData(0, 0, canvas.width, canvas.height);
	data = bitmap.data;
	length = data.length / 4;

	top = bitmap.height;
	bottom = 0;
	left = bitmap.width;
	right = 0;

	for (pixel = 0; pixel < length; pixel ++) {
		// If the pixel is partly transparent, make it completely transparent, else make it completely black
		if (data[pixel * 4 + 3] < alphaLimit) {
			data[pixel * 4] = 0; // Red
			data[pixel * 4 + 1] = 0; // Green
			data[pixel * 4 + 2] = 0; // Blue
			data[pixel * 4 + 3] = 0; // Alpha
		}
		else {
			data[pixel * 4] = 0; // Red
			data[pixel * 4 + 1] = 0; // Green
			data[pixel * 4 + 2] = 0; // Blue
			data[pixel * 4 + 3] = 255; // Alpha

			// Remember the mask's bounding box
			y = Math.floor(pixel / bitmap.width);
			x = pixel - y * bitmap.width;

			while (x >= Math.floor(image.width / image.imageLength)) {
				x -= Math.floor(image.width / image.imageLength) + image.spacing;
			}
			if (x < 0) {continue; }

			top = Math.min(y, top);
			bottom = Math.max(y + 1, bottom);
			left = Math.min(x, left);
			right = Math.max(x + 1, right);
		}
	}
	ctx.putImageData(bitmap, 0, 0);

	canvas.bBox = new Rectangle(left - bitmap.width / 2, top - bitmap.height / 2, right - left, bottom - top).getPolygon();

	return canvas;
};

/**
 * Checks if all resources - of all themes - has been loaded. This check is automatically called any time a single resource has finished loading.
 * 
 * @private
 * @return {boolean} Whether or not all themes' resources has been succesfully loaded
 */
Loader.prototype.checkAllLoaded = function () {
	var i, total, loaded, theme;

	total = 0;
	loaded = 0;

	for (i in this.themes) {
		if (this.themes.hasOwnProperty(i)) {
			theme = this.themes[i];
			total += theme.resourcesCount;
			loaded += theme.resourcesLoaded;
		}
	}
	if (loaded === total) {
		if (this.onthemesloaded) {
			this.onthemesloaded();
		}
		return true;
	}
	return false;
};