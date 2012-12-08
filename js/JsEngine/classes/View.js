/*
	View:
	An object that can contain other objects.
	Provides methods for removing automatic spawning and removement of contained objects
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

	if (this.children === undefined) {
		this.children = [];
	}

	this.children.push(child);
	child.parent = this;

	if (child.setDepth && this.depth !== undefined) {
		child.setDepth(this.depth);
	}
	if (child.refreshSource) {
		child.refreshSource;
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
			child.refreshSource;
		}
	}

	return insertChildren;
};

View.prototype.getChildren = function () {
	return this.children !== undefined  ?  this.children : [];
};

View.prototype.setDepth = function (depth) {
	if (depth === undefined) {throw new Error('Missing argument: depth'); }
	var i;

	// Store depth and ctx in object (ctx is for improving performance)
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

// Method for setting the theme of the object
View.prototype.setTheme = function (themeName, recursive) {
	if (themeName) {
		if (loader.themes[themeName] === undefined) {throw new Error('Trying to set unexisting theme: '+themeName); }
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
}

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