/*
TextBlock:
A block of text with a limited width
*/

jseCreateClass('TextBlock', [Animation, View, Vector2D]);

// Constructor
TextBlock.prototype.textBlock = function (string, x, y, width, additionalProperties) {
	if (string === undefined) {throw new Error('Missing argument: string'); }
	if (width === undefined) {throw new Error('Missing argument: width'); }

	this.vector2D(x, y);

	// Load default options
	this.width = width;

	// Load default options
	this.font = 'normal 14px Verdana';
	this.alignment = 'left';
	this.offset = new Vector2D();
	this.color = "#000000";
	this.opacity = 1;
	this.bmSize = 1;
	this.dir = 0;
	this.composite = 'source-over';

	// Load additional properties
	this.importProperties(additionalProperties);
	this.lineHeight = this.lineHeight ? this.lineHeight: this.font.match(/[0.0-9]+/) * 1.25;

	this.lines = [];
	this.lineWidth = [];
	this.cache = document.createElement('canvas');
	this.cacheCtx = this.cache.getContext('2d');
	this.cache.width = this.width;
	this.cache.height = 1000;
	engine.registerObject(this);

	this.setString(string);
	this.cacheRendering();
};

TextBlock.prototype.setString = function (string) {
	if (string === undefined) {throw new Error('Missing argument: string'); }
	this.string = string;

	if (typeof this.string !== 'string') {
		this.string = this.string.toString();
	}
	if (this.string === '') {
		this.string === ' ';
	}

	this.stringToLines();
	this.cacheRendering();
};

TextBlock.prototype.setAlignment = function (alignment) {
	if (alignment === undefined) {throw new Error('Missing argument: alignment'); }
	if (/left|right|center/.test(alignment) === false) {throw new Error('Invalid alignment given. Valid alignments are: left, right, center'); }
	this.alignment = alignment;
	this.cacheRendering();
}

TextBlock.prototype.setColor = function (colorString) {
	if (colorString === undefined) {throw new Error('Missing argument: colorString'); }
	this.color = colorString;
	this.cacheRendering();
}

TextBlock.prototype.cacheRendering = function () {
	var xOffset, i;

	this.cacheCtx.clearRect(0, 0, this.cache.width, this.cache.height);
	this.cacheCtx.font = this.font;
	this.cacheCtx.fillStyle = this.color;
	for (i = 0; i < this.lines.length; i ++) {
		xOffset = 0;

		switch (this.alignment) {
		case 'left':
			xOffset = 0;
			break;
		case 'right':
			xOffset = this.width - this.lineWidth[i];
			break;
		case 'center':
			xOffset = (this.width - this.lineWidth[i]) / 2;
			break;
		}

		if (this.lines[i]) {
			this.cacheCtx.fillText(this.lines[i], xOffset, this.lineHeight * (1 + i));
		}
	}
};

TextBlock.prototype.drawCanvas = function () {
	var c;

	// Draw on canvas
	if (/^\s*$/.test(this.string)) {return; }

	c = this.ctx;
	c.save();
	c.translate(this.x, this.y);
	c.rotate(this.dir);
	c.globalAlpha = this.opacity;
	c.globalCompositeOperation = this.composite;
	c.drawImage(this.cache, - this.offset.x * this.bmSize, - this.offset.y * this.bmSize, this.cache.width * this.bmSize, this.cache.height * this.bmSize);
	c.restore();
};

TextBlock.prototype.stringToLines = function () {
	var lt, line, paragraphs, pid, words, wid, word;

	lt = document.createElement('span');
	lt.style.font = this.font;
	lt.style.visibility = 'hidden';
	lt.style.position = 'absolute';
	document.body.appendChild(lt);

	line = 0;
	this.lines = [];
	this.lines[line] = '';

	paragraphs = this.string.split("\n");

	for (pid = 0; pid < paragraphs.length; pid ++) {
		words = paragraphs[pid].split(' ');

		for (wid = 0; wid < words.length; wid ++) {
			word = words[wid];

			lt.innerHTML += word + " ";
			if (lt.offsetWidth > this.width) {
				line ++;
				this.lines[line] = '';
				lt.innerHTML = '';
				lt.innerHTML += word + " ";
			}
			else {
				this.lineWidth[line] = lt.offsetWidth;
			}

			this.lines[line] += word + " ";
		}

		line ++;
		lt.innerHTML = '';
		this.lines[line] = '';
	}
	lt.parentNode.removeChild(lt);
};