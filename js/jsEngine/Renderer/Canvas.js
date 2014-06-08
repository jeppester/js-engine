new Class('Renderer.Canvas', {
	Canvas: function (canvas) {
		var gl, options;

		this.context = canvas.getContext('2d');
	},

	render: function (object) {
		this.context.save();
		this.context.clearRect(0, 0, engine.canvas.width, engine.canvas.height);

		this.renderTree(object);

		this.context.restore();
	},

	renderTree: function(object) {
		var i, len, child;

		this.transformCanvasContext(object);

		if (!object.isVisible()) {
			return;
		}

		switch (object.renderType) {
			case 'sprite':
			case 'textblock':
				this.renderSprite(object);
				engine.drawCalls ++; //dev
				break;
		}

		if (object.children) {

			len = object.children.length;
			for (i = 0; i < len; i ++) {
				this.renderTree(object.children[i]);
			}
		}

		this.restoreCanvasContext(object);
	},

	renderSprite: function(object) {
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
		this.context.drawImage(object.bm, (object.clipWidth + object.bm.spacing) * object.imageNumber, 0, object.clipWidth, object.clipHeight, - offX, - offY, object.clipWidth, object.clipHeight);
	},

	/**
	 * Prepares the canvas context for drawing the object (applies all transformations)
	 *
	 * @private
	 */
	transformCanvasContext: function (object) {
	    // Draw Sprite on canvas
	    var c, x, y;

	    c = this.context;

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
	restoreCanvasContext: function (object) {
	    // Draw Sprite on canvas
	    var c, x, y;

	    c = this.context;

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