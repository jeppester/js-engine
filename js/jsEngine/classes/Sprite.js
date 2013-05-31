/**
 * Sprite:
 * Class for drawing bitmaps with rotation and size.
 * Usually all graphical objects in a game are sprites or extends this class.
 */

NewClass('Sprite', [View, Animatable, Vector]);

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
Sprite.prototype.Sprite = function (source, x, y, dir, additionalProperties) {
	if (source === undefined) {throw new Error('Missing argument: source'); }

	// Call Vector's and view's constructors
	this.View();
	this.Vector(x, y);

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
 * @param {string} The resource string of the bitmap-source to use for the object
 */
Sprite.prototype.setSource = function (source) {
	if (source === undefined) {throw new Error('Missing argument: source'); }
	if (this.source === source) {return; }

	this.source = source;
	this.refreshSource();
};

/**
 * Draws the object to the canvas.
 * 
 * @private
 * @param {object} c A canvas 2D context on which to draw the Sprite
 */
Sprite.prototype.drawCanvas = function (c, cameraOffset) {
	// Draw Sprite on canvas
	var x, y;

	if (engine.avoidSubPixelRendering) {
		x = Math.round(this.x - cameraOffset.x);
		y = Math.round(this.y - cameraOffset.y);
	}
	else {
		x = this.x - cameraOffset.x;
		y = this.y - cameraOffset.y;
	}

	// Set the right subimage
	if (this.imageLength !== 1) {
		this.currentImage = Math.floor((engine.gameTime - this.imageTimeOffset) / 1000 * this.imageSpeed) % this.imageLength;
	}

	c.globalAlpha = this.opacity;
	if (this.composite !== 'source-over') {
		c.globalCompositeOperation = this.composite;
	}
	
	// If a rotation is used, translate the context and rotate it (much slower than using no rotation)
	if (this.dir !== 0) {
		c.translate(x, y);
		c.rotate(this.dir);
		
		// Draw images
		c.drawImage(this.bm, (this.width + this.bm.spacing) * this.currentImage, 0, this.width, this.height, - this.offset.x * this.size, - this.offset.y * this.size, this.width * this.size, this.height * this.size);
		
		c.rotate(-this.dir);
		c.translate(-x, -y);
	}
	// If the image is not rotated, draw it without rotation (much faster)
	else {
		c.drawImage(this.bm, (this.width + this.bm.spacing) * this.currentImage, 0, this.width, this.height, x - this.offset.x * this.size, y - this.offset.y * this.size, this.width * this.size, this.height * this.size);
	}

	if (this.composite !== 'source-over') {
		c.globalCompositeOperation = 'source-over';
	}
	c.globalAlpha = 1;
};

/**
 * Calculates the region which the sprite will fill out when redrawn.
 * 
 * @private
 * @return {object} The bounding rectangle of the sprite's redraw
 */
Sprite.prototype.getRedrawRegion = function () {
	var ret;

	ret = new Rectangle(-this.offset.x, -this.offset.y, Math.floor(this.bm.width / this.imageLength), this.bm.height);
	ret = ret.getPolygon();
	ret = ret.scale(this.size);
	ret = ret.rotate(this.dir)
	ret = ret.getBoundingRectangle().move(this.x, this.y);
	ret.x = Math.floor(ret.x - 1);
	ret.y = Math.floor(ret.y - 1);
	ret.width = Math.ceil(ret.width + 2);
	ret.height = Math.ceil(ret.height + 2);

	return ret;
}