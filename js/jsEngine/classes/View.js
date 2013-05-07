/**
 * View:
 * A class for objects that are to be drawn on the canvas (or to contain drawn objects)
 * All objects which are drawn on the game's canvas extends the View-class.
 */

NewClass('View');

/**
 * Constructor for the View class.
 */
View.prototype.View = function () {
	this.children = [];
};

/**
 * Adds children to a View object. If the object that the children are added to, is a grandchild of a depth layer, the children will be drawn on the stage when added. The added children will be drawn above the current children.
 * 
 * @param {object} child1 A child to add to the View object
 * @param {object} child2 Another child to add...
 * @return {array} An array containing the added children
 */
View.prototype.addChildren = function (child1, child2) {
	if (arguments.length === 0) {throw new Error('This function needs at least one argument'); }
	var i, child;

	for (i = 0; i < arguments.length; i ++) {
		child = arguments[i];

		if (typeof child !== 'object') {throw new Error('Argument "child" has to be of type "object"'); }

		this.children.push(child);
		child.parent = this;

		if (child.setDepth && this.depth !== undefined) {
			child.setDepth(this.depth);
		}
		if (child.refreshSource) {
			child.refreshSource();
		}
	}
	return arguments;
};

/**
 * Adds a child to a View object, below an already added child. This means that the inserted child (or children) will be drawn below the child which they are inserted below.
 * 
 * @param {mixed} insertChildren Object or array of objects to insert before an existing child
 * @param {object} child Current child to insert other children before
 * @return {array} Array of the inserted children
 */
View.prototype.insertBelow = function (insertChildren, child) {
	if (insertChildren === undefined) {throw new Error('Missing argument: insertChildren'); }
	if (child === undefined) {throw new Error('Missing argument: child'); }
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

		child.parent = this;
		if (child.setDepth && this.depth !== undefined) {
			child.setDepth(this.depth);
		}
		if (child.refreshSource) {
			child.refreshSource();
		}
	}

	return insertChildren;
};

/**
 * Fetches an array of all the View's children.
 * This will not return a pointer, so changing the returned array will not change the View's children.
 * 
 * @return {array} Array containing all of the View's children
 */
View.prototype.getChildren = function () {
	var ret, i;

	ret = [];

	for (i = 0; i < this.children.length; i++) {
		ret.push(this.children[i]);
	}

	return ret;
};

/**
 * Sets theme of an View. Children whoose theme is not already set, will inherit the set theme. To enforce the theme to all children, use the recursive argument.
 * 
 * @param {string} themeName The name of the theme to apply as the object's theme
 * @param {boolean} Whether or not the set theme will be applied to children for which a theme has already been set. If this argument is unset, it will default to false
 */
View.prototype.setTheme = function (themeName, recursive) {
	if (themeName) {
		if (loader.themes[themeName] === undefined) {throw new Error('Trying to set unexisting theme: ' + themeName); }
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
};

/**
 * Executes a function for the View and all of the its children.
 * 
 * @param {function} func Function to execute
 */
View.prototype.applyToThisAndChildren = function (func) {
	if (func === undefined) {throw new Error('Missing argument: function'); }
	var i;

	func.call(this);
	for (i = 0;i < this.children.length;i ++) {
		this.children[i].applyToThisAndChildren(func);
	}
};

/**
 * Removes the View from the arena and everywhere where it is registered. If the object has children, the children will be removed aswell.
 * 
 * @param {boolean} purgeChildren Whether or not to purge all children, meaning that their scheduled functions and loop-attached functions will be removed. (true by default)
 */
View.prototype.remove = function (purgeChildren) {
	this.removeAllChildren(purgeChildren);
	
	engine.purge(this);
};

/**
 * Removes all children from the View.
 * 
 * @param {boolean} purge Whether or not to purge the removed children, meaning that their scheduled functions and loop-attached functions will be removed. (true by default)
 */
View.prototype.removeAllChildren = function (purge) {
	purge = purge !== undefined ? purge : true;
	
	var rmChild;

	rmChild = this.children.splice(0, this.children.length);
	rmChild.forEach(function () {
		this.parent = undefined;
		if (purge) {
			engine.purge(this);
		}
	});
};

/**
 * Removes one or more children from the View.
 * 
 * @param {object} child1 A child to add to the View object
 * @param {object} child2 Another child to remove...
 * @return {array} An array of the children which was removed. If an object, which was supplied as argument, was not a child of the View, it will not appear in the returned array
 */
View.prototype.removeChildren = function (child1, child2) {
	if (arguments.length === 0) {throw new Error('This function needs at least one argument'); }
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
};

/**
 * Draws all children and grandchildren of an object that inherits the View class. It is usually not necessary to call this function since it is automatically called by the engine's redraw loop.
 * 
 * @param {object} ctx A canvas' 2d context to draw the children on
 */
View.prototype.drawChildren = function (ctx) {
	var i;

	if (this.drawCanvas) {
		this.drawCanvas(ctx);
		if (engine.drawBBoxes && this.drawBBox) {
			if (engine.useRotatedBoundingBoxes) {
				this.drawRotatedBBox(ctx);
			}
			else {
				this.drawBBox(ctx);
			}
		}
		if (engine.drawMasks && this.drawMask) {
			this.drawMask(ctx);
		}
	}
	
	for (i = 0;i < this.children.length;i ++) {
		if (this.children[i].drawChildren) {
			this.children[i].drawChildren(ctx);
		}
	}
};