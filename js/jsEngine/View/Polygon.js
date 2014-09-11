nameSpace('View');

/**
 * The constructor for the Polygon class. Uses the setFromPoints-function to set the points of the polygon.
 *
 * @name View.Polygon
 * @class A class which is used for handling polygons
 * @augments Math.Polygon
 * @augments View.Child
 *
 * @property {Vector[]} points An array of the polygon's points. Each point is connect to the previous- and next points, and the first and last points are connected
 * @property {string} strokeStyle The polygon's color if added to a view (css color string)
 * @property {number} lineWidth The polygon's width if added to a view (in px)
 * @property {string} fillStyle The polygon's fill color if added to a view (css color string)
 *
 * @param {Vector[]} points An array of Vector's which are to be used as points for the polygon. Keep in mind that the polygon will NOT copy the points, so changing another reference to one of the added points will change the point inside the polygon.
 * @param {string} [fillStyle = "#000"] The polygon's fill color if added to a view (css color string)
 * @param {string} [strokeStyle = "#000"] The polygon's color if added to a view (css color string)
 * @param {number} [lineWidth = 1] The polygon's width if added to a view (in px)
 */
View.Polygon = function (points, fillStyle, strokeStyle, lineWidth) {
	View.Child.call(this);
	this.renderType = "polygon";

	this.setFromPoints(points);

	this.fillStyle = fillStyle || "#000";
	this.strokeStyle = strokeStyle || "#000";
	this.lineWidth = lineWidth || 1;
	this.opacity = 1;
	this.closed = 1;
	this.lineDash = [];
};

View.Polygon.prototype = Object.create(View.Child.prototype);

View.Polygon.import(Math.Polygon.prototype);

View.Polygon.prototype.import(/** @lends View.Polygon.prototype */ {
    /**
     * Calculates the region which the object will fill out when redrawn.
     *
     * @private
     * @return {Rectangle} The bounding rectangle of the redraw
     */
    getRedrawRegion: function () {
        var ln;

        // Get bounding rectangle
        var rect = this.getBoundingRectangle();

        // line width
        ln = Math.ceil(this.lineWidth / 2);
        rect.x -= ln;
        rect.y -= ln;
        rect.width += ln * 2;
        rect.height += ln * 2;

        return rect.add(this.parent.getRoomPosition());
    },
});
