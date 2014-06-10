new Class('View.Line',[Math.Line, View.Child], {
	/**
	 * Constructor for the Line class. Uses setFromVectors to create the line's start and end points
	 *
     * @name View.Line
     * @class A class which is used for handling lines
     * @augments View.Child
     * @augments Lib.Animatable
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
        this.renderType = 'line';

        if (engine.enableRedrawRegions) {
            this.LineInitWithRedrawRegions(startVector, endVector, strokeStyle, lineWidth, lineCap);
        }
        else {
            this.LineInitWithoutRedrawRegions(startVector, endVector, strokeStyle, lineWidth, lineCap);
        }
    },
    /** @scope View.Line */

    LineInitWithoutRedrawRegions: function (startVector, endVector, strokeStyle, lineWidth, lineCap) {
        this.strokeStyle = strokeStyle || "#000";
        this.lineWidth = lineWidth || 1;
        this.lineCap = lineCap || 'butt';
        this.setFromVectors(startVector || new Math.Vector(), endVector || new Math.Vector());
    },

    LineInitWithRedrawRegions: function (startVector, endVector, strokeStyle, lineWidth, lineCap) {

        // Create getters and setters for line ends
        var hidden;

        hidden = {
            strokeStyle: strokeStyle || "#000",
            lineWidth: lineWidth || 1,
            lineCap: lineCap || 'butt',
            a: undefined,
            b: undefined,
            parentObject: this
        };

        Object.defineProperty(this, 'strokeStyle', {
            get: function() {return hidden.strokeStyle; },
            set: function(value) {
                if (hidden.strokeStyle !== value) {
                    hidden.strokeStyle = value;
                    this.onAfterChange();
                }
            }
        });
        Object.defineProperty(this, 'lineCap', {
            get: function() {return hidden.lineCap; },
            set: function(value) {
                if (hidden.lineCap !== value) {
                    hidden.lineCap = value;
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
        Object.defineProperty(this, 'a', {
            get: function() {return hidden.a; },
            set: function(value) {
                if (hidden.a !== value) {
                    hidden.a = value;

                    var xHidden, yHidden;

                    xHidden = hidden.a.x;
                    yHidden = hidden.a.y;

                    // Put getters and setters on points values
                    Object.defineProperty(hidden.a, 'x', {
                        get: function() {return xHidden; },
                        set: function(value) {
                            if (xHidden !== value) {
                                xHidden = value;
                                hidden.parentObject.onAfterChange();
                            }
                        }
                    });
                    // Put getters and setters on points values
                    Object.defineProperty(hidden.a, 'y', {
                        get: function() {return yHidden; },
                        set: function(value) {
                            if (yHidden !== value) {
                                yHidden = value;
                                hidden.parentObject.onAfterChange();
                            }
                        }
                    });

                    this.onAfterChange();
                }
            }
        });
        Object.defineProperty(this, 'b', {
            get: function() {return hidden.b; },
            set: function(value) {
                if (hidden.b !== value) {
                    hidden.b = value;

                    var xHidden, yHidden;

                    xHidden = hidden.b.x;
                    yHidden = hidden.b.y;

                    // Put getters and setters on points values
                    Object.defineProperty(hidden.b, 'x', {
                        get: function() {return xHidden; },
                        set: function(value) {
                            if (xHidden !== value) {
                                xHidden = value;
                                hidden.parentObject.onAfterChange();
                            }
                        }
                    });
                    // Put getters and setters on points values
                    Object.defineProperty(hidden.b, 'y', {
                        get: function() {return yHidden; },
                        set: function(value) {
                            if (yHidden !== value) {
                                yHidden = value;
                                hidden.parentObject.onAfterChange();
                            }
                        }
                    });

                    this.onAfterChange();
                }
            }
        });

        this.setFromVectors(startVector || new Math.Vector(), endVector || new Math.Vector());
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
            box.scale(parent.size * parent.widthScale, parent.size * parent.heightScale);
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
});
