/**
 * Sprite:
 * Class for drawing bitmaps with rotation and size.
 * Usually all graphical objects in a game are sprites or extends this class.
 */

NewClass('Sprite', [View, Animatable]);

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
	this.x = x !== undefined ? x : 0;
	this.y = y !== undefined ? y : 0;

	// Load default options
	this.source = source;
	this.dir = dir !== undefined ? dir : 0;

	engine.registerObject(this);

	this.imageNumber = 0;
	this.imageLength = 1;
	this.animationSpeed = 30;
	this.animationLastSwitch = engine.gameTime;
	this.animationLoops = true;

	// Size modifiers
	this.size = 1;
	this.widthModifier = 1;
	this.heightModifier = 1;

	// Draw options
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
	this.imageLength = this.bm.imageLength;
	this.imageNumber = Math.min(this.imageLength - 1, this.imageNumber);
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
 * Calculates and sets the width modifier to fit a targetted width.
 * 
 * @param {number} width The targetted width in pixels
 */
Sprite.prototype.setWidth = function (width) {
	this.widthModifier = width / (this.width * this.size);
};

/**
 * Calculates and sets the height modifier to fit a targetted height.
 * 
 * @param {number} height The targetted height in pixels
 */
Sprite.prototype.setHeight = function (height) {
	this.heightModifier = height / (this.height * this.size);
};

/**
 * Draws the object to the canvas.
 * 
 * @private
 * @param {object} c A canvas 2D context on which to draw the Sprite
 * @param {object} cameraOffset A Vector defining the offset to subtract from the drawing position (the camera's captureRegion's position)
 */
Sprite.prototype.drawCanvas = function (c, cameraOffset) {
	// Draw Sprite on canvas
	var x, y;

	// If sprites size has been modified to zero, do nothing
	if (this.size === 0 || this.widthModifier === 0 || this.heightModifier === 0 || this.opacity === 0) {
		return;
	}

	if (engine.avoidSubPixelRendering) {
		x = Math.round(this.x - cameraOffset.x);
		y = Math.round(this.y - cameraOffset.y);
	}
	else {
		x = this.x - cameraOffset.x;
		y = this.y - cameraOffset.y;
	}

	// Set the right subimage
	if (this.imageLength !== 1 && this.animationSpeed !== 0) {
		if (engine.gameTime - this.animationLastSwitch > 1000 / this.animationSpeed) {
			this.imageNumber = this.imageNumber + (this.animationSpeed > 0 ? 1 : -1);

			this.animationLastSwitch = engine.gameTime;

			if (this.imageNumber === this.imageLength) {
				this.imageNumber = this.animationLoops ? 0 : this.imageLength - 1;
			}
			else if (this.imageNumber === -1) {
				this.imageNumber = this.animationLoops ? this.imageLength - 1 : 0;
			}
		}
	}

	c.globalAlpha = this.opacity;
	if (this.composite !== 'source-over') {
		c.globalCompositeOperation = this.composite;
	}
	
	// If a rotation is used, translate the context and rotate it (much slower than using no rotation)
	if (this.dir !== 0) {
		c.translate(x, y);
		c.rotate(this.dir);
		c.scale(this.widthModifier * this.size, this.heightModifier * this.size);
		
		// Draw images
		c.drawImage(this.bm, (this.width + this.bm.spacing) * this.imageNumber, 0, this.width, this.height, - this.offset.x, - this.offset.y, this.width, this.height);
		
		c.scale(1 / (this.widthModifier * this.size), 1 / (this.heightModifier * this.size));
		c.rotate(-this.dir);
		c.translate(-x, -y);
	}
	// If the image is not rotated, draw it without rotation
	else {
		c.translate(x, y);
		c.scale(this.widthModifier * this.size, this.heightModifier * this.size);
		
		c.drawImage(this.bm, (this.width + this.bm.spacing) * this.imageNumber, 0, this.width, this.height, - this.offset.x, - this.offset.y, this.width, this.height);
		
		c.scale(1 / (this.widthModifier * this.size), 1 / (this.heightModifier * this.size));
		c.translate(-x, -y);
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
	ret = ret.scale(this.size * this.widthModifier, this.size * this.heightModifier);
	ret = ret.rotate(this.dir);
	ret = ret.getBoundingRectangle().add(this.getRoomPosition());
	ret.x = Math.floor(ret.x - 1);
	ret.y = Math.floor(ret.y - 1);
	ret.width = Math.ceil(ret.width + 2);
	ret.height = Math.ceil(ret.height + 2);

	return ret;
};