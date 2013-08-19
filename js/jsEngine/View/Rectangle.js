new Class('View.Rectangle', [Math.Rectangle, View.Child], {
	/**
	 * The constructor for the Rectangle class. Uses the set-function to set the properties of the rectangle.
	 *
     * @name View.Rectangle
     * @class A math class which is used for handling non-rotated rectangles
     * @augments Animatable
     * @augments Vector
     *
     * @property {number} x The top left corner's x-coordinate
     * @property {number} y The top left corner's y-coordinate
     * @property {number} width The width of the rectangle
     * @property {number} height The height of the rectangle
     * @property {string} strokeStyle The rectangle's color if added to a view (css color string)
     * @property {number} lineWidth The rectangle's width if added to a view (in px)
     * @property {string} fillStyle The rectangle's fill color if added to a view (css color string)
     *
	 * @param {number} x The x-coordinate for the rectangle's top left corner
	 * @param {number} y The y-coordinate for the rectangle's top left corner
	 * @param {number} width The width of the rectangle
	 * @param {number} height The height of the rectangle
     * @param {string} [fillStyle = "#000"] The rectangle's fill color if added to a view (css color string)
     * @param {string} [strokeStyle = "#000"] The rectangle's color if added to a view (css color string)
     * @param {number} [lineWidth = 1] The rectangle's width if added to a view (in px)
	 */
	Rectangle: function (x, y, width, height, fillStyle, strokeStyle, lineWidth) {
		this.Child();

		this.set(x, y, width, height);

        this.fillStyle = fillStyle || "#000";
        this.strokeStyle = strokeStyle || "#000";
        this.lineWidth = lineWidth || 1;
        this.opacity = 1;
	},
    /** @scope View.Rectangle */

    /**
     * Calculates the region which the object will fill out when redrawn.
     *
     * @private
     * @return {Rectangle} The bounding rectangle of the redraw
     */
    getRedrawRegion: function () {
        var ln;

        // Get bounding rectangle
        var rect = this.copy();

        // line width
        ln = Math.ceil(this.lineWidth / 2);
        rect.x -= ln;
        rect.y -= ln;
        rect.width += ln * 2;
        rect.height += ln * 2;

        return rect.add(this.parent.getRoomPosition());
    },

	/**
	 * Draws the Rectangle object on the canvas (if added as a child of a View)
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} c A canvas 2D context on which to draw the Rectangle
     * @param {Vector} cameraOffset A vector defining the offset with which to draw the object
     */
	drawCanvas: function (c) {
		c.save();

		c.translate(-this.offset.x, -this.offset.y);

        c.strokeStyle = this.strokeStyle;
        c.fillStyle = this.fillStyle;

		c.beginPath();

		c.moveTo(this.x, this.y);
		c.lineTo(this.x + this.width, this.y);
		c.lineTo(this.x + this.width, this.y + this.height);
		c.lineTo(this.x, this.y + this.height);
		c.lineTo(this.x, this.y);

        c.lineWidth = this.lineWidth;
        c.stroke();
        c.fill();

		c.closePath();

		c.restore();
	}
});
