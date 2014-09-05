new Class('View.Child', [Mixin.Animatable], {
    /**
     * @name View.Child
     * @class If a class inherits Child it can be added to the view list. Therefore all objects which can be drawn inherits this class
     */
    Child: function () {
        this.renderType = '';
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
        this.widthScale = 1;
        this.heightScale = 1;

        var hidden = {
            offset: new Math.Vector(),
        }

        Object.defineProperty(this, 'offset', {
            get: function () {
                return hidden.offset;
            },
            set: function (value) {
                if (typeof value === 'string') {
                    this.offsetGlobal = value;
                    hidden.offset = this.parseOffsetGlobal(value);
                }
                else {
                    this.offsetGlobal = false;
                    hidden.offset = value;
                }
                return value;
            }
        });
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
            widthScale: 1,
            heightScale: 1,
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
        Object.defineProperty(this, 'widthScale', {
            get: function() {return hidden.widthScale; },
            set: function(value) {
                if (hidden.widthScale !== value) {
                    hidden.widthScale = value;
                    this.onAfterChange();
                }
            }
        });
        Object.defineProperty(this, 'heightScale', {
            get: function() {return hidden.heightScale; },
            set: function(value) {
                if (hidden.heightScale !== value) {
                    hidden.heightScale = value;
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
     * Parses an offset global into an actual Math.Vector offset
     * (this function is only here for convenience and should be replaced by any class that inherits the child class)
     * 
     * @param  {number} offset Offset global (OFFSET_TOP_LEFT, etc.)
     * @return {Math.Vector} A parsed version of the offset global
     */
    parseOffsetGlobal: function (offset) {
        return new Math.Vector();
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

                pos.scale(parent.widthScale * parent.size, parent.heightScale * parent.size);
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
     * Checks if the objects is visible. This function runs before each draw to ensure that it is necessary
     * @return {boolean} Whether or not the object is visible (based on its size and opacity vars) 
     */
    isVisible: function () {
        // If sprites size has been modified to zero, do nothing
        return !(this.size === 0 || this.widthScale === 0 || this.heightScale === 0);
    }
});