new Class('View.Sprite', [View.Container, Lib.Animatable], {
	/**
	 * The constructor for Sprite objects.
	 *
     * @name View.Sprite
     * @class Class for drawing bitmaps with rotation and size.
     *        Usually all graphical objects in a game are sprites or extends this class.
     * @augments View.Container
     * @augments Lib.Animatable
     *
     * @property {string} source A resource string representing the bitmap source of the sprite, use setSource() to set the source (do not set it directly)
     * @property {number} direction The direction of the sprite (in radians)
     * @property {int} imageNumber The current image in the animation (0 the source is not an animation)
     * @property {int} imageLength The number of images in the source (1 the source is not an animation)
     * @property {Vector} offset The offset with which the sprite will be drawn (to its position)
     * @property {number} animationSpeed The number of images / second in the animation (only relevant if the source is an animation)
     * @property {boolean} animationLoops Whether or not the animation should loop (only relevant if the source is an animation)
     * @property {number} size A size modifier which modifies both the width and the height of the sprite
     * @property {number} widthScale A size modifier which modifies the width of the sprite
     * @property {number} heightScale A size modifier which modifies the height of the object
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
		if (source === undefined) {throw new Error('Missing argument: source'); } //dev

		var offset;

		// Call Vector's and view's constructors
		this.Container();
		this.x = x !== undefined ? x : 0;
		this.y = y !== undefined ? y : 0;

		// Load default options
		this.source = source;
		this.direction = direction !== undefined ? direction : 0;

		// Animation options
		this.imageNumber = 0;
		this.imageLength = 1;
		this.animationSpeed = 30;
		this.animationLastSwitch = engine.gameTime;
		this.animationLoops = true;
		this.clipWidth;
		this.clipHeight;

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
				return value;
			}
		});

		// If an offset static var is used, remove it for now, and convert it later
		offset = OFFSET_MIDDLE_CENTER;
		if (additionalProperties && additionalProperties.offset) {
			offset = additionalProperties.offset;
			delete additionalProperties.offset;
		}

		// Load additional properties
		this.importProperties(additionalProperties);

		if (!this.refreshSource()) {
			throw new Error('Sprite source was not successfully loaded: ' + source); //dev
		}

		// Set offset after the source has been set (otherwise the offset cannot be calculated correctly)
		this.offset = offset;

		if (engine.avoidSubPixelRendering) {
			this.offset.x = Math.round(this.offset.x);
			this.offset.y = Math.round(this.offset.y);
		}
	},

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
			ret.x = this.bm.width / this.imageLength / 2;
		}
		else if ([OFFSET_TOP_RIGHT, OFFSET_MIDDLE_RIGHT, OFFSET_BOTTOM_RIGHT].indexOf(offset) !== -1) {
			ret.x = this.bm.width / this.imageLength;
		}

		// calculate vertical offset
		if ([OFFSET_TOP_LEFT, OFFSET_TOP_CENTER, OFFSET_TOP_RIGHT].indexOf(offset) !== -1) {
			ret.y = 0;
		}
		else if ([OFFSET_MIDDLE_LEFT, OFFSET_MIDDLE_CENTER, OFFSET_MIDDLE_RIGHT].indexOf(offset) !== -1) {
			ret.y = this.bm.height / 2;
		}
		else if ([OFFSET_BOTTOM_LEFT, OFFSET_BOTTOM_CENTER, OFFSET_BOTTOM_RIGHT].indexOf(offset) !== -1) {
			ret.y = this.bm.height;
		}

		return ret;
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
		this.clipWidth = Math.floor(this.bm.width / this.imageLength);
		this.clipHeight = this.bm.height;
		if (this.offsetGlobal) {
			this.offset = this.offsetGlobal;
		}

		return this.bm;
	},

	/**
	 * Sets the bitmap-source of the object. For more information about bitmaps and themes, see themes.
	 * 
	 * @param {string} source The resource string of the bitmap-source to use for the object
	 */
	setSource: function (source) {
		if (source === undefined) {throw new Error('Missing argument: source'); } //dev
		if (this.source === source) {return; }

		this.source = source;
		this.refreshSource();
	},

	drawGl: function (gl, wm) {
		// look up where the vertex data needs to go.
		var positionLocation = gl.getAttribLocation(engine.program, "a_position");
		var texCoordLocation = gl.getAttribLocation(engine.program, "a_texCoord");

		// provide texture coordinates for the rectangle.
		var texCoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
		    0.0,  0.0,
		    1.0,  0.0,
		    0.0,  1.0,
		    0.0,  1.0,
		    1.0,  0.0,
		    1.0,  1.0]), gl.STATIC_DRAW);
		gl.enableVertexAttribArray(texCoordLocation);
		gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

		// Create a texture.
		var texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);

		// Set the parameters so we can render any size image.
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

		// Upload the image into the texture.
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.bm);

		// lookup uniforms
		var resolutionLocation = gl.getUniformLocation(engine.program, "u_resolution");

		// set the resolution
		gl.uniform2f(resolutionLocation, engine.mainCanvas.width, engine.mainCanvas.height);

		// Create a buffer for the position of the rectance corners.
		var buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.enableVertexAttribArray(positionLocation);
		gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

		// Set a rectangle the same size as the image.
		Helpers.setPlane(gl, 0, 0, this.bm.width, this.bm.height);

		// Draw the rectangle.
		gl.drawArrays(gl.TRIANGLES, 0, 6);
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
        c.drawImage(this.bm, (this.clipWidth + this.bm.spacing) * this.imageNumber, 0, this.clipWidth, this.clipHeight, - offX, - offY, this.clipWidth, this.clipHeight);
	},

	/**
	 * Calculates the region which the sprite will fill out when redrawn.
	 * 
	 * @private
	 * @return {Rectangle} The bounding rectangle of the sprite's redraw
	 */
	getRedrawRegion: function () {
		var box, parents, parent, i;

		box = new Math.Rectangle(-this.offset.x, -this.offset.y, this.clipWidth, this.clipHeight).getPolygon();	

		parents = this.getParents();
		parents.unshift(this);
		
		for (i = 0; i < parents.length; i ++) {
			parent = parents[i];
			box.scale(parent.size * parent.widthScale, parent.size * parent.heightScale);
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
