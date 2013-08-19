new Class('View.TextBlock', [Lib.Animatable, View.Container], {
	/**
	 * The constructor for the TextBlock class.
	 *
     * @name TextBlock
     * @class A block of text with a limited width. If the width is reached by the text, the text will break into multiple lines.
     * @augments Animatable
     * @augments View
     *
     * @property {string} font A css string representing the font of the text block
     * @property {number} width The width of the text block
     * @property {number} height The height of the text block
     * @property {string} alignment The text alignment of the text block, possible values are: "left", "center", "right"
     * @property {string} color A css string representing the text's color
     * @property {Vector} offset The offset with which the sprite will be drawn (to its position)
     * @property {number} direction The direction of the sprite (in radians)
     * @property {number} size A size modifier which modifies both the width and the height of the sprite
     * @property {number} widthModifier A size modifier which modifies the width of the sprite
     * @property {number} heightModifier A size modifier which modifies the height of the object
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
	 * 	                alignment: 'left',
	 * 	                size: 1,
	 * 	                opacity: 1,
	 * 	                composite: 'source-over',
	 * 	                offset: new Math.Vector(0, 0)
	 *                 }</code>
	 */
	TextBlock: function (string, x, y, width, additionalProperties) {
		if (string === undefined) {throw new Error('Missing argument: string'); }

		// Call Vector's and view's constructors
		this.Container();
		this.x = x !== undefined ? x : 0;
		this.y = y !== undefined ? y : 0;

		// Load default options
		this.width = width !== undefined ? width : 200;

		// Load default options
		this.font = 'normal 14px Verdana';
		this.alignment = 'left';
		this.offset = new Math.Vector();
		this.color = "#000000";
		this.opacity = 1;
		this.size = 1;
		this.widthModifier = 1;
		this.heightModifier = 1;
		this.direction = 0;
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
		this.onAfterChange();
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

        this.height = this.lines.length * this.lineHeight;
		this.bm.height = this.height;
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
     * Checks if the objects is visible. This function runs before each draw to ensure that it is necessary
     * @return {boolean} Whether or not the object is visible (based on its size and opacity vars) 
     */
    isVisible: function () {
        // If sprites size has been modified to zero, do nothing
        return !(this.size === 0 || this.widthModifier === 0 || this.heightModifier === 0 || /^\s*$/.test(this.string));
    },

	/**
	 * Draws the cached rendering of the TextBlock object to the canvas.
	 * 
	 * @private
	 * @param {CanvasRenderingContext2D} c A canvas 2D context on which to draw the TextBlock
	 * @param {Vector} cameraOffset A Vector defining the offset to subtract from the drawing position (the camera's captureRegion's position)
	 */
	drawCanvas: function (c) {
		// Draw Sprite on canvas
		var x, y;

		// Round offset if necessary
		var offX, offY;
		if (engine.avoidSubPixelRendering) {
            offX = Math.round(this.offset.x);
            offY = Math.round(this.offset.y);
        }
        else {
            offX = this.offset.x;
            offY = this.offset.y;
		}

        // Draw bm
        c.drawImage(this.bm, 0, 0, this.width, this.height, - offX, - offY, this.width, this.height);
	},

	/**
	 * Calculates a bounding non-rotated rectangle that the text block will fill when drawn.
	 * 
	 * @private
	 * @return {Rectangle} The bounding rectangle of the text block when drawn.
	 */
	getRedrawRegion: function () {
		var ret;

		ret = new Math.Rectangle(-this.offset.x, -this.offset.y, this.bm.width, this.bm.height);
		ret = ret.getPolygon();
		ret = ret.scale(this.size * this.widthModifier, this.size * this.heightModifier);
		ret = ret.rotate(this.direction);
		ret = ret.getBoundingRectangle().add(this.getRoomPosition());
		ret.x = Math.floor(ret.x - 1);
		ret.y = Math.floor(ret.y - 1);
		ret.width = Math.ceil(ret.width + 2);
		ret.height = Math.ceil(ret.height + 2);

		return ret;
	}
});
