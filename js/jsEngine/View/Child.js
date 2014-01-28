new Class('View.Child', [Lib.Animatable], {
    /**
     * @name View.Child
     * @class If a class inherits Child it can be added to the view list. Therefore all objects which can be drawn inherits this class
     */
    Child: function () {
        if (engine.enableRedrawRegions) {
            this.ChildInitWithRedrawRegions();
        }
        else {
            this.ChildInitWithoutRedrawRegions();
        }
        engine.registerObject(this);
    },
    /** @scope View.Child */

    ChildInitWithoutRedrawRegions: function () {
        this.x = 0;
        this.y = 0;
        this.opacity = 1;
        this.direction = 0;
        this.size = 1;
        this.widthModifier = 1;
        this.heightModifier = 1;
        this.offset = new Math.Vector();
    },

    ChildInitWithRedrawRegions: function () {
        this.hasChanged = false;

        // Define hidden vars
        var hidden;

        hidden = {
            x: 0,
            y: 0,
            opacity: 1,
            direction: 0,
            size: 1,
            widthModifier: 1,
            heightModifier: 1,
            offset: undefined,
            parentObject: this
        };

        // Define getter/setters for hidden vars
        Object.defineProperty(this, 'x', {
            get: function() {return hidden.x; },
            set: function(value) {
                if (hidden.x !== value) {
                    hidden.x = value;
                    this.onAfterChange();
                }
            }
        });
        Object.defineProperty(this, 'y', {
            get: function() {return hidden.y; },
            set: function(value) {
                if (hidden.y !== value) {
                    hidden.y = value;
                    this.onAfterChange();
                }
            }
        });
        Object.defineProperty(this, 'opacity', {
            get: function() {return hidden.opacity; },
            set: function(value) {
                if (hidden.opacity !== value) {
                    hidden.opacity = value;
                    this.onAfterChange();
                }
            }
        });
        Object.defineProperty(this, 'direction', {
            get: function() {return hidden.direction; },
            set: function(value) {
                if (hidden.direction !== value) {
                    hidden.direction = value;
                    this.onAfterChange();
                }
            }
        });
        Object.defineProperty(this, 'size', {
            get: function() {return hidden.size; },
            set: function(value) {
                if (hidden.size !== value) {
                    hidden.size = value;
                    this.onAfterChange();
                }
            }
        });
        Object.defineProperty(this, 'widthModifier', {
            get: function() {return hidden.widthModifier; },
            set: function(value) {
                if (hidden.widthModifier !== value) {
                    hidden.widthModifier = value;
                    this.onAfterChange();
                }
            }
        });
        Object.defineProperty(this, 'heightModifier', {
            get: function() {return hidden.heightModifier; },
            set: function(value) {
                if (hidden.heightModifier !== value) {
                    hidden.heightModifier = value;
                    this.onAfterChange();
                }
            }
        });

        Object.defineProperty(this, 'offset', {
            get: function() {return hidden.offset; },
            set: function(value) {
                if (hidden.offset !== value) {
                    hidden.offset = value;

                    var off = {
                        x: value.x,
                        y: value.y,
                    };

                    // Put getters and setters on points values
                    Object.defineProperty(hidden.offset, 'x', {
                        get: function() {return off.x; },
                        set: function(value) {
                            if (off.x !== value) {
                                off.x = value;
                                hidden.parentObject.onAfterChange();
                            }
                        }
                    });
                    // Put getters and setters on points values
                    Object.defineProperty(hidden.offset, 'y', {
                        get: function() {return off.y; },
                        set: function(value) {
                            if (off.y !== value) {
                                off.y = value;
                                hidden.parentObject.onAfterChange();
                            }
                        }
                    });

                    this.onAfterChange();
                }
            }
        });

        this.offset = new Math.Vector();
    },

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

    /**
     * Checks if the child object is inside a room that is currently visible
     * 
     * @return {Boolean} Whether or not the child object is currently in a visible room
     */
    isInVisibleRoom: function () {
        var p;

        p = this.getParents().pop();

        return (p === engine.currentRoom || p === engine.masterRoom);
    },

    /**
     * Checks if the child object is in a state where it will get drawn.
     * For this function to return true, the child object has to be both visible and placed in a visible room.
     * 
     * @return {Boolean} Whether or not the child object is in a state where it will get drawn
     */
    isDrawn: function () {
        return this.isVisible() && this.isInVisibleRoom();
    },

    /**
     * Fetches the position of the child inside the room
     *
     * @return {Math.Vector|Boolean} The objects position in its room, or false if the object is not placed in any room.
     */
    getRoomPosition: function () {
        var pos, parents, parent, i;
        
        parents = this.getParents();

        if (parents.length && parents[parents.length -1].implements(Engine.Room)) {
            pos = new Math.Vector(this.x, this.y);
            
            for (i = 0; i < parents.length; i ++) {
                parent = parents[i];

                pos.scale(parent.widthModifier * parent.size, parent.heightModifier * parent.size);
                pos.rotate(parent.direction);
                pos.move(parent.x, parent.y);
            }

            return pos;
        }
        else {
            return false;
        }
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
     * Finds the room to which the object is currently added
     *
     * @return {View.Room|Boolean} The room to which the object is currently added, or false if the object is not added to a room
     */
    getRoom: function () {
        var parents, ancestor;

        parents = this.getParents();
        if (parents.length === 0) {
            return false;
        }

        ancestor = parents[parents.length -1];

        return ancestor.implements(Engine.Room) ? ancestor : false;
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
        return this.getRoomPosition().subtract(child.getRoomPosition()).getLength();
    },

    /**
     * Calculates the direction to another child
     * @param  {View.Child} child The object to calculate the direction to
     * @return {number} The direction in radians
     */
    getDirectionTo: function (child) {
        return child.getRoomPosition().subtract(this.getRoomPosition()).getDirection();
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