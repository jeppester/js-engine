/*
Sprite:
A drawn bitmap with rotation and size.
Usually all graphical objects in a game extends a sprite.

Requirements:
	Animation
	Animator
*/

jseCreateClass('Sprite', [View, Animation, Vector2D]);

Sprite.prototype.sprite = function (source, x, y, dir, additionalProperties) {
	if (source === undefined) {throw new Error('Missing argument: source'); }

	this.vector2D(x, y);

	// Load default options
	this.source = source;
	this.dir = dir !== undefined ? dir : 0;

	engine.registerObject(this);

	this.bmSize = 1;
	this.opacity = 1;
	this.composite = 'source-over';

	// Load additional properties
	this.importProperties(additionalProperties);
	
	if (!this.refreshSource()) {
		throw new Error('Sprite source was not successfully loaded: ' + source);
	}
	
	this.bmWidth = this.bm.width;
	this.bmHeight = this.bm.height;

	this.offset = this.offset !== undefined ? this.offset : new Vector2D(this.bm.width / 2, this.bm.height / 2);
	if (this.offset.x === 'center') {this.offset.x = this.bm.width / 2; }
	if (this.offset.y === 'center') {this.offset.y = this.bm.height / 2; }
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
	this.bmWidth = this.bm.width;
	this.bmHeight = this.bm.height;
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
	c.translate(this.x, this.y);
	c.globalAlpha = this.opacity;
	c.rotate(this.dir);
	c.globalCompositeOperation = this.composite;
	c.drawImage(this.bm, - this.offset.x * this.bmSize, - this.offset.y * this.bmSize, this.bmWidth * this.bmSize, this.bmHeight * this.bmSize);
	c.restore();
};