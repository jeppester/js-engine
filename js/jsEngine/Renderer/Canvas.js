new Class('Renderer.Canvas', [Lib.MatrixCalculation], {
	Canvas: function (canvas) {
		var gl, options;

		this.canvas = canvas;
		this.context = canvas.getContext('2d');
	},

	render: function (cameras) {
		var camerasLength, roomsLength, i, ii, wm, c, w, h;

		camerasLength = cameras.length;
		c = this.context;
		c.clearRect(0, 0, this.canvas.width, this.canvas.height);
		c.save();

		for (i = 0; i < camerasLength; i ++) {
			camera = cameras[i];

			// Setup camera resolution
			//w = camera.captureRegion.width;
			//h = camera.captureRegion.height;

			// Set camera position
			wm = this.makeTranslation(-camera.captureRegion.x, -camera.captureRegion.y);

			// Set camera projection viewport
			c.beginPath();
			c.moveTo(camera.projectionRegion.x, camera.projectionRegion.y);
			c.lineTo(camera.projectionRegion.x + camera.projectionRegion.width, 0);
			c.lineTo(camera.projectionRegion.x + camera.projectionRegion.width, camera.projectionRegion.y + camera.projectionRegion.height);
			c.lineTo(0, camera.projectionRegion.y + camera.projectionRegion.height);
			c.closePath();
			c.clip()

			rooms = [engine.masterRoom, camera.room];
			roomsLength = rooms.length;

			for (ii = 0; ii < roomsLength; ii ++) {
				// Draw rooms
				this.renderTree(rooms[ii], wm);
			}

			c.restore();
		}
	},

	renderTree: function(object, wm) {
		var i, len, child, localWm, offset;

		localWm = this.matrixMultiplyArray([this.calculateLocalMatrix(object), wm]);
		offset = this.makeTranslation(-object.offset.x, -object.offset.y);

		if (!object.isVisible()) {
			return;
		}

		switch (object.renderType) {
			case 'textblock':
			case 'sprite':
				offset = this.matrixMultiply(offset, localWm);

				this.context.setTransform(offset[0], offset[1], offset[3], offset[4], offset[6], offset[7]);
				this.context.globalAlpha = object.opacity;
				this.renderSprite(object);
				break;
		}

		if (object.children) {
			len = object.children.length;
			for (i = 0; i < len; i ++) {
				this.renderTree(object.children[i], localWm);
			}
		}
	},

	renderSprite: function(object) {
		// Set the right sub image
		if (object.imageLength !== 1 && object.animationSpeed !== 0) {
			if (engine.gameTime - object.animationLastSwitch > 1000 / object.animationSpeed) {
				object.imageNumber = object.imageNumber + (object.animationSpeed > 0 ? 1 : -1);

				object.animationLastSwitch = engine.gameTime;

				if (object.imageNumber === object.imageLength) {
					object.imageNumber = object.animationLoops ? 0 : object.imageLength - 1;
				}
				else if (object.imageNumber === -1) {
					object.imageNumber = object.animationLoops ? object.imageLength - 1 : 0;
				}
			}
		}

		// Draw bm
		this.context.drawImage(object.bm, (object.clipWidth + object.bm.spacing) * object.imageNumber, 0, object.clipWidth, object.clipHeight, 0, 0, object.clipWidth, object.clipHeight);
	},

	/**
	 * Draws the Rectangle object on the canvas (if added as a child of a View)
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} c A canvas 2D context on which to draw the Rectangle
     * @param {Vector} cameraOffset A vector defining the offset with which to draw the object
     */
	renderRectangle: function (object) {
		var c;

		c = this.context;

        c.strokeStyle = object.strokeStyle;
        c.fillStyle = object.fillStyle;

		c.beginPath();

		c.moveTo(0, 0);
		c.lineTo(object.width, 0);
		c.lineTo(object.width, object.height);
		c.lineTo(0, object.height);
		c.closePath();

        c.lineWidth = object.lineWidth;
        c.fill();
        c.stroke();
	},

	// Legacy, used for collisions (should be replaced by matrix math)

	/**
	 * Prepares the canvas context for drawing the object (applies all transformations)
	 *
	 * @private
	 */
	transformCanvasContext: function (object, context) {
	    // Draw Sprite on canvas
	    var c, x, y;

	    c = context;

	    if (engine.avoidSubPixelRendering) {
	        x = Math.round(object.x);
	        y = Math.round(object.y);
	    }
	    else {
	        x = object.x;
	        y = object.y;
	    }

	    // Apply drawing options if they are needed (this saves a lot of resources)
	    c.globalAlpha = object.opacity;
	    if (object.composite !== 'source-over') {
	        c.globalCompositeOperation = object.composite;
	    }
	    if (x !== 0 || y !== 0) {
	        c.translate(x, y);
	    }
	    if (object.direction !== 0) {
	        c.rotate(object.direction);
	    }
	    if (object.size !== 1 || object.widthScale !== 1 || object.heightScale !== 1) {
	        c.scale(object.widthScale * object.size, object.heightScale * object.size);
	    }
	},

	/**
	 * Restores the canvas context after the object has been drawn (restores all transformations)
	 *
	 * @private
	 */
	restoreCanvasContext: function (object, context) {
	    // Draw Sprite on canvas
	    var c, x, y;

	    c = context;

	    if (engine.avoidSubPixelRendering) {
	        x = Math.round(object.x);
	        y = Math.round(object.y);
	    }
	    else {
	        x = object.x;
	        y = object.y;
	    }

	    // Apply drawing options if they are needed (this saves a lot of resources)
	    if (object.size !== 1 || object.widthScale !== 1 || object.heightScale !== 1) {
	        c.scale(1 / (object.widthScale * object.size), 1 / (object.heightScale * object.size));
	    }
	    if (object.direction !== 0) {
	        c.rotate(-object.direction);
	    }
	    if (x !== 0 || y !== 0) {
	        c.translate(-x, -y);
	    }
	    if (object.composite !== 'source-over') {
	        c.globalCompositeOperation = 'source-over';
	    }
	    c.globalAlpha = object.opacity;
	},
})