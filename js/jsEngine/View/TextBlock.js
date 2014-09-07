nameSpace('View');

View.TextBlock = createClass('TextBlock', [Mixin.Animatable, View.Container], /** @lends View.TextBlock.prototype */ {
	/**
	 * The constructor for the TextBlock class.
	 *
	 * @name View.TextBlock
	 * @class A block of text with a limited width. If the width is reached by the text, the text will break into multiple lines.
	 * @augments Mixin.Animatable
	 * @augments View.Container
	 *
	 * @property {string} font A css string representing the font of the text block
	 * @property {number} width The width of the text block
	 * @property {number} height The height of the text block
	 * @property {string} alignment The text alignment of the text block, possible values are: ALIGNMENT_LEFT, ALIGNMENT_CENTER, ALIGNMENT_RIGHT
	 * @property {string} color A css string representing the text's color
	 * @property {Vector} offset The offset with which the sprite will be drawn (to its position)
	 * @property {number} direction The direction of the sprite (in radians)
	 * @property {number} size A size modifier which modifies both the width and the height of the sprite
	 * @property {number} widthScale A size modifier which modifies the width of the sprite
	 * @property {number} heightScale A size modifier which modifies the height of the object
	 * @property {number} opacity The opacity of the sprite
	 *
	 * @param {string} string The string to display inside the TextBlock
	 * @param {number} [x=0] The x-position of the object in the game arena, in pixels
	 * @param {number} [y=0] The y-position of the object in the game arena, in pixels
	 * @param {number} [width=200] The width of the text block, in pixels. When the text reaches the width, it will break into a new line
	 * @param {Object} [additionalProperties] An object containing additional properties to assign to the created object.
	 *                 The default is:<code>
	 *                 {
	 * 	                font: 'normal 14px Verdana',
	 * 	                color: '#000',
	 * 	                alignment: ALIGNMENT_LEFT,
	 * 	                size: 1,
	 * 	                opacity: 1,
	 * 	                composite: 'source-over',
	 * 	                offset: new Math.Vector(0, 0)
	 *                 }</code>
	 */
	TextBlock: function (string, x, y, width, additionalProperties) {
		if (string === undefined) {throw new Error('Missing argument: string'); } //dev

		var hidden, offset;

		// Call Vector's and view's constructors
		this.Container();
		this.renderType = "textblock";
		this.x = x !== undefined ? x : 0;
		this.y = y !== undefined ? y : 0;

		// Animation options
		this.imageLength = 1;
		this.imageNumber = 0;

		// Load default options
		this.clipWidth = parseInt(width, 10) || 200;
		this.lines = [];
		this.lineWidth = [];
		this.bm = document.createElement('canvas');
		this.bmCtx = this.bm.getContext('2d');
		this.bm.width = this.clipWidth;
		this.bm.height = 10;
		this.bm.spacing = 0;

		// Create getters/setters
		hidden = {
			string: '',
			font: 'normal 14px Verdana',
			alignment: 'left',
			color: "#000000",
			lineHeight: 0,
		};

		Object.defineProperty(this, 'string', {
			get: function () {return hidden.string; },
			set: function (value) {
				hidden.string = typeof value === 'string' ? value : value.toString();
				this.stringToLines();
				this.cacheRendering();
				engine.enableRedrawRegions && this.onAfterChange();
				return value;
			}
		});
		Object.defineProperty(this, 'font', {
			get: function () {return hidden.font; },
			set: function (value) {
				if (typeof value !== 'string') {throw new Error('font should be of type: string'); } //dev
				if (value === hidden.font) {return value; }
				hidden.font = value;
				this.stringToLines();
				this.cacheRendering();
				engine.enableRedrawRegions && this.onAfterChange();
				return value;
			}
		});
		Object.defineProperty(this, 'alignment', {
			get: function () {return hidden.alignment; },
			set: function (value) {
				if (['left', 'center', 'right'].indexOf(value) === -1) {throw new Error('alignment should be one of the following: ALIGNMENT_LEFT, ALIGNMENT_CENTER, ALIGNMENT_RIGHT'); } //dev
				if (value === hidden.alignment) {return value; }
				hidden.alignment = value;
				this.cacheRendering();
				engine.enableRedrawRegions && this.onAfterChange();
				return value;
			}
		});
		Object.defineProperty(this, 'color', {
			get: function () {return hidden.color; },
			set: function (value) {
				if (!/#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})/.test(value)) {throw new Error('color should be a CSS color string'); } //dev
				if (value === hidden.color) {return value; }
				hidden.color = value;
				this.cacheRendering();
				engine.enableRedrawRegions && this.onAfterChange();
				return value;
			}
		});
		Object.defineProperty(this, 'lineHeight', {
			get: function () {return hidden.lineHeight; },
			set: function (value) {
				hidden.lineHeight = typeof value !== "number" ? value : parseFloat(value);
				this.calculateCanvasHeight();
				this.cacheRendering();
				engine.enableRedrawRegions && this.onAfterChange();
				return value;
			}
		});

		// Define pseudo properties
		Object.defineProperty(this, 'width', {
			get: function () {
				return Math.abs(this.clipWidth * this.size * this.widthScale);
			},
			set: function (value) {
				var sign = this.widthScale > 0 ? 1 : -1;
				this.widthScale = sign * Math.abs(value / (this.clipWidth * this.size));
				return value;
			}
		});
		Object.defineProperty(this, 'height', {
			get: function () {
				return Math.abs(this.clipHeight * this.size * this.heightScale);
			},
			set: function (value) {
				var sign = this.heightScale > 0 ? 1 : -1;
				this.heightScale = sign * Math.abs(value / (this.clipHeight * this.size));
				return value
			}
		});

		this.lineHeight = additionalProperties && additionalProperties.lineHeight ? additionalProperties.lineHeight: this.font.match(/[0.0-9]+/) * 1.25;

		offset = OFFSET_TOP_LEFT;
		if (additionalProperties && additionalProperties.offset) {
			offset = additionalProperties.offset;
			delete additionalProperties.offset;
		}

		// Load additional properties
		this.importProperties(additionalProperties);
		this.string = string;

		// Set offset after the source has been set (otherwise the offset cannot be calculated correctly)
		this.offset = offset;

		if (engine.avoidSubPixelRendering) {
			this.offset.x = Math.round(this.offset.x);
			this.offset.y = Math.round(this.offset.y);
		}
	},
	/** @scope TextBlock */

	/**
	 * Parses an offset global into an actual Math.Vector offset that fits the instance
	 *
	 * @param  {number} offset Offset global (OFFSET_TOP_LEFT, etc.)
	 * @return {Math.Vector} The offset vector the offset global corresponds to for the instance
	 */
	parseOffsetGlobal: function (offset) {
		ret = new Math.Vector();

		// calculate horizontal offset
		if ([OFFSET_TOP_LEFT, OFFSET_MIDDLE_LEFT, OFFSET_BOTTOM_LEFT].indexOf(offset) !== -1) {
			ret.x = 0;
		}
		else if ([OFFSET_TOP_CENTER, OFFSET_MIDDLE_CENTER, OFFSET_BOTTOM_CENTER].indexOf(offset) !== -1) {
			ret.x = this.clipWidth / 2;
		}
		else if ([OFFSET_TOP_RIGHT, OFFSET_MIDDLE_RIGHT, OFFSET_BOTTOM_RIGHT].indexOf(offset) !== -1) {
			ret.x = this.clipWidth;
		}

		// calculate vertical offset
		if ([OFFSET_TOP_LEFT, OFFSET_TOP_CENTER, OFFSET_TOP_RIGHT].indexOf(offset) !== -1) {
			ret.y = 0;
		}
		else if ([OFFSET_MIDDLE_LEFT, OFFSET_MIDDLE_CENTER, OFFSET_MIDDLE_RIGHT].indexOf(offset) !== -1) {
			ret.y = this.clipHeight / 2;
		}
		else if ([OFFSET_BOTTOM_LEFT, OFFSET_BOTTOM_CENTER, OFFSET_BOTTOM_RIGHT].indexOf(offset) !== -1) {
			ret.y = this.clipHeight;
		}

		return ret;
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
			lt.innerHTML = '';
			this.lines[line] = '';

			for (wid = 0; wid < words.length; wid ++) {
				word = words[wid];

				lt.innerHTML += word + " ";
				if (lt.offsetWidth > this.clipWidth) {
					line ++;
					this.lines[line] = '';
					lt.innerHTML = '';
					lt.innerHTML += word + " ";
					this.lineWidth[line] = lt.offsetWidth;
				}
				else {
					this.lineWidth[line] = lt.offsetWidth;
				}

				this.lines[line] += word + " ";
			}

			line ++;
		}

		this.calculateCanvasHeight();
		lt.parentNode.removeChild(lt);
	},

	/**
	 * Calculates and sets the height of the cache canvas based on the number of lines, the font height and the line height
	 */
	calculateCanvasHeight: function () {
		this.bm.height = (this.lines.length - 1) * this.lineHeight + this.font.match(/[0.0-9]+/) * 1.25;
		this.clipHeight = this.bm.height;
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
				xOffset = this.clipWidth - this.lineWidth[i];
				break;
			case 'center':
				xOffset = (this.clipWidth - this.lineWidth[i]) / 2;
				break;
			}

			if (this.lines[i]) {
				this.bmCtx.fillText(this.lines[i], xOffset, this.lineHeight * i + this.font.match(/[0.0-9]+/) * 1);
			}
		}

		this.createHash();
	},

	createHash: function () {
		var self;

		self = this;
		this.bm.oldSrc = this.bm.src;
		this.bm.src = ['string', 'font', 'alignment', 'color', 'lineHeight', 'clipWidth'].map(function (property) {
			return self[property];
		}).join('-|-');
	},

	/**
	 * Checks if the objects is visible. This function runs before each draw to ensure that it is necessary
	 * @return {boolean} Whether or not the object is visible (based on its size and opacity vars)
	 */
	isVisible: function () {
		// If sprites size has been modified to zero, do nothing
		return !(this.size === 0 || this.widthScale === 0 || this.heightScale === 0 || /^\s*$/.test(this.string));
	},

	/**
	 * Calculates a bounding non-rotated rectangle that the text block will fill when drawn.
	 *
	 * @private
	 * @return {Rectangle} The bounding rectangle of the text block when drawn.
	 */
	getRedrawRegion: function () {
		var ret;

		ret = new Math.Rectangle(-this.offset.x, -this.offset.y, this.clipWidth, this.clipHeight);
		ret = ret.getPolygon();
		ret = ret.scale(this.size * this.widthScale, this.size * this.heightScale);
		ret = ret.rotate(this.direction);
		ret = ret.getBoundingRectangle().add(this.getRoomPosition());
		ret.x = Math.floor(ret.x - 1);
		ret.y = Math.floor(ret.y - 1);
		ret.width = Math.ceil(ret.width + 2);
		ret.height = Math.ceil(ret.height + 2);

		return ret;
	}
});
