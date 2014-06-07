new Class('View.Container', [View.Child], {
	/**
	 * Constructor for the View class.
	 *
	 * @name View.Container
	 * @class A class for objects that are to be drawn on the canvas (or to contain drawn objects)
	 *        All objects which are drawn on the game's canvas extends the View-class.
	 * @augments View.Child
	 *
	 * @property {View.Child[]} children The view's children
	 * @property {View.Container} parent The parent of the view or undefined if the view is an orphan
	 * @property {boolean} drawCacheEnabled Whether or not draw caching is enabled
	 *
	 * @param {View.Child} child1 A child to add to the view upon creation
	 * @param {View.Child} child2 An other child to add to the view upon creation
	 * @param {View.Child} child3 A third ...
	 */
	Container: function (child1, child2, child3) {
		this.children = [];
		this.Child();
		this.parent = undefined;
		/*this.drawCacheCanvas = document.createElement('canvas');
		this.drawCacheCtx = Helpers.getCanvasContext(this.drawCacheCanvas);
		this.drawCacheEnabled = false;
		this.drawCacheOffset = new Math.Vector();*/

		this.addChildren.apply(this, Array.prototype.slice.call(arguments));
	},
	/** @scope View.Container */

	/**
	 * Adds children to a View object. If the object that the children are added to, is a descendant of the current room, the children will be drawn on the stage when added. The added children will be drawn above the current children.
	 * 
	 * @param {View.Child} child1 A child to add to the View object
	 * @param {View.Child} child2 Another child to add...
	 * @return {View.Child[]} An array containing the added children
	 */
	addChildren: function (child1, child2) {
		if (arguments.length === 0) {return; }
		var i, child;

		for (i = 0; i < arguments.length; i ++) {
			child = arguments[i];

			if (!child.implements(View.Child)) {throw new Error('Argument child has to be of type: View.Child'); } //dev

			// If the child already has a parent, remove the child from that parent
			if (child.parent) {
				child.parent.removeChildren(child);
			}

			// Add the child
			this.children.push(child);
			child.parent = this;
			engine.enableRedrawRegions && child.onAfterChange();

			// Refresh the child's sprite (it might have changed)
			if (child.refreshSource) {
				child.refreshSource();
			}
		}
		return arguments; 
	},

	/**
	 * Adds a child to a View object, below an already added child. This means that the inserted child (or children) will be drawn below the child which they are inserted below.
	 * 
	 * @param {View.Child|View.Child[]} insertChildren Child or array of children to insert before an existing child
	 * @param {View.Child} child Current child to insert other children before
	 * @return {View.Child[]} Array of the inserted children
	 */
	insertBelow: function (insertChildren, child) {
		if (insertChildren === undefined) {throw new Error('Missing argument: insertChildren'); } //dev
		if (child === undefined) {throw new Error('Missing argument: child'); } //dev
		var arr, i;

		if (!Array.prototype.isPrototypeOf(insertChildren)) {
			arr = [];
			arr.push(insertChildren);
			insertChildren = arr;
		}

		if ((i = this.children.indexOf(child)) !== -1) {
			this.children.splice.apply(this.children, [i, 0].concat(insertChildren));
		}

		for (i = 0; i < insertChildren.length; i ++) {
			child = insertChildren[i];

			if (!child.implements(View.Child)) {throw new Error('Argument child has to be of type: Child'); } //dev

			// If the child already has a parent, remove the child from that parent
			if (child.parent) {
				child.parent.removeChildren(child);
			}

			child.parent = this;
			engine.enableRedrawRegions && child.onAfterChange();
			
			if (child.refreshSource) {
				child.refreshSource();
			}
		}

		return insertChildren;
	},

	/**
	 * Fetches an array of all the View's children.
	 * This will not return a pointer, so changing the returned array will not change the View's children.
	 * 
	 * @return {View.Child[]} Array containing all of the View's children
	 */
	getChildren: function () {
		var ret, i;

		ret = [];

		for (i = 0; i < this.children.length; i++) {
			ret.push(this.children[i]);
		}

		return ret;
	},

	/**
	 * Sets theme of an View. Children whose theme is not already set, will inherit the set theme. To enforce the theme to all children, use the recursive argument.
	 * 
	 * @param {string} themeName The name of the theme to apply as the object's theme
	 * @param {boolean} [recursive=false] Whether or not the set theme will be applied to children for which a theme has already been set. If this argument is unset, it will default to false
	 */
	setTheme: function (themeName, recursive) {
		if (themeName) {
			if (loader.themes[themeName] === undefined) {throw new Error('Trying to set nonexistent theme: ' + themeName); } //dev
		}
		else {
			themeName = undefined;
		}

		var i;

		recursive = recursive !== undefined ? recursive : false;
		this.theme = themeName;

		if (this.refreshSource) {
			this.refreshSource();
		}

		if (recursive) {
			for (i = 0; i < this.children.length;i ++) {
				this.children[i].setTheme(undefined, true);
			}
		}
		else {
			this.applyToThisAndChildren(function () {
				if (this.refreshSource) {
					this.refreshSource();
				}
			});
		}
	},

	/**
	 * Executes a function for the View and all of the its children.
	 * 
	 * @param {function} func Function to execute
	 */
	applyToThisAndChildren: function (func) {
		if (func === undefined) {throw new Error('Missing argument: function'); } //dev
		var i;

		func.call(this);
		for (i = 0;i < this.children.length;i ++) {
			if (this.children[i].applyToThisAndChildren) {
				this.children[i].applyToThisAndChildren(func);
			}
			else {
				func.call(this.children[i]);
			}
		}
	},

	/**
	 * Sets whether or not the view should be cached (and only redrawn when called directly).
	 * If a view is set to static, the view's canvas will be used for caching a drawing of the view's children.
	 * 
	 * @param {boolean} enabled Whether or not draw caching should be enabled or disabled
	 */
	setDrawCache: function (enabled) {
		enabled = enabled === true;
		if (enabled === this.drawCacheEnabled) {return; }


		if (enabled) {
			this.cacheDrawing();
			document.body.appendChild(this.drawCacheCanvas);
		}
		this.drawCacheEnabled = enabled;
	},

	/**
	 * Caches a drawing of the View's children (and itself)
	 */
	cacheDrawing: function () {
		// Calculate the size of the canvas and its offset
		var drawRegion;
		drawRegion = this.getCombinedRedrawRegion();
		
		if (drawRegion) {
			drawRegion.move(-this.x, -this.y);
			this.drawCacheOffset = new Math.Vector(drawRegion.x, drawRegion.y);
			this.drawCacheCanvas.width = drawRegion.width;
			this.drawCacheCanvas.height = drawRegion.height;

			// Draw all children to the cache canvas
			this.draw(this.drawCacheCtx, this.drawCacheOffset.copy().move(this.x, this.y), drawRegion, true);
		}
	},

	/**
	 * Gets the complete region that will used for drawing on next redraw
	 * 
	 * @return {Math.Rectangle} A rectangle representing the region
	 */
	getCombinedRedrawRegion: function () {
		var box, addBox, i, child;

		if (this.getRedrawRegion) {
			box = this.getRedrawRegion();
		}

		for (i = 0; i < this.children.length; i ++) {
			child = this.children[i];

			if (child.getCombinedRedrawRegion) {
				addBox = child.getCombinedRedrawRegion();
			}
			else {
				addBox = child.getRedrawRegion();
			}

			child.currentRedrawRegion = addBox;

			if (addBox) {
				if (box) {
					box = box.getBoundingRectangle(addBox);
				}
				else {
					box = addBox;
				}
			}
		}

		return box;
	},

	/**
	 * Removes one or more children from the View.
	 * 
	 * @param {View.Child} child1 A child to add to the View object
	 * @param {View.Child} child2 Another child to remove...
	 * @return {View.Child[]} An array of the children which was removed. If an object, which was supplied as argument, was not a child of the View, it will not appear in the returned array
	 */
	removeChildren: function (child1, child2) {
		if (arguments.length === 0) {throw new Error('This function needs at least one argument'); } //dev
		var i, childId, removed;

		removed = [];
		i = arguments.length;

		while (i > -1) {
			childId = this.children.indexOf(arguments[i]);
			if (childId !== -1) {
				this.children.splice(childId, 1);
				removed.push(arguments[i]);
				arguments[i].parent = undefined;
			}
			i--;
		}
		return removed;
	},

	/**
	 * Removes all children from the View.
	 * 
	 * @param {boolean} purge Whether or not to purge the removed children, meaning that their scheduled functions and loop-attached functions will be removed. (true by default)
	 */
	removeAllChildren: function (purge) {
		purge = purge !== undefined ? purge : true;
		
		var rmChild;

		rmChild = this.children.splice(0, this.children.length);
		rmChild.forEach(function () {
			this.parent = undefined;
			if (purge) {
				engine.purge(this);
			}
		});
	},

	/**
	 * Draws all children and grandchildren of an object that inherits the View class. It is usually not necessary to call this function since it is automatically called by the engine's redraw loop.
	 * 
	 * @param {CanvasRenderingContext2D} c A canvas' 2d context to draw the children on
	 * @param {Math.Rectangle} area A rectangle specifying the area to draw
	 * @param {boolean} forceRedraw Whether or not to force a redraw even though draw caching is enabled (this option is actually used when caching the view)
	 */
	draw: function (c, area, noCache) {
		if (engine.enableRedrawRegions) {
			this.drawRedrawRegions(c, area);
		}
		else {
			this.drawWholeCanvas(c, noCache);
		}
	},

	drawWholeCanvas: function (c, noCache) {
		var i, len, child;

		if (!this.isVisible()) {
			return;
		}

		this.transformCanvasContext(c);

		if (this.drawCacheEnabled && !noCache) {
			c.drawImage(this.drawCacheCanvas, 0, 0);
		}
		else {
			if (this.drawCanvas) {
				engine.drawCalls ++; //dev

				this.drawCanvas(c);

				if (engine.drawBoundingBoxes && this.drawBoundingBox) { //dev
					this.drawBoundingBox(c); //dev
				} //dev
				if (engine.drawMasks && this.drawMask) { //dev
					this.drawMask(c); //dev
				} //dev
			}

			// Draw children
			len = this.children.length;

			for (i = 0; i < len; i ++) {
				child = this.children[i];
				if (child.draw) {
					child.draw(c);
				}
				else if (child.isVisible()) {
					engine.drawCalls ++; //dev
					
					child.transformCanvasContext(c);
					child.drawCanvas(c);
					child.restoreCanvasContext(c);
				}
			}
		}

		
		this.restoreCanvasContext(c);
	},

	/**
	 * Remove drawCanvas function which was inherited from View
	 */
	drawCanvas: undefined,
	getRedrawRegion: undefined
});
