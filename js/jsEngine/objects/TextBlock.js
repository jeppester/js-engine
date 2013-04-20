/**
 * TextBlock:
 * A block of text with a limited width. If the width is reached by the text, the text will break into multiple lines.
 */

NewObject('TextBlock', [Animatable, View, Vector]);

/**
 * The constructor for the TextBlock class.
 * 
 * @param {string} string The string to display inside the TextBlock
 * @param {number} x The x-position of the object in the game arena, in pixels
 * @param {number} y The y-position of the object in the game arena, in pixels
 * @param {number} width The width of the textblock, in pixels. When the text reaches the width, it will break into a new line
 * @param {object} additionalProperties An object containing additional properties to assign to the created object.
 * The default is:
 * <code>{
 * 	font: 'normal 14px Verdana',
 * 	color: '#000',
 * 	alignment: 'left',
 * 	size: 1,
 * 	opacity: 1,
 * 	composite: 'source-over',
 * 	offset: new Vector(0, 0)
 * }</code>
 */
TextBlock.prototype.textBlock = function (string, x, y, width, additionalProperties) {
	if (string === undefined) {throw new Error('Missing argument: string'); }
	if (width === undefined) {throw new Error('Missing argument: width'); }

	// Call Vector's and view's constructors
	this.view();
	this.vector(x, y);

	// Load default options
	this.width = width;

	// Load default options
	this.font = 'normal 14px Verdana';
	this.alignment = 'left';
	this.offset = new Vector();
	this.color = "#000000";
	this.opacity = 1;
	this.size = 1;
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

	if (engine.avoidSubPixelRendering) {
		this.offset.x = Math.round(this.offset.x);
		this.offset.y = Math.round(this.offset.y);
	}
};

/**
 * Used for setting the text string of a TextBlock object.
 * 
 * @param {string} string A text string to set for the TextBlock object
 */
TextBlock.prototype.setString = function (string) {
	if (string === undefined) {throw new Error('Missing argument: string'); }
	this.string = string;

	if (typeof this.string !== 'string') {
		this.string = this.string.toString();
	}
	if (this.string === '') {
		this.string = ' ';
	}

	this.stringToLines();
	this.cacheRendering();
};

/**
 * Used for setting the text alignment of a TextBlock object.
 * 
 * @param {string} alignment A string representing the new text alignment. Valid alignments are: "left", "right", "center".
 */
TextBlock.prototype.setAlignment = function (alignment) {
	if (alignment === undefined) {throw new Error('Missing argument: alignment'); }
	if (/left|right|center/.test(alignment) === false) {throw new Error('Invalid alignment given. Valid alignments are: "left", "right", "center"'); }
	this.alignment = alignment;
	this.cacheRendering();
};

/**
 * Sets the text color of the TextBlock object.
 * 
 * @param {string} colorString A CSS colorstring. For instance "#000" or "#ABABAB" or "red"
 */
TextBlock.prototype.setColor = function (colorString) {
	if (colorString === undefined) {throw new Error('Missing argument: colorString'); }
	this.color = colorString;
	this.cacheRendering();
};

/**
 * Does the actual rendering of the text, and caches it (for huge performance gains). This function is automatically called each time a property which affects the rendering has been changed (via the right setter functions).
 * 
 * @private
 */
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

/**
 * Breaks the TextBlock's text string into lines.
 * 
 * @private
 */
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

/**
 * Draws the cached rendering of the TextBlock object to the canvas. Usually there is no reason to call this function manually since it is automatically called by the engine's redraw loop. To redraw depths that are not automatically redrawn, use the engine's redraw function.
 * 
 * @private
 * @param {object} c A canvas 2D context on which to draw the TextBlock
 */
TextBlock.prototype.drawCanvas = function (c) {
	// Draw on canvas
	if (/^\s*$/.test(this.string)) {return; }
	c.save();

	if (engine.avoidSubPixelRendering) {
		c.translate(Math.round(this.x), Math.round(this.y));
	}
	else {
		c.translate(this.x, this.y);
	}

	c.rotate(this.dir);
	c.globalAlpha = this.opacity;
	c.globalCompositeOperation = this.composite;
	c.drawImage(this.cache, - this.offset.x * this.size, - this.offset.y * this.size, this.cache.width * this.size, this.cache.height * this.size);
	c.restore();
};