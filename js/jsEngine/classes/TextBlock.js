new Class('TextBlock', [Animatable, View], {
	/**
	 * The constructor for the TextBlock class.
	 *
     * @name TextBlock
     * @class A block of text with a limited width. If the width is reached by the text, the text will break into multiple lines.
	 * @param {string} string The string to display inside the TextBlock
	 * @param {number} x The x-position of the object in the game arena, in pixels
	 * @param {number} y The y-position of the object in the game arena, in pixels
	 * @param {number} width The width of the textblock, in pixels. When the text reaches the width, it will break into a new line
	 * @param {object} additionalProperties An object containing additional properties to assign to the created object.
	 *                 The default is:<code>
     *                 {
	 * 	                font: 'normal 14px Verdana',
	 * 	                color: '#000',
	 * 	                alignment: 'left',
	 * 	                size: 1,
	 * 	                opacity: 1,
	 * 	                composite: 'source-over',
	 * 	                offset: new Vector(0, 0)
	 *                 }</code>
	 */
	TextBlock: function (string, x, y, width, additionalProperties) {
		if (string === undefined) {throw new Error('Missing argument: string'); }
		if (width === undefined) {throw new Error('Missing argument: width'); }

		// Call Vector's and view's constructors
		this.View();
		this.x = x !== undefined ? x : 0;
		this.y = y !== undefined ? y : 0;

		// Load default options
		this.width = width;

		// Load default options
		this.font = 'normal 14px Verdana';
		this.alignment = 'left';
		this.offset = new Vector();
		this.color = "#000000";
		this.opacity = 1;
		this.size = 1;
		this.widthModifier = 1;
		this.heightModifier = 1;
		this.dir = 0;
		this.composite = 'source-over';

		// Load additional properties
		this.importProperties(additionalProperties);
		this.lineHeight = this.lineHeight ? this.lineHeight: this.font.match(/[0.0-9]+/) * 1.25;

		this.lines = [];
		this.lineWidth = [];
		this.bm = document.createElement('canvas');
		this.bmCtx = this.bm.getContext('2d');
		this.bm.width = this.width;
		this.bm.height = 1000;
		engine.registerObject(this);

		this.setString(string);
		this.cacheRendering();

		if (engine.avoidSubPixelRendering) {
			this.offset.x = Math.round(this.offset.x);
			this.offset.y = Math.round(this.offset.y);
		}
	},
    /** @scope TextBlock */

	/**
	 * Used for setting the text string of a TextBlock object.
	 * 
	 * @param {string} string A text string to set for the TextBlock object
	 */
	setString: function (string) {
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
	},

	/**
	 * Used for setting the text alignment of a TextBlock object.
	 * 
	 * @param {string} alignment A string representing the new text alignment. Valid alignments are: "left", "right", "center".
	 */
	setAlignment: function (alignment) {
		if (alignment === undefined) {throw new Error('Missing argument: alignment'); }
		if (/left|right|center/.test(alignment) === false) {throw new Error('Invalid alignment given. Valid alignments are: "left", "right", "center"'); }
		this.alignment = alignment;
		this.cacheRendering();
	},

	/**
	 * Sets the text color of the TextBlock object.
	 * 
	 * @param {string} colorString A CSS colorstring. For instance "#000" or "#ABABAB" or "red"
	 */
	setColor: function (colorString) {
		if (colorString === undefined) {throw new Error('Missing argument: colorString'); }
		this.color = colorString;
		this.cacheRendering();
	},

	/**
	 * Does the actual rendering of the text, and caches it (for huge performance gains). This function is automatically called each time a property which affects the rendering has been changed (via the right setter functions).
	 * 
	 * @private
	 */
	cacheRendering: function () {
		var xOffset, i;

		this.bmCtx.clearRect(0, 0, this.bm.width, this.bm.height);
		this.bmCtx.font = this.font;
		this.bmCtx.fillStyle = this.color;
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
				this.bmCtx.fillText(this.lines[i], xOffset, this.lineHeight * (1 + i));
			}
		}
	},

	/**
	 * Breaks the TextBlock's text string into lines.
	 * 
	 * @private
	 */
	stringToLines: function () {
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
		this.bm.height = this.lines.length * this.lineHeight;
	},

	/**
	 * Calculates and sets the width modifier to fit a targeted width.
	 * 
	 * @param {number} width The targeted width in pixels
	 */
	setWidth: function (width) {
		this.widthModifier = width / (this.bm.width * this.size);
	},

	/**
	 * Calculates and sets the height modifier to fit a targeted height.
	 * 
	 * @param {number} height The targeted height in pixels
	 */
	setHeight: function (height) {
		this.heightModifier = height / (this.bm.height * this.size);
	},

	/**
	 * Draws the cached rendering of the TextBlock object to the canvas.
	 * 
	 * @private
	 * @param {CanvasRenderingContext2D} c A canvas 2D context on which to draw the TextBlock
	 * @param {Vector} cameraOffset A Vector defining the offset to subtract from the drawing position (the camera's captureRegion's position)
	 */
	drawCanvas: function (c, cameraOffset) {
		// Draw Sprite on canvas
		var x, y;

		if (/^\s*$/.test(this.string)) {return; }

		if (engine.avoidSubPixelRendering) {
			x = Math.round(this.x - cameraOffset.x);
			y = Math.round(this.y - cameraOffset.y);
		}
		else {
			x = this.x - cameraOffset.x;
			y = this.y - cameraOffset.y;
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
			c.drawImage(this.bm, this.width, 0, this.width, this.height, - this.offset.x, - this.offset.y, this.width, this.height);
			
			c.scale(1 / (this.widthModifier * this.size), 1 / (this.heightModifier * this.size));
			c.rotate(-this.dir);
			c.translate(-x, -y);
		}
		// If the image is not rotated, draw it without rotation
		else {
			c.translate(x, y);
			c.scale(this.widthModifier * this.size, this.heightModifier * this.size);
			
			c.drawImage(this.bm, this.width, 0, this.width, this.height, - this.offset.x, - this.offset.y, this.width, this.height);
			
			c.scale(1 / (this.widthModifier * this.size), 1 / (this.heightModifier * this.size));
			c.translate(-x, -y);
		}

		if (this.composite !== 'source-over') {
			c.globalCompositeOperation = 'source-over';
		}
		c.globalAlpha = 1;
	},

	/**
	 * Calculates a bounding non-rotated rectangle that the text block will fill when drawn.
	 * 
	 * @private
	 * @return {Rectangle} The bounding rectangle of the text block when drawn.
	 */
	getRedrawRegion: function () {
		var ret;

		ret = new Rectangle(-this.offset.x, -this.offset.y, this.bm.width, this.bm.height);
		ret = ret.getPolygon();
		ret = ret.scale(this.size * this.widthModifier, this.size * this.heightModifier);
		ret = ret.rotate(this.dir);
		ret = ret.getBoundingRectangle().add(this.getRoomPosition());
		ret.x = Math.floor(ret.x - 1);
		ret.y = Math.floor(ret.y - 1);
		ret.width = Math.ceil(ret.width + 2);
		ret.height = Math.ceil(ret.height + 2);

		return ret;
	},
});
