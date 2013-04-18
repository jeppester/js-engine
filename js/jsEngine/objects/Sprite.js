/**
 * Sprite:
 * A drawn bitmap with rotation and size.
 * Usually all graphical objects in a game are sprites or extends this object.
 */

jseCreateClass('Sprite', [View, Animatable, Vector]);

/**
 * The constructor for Sprite objects.
 * 
 * @param {string} source A string representing the source of the object's bitmap
 * @param {number} x The x-position of the object in the game arena, in pixels
 * @param {number} y The y-position of the object in the game arena, in pixels
 * @param {number} dir The rotation (in radians) of the object when drawn in the game arena
 * @param {object} additionalProperties An object containing additional properties to assign to the created object.
 * The default is:
 * <code>{
 * 	size: 1,
 * 	opacity: 1,
 * 	composite: 'source-over',
 * 	offset: new Vector('center', 'center')
 * }</code>
 */
Sprite.prototype.sprite = function (source, x, y, dir, additionalProperties) {
	if (source === undefined) {throw new Error('Missing argument: source'); }

	// Call Vector's and view's constructors
	this.vector(x, y);
	this.view();

	// Load default options
	this.source = source;
	this.dir = dir !== undefined ? dir : 0;

	engine.registerObject(this);

	this.imageSpeed = 10;
	this.currentImage = 0;
	this.imageTimeOffset = engine.gameTime;

	this.size = 1;
	this.opacity = 1;
	this.composite = 'source-over';

	// Load additional properties
	this.importProperties(additionalProperties);

	if (!this.refreshSource()) {
		throw new Error('Sprite source was not successfully loaded: ' + source);
	}

	this.offset = this.offset !== undefined ? this.offset : new Vector(this.width / 2, this.height / 2);
	if (this.offset.x === 'center') {this.offset.x = this.width / 2; }
	if (this.offset.y === 'center') {this.offset.y = this.height / 2; }

	if (engine.avoidSubPixelRendering) {
		this.offset.x = Math.round(this.offset.x);
		this.offset.y = Math.round(this.offset.y);
	}
};

/**
 * Fetches the name of the theme which currently applies to the object.
 * 
 * @return {string} The name of the object's theme
 */
Sprite.prototype.getTheme = function () {
	var parent, theme;

	theme = this.theme;

	parent = this;
	while (theme === undefined) {
		if (parent.theme) {
			theme = parent.theme;
		}
		else {
			if (parent.parent) {
				parent = parent.parent;
			}
			else {
				break;
			}
		}
	}

	return theme ? theme : engine.defaultTheme;
};

/**
 * Updates the source bitmap of the object to correspond to it's current theme (set with setTheme or inherited).
 * Calling this function is usually not necessary since it is automatically called when setting the theme of the object itself or it's parent object.
 * 
 * @private
 */
Sprite.prototype.refreshSource = function () {
	var theme;

	theme = this.getTheme();

	this.bm = loader.getImage(this.source, theme);
	this.imageLength = this.bm.imageLength * 1;
	this.currentImage = Math.min(this.imageLength - 1, this.currentImage);
	this.width = Math.floor(this.bm.width / this.imageLength);
	this.height = this.bm.height;
	return this.bm;
};

/**
 * Sets the bitmap-source of the object. For more information about bitmaps and themes, see themes.
 * 
 * @param {string} The ressource string of the bitmap-source to use for the object
 */
Sprite.prototype.setSource = function (source) {
	if (source === undefined) {throw new Error('Missing argument: source'); }
	if (this.source === source) {return; }

	this.source = source;
	this.refreshSource();
};

/**
 * Draws the object to the canvas. Usually there is no reason to call this function manually since it is automatically called by the engine's redraw loop. To redraw depths that are not automatically redrawn, use redraw.
 * 
 * @private
 * @param {object} c A canvas 2D context on which to draw the Sprite
 */
Sprite.prototype.drawCanvas = function (c) {
	// Draw Sprite on canvas
	c.save();

	if (engine.avoidSubPixelRendering) {
		c.translate(Math.round(this.x), Math.round(this.y));
	}
	else {
		c.translate(this.x, this.y);
	}

	if (this.imageLength !== 1) {
		this.currentImage = Math.floor((engine.gameTime - this.imageTimeOffset) / 1000 * this.imageSpeed) % this.imageLength;
	}

	c.globalAlpha = this.opacity;
	c.rotate(this.dir);
	c.globalCompositeOperation = this.composite;
	c.drawImage(this.bm, (this.width + this.bm.spacing) * this.currentImage, 0, this.width, this.height, - this.offset.x * this.size, - this.offset.y * this.size, this.width * this.size, this.height * this.size);
	c.restore();
};