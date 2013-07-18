new Class('Camera', {
    /**
     * Constructor for Camera class
     *
     * @name Camera
     * @class A camera represents a part of the arena which is "projected" on to the engines main canvas.
     *        The camera contains both a capture region and a projection region, the capture region decides which part of the arena to "capture".
     *        The projection region decides where the captured region will be drawn on the main canvas.
	 * @param {Rectangle} captureRegion A rectangle which defines the region, from which to capture the current room
	 * @param {Rectangle} projectionRegion A rectangle which defines the region on the main canvas where the captured region should be drawn
	 */
	Camera: function (captureRegion, projectionRegion) {
		if (!captureRegion.implements(Rectangle)) {throw new Error('Argument captureRegion should be of type: Rectangle'); }
		if (!projectionRegion.implements(Rectangle)) {throw new Error('Argument projectionRegion should be of type: Rectangle'); }

		this.captureRegion = captureRegion;
		this.projectionRegion = projectionRegion;
		this.canvas = document.createElement('canvas');
		this.canvas.width = this.captureRegion.width;
		this.canvas.height = this.captureRegion.height;
		this.room = engine.currentRoom;
		this.ctx = this.canvas.getContext('2d');
	},
    /** @scope Camera */

	/**
	 * Updates the capture canvas' width and height to correspond to the captureRegion's width and height.
	 * Called by Camera.capture, to always keep the canvas' size updated.
	 *
	 * @private
	 */
	updateCaptureCanvas: function () {
		if (this.captureRegion.width !== this.canvas.width) {
			this.canvas.width = this.captureRegion.width;
		}
		if (this.captureRegion.height !== this.canvas.height) {
			this.canvas.height = this.captureRegion.height;
		}
	},

	/**
	 * Captures the current room by drawing all of its objects to the Camera's canvas
	 * This functions i automatically called by the engine, if the camera object is added to the engine.cameras array.
	 *
	 * @private
	 */
	capture: function () {
		// Clear camera canvas

		this.updateCaptureCanvas();
		this.ctx.clearRect(0, 0, this.captureRegion.width, this.captureRegion.height);

		engine.masterRoom.draw(this.ctx, this.captureRegion.copy());
		this.room.draw(this.ctx, this.captureRegion.copy());
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
		c.drawImage(this.canvas, this.projectionRegion.x, this.projectionRegion.y, this.projectionRegion.width, this.projectionRegion.height);
		c.restore();
	},
});
