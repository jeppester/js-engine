new Class('View.Line',[Math.Line, View.Child], {
	/**
	 * Constructor for the Line class. Uses setFromVectors to create the line's start and end points
	 *
     * @name View.Line
     * @class A class which is used for handling lines
     * @augments View.Child
     * @augments Math.Animatable
     *
     * @property {View.Vector} a The line's starting point
     * @property {View.Vector} b The line's ending point
     * @property {string} strokeStyle The line's color if added to a view (css color string)
     * @property {string} lineWidth The line's width if added to a view (in px)
     * @property {string} lineCap The line's cap style if added to a view
     *
	 * @param {View.Vector} startVector A Vector representing the start point of the line
	 * @param {View.Vector} endVector A Vector representing the end point of the line
	 * @param {string} [strokeStyle="#000"] The line's color if added to a view (css color string)
	 * @param {number} [lineWidth=1] The line's width if added to a view (in px)
     * @param {string} [lineCap='butt'] The line's cap style if added to a view
	 */
	Line: function (startVector, endVector, strokeStyle, lineWidth, lineCap) {
		this.Child();
        
		startVector = startVector !== undefined ? startVector : new Math.Vector(0, 0);
		endVector = endVector !== undefined ? endVector : new Math.Vector(0, 0);
        this.strokeStyle = strokeStyle || "#000";
        this.lineWidth = lineWidth || 1;
        this.opacity = 1;
        this.lineCap = lineCap || 'butt';

        // Create getters and setters for line ends
        var aHidden, bHidden, parentObject;
        parentObject = this;
        Object.defineProperty(this, 'a', {
            get: function() {return aHidden},
            set: function(value) {
                if (aHidden !== value) {
                    aHidden = value;

                    var xHidden, yHidden;

                    xHidden = aHidden.x;
                    yHidden = aHidden.y;

                    // Put getters and setters on points values
                    Object.defineProperty(aHidden, 'x', {
                        get: function() {return xHidden},
                        set: function(value) {
                            if (xHidden !== value) {
                                xHidden = value;
                                parentObject.onAfterChange();
                            }
                        }
                    });
                    // Put getters and setters on points values
                    Object.defineProperty(aHidden, 'y', {
                        get: function() {return yHidden},
                        set: function(value) {
                            if (yHidden !== value) {
                                yHidden = value;
                                parentObject.onAfterChange();
                            }
                        }
                    });

                    this.onAfterChange();
                }
            }
        });
        Object.defineProperty(this, 'b', {
            get: function() {return bHidden},
            set: function(value) {
                if (bHidden !== value) {
                    bHidden = value;

                    var xHidden, yHidden;

                    xHidden = bHidden.x;
                    yHidden = bHidden.y;

                    // Put getters and setters on points values
                    Object.defineProperty(bHidden, 'x', {
                        get: function() {return xHidden},
                        set: function(value) {
                            if (xHidden !== value) {
                                xHidden = value;
                                parentObject.onAfterChange();
                            }
                        }
                    });
                    // Put getters and setters on points values
                    Object.defineProperty(bHidden, 'y', {
                        get: function() {return yHidden},
                        set: function(value) {
                            if (yHidden !== value) {
                                yHidden = value;
                                parentObject.onAfterChange();
                            }
                        }
                    });

                    this.onAfterChange();
                }
            }
        });

		this.setFromVectors(startVector, endVector);
	},
    
    /**
     * Calculates the region which the object will fill out when redrawn.
     *
     * @private
     * @return {Math.Rectangle} The bounding rectangle of the redraw
     */
    getRedrawRegion: function () {
        var box, parents, parent, i, ln;

        box = this.getPolygon();

        parents = this.getParents();
        parents.unshift(this);
        
        for (i = 0; i < parents.length; i ++) {
            parent = parents[i];
            box.scale(parent.size * parent.widthModifier, parent.size * parent.heightModifier);
            box.rotate(parent.direction);
            box.move(parent.x, parent.y);
        }

        box = box.getBoundingRectangle();

        ln = Math.ceil(this.lineWidth / 2);
        box.x = Math.floor(box.x - ln);
        box.y = Math.floor(box.y - ln);
        box.width = Math.ceil(box.width + ln * 2 + 1);
        box.height = Math.ceil(box.height + ln * 2 + 1);

        return box;/**/
    },

	/**
	 * Draws the Line object on the canvas (if added as a child of a View)
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} c A canvas 2D context on which to draw the Line
	 */
	drawCanvas: function (c) {
		c.strokeStyle = this.strokeStyle;
        c.globalAlpha = this.opacity;
		c.beginPath();

		c.moveTo(this.a.x, this.a.y);
		c.lineTo(this.b.x, this.b.y);

        c.lineWidth = this.lineWidth;
        c.lineCap = this.lineCap;
		c.stroke();
	}
});
