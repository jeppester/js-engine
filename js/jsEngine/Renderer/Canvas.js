new Class('Renderer.Canvas', {
	Canvas: function (canvas) {
		var gl, options;

		this.context = canvas.getContext('2d');
	},

	render: function (cameras) {
		var camerasLength, roomsLength, i, ii, camera;

		this.context.save();
		this.context.clearRect(0, 0, engine.canvas.width, engine.canvas.height);

		camerasLength = cameras.length;

		for (i = 0; i < camerasLength; i ++) {
			camera = cameras[i];

			rooms = [engine.masterRoom, camera.room];
			roomsLength = rooms.length;

			// Setup/update camera
			if (!camera.canvas) {
				camera.canvas = document.createElement('canvas');
				camera.context = camera.canvas.getContext('2d');
			}
			if (camera.captureRegion.width !== camera.canvas.width) {
				camera.canvas.width = camera.captureRegion.width;
				changed = true;
			}
			if (camera.captureRegion.height !== camera.canvas.height) {
				camera.canvas.height = camera.captureRegion.height;
				changes = true;
			}

			// Clear camera canvas
			camera.context.clearRect(0, 0, camera.canvas.width, camera.canvas.height);

			// Apply camera translation
			camera.context.translate(-camera.captureRegion.x, -camera.captureRegion.y);

			// Draw rooms
			for (ii = 0; ii < roomsLength; ii ++) {
				this.renderTree(rooms[ii], camera.context);
			}

			// Draw camera canvas to main canvas
			this.context.drawImage(camera.canvas, camera.projectionRegion.x, camera.projectionRegion.y, camera.projectionRegion.width, camera.projectionRegion.height);

			this.context.restore();
		}
	},

	renderTree: function(object, context) {
		var i, len, child;

		this.transformCanvasContext(object, context);

		if (!object.isVisible()) {
			return;
		}

		switch (object.renderType) {
			case 'sprite':
			case 'textblock':
				this.renderSprite(object, context);
				engine.drawCalls ++; //dev
				break;
			case 'rectangle':
				this.renderRectangle(object, context);
				engine.drawCalls ++; //dev
				break;
		}

		if (object.children) {

			len = object.children.length;
			for (i = 0; i < len; i ++) {
				this.renderTree(object.children[i], context);
			}
		}

		this.restoreCanvasContext(object, context);
	},

	renderSprite: function(object, context) {
		// Round offset if necessary
		var offX, offY;

		offX = object.offset.x;
		offY = object.offset.y;

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
		context.drawImage(object.bm, (object.clipWidth + object.bm.spacing) * object.imageNumber, 0, object.clipWidth, object.clipHeight, - offX, - offY, object.clipWidth, object.clipHeight);
	},

	/**
	 * Draws the Rectangle object on the canvas (if added as a child of a View)
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} c A canvas 2D context on which to draw the Rectangle
     * @param {Vector} cameraOffset A vector defining the offset with which to draw the object
     */
	renderRectangle: function (object, context) {
		context.translate(-object.offset.x, -object.offset.y);

        context.strokeStyle = object.strokeStyle;
        context.fillStyle = object.fillStyle;

		context.beginPath();

		context.moveTo(0, 0);
		context.lineTo(object.width, 0);
		context.lineTo(object.width, object.height);
		context.lineTo(0, object.height);
		context.closePath();

        context.lineWidth = object.lineWidth;
        context.fill();
        context.stroke();
	},

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