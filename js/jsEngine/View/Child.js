new Class('View.Child', [Lib.Animatable], {
    /**
     * @name View.Child
     * @class If a class inherits Child it can be added to the view list. Therefore all objects which can be drawn inherits this class
     */
    Child: function () {
        this.hasChanged = false;

        // Define hidden vars
        var xHidden, yHidden, opacityHidden, directionHidden, sizeHidden, widthModifierHidden, heightModifierHidden, offsetHidden, parentObject;

        xHidden = 0;
        yHidden = 0;
        opacityHidden = 1;
        directionHidden = 0;
        sizeHidden = 1;
        widthModifierHidden = 1;
        heightModifierHidden = 1;

        // Define getter/setters for hidden vars
        Object.defineProperty(this, 'x', {
            get: function() {return xHidden},
            set: function(value) {
                if (xHidden !== value) {
                    xHidden = value;
                    this.onAfterChange();
                }
            }
        });
        Object.defineProperty(this, 'y', {
            get: function() {return yHidden},
            set: function(value) {
                if (yHidden !== value) {
                    yHidden = value;
                    this.onAfterChange();
                }
            }
        });
        Object.defineProperty(this, 'opacity', {
            get: function() {return opacityHidden},
            set: function(value) {
                if (opacityHidden !== value) {
                    opacityHidden = value;
                    this.onAfterChange();
                }
            }
        });
        Object.defineProperty(this, 'direction', {
            get: function() {return directionHidden},
            set: function(value) {
                if (directionHidden !== value) {
                    directionHidden = value;
                    this.onAfterChange();
                }
            }
        });
        Object.defineProperty(this, 'size', {
            get: function() {return sizeHidden},
            set: function(value) {
                if (sizeHidden !== value) {
                    sizeHidden = value;
                    this.onAfterChange();
                }
            }
        });
        Object.defineProperty(this, 'widthModifier', {
            get: function() {return widthModifierHidden},
            set: function(value) {
                if (widthModifierHidden !== value) {
                    widthModifierHidden = value;
                    this.onAfterChange();
                }
            }
        });
        Object.defineProperty(this, 'heightModifier', {
            get: function() {return heightModifierHidden},
            set: function(value) {
                if (heightModifierHidden !== value) {
                    heightModifierHidden = value;
                    this.onAfterChange();
                }
            }
        });

        parentObject = this;
        Object.defineProperty(this, 'offset', {
            get: function() {return offsetHidden},
            set: function(value) {
                if (offsetHidden !== value) {
                    offsetHidden = value;

                    var xHidden, yHidden;

                    xHidden = offsetHidden.x;
                    yHidden = offsetHidden.y;

                    // Put getters and setters on points values
                    Object.defineProperty(offsetHidden, 'x', {
                        get: function() {return xHidden},
                        set: function(value) {
                            if (xHidden !== value) {
                                xHidden = value;
                                parentObject.onAfterChange();
                            }
                        }
                    });
                    // Put getters and setters on points values
                    Object.defineProperty(offsetHidden, 'y', {
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

        this.offset = new Math.Vector();
    },
    /** @scope View.Child */

    onAfterChange: function () {
        if (!this.hasChanged && this.isDrawn()) {
            this.lastRedrawRegion = this.currentRedrawRegion;
            this.currentRedrawRegion = this.getCombinedRedrawRegion ? this.getCombinedRedrawRegion() : this.getRedrawRegion();

            if (this.currentRedrawRegion) {
                engine.redrawObjects.push(this);
                this.hasChanged = true;
            }
        }
    },

    isDrawn: function () {
        var p;

        p = this.getParents().pop();

        return this.isVisible() && (p === engine.currentRoom || p === engine.masterRoom);
    },

    /**
     * Fetches the position of the child inside the room
     */
    getRoomPosition: function () {
        var pos, parents, i;

        pos = new Math.Vector(this.x, this.y);
        
        parents = this.getParents();

        for (i = 0; i < parents.length; i ++) {
            pos.move(parents[i].x, parents[i].y);
        }

        return pos;
    },

    /**
     * Creates and returns and array of all the child's parents (from closest to farthest)
     * 
     * @return {View.Container[]} A list of all the child's parents
     */
    getParents: function () {
        var parent, parents;

        parents = [];
        parent = this;
        while ((parent = parent.parent) !== undefined) {
            parents.push(parent);
        }

        return parents;
    },

    /**
     * Sets the position of the object relative to its parent
     * 
     * @param {number} x The horisontal position
     * @param {number} y The vertical position
     */
    moveTo: function (x, y) {
        this.x = x || 0;
        this.y = y || 0;
    },

    /**
     * Calculates the distance to another child (the distance between the object's positions)
     * @param  {View.Child} child The object to calculate the distance to
     * @return {number} The distance in pixels
     */
    getDistanceTo: function (child) {
        return new Math.Vector(this.x, this.y).subtract(new Math.Vector(child.x, child.y)).getLength();
    },

    /**
     * Prepares the canvas context for drawing the object (applies all transformations)
     *
     * @private
     */
    transformCanvasContext: function (c) {
        // Draw Sprite on canvas
        var x, y;

        if (engine.avoidSubPixelRendering) {
            x = Math.round(this.x);
            y = Math.round(this.y);
        }
        else {
            x = this.x;
            y = this.y;
        }

        // Apply drawing options if they are needed (this saves a lot of resources)
        c.globalAlpha = this.opacity;
        if (this.composite !== 'source-over') {
            c.globalCompositeOperation = this.composite;
        }
        if (x !== 0 || y !== 0) {
            c.translate(x, y);
        }
        if (this.direction !== 0) {
            c.rotate(this.direction);
        }
        if (this.size !== 1 || this.widthModifier !== 1 || this.heightModifier !== 1) {
            c.scale(this.widthModifier * this.size, this.heightModifier * this.size);
        }
    },

    /**
     * Restores the canvas context after the object has been drawn (restores all transformations)
     *
     * @private
     */
    restoreCanvasContext: function (c) {
        // Draw Sprite on canvas
        var x, y;

        if (engine.avoidSubPixelRendering) {
            x = Math.round(this.x);
            y = Math.round(this.y);
        }
        else {
            x = this.x;
            y = this.y;
        }

        // Apply drawing options if they are needed (this saves a lot of resources)
        if (this.size !== 1 || this.widthModifier !== 1 || this.heightModifier !== 1) {
            c.scale(1 / (this.widthModifier * this.size), 1 / (this.heightModifier * this.size));
        }
        if (this.direction !== 0) {
            c.rotate(-this.direction);
        }
        if (x !== 0 || y !== 0) {
            c.translate(-x, -y);
        }
        if (this.composite !== 'source-over') {
            c.globalCompositeOperation = 'source-over';
        }
        c.globalAlpha = this.opacity;
    },

    /**
     * Checks if the objects is visible. This function runs before each draw to ensure that it is necessary
     * @return {boolean} Whether or not the object is visible (based on its size and opacity vars) 
     */
    isVisible: function () {
        // If sprites size has been modified to zero, do nothing
        return !(this.size === 0 || this.widthModifier === 0 || this.heightModifier === 0);
    }
});