/*
Loader:
Object for loading and storing ressources
*/

jseCreateClass('Loader');

Loader.prototype.loader = function () {
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
	this.loadOverlay.innerHTML = '<div id="loadOverlayText">JsEngine loading...</div>';
	engine.arena.appendChild(this.loadOverlay);
};

Loader.prototype.hideOverlay = function (callback) {
	this.fadeCallback = callback;
	this.fadeOpacity = 1;
	this.fade = function () {
		var obj = loader.loadOverlay;
		loader.fadeOpacity = Math.max(0, loader.fadeOpacity - 0.1);
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

Loader.prototype.getImage = function (ressource, themeName) {
	if (ressource === undefined) {throw new Error('Missing argument: ressource'); }
	themeName = themeName !== undefined ? themeName : engine.defaultTheme;

	return this.getRessource(ressource, 'images', themeName);
};

Loader.prototype.getSound = function (ressource, themeName) {
	if (ressource === undefined) {throw new Error('Missing argument: ressource'); }
	themeName = themeName !== undefined ? themeName : engine.defaultTheme;

	return this.getRessource(ressource, 'sfx', themeName);
};

Loader.prototype.getMusic = function (ressource, themeName) {
	themeName = themeName !== undefined ? themeName : engine.defaultTheme;
	return this.getRessource(ressource, 'music', themeName);
};

Loader.prototype.getMask = function (ressource, themeName) {
	if (ressource === undefined) {throw new Error('Missing argument: ressource'); }
	themeName = themeName !== undefined ? themeName : engine.defaultTheme;

	var mask;

	// Check if the mask has been generated
	mask = this.getRessource(ressource, 'masks', themeName);
	if (mask) {
		// If yes, return the mask
		return mask;
	}
	// Otherwise, generate the mask and return it
	else {
		mask = this.generateMask(ressource);
		this.themes[themeName].masks[ressource] = mask;
		return mask;
	}
};

Loader.prototype.getRessource = function (ressource, typeString, themeName) {
	if (ressource === undefined) {throw new Error('Missing argument: ressource'); }
	if (typeString === undefined) {throw new Error('Missing argument: typeString'); }
	if (themeName === undefined) {throw new Error('Missing argument: themeName'); }
	var res, inh, i;

	if (ressource.indexOf('/') !== -1) {
		ressource = ressource.replace(/\//g, '.');
	}

	res = this.themes[themeName][typeString][ressource];

	// Search for the ressource in inherited themes
	if (res === undefined) {
		for (i = 0; i < this.themes[themeName].inherit.length; i ++) {
			inh = this.themes[themeName].inherit[i];
			if (this.themes[inh]) {
				res = this.themes[inh][typeString][ressource];

				if (res) {
					break;
				}
			}
		}
	}

	return res === undefined ? false : res;
};

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

Loader.prototype.loadClasses = function (paths) {
	if (paths === undefined) {throw new Error('Missing argument: paths'); }
	var className, i;

	for (i in paths) {
		if (paths.hasOwnProperty(i)) {
			// Check that the class is not already loaded
			className = paths[i].match(/(\w*)\.\w+$/)[1];
			if (window[className]) {continue; }

			jseSyncLoad(paths[i]);
			this.loaded.classes[className] = paths[i];
		}
	}
	return true;
};

// Function for reloading all classes - Very useful for applying code changes without having to refresh the browser
Loader.prototype.reloadAllClasses = function () {
	var i;

	for (i in this.loaded.classes) {
		if (this.loaded.classes.hasOwnProperty(i)) {
			jseSyncLoad(this.loaded.classes[i]);
		}
	}
};

// Function for loading themes
Loader.prototype.loadThemes = function (themeNames, callback) {
	if (themeNames === undefined) {throw new Error('Missing argument: themeNames'); }
	if (callback !== undefined) {this.onthemesloaded = callback; }

	var name, req, i, total, theme;

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
		eval('theme = ' + req.responseText);

		// Load inherited themes
		if (theme.inherit.length) {
			this.loadThemes(theme.inherit);
		}

		// Create new theme
		this.themes[name] = theme;
		theme.ressourcesCount = 0;
		theme.ressourcesLoaded = 0;
		theme.masks = {};
		theme.bBoxes = {};

		// Load all images
		this.loadRessources(theme, theme.images, 'images');
		this.loadRessources(theme, theme.sfx, 'sfx');
		this.loadRessources(theme, theme.music, 'music');
	}

	// Check if the theme was empty, if so, run callback
	total = 0;
	for (i in this.themes) {
		if (this.themes.hasOwnProperty(i)) {
			total += this.themes[i].ressourcesCount;
		}
	}
	if (total === 0) {
		if (this.onthemesloaded) {
			this.onthemesloaded();
		}
	}
};

Loader.prototype.loadRessources = function (theme, object, typeString) {
	if (theme === undefined) {throw new Error('Missing argument: theme'); }
	if (object === undefined) {throw new Error('Missing argument: object'); }
	if (typeString === undefined) {throw new Error('Missing argument: typeString'); }

	var onload, res, path, i, format, images;

	onload = function () {
		var ressourceString, theme, i;
		if (this.hasAttribute('data-loaded')) {return; }

		
		if (engine.preGenerateBoundingBoxes && this.toString() === '[object HTMLImageElement]') {
			ressourceString = this.getAttribute('data-ressourceString');
			theme = this.getAttribute('data-theme');

			console.log('Pre-generating bounding box: ' + ressourceString);
			for (i = 0; i < 100; i++) {
				loader.getBBox(ressourceString, theme, i / 50 * Math.PI);
			}
		}

		this.setAttribute('data-loaded', 'true');
		theme = loader.themes[this.getAttribute('data-theme')];
		theme.ressourcesLoaded ++;

		loader.checkAllLoaded();
	};

	for (path in object) {
		if (object.hasOwnProperty(path)) {
			switch (typeString) {
			case 'images':
				res = new Image();
				res.src = engine.themesPath + "/" + theme.name + "/images/" + path.replace(/\./g, '/') + '.png';
				if (images = object[path].match(/; *(\d+) *images?/)) {
					res.imageLength = images[1];
				}
				else {
					res.imageLength = 1;
				}
				if (images = object[path].match(/; *bordered/)) {
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
				theme.ressourcesCount ++;
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
					theme.ressourcesCount ++;
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
				theme.music[path] = res;

				if (engine.preloadSounds) {
					res.setAttribute('preload', 'auto');
					res.addEventListener("canplaythrough", onload, false);
					theme.ressourcesCount ++;
				}
				break;
			}

			res.setAttribute('data-theme', theme.name);
			res.setAttribute('data-ressourceString', path.replace(/\./g, '/'));
		}
	}
};

Loader.prototype.generateMask = function (ressourceString, alphaLimit) {
	if (ressourceString === undefined) {throw new Error('Missing argument: ressourceString'); }
	alphaLimit = alphaLimit !== undefined ? alphaLimit : 255;

	var image, canvas, ctx, bitmap, data, length, pixel, top, bottom, left, right, x, y;

	image = loader.getImage(ressourceString);

	canvas = document.createElement('canvas');
	canvas.width = image.width;
	canvas.height = image.height;
	ctx = canvas.getContext('2d');

	if (image === false) {
		console.log(ressourceString);
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

Loader.prototype.checkAllLoaded = function () {
	var i, total, loaded, theme;

	total = 0;
	loaded = 0;

	for (i in this.themes) {
		if (this.themes.hasOwnProperty(i)) {
			theme = this.themes[i];
			total += theme.ressourcesCount;
			loaded += theme.ressourcesLoaded;
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