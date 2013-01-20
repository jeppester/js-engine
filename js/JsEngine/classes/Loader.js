/*
Loader:
Object for loading and storing ressources

No requirements
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

Loader.prototype.getSound = function (ressource, clone, themeName) {
	if (ressource === undefined) {throw new Error('Missing argument: ressource'); }
	clone = clone !== undefined ? clone : true;
	themeName = themeName !== undefined ? themeName : engine.defaultTheme;

	var sfx;

	clone = clone === undefined  ?  true : clone;
	sfx = this.getRessource(ressource, 'sfx', themeName);
	return sfx  ?  (clone  ?  sfx.cloneNode() : sfx) : false;
};

Loader.prototype.getMusic = function (ressource, themeName) {
	themeName = themeName !== undefined ? themeName : engine.defaultTheme;
	return this.getRessource(ressource, 'music', themeName);
};

Loader.prototype.getMask = function (ressource, themeName) {
	if (ressource === undefined) {throw new Error('Missing argument: ressource'); }
	themeName = themeName !== undefined ? themeName : engine.defaultTheme;

	return this.getRessource(ressource, 'masks', themeName);
}

Loader.prototype.getBBox = function (ressource, themeName) {
	if (ressource === undefined) {throw new Error('Missing argument: ressource'); }
	themeName = themeName !== undefined ? themeName : engine.defaultTheme;

	return this.getRessource(ressource, 'bBoxes', themeName);
};

Loader.prototype.getRessource = function (ressource, typeString, themeName) {
	if (ressource === undefined) {throw new Error('Missing argument: ressource'); }
	if (typeString === undefined) {throw new Error('Missing argument: typeString'); }
	if (themeName === undefined) {throw new Error('Missing argument: themeName'); }
	var res, inh, i;

	if (ressource.indexOf('/') !== -1) {
		ressource = ressource.replace('/', '.');
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

	return res === undefined || res.toString() === "[object Object]"  ?  false : res;
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

	var name, req, i, total;

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
		eval('var theme = ' + req.responseText);

		// Load inherited themes
		if (theme.inherit.length) {
			this.loadThemes(theme.inherit);
		}

		// Create new theme
		this.themes[name] = theme;
		theme.ressourcesCount = 0;
		theme.ressourcesLoaded = 0;
		theme.masksCount = 0;
		theme.bBoxesCount = 0;
		theme.masksGenerated = 0;
		theme.bBoxesGenerated = 0;
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

Loader.prototype.preGenerateMask = function (theme, ressourceString) {
	theme.masks[ressourceString] = Collidable.prototype.generateMask(ressourceString);
	theme.masksGenerated ++;
}

Loader.prototype.preGenerateBBox = function (theme, ressourceString) {
	theme.bBoxes[ressourceString] = Collidable.prototype.generateBBox(theme.masks[ressourceString]);
	theme.bBoxesGenerated ++;
}

Loader.prototype.loadRessources = function (theme, object, typeString) {
	if (theme === undefined) {throw new Error('Missing argument: theme'); }
	if (object === undefined) {throw new Error('Missing argument: object'); }
	if (typeString === undefined) {throw new Error('Missing argument: typeString'); }

	var onload, res, path, i, format;

	onload = function () {
		var total, loaded, ressourceString, theme, i;
		if (this.hasAttribute('data-loaded')) {return; }

		this.setAttribute('data-loaded', 'true');
		theme = loader.themes[this.getAttribute('data-theme')];
		ressourceString = this.getAttribute('data-ressourceString');
		theme.ressourcesLoaded ++;

		// If the loaded object is an image, generate mask and bboxes
		if (this.toString() === '[object HTMLImageElement]') {
			if (this.width * this.height < 20000) {
				theme.masksCount++;
				theme.bBoxesCount++;

				setTimeout(function () {
					loader.preGenerateMask(theme, ressourceString);
					loader.preGenerateBBox(theme, ressourceString);
					loader.checkAllLoaded();
				}, 1);
			}
			else {
				console.log('Skipping generation of mask and bbox (> 20000 px): ' + ressourceString);
			}
		}

		loader.checkAllLoaded();
	};

	for (path in object) {
		if (object.hasOwnProperty(path)) {
			switch (typeString) {
			case 'images':
				res = new Image();
				res.src = engine.themesPath + "/" + theme.name + "/images/" + path.replace(/\./g, '/') + '.png';
				theme.images[path] = res;
				res.onload = onload;
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
				theme.sfx[path] = res;
				res.addEventListener("canplaythrough", onload, false);
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
				res.setAttribute('preload', 'preload');
				theme.music[path] = res;
				res.addEventListener("canplaythrough", onload, false);
				break;
			}

			theme.ressourcesCount ++;
			res.setAttribute('data-theme', theme.name);
			res.setAttribute('data-ressourceString', path.replace(/\./g, '/'));
		}
	}
};

Loader.prototype.checkAllLoaded = function () {
	total = 0;
	loaded = 0;

	for (i in this.themes) {
		if (this.themes.hasOwnProperty(i)) {
			theme = this.themes[i];
			total += theme.ressourcesCount;
			total += theme.masksCount;
			total += theme.bBoxesCount;

			loaded += theme.ressourcesLoaded;
			loaded += theme.masksGenerated;
			loaded += theme.bBoxesGenerated;
		}
	}
	if (loaded === total) {
		if (this.onthemesloaded) {
			this.onthemesloaded();
		}
	}
}