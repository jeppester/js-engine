new Class('Engine.Camera', {
    /**
     * Constructor for Camera class
     *
     * @name Engine.Camera
     * @class A camera represents a part of the arena which is "projected" on to the engines main canvas.
     *        The camera contains both a capture region and a projection region, the capture region decides which part of the arena to "capture".
     *        The projection region decides where the captured region will be drawn on the main canvas.
     *
     * @property {Math.Rectangle} captureRegion A rectangle which defines the region of the current room to capture
     * @property {Math.Rectangle} projectionRegion A rectangle which defines the region on the main canvas where the captured region should be drawn
     * @property {Engine.Room} room The room to capture from
     *
     * @param {Math.Rectangle} captureRegion A rectangle which defines the region of the current room to capture
     * @param {Math.Rectangle} projectionRegion A rectangle which defines the region on the main canvas where the captured region should be drawn
     */
    Camera: function (captureRegion, projectionRegion) {
        if (!captureRegion.implements(Math.Rectangle)) {throw new Error('Argument captureRegion should be of type: Rectangle'); }
		if (!projectionRegion.implements(Math.Rectangle)) {throw new Error('Argument projectionRegion should be of type: Rectangle'); }

		this.captureRegion = captureRegion;
		this.projectionRegion = projectionRegion;
		this.canvas = document.createElement('canvas');
		this.canvas.width = this.captureRegion.width;
		this.canvas.height = this.captureRegion.height;
		this.room = engine.currentRoom;
		this.ctx = this.canvas.getContext('2d');
	},
    /** @scope Engine.Camera */

	/**
	 * Updates the capture canvas' width and height to correspond to the captureRegion's width and height.
	 * Called by Camera.capture, to always keep the canvas' size updated.
	 *
	 * @private
	 */
	updateCaptureCanvas: function () {
		var changed;

		changed = false;

		if (this.captureRegion.width !== this.canvas.width) {
			this.canvas.width = this.captureRegion.width;
			changed = true;
		}
		if (this.captureRegion.height !== this.canvas.height) {
			this.canvas.height = this.captureRegion.height;
			changes = true;
		}

		return changed;
	},

	/**
	 * Captures the current room by drawing all of its objects to the Camera's canvas
	 * This functions i automatically called by the engine, if the camera object is added to the engine.cameras array.
	 *
	 * @private
	 */
	capture: function () {
		var x, y, i, captureRegion, regions, object, region, ctx, overlap;

		this.captureRegion.x = Math.round(this.captureRegion.x);
		this.captureRegion.y = Math.round(this.captureRegion.y);

		// Redraw changed regions
		// Get all redraw regions
		regions = [];
		for (i = 0; i < engine.redrawObjects.length; i ++) {
			object = engine.redrawObjects[i];

			if (object.lastRedrawRegion) {
				region = object.currentRedrawRegion.getBoundingRectangle(object.lastRedrawRegion);
			}
			else {
				region = object.currentRedrawRegion;
			}

			// Check if the region overlaps the camera's capture region
			region = region.getOverlap(this.captureRegion);
			region.object = object;

			if (region) {
				// If the overlap is the same size as the capture region (covering the same area), skip all other regions
				if (region.getArea() === this.captureRegion.getArea()) {
					regions = [region];
					break;
				}
				else {
					regions.push(region);
				}
			}
		}

		engine.redrawObjects.forEach(function () {
			this.hasChanged = false;
		});

		if (regions.length > 20) {
			regions = [this.captureRegion.copy()];
			console.log('Drawing whole region');
		}

		if (engine.debug) {
            engine.redrawRegions = regions;
            engine.redrawnPixels = 0;

            for (i = 0; i < regions.length; i ++) {
            	engine.redrawnPixels += regions[i].getArea();
            }
        }

		// Draw each redraw region on separate canvases and draw the canvases on the camera's canvas
		for (i = 0; i < regions.length; i++) {
			region = regions[i];
			region.canvas = document.createElement('canvas');
			region.canvas.width = region.width;
			region.canvas.height = region.height;

			ctx = region.canvas.getContext('2d');
			ctx.translate(-region.x, -region.y);
			engine.masterRoom.draw(ctx, region);
			this.room.draw(ctx, region);


			this.ctx.drawImage(region.canvas, region.x - this.captureRegion.x, region.y - this.captureRegion.y);
		}
	},

	/**
	 * Draws the camera's captured canvas to a canvas 2d context.
	 * This functions i automatically called by the engine, if the camera object is added to the engine.cameras array.
	 * 
	 * @param {CanvasRenderingContext2D} c A canvas2dContext on which to draw the camera's captured canvas
	 * @private
	 */
	draw: function (c) {
		// Camera on canvas
		c.save();

		if (engine.debug) {
			engine.drawCalls ++;
		}

		c.drawImage(this.canvas, this.projectionRegion.x, this.projectionRegion.y, this.projectionRegion.width, this.projectionRegion.height);
		c.restore();
	}
});
