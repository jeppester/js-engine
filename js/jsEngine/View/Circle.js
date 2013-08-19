new Class('View.Circle', [Math.Circle, View.Child], {
	/**
	 * Constructor for Circle class, uses the set function, to set the properties of the circle.
	 *
     * @name View.Circle
     * @class A class which is used for handling circles
     * @augments Math.Circle
     * @augments View.Child
     *
     * @property {number} x The circle's horizontal position
     * @property {number} y The circle's vertical position
     * @property {number} radius The circle's radius
     * @property {string} strokeStyle The circle's color if added to a view (css color string)
     * @property {number} lineWidth The circle's width if added to a view (in px)
     * @property {string} fillStyle The circle's fill color if added to a view (css color string)
     *
	 * @param {number} x The x-coordinate for the center of the circle
	 * @param {number} y The y-coordinate for the center of the circle
	 * @param {number} radius The radius for the circle
     * @param {string} [fillStyle = "#000"] The circle's fill color if added to a view (css color string)
     * @param {string} [strokeStyle = "#000"] The circle's color if added to a view (css color string)
     * @param {number} [lineWidth = 1] The circle's width if added to a view (in px)
	 */
	Circle: function (x, y, radius, fillStyle, strokeStyle, lineWidth) {
		this.Child();

        var hidden;

        hidden = {
            radius: radius,
            fillStyle: fillStyle || "#000",
            strokeStyle: strokeStyle || "#000",
            lineWidth: lineWidth || 1
        };

        // Put getters and setters on points values
        Object.defineProperty(this, 'radius', {
            get: function() {return hidden.radius; },
            set: function(value) {
                if (hidden.radius !== value) {
                    hidden.radius = value;
                    this.onAfterChange();
                }
            }
        });
        Object.defineProperty(this, 'fillStyle', {
            get: function() {return hidden.fillStyle; },
            set: function(value) {
                if (hidden.fillStyle !== value) {
                    hidden.fillStyle = value;
                    this.onAfterChange();
                }
            }
        });
        Object.defineProperty(this, 'strokeStyle', {
            get: function() {return hidden.strokeStyle; },
            set: function(value) {
                if (hidden.strokeStyle !== value) {
                    hidden.strokeStyle = value;
                    this.onAfterChange();
                }
            }
        });
        Object.defineProperty(this, 'lineWidth', {
            get: function() {return hidden.lineWidth; },
            set: function(value) {
                if (hidden.lineWidth !== value) {
                    hidden.lineWidth = value;
                    this.onAfterChange();
                }
            }
        });

        this.set(x, y, radius);
	},
    /** @scope View.Circle */

    /**
     * Calculates the region which the object will fill out when redrawn.
     *
     * @private
     * @return {Math.Rectangle} The bounding rectangle of the redraw
     */
    getRedrawRegion: function () {
        var rect, ln;
        ln = Math.ceil(this.lineWidth / 2);
        rect = new Math.Rectangle(Math.floor(this.x - (this.radius + ln + 5)), Math.floor(this.y - (this.radius + ln + 5)), Math.ceil((this.radius + ln + 5) * 2), Math.ceil((this.radius + ln + 5) * 2));

        return rect.add(this.parent.getRoomPosition());
    },

	/**
	 * Draws the Circle object on the canvas (if added as a child of a View)
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} c A canvas 2D context on which to draw the Circle
	 * @param {Math.Vector} drawOffset A vector defining the offset with which to draw the object
	 */
	drawCanvas: function (c) {
		c.strokeStyle = this.strokeStyle;
        c.fillStyle = this.fillStyle;

		c.beginPath();

		c.arc(-this.offset.x, -this.offset.y, this.radius, 0, Math.PI * 2, true);

        c.lineWidth = this.lineWidth;
        c.globalAlpha = this.opacity;
		c.stroke();
        c.fill();
	}
});
