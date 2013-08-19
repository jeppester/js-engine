new Class('View.Sprite', [View.Container, Lib.Animatable], {
	/**
	 * The constructor for Sprite objects.
	 *
     * @name Sprite
     * @class Class for drawing bitmaps with rotation and size.
     *        Usually all graphical objects in a game are sprites or extends this class.
     * @augments View
     * @augments Animatable
     *
     * @property {string} source A resource string representing the bitmap source of the sprite, use setSource() to set the source (do not set it directly)
     * @property {number} direction The direction of the sprite (in radians)
     * @property {int} imageNumber The current image in the animation (0 the source is not an animation)
     * @property {int} imageLength The number of images in the source (1 the source is not an animation)
     * @property {Vector} offset The offset with which the sprite will be drawn (to its position)
     * @property {number} animationSpeed The number of images / second in the animation (only relevant if the source is an animation)
     * @property {boolean} animationLoops Whether or not the animation should loop (only relevant if the source is an animation)
     * @property {number} size A size modifier which modifies both the width and the height of the sprite
     * @property {number} widthModifier A size modifier which modifies the width of the sprite
     * @property {number} heightModifier A size modifier which modifies the height of the object
     * @property {number} opacity The opacity of the sprite
     *
	 * @param {string} source A string representing the source of the object's bitmap
	 * @param {number} [x=0] The x-position of the object in the game arena, in pixels
	 * @param {number} [y=0] The y-position of the object in the game arena, in pixels
	 * @param {number} [direction=0] The rotation (in radians) of the object when drawn in the game arena
	 * @param {Object} [additionalProperties] An object containing additional properties to assign to the created object.
	 *                 The default is:<code>
     *                 {
	 *                  size: 1,
	 * 	                opacity: 1,
	 * 	                composite: 'source-over',
	 * 	                offset: new Math.Vector('center', 'center')
	 *                 }</code>
	 */
	Sprite: function (source, x, y, direction, additionalProperties) {
		if (source === undefined) {throw new Error('Missing argument: source'); }

		var offset;

		// Call Vector's and view's constructors
		this.Container();
		this.x = x !== undefined ? x : 0;
		this.y = y !== undefined ? y : 0;

		// Load default options
		this.source = source;
		this.direction = direction !== undefined ? direction : 0;

		engine.registerObject(this);

		this.imageNumber = 0;
		this.imageLength = 1;
		this.animationSpeed = 30;
		this.animationLastSwitch = engine.gameTime;
		this.animationLoops = true;
		offset = OFFSET_MIDDLE_CENTER;

		// Draw options
		this.composite = 'source-over';	

		// If an offset static var is used, remove it for now, and convert it later
		if (additionalProperties && additionalProperties.offset) {
			if (typeof additionalProperties.offset === 'string') {
				offset = additionalProperties.offset;
				delete additionalProperties.offset;
			}
			else {
				offset = undefined;
			}
		}

		// Load additional properties
		this.importProperties(additionalProperties);

		if (!this.refreshSource()) {
			throw new Error('Sprite source was not successfully loaded: ' + source);
		}

		// Convert static offset var (if such a var has been used)
		if (offset) {
			// calculate horizontal offset
			if ([OFFSET_TOP_LEFT, OFFSET_MIDDLE_LEFT, OFFSET_BOTTOM_LEFT].indexOf(offset) !== -1) {
				this.offset.x = 0;
			}
			else if ([OFFSET_TOP_CENTER, OFFSET_MIDDLE_CENTER, OFFSET_BOTTOM_CENTER].indexOf(offset) !== -1) {
				this.offset.x = this.width / 2;
			}
			else if ([OFFSET_TOP_RIGHT, OFFSET_MIDDLE_RIGHT, OFFSET_BOTTOM_RIGHT].indexOf(offset) !== -1) {
				this.offset.x = this.width;
			}

			// calculate vertical offset
			if ([OFFSET_TOP_LEFT, OFFSET_TOP_CENTER, OFFSET_TOP_RIGHT].indexOf(offset) !== -1) {
				this.offset.y = 0;
			}
			else if ([OFFSET_MIDDLE_LEFT, OFFSET_MIDDLE_CENTER, OFFSET_MIDDLE_RIGHT].indexOf(offset) !== -1) {
				this.offset.y = this.height / 2;
			}
			else if ([OFFSET_BOTTOM_LEFT, OFFSET_BOTTOM_CENTER, OFFSET_BOTTOM_RIGHT].indexOf(offset) !== -1) {
				this.offset.y = this.height;
			}
		}

		if (engine.avoidSubPixelRendering) {
			this.offset.x = Math.round(this.offset.x);
			this.offset.y = Math.round(this.offset.y);
		}
	},
    /** @scope Sprite */

	/**
	 * Fetches the name of the theme which currently applies to the object.
	 * 
	 * @return {string} The name of the object's theme
	 */
	getTheme: function () {
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
	},

	/**
	 * Updates the source bitmap of the object to correspond to it's current theme (set with setTheme or inherited).
	 * Calling this function is usually not necessary since it is automatically called when setting the theme of the object itself or it's parent object.
	 * 
	 * @private
	 */
	refreshSource: function () {
		var theme;

		theme = this.getTheme();
		this.bm = loader.getImage(this.source, theme);
		this.imageLength = this.bm.imageLength;
		this.imageNumber = Math.min(this.imageLength - 1, this.imageNumber);
		this.width = Math.floor(this.bm.width / this.imageLength);
		this.height = this.bm.height;

		return this.bm;
	},

	/**
	 * Sets the bitmap-source of the object. For more information about bitmaps and themes, see themes.
	 * 
	 * @param {string} source The resource string of the bitmap-source to use for the object
	 */
	setSource: function (source) {
		if (source === undefined) {throw new Error('Missing argument: source'); }
		if (this.source === source) {return; }

		this.source = source;
		this.refreshSource();
	},

	/**
	 * Calculates and sets the width modifier to fit a targeted width.
	 * 
	 * @param {number} width The targeted width in pixels
	 */
	setWidth: function (width) {
		this.widthModifier = width / (this.width * this.size);
	},

	/**
	 * Calculates and sets the height modifier to fit a targeted height.
	 * 
	 * @param {number} height The targeted height in pixels
	 */
	setHeight: function (height) {
		this.heightModifier = height / (this.height * this.size);
	},

	/**
	 * Draws the object to the canvas.
	 * 
	 * @private
	 * @param {CanvasRenderingContext2D} c A canvas 2D context on which to draw the Sprite
	 * @param {Vector} cameraOffset A Vector defining the offset to subtract from the drawing position (the camera's captureRegion's position)
	 */
	drawCanvas: function (c, cameraOffset) {
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

		// Set the right sub image
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

        // Draw bm
        c.drawImage(this.bm, (this.width + this.bm.spacing) * this.imageNumber, 0, this.width, this.height, - offX, - offY, this.width, this.height);
	},

	/**
	 * Calculates the region which the sprite will fill out when redrawn.
	 * 
	 * @private
	 * @return {Rectangle} The bounding rectangle of the sprite's redraw
	 */
	getRedrawRegion: function () {
		var box, parents, parent, i;

		box = new Math.Rectangle(-this.offset.x, -this.offset.y, this.width, this.height).getPolygon();	

		parents = this.getParents();
		parents.unshift(this);
		
		for (i = 0; i < parents.length; i ++) {
			parent = parents[i];
			box.scale(parent.size * parent.widthModifier, parent.size * parent.heightModifier);
			box.rotate(parent.direction);
			box.move(parent.x, parent.y);
		}

		box = box.getBoundingRectangle();
		box.x = Math.floor(box.x);
		box.y = Math.floor(box.y);
		box.width = Math.ceil(box.width + 1);
		box.height = Math.ceil(box.height + 1);

		return box;/**/
	}
});
