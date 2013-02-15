/*
View:
An object which is either drawn on on the game canvas or which contains children that are drawn.
All objects which are drawn on the game's canvas extends the View-object.
*/

jseCreateClass('View');

View.prototype.view = function (depth) {
	if (depth === undefined) {throw new Error('Missing argument: depth'); }

	this.depth = depth !== undefined  ?  depth : undefined;
	this.children = [];
};

// Method for adding a child
View.prototype.addChild = function (child) {
	if (child === undefined) {throw new Error('Missing argument: child'); }
	if (typeof child !== 'object') {throw new Error('Argument "child" has to be of type "object"'); }

	if (this.children === undefined) {
		this.children = [];
	}

	this.children.push(child);
	child.parent = this;

	if (child.setDepth && this.depth !== undefined) {
		child.setDepth(this.depth);
	}
	if (child.refreshSource) {
		child.refreshSource();
	}
	return child;
};

View.prototype.addChildren = function (child1, child2) {
	if (arguments.length === 0) {throw new Error('This function needs at least one argument'); }
	var i;

	for (i = 0; i < arguments.length; i ++) {
		this.addChild(arguments[i]);
	}
	return arguments;
};

View.prototype.insertBefore = function (insertChildren, child) {
	if (insertChildren === undefined) {throw new Error('Missing argument: insertChildren'); }
	if (child === undefined) {throw new Error('Missing argument: child'); }
	var arr, i;

	if (this.children === undefined) {
		this.children = [];
	}

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

View.prototype.getChildren = function () {
	var ret, i;

	ret = [];
	
	if (this.children) {
		for (i = 0; i < this.children.length; i++) {
			ret.push(this.children[i]);
		}
	}
	
	return ret;
};

View.prototype.setDepth = function (depth) {
	if (depth === undefined) {throw new Error('Missing argument: depth'); }
	var i;

	// Store depth and ctx in object (ctx is for improving drawing performance)
	this.depth = depth;
	this.ctx = engine.depth[depth].ctx;

	if (this.children) {
		for (i = 0;i < this.children.length;i ++) {
			if (this.children[i].setDepth) {
				this.children[i].setDepth(this.depth);
			}
		}
	}
};

View.prototype.directionTo = function (obj) {
	if (obj === undefined) {throw new Error('Missing argument: obj'); }

	if (this.x && this.y && obj.x && obj.y) {
		return Math.atan2(obj.y - this.y, obj.x - this.x);
	}
	else {
		throw new Error('This object, or checked object has no position');
	}
};

// Method for setting the theme of the object
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
	
	if (this.children) {
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
	}
};

View.prototype.applyToThisAndChildren = function (func) {
	if (func === undefined) {throw new Error('Missing argument: function'); }
	var i;

	func.call(this);
	if (this.children) {
		for (i = 0;i < this.children.length;i ++) {
			this.children[i].applyToThisAndChildren(func);
		}
	}
};

// Method for removing the object and all of its children
View.prototype.remove = function () {
	this.removeAllChildren();
	jsePurge(this);
};

// Method for removing the objects children
View.prototype.removeAllChildren = function () {
	var len;

	if (this.children) {
		len = this.children.length;
		while (len --) {
			this.children[len].remove();
			this.children.splice(len, 1);
		}
	}
};

View.prototype.removeChildren = function (child1, child2) {
	if (arguments.length === 0) {throw new Error('This function needs at least one argument'); }
	var i;

	for (i = 0; i < arguments.length; i ++) {
		this.removeChild(arguments[i]);
	}
	return arguments;
};

View.prototype.removeChild = function (child) {
	if (child === undefined) {throw new Error('Missing argument: child'); }
	var i;

	if (this.children) {
		for (i = 0;i < this.children.length;i ++) {
			if (this.children[i] === child) {
				this.children.splice(i, 1);
			}
		}
	}
};

// Method for drawing all children
View.prototype.drawChildren = function () {
	var i;

	if (this.drawCanvas) {
		if (this.depth !== undefined) {
			this.drawCanvas();
			if (engine.drawBBoxes && this.drawBBox) {
				if (engine.useRotatedBoundingBoxes) {
					this.drawRotatedBBox();
				}
				else {
					this.drawBBox();
				}
			}
			if (engine.drawMasks && this.drawMask) {
				this.drawMask();
			}
		}
		else {
			console.log(this);
		}
	}

	if (this.children) {
		for (i = 0;i < this.children.length;i ++) {
			if (this.children[i].drawChildren) {
				this.children[i].drawChildren();
			}
		}
	}
};