new Class('Renderer.Canvas', [Mixin.MatrixCalculation], {
	Canvas: function (canvas) {
		var gl, options;

		this.canvas = canvas;
		this.context = canvas.getContext('2d');
	},

	render: function (cameras) {
		var camerasLength, roomsLength, i, ii, wm, wmT, wmS, c, w, h;

		camerasLength = cameras.length;
		c = this.context;
		c.clearRect(0, 0, this.canvas.width, this.canvas.height);

		for (i = 0; i < camerasLength; i ++) {
			camera = cameras[i];

			// Save/restore routine is needed for resetting the clip
			c.save();

			// Setup camera resolution
			w = camera.captureRegion.width;
			h = camera.captureRegion.height;

			// Set camera position
			wmT = this.makeTranslation(-camera.captureRegion.x, -camera.captureRegion.y);
			if (camera.captureRegion.width !== 0 && camera.captureRegion.height !== 0) {
				wmS = this.makeScale(camera.projectionRegion.width / camera.captureRegion.width, camera.projectionRegion.height / camera.captureRegion.height);
			}
			else {
				wmS = this.makeIdentity();
			}
			wm = this.matrixMultiply(wmT, wmS);
			wm = this.matrixMultiply(wm, this.makeTranslation(camera.projectionRegion.x, camera.projectionRegion.y));

			// Set camera projection viewport
			c.beginPath();
			c.moveTo(camera.projectionRegion.x, camera.projectionRegion.y);
			c.lineTo(camera.projectionRegion.x + camera.projectionRegion.width, camera.projectionRegion.y);
			c.lineTo(camera.projectionRegion.x + camera.projectionRegion.width, camera.projectionRegion.y + camera.projectionRegion.height);
			c.lineTo(camera.projectionRegion.x, camera.projectionRegion.y + camera.projectionRegion.height);
			c.closePath();
			c.clip();

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

		if (!object.isVisible()) {
			return;
		}

		if (object.renderType !== '') {
			offset = this.matrixMultiply(this.makeTranslation(-object.offset.x, -object.offset.y), localWm);
			this.context.setTransform(offset[0], offset[1], offset[3], offset[4], offset[6], offset[7]);
			this.context.globalAlpha = object.opacity;
		}

		switch (object.renderType) {
			case 'textblock':
			case 'sprite':
				this.renderSprite(object);
				break;
			case 'circle':
				this.renderCircle(object);
				break;
			case 'line':
				this.renderLine(object);
				break;
			case 'rectangle':
				this.renderRectangle(object);
				break;
			case 'polygon':
				this.renderPolygon(object);
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
	 * Draws a Circle object on the canvas (if added as a child of a View)
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} c A canvas 2D context on which to draw the Circle
	 * @param {Math.Vector} drawOffset A vector defining the offset with which to draw the object
	 */
	renderCircle: function (object) {
		var c;

		c = this.context;

		c.strokeStyle = object.strokeStyle;
		c.fillStyle = object.fillStyle;

		c.beginPath();

		c.arc(0, 0, object.radius, 0, Math.PI * 2, true);

		c.lineWidth = object.lineWidth;
		c.globalAlpha = object.opacity;
		c.fill();
		c.stroke();
	},

	/**
	 * Draws a Polygon object on the canvas (if added as a child of a View)
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} c A canvas 2D context on which to draw the Polygon
	 * @param {Vector} drawOffset A vector defining the offset with which to draw the object
	 */
	renderPolygon: function (object) {
		var c, i, len;

		c = this.context;

		c.strokeStyle = object.strokeStyle;
		c.fillStyle = object.fillStyle;

		if (object.lineDash !== [] && c.setLineDash) {
			c.setLineDash(object.lineDash);
		}

		c.beginPath();

		len = object.points.length;

		for (i = 0; i < len; i ++) {
			c.lineTo(object.points[i].x, object.points[i].y);
		}

		c.lineWidth = object.lineWidth;
		c.globalAlpha = object.opacity;

		if (object.closed) {
			c.closePath();
			c.fill();
			c.stroke();
		}
		else {
			c.fill();
			c.stroke();
			c.closePath();
		}
	},

	/**
	 * Draws a Line object on the canvas (if added as a child of a View)
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} c A canvas 2D context on which to draw the Line
	 */
	renderLine: function (object) {
		var c;

		c = this.context;

		c.strokeStyle = object.strokeStyle;
		c.globalAlpha = object.opacity;
		c.beginPath();

		c.moveTo(object.a.x, object.a.y);
		c.lineTo(object.b.x, object.b.y);

		c.lineWidth = object.lineWidth;
		c.lineCap = object.lineCap;
		c.stroke();
	},

	/**
	 * Draws a Rectangle object on the canvas (if added as a child of a View)
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
});
