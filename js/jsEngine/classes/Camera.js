/**
 * Camera:
 * A camera represents a part of the arena which is "projected" on to the engines main canvas.
 * The camera contains both a capture rectangle and a projection rectangle, the capture rectangle decides which part of the arena to "capture".
 * The projection rectangle decides where the captured rectangle will be drawn on the main canvas.
 */
NewClass('Camera');

/**
 * @param {object} captureRectangle A rectangle which defines the area, from which to capture the current room
 * @param {object} projectionRectangle A rectangle which defines the area on the main canvas where the captured rectangle should be drawn
 */
Camera.prototype.Camera = function (captureRectangle, projectionRectangle) {
	if (!captureRectangle.implements(Rectangle)) {throw new Error('Argument captureRectangle should be of type: Rectangle'); }
	if (!projectionRectangle.implements(Rectangle)) {throw new Error('Argument projectionRectangle should be of type: Rectangle'); }

	this.captureRectangle = captureRectangle;
	this.projectionRectangle = projectionRectangle;
	this.canvas = document.createElement('canvas');
	this.canvas.width = this.captureRectangle.width;
	this.canvas.height = this.captureRectangle.height;
	this.ctx = this.canvas.getContext('2d');
};

/**
 * Updates the capture canvas' width and height to correspond to the captureRectangle's width and height.
 * Called by Camera.capture, to always keep the canvas' size updated.
 * 
 * @private
 */
Camera.prototype.updateCaptureCanvas = function () {
	if (this.captureRectangle.width !== this.canvas.width) {
		this.canvas.width = this.captureRectangle.width;
	}
	if (this.captureRectangle.height !== this.canvas.height) {
		this.canvas.height = this.captureRectangle.height;
	}
};

/**
 * Captures the current room by drawing all of its objects to the Camera's canvas
 * This functions i automatically called by the engine, if the camera object is added to the engine.cameras array.
 * 
 * @private
 */
Camera.prototype.capture = function () {
	// Clear camera canvas
	this.updateCaptureCanvas();
	this.ctx.fillStyle = engine.backgroundColor;
	this.ctx.fillRect(0, 0, this.captureRectangle.width, this.captureRectangle.height);

	engine.masterRoom.drawChildren(this.ctx, this.captureRectangle.copy());
	engine.currentRoom.drawChildren(this.ctx, this.captureRectangle.copy());
};

/**
 * Draws the camera's captured canvas to a canvas 2d context.
 * This functions i automatically called by the engine, if the camera object is added to the engine.cameras array.
 * 
 * @param {object} c A canvas2dContext on which to draw the camera's captured canvas
 * @private
 */
Camera.prototype.draw = function (c) {
	// Camera on canvas
	c.save();
	c.drawImage(this.canvas, this.projectionRectangle.x, this.projectionRectangle.y, this.projectionRectangle.width, this.projectionRectangle.height);
	c.restore();
};