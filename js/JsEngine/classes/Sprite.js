/*
Sprite:
A drawn bitmap with rotation and size.
Usually all graphical objects in a game are sprites or extends this object.
*/

jseCreateClass('Sprite', [View, Animation, Vector2D]);

Sprite.prototype.sprite = function (source, x, y, dir, additionalProperties) {
	if (source === undefined) {throw new Error('Missing argument: source'); }

	this.vector2D(x, y);

	// Load default options
	this.source = source;
	this.dir = dir !== undefined ? dir : 0;

	engine.registerObject(this);

	this.imageSpeed = 1;
	this.currentImage = 0;
	this.imageTimeOffset = engine.gameTime;

	this.bmSize = 1;
	this.opacity = 1;
	this.composite = 'source-over';

	// Load additional properties
	this.importProperties(additionalProperties);
		
	if (!this.refreshSource()) {
		throw new Error('Sprite source was not successfully loaded: ' + source);
	}

	this.offset = this.offset !== undefined ? this.offset : new Vector2D(this.width / 2, this.height / 2);
	if (this.offset.x === 'center') {this.offset.x = this.width / 2; }
	if (this.offset.y === 'center') {this.offset.y = this.height / 2; }

	if (engine.avoidSubPixelRendering) {
		this.offset.x = Math.round(this.offset.x); 
		this.offset.y = Math.round(this.offset.y);
	}
};

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
				parent = parent.parent
			}
			else {
				break;
			}
		}
	}

	return theme ? theme : engine.defaultTheme;
}

Sprite.prototype.refreshSource = function () {
	var theme;

	theme = this.getTheme();

	this.bm = loader.getImage(this.source, theme);
	this.imageLength = this.bm.imageLength;
	this.currentImage = Math.min(this.imageLength - 1, this.currentImage);
	this.width = Math.floor(this.bm.width / this.imageLength);
	this.height = this.bm.height;
	return this.bm;
};

Sprite.prototype.setSource = function (source) {
	if (source === undefined) {throw new Error('Missing argument: source'); }
	if (this.source === source) {return; }

	this.source = source;
	this.refreshSource();
};

Sprite.prototype.drawCanvas = function () {
	// Draw Sprite on canvas
	var c = this.ctx;
	c.save();

	if (engine.avoidSubPixelRendering) {
		c.translate(Math.round(this.x), Math.round(this.y));
	}
	else {
		c.translate(this.x, this.y);
	}

	if (this.imageLength !== 0) {
		this.currentImage = Math.floor((engine.gameTime - this.imageTimeOffset) / 1000 * this.imageSpeed) % this.imageLength;
	}

	c.globalAlpha = this.opacity;
	c.rotate(this.dir);
	c.globalCompositeOperation = this.composite;
	c.drawImage(this.bm, this.width * this.currentImage, 0, this.width, this.height, - this.offset.x * this.bmSize, - this.offset.y * this.bmSize, this.width * this.bmSize, this.height * this.bmSize);
	c.restore();
};