/*
Sprite:
A drawn bitmap with rotation and size.
Usually all graphical objects in a game extends a sprite.

Requirements:
	Animation
	Animator
*/

jseCreateClass('Sprite', [View, Animation]);

Sprite.prototype.sprite = function (source, x, y, dir, additionalProperties) {
	if (source === undefined) {throw new Error('Missing argument: source'); }

	// Load default options
	this.source = source;
	this.x = x !== undefined ? x : 0;
	this.y = y !== undefined ? y : 0;
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

	this.xOff = this.xOff !== undefined && this.xOff !== 'center' ? this.xOff : this.bmWidth / 2;
	this.yOff = this.yOff !== undefined && this.yOff !== 'center' ? this.yOff : this.bmHeight / 2;
};

Sprite.prototype.refreshSource = function () {
	var parent, theme;

	theme = this.theme;

	if (theme === undefined) {
		if (this.parent) {
			parent = this.parent;

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
		}
	}

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
	try {
		c.drawImage(this.bm, - this.xOff * this.bmSize, - this.yOff * this.bmSize, this.bmWidth * this.bmSize, this.bmHeight * this.bmSize);
	} catch (e) {
		console.log(this.source);
		console.log(this.bm);
		engine.stopMainLoop();
		throw new Error(e);
	}
	c.restore();
};