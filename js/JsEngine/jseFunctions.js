/*
jseFunctions.js:
This file contains global JsEngine functions
*/

// Function to copy all variables from one object to another
// Used mainly for loading option objects - See TextBlock for an example
jseCreateClass = function (className, inherits) {
	var constructorName, i, inheritClass, newClass;

	if (!/^\w*$/.test(className)) {throw new Error("Invalid class name: " + className); }

	constructorName = className.charAt(0).toLowerCase() + className.slice(1);
	eval('window.' + className + ' = function () {this.' + constructorName + '.apply(this, arguments); }');
	window[className].prototype[constructorName] = function () {};
	newClass = window[className];

	if (inherits) {
		if (!Array.prototype.isPrototypeOf(inherits)) {throw new Error("Arguments inherits is not an array"); }

		for (i = 0; i < inherits.length; i ++) {
			inheritClass = inherits[i];
			jseExtend(newClass, inheritClass);
		}
	}
	return newClass;
};

jseExtend = function (newClass, inheritClass) {
	var functionName;

	for (functionName in inheritClass.prototype) {
		if (typeof inheritClass.prototype[functionName] === "function") {
			newClass.prototype[functionName] = inheritClass.prototype[functionName];
		}
	}
};

// Function to clean every trace of an element in the engine
jsePurge = function (obj) {
	var name, loop, i;

	if (obj === undefined) {throw new Error(obj); }
	if (typeof obj === "string") {
		obj = engine.objectIndex[obj];
	}

	// Delete all references from loops
	for (name in engine.loops) {
		if (engine.loops.hasOwnProperty(name)) {
			loop = engine.loops[name];

			// From activities
			i = loop.activities.length;
			while (i --) {
				if (obj === loop.activities[i].object) {
					loop.activities.splice(i, 1);
				}
			}

			// From animations
			// FLAWED ?
			i = loop.animations.length;
			while (i --) {
				if (obj === loop.animations[i].obj) {
					loop.animations.splice(i, 1);
				}
			}
		}
	}

	// Delete from viewlist
	if (obj.parent) {
		obj.parent.removeChild(obj);
	}

	delete engine.objectIndex[obj.id];
};

jseSyncLoad = function (filePaths) {
	var i, req;

	if (typeof filePaths === "string") {
		filePaths = [filePaths];
	}

	for (i = 0; i < filePaths.length; i ++) {
		// console.log('Loading: ' + filePaths[i])
		req = new XMLHttpRequest();
		req.open('GET', filePaths[i], false);
		req.send();
		try {
			eval.call(window, req.responseText);
		}
		catch (e) {
			throw new Error('Failed loading "' + filePaths[i] + '": ' + e.type + ' "' + e.arguments[0] + '"');
		}
	}

	if (window.loadedFiles === undefined) {window.loadedFiles = []; }
	window.loadedFiles = window.loadedFiles.concat(filePaths);
};

jseRequest = function (url, params, async, callback, caller) {
	if (url === undefined) {throw new Error('Missing argument: url'); }
	params = params !== undefined ? params : '';
	async = async !== undefined ? async : true;
	caller = caller !== undefined ? caller : window;

	// If params is not a string, json-stringify it
	if (typeof params !== 'string') {
		params = 'data=' + JSON.stringify(params);
	}

	if (async && callback === undefined) {throw new Error('Callback function needed for asynchronous requests'); }

	var req;

	req = new XMLHttpRequest();

	if (async) {
		req.onreadystatechange = function () {
			if (req.readyState === 4 && req.status === 200) {
				callback.call(caller, req.responseText);
			}
		}
	}

	req.open('POST', url, async);
	req.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	req.send(params);

	if (!async) {
		if (req.readyState==4 && req.status==200) {
			return req.responseText;
		}
		else {
			console.log('XMLHttpRequest failed: ' + url);
		}
	}
}

// Function for turning an object with properties into a json string, functions are ignored
jsonEncode = function (obj, ignore) {
	function jsonIterate(obj, ignore) {
		var ret, i;

		ignore = ignore === undefined ? []: ignore;

		switch (typeof obj) {
		// If string or number, save directly
		case 'string':
		case 'number':
		case 'boolean':
			// console.log('Wrote string / number: ' + obj);
			ret += '"' + obj + '",';
			break;
		// If object, check if array or object and do accordingly
		case 'object':
			if (obj instanceof Array) {
				ret += '[';
				for (i = 0; i < obj.length; i ++) {
					ret += jsonIterate(obj[i], ignore);
				}
				ret += '],';
			} else {
				ret += '{';
				for (i in obj) {
					if (obj.hasOwnProperty(i)) {
						if (ignore.indexOf(i) !== -1) {continue; }
						ret += '"' + i + '":';
						ret += jsonIterate(obj[i], ignore);
					}
				}
				ret += '},';
			}
			break;
		}
		return ret;
	}

	var json = jsonIterate(obj, ignore);
	return json.replace(/,\}/gi, '}').replace(/,\]/gi, ']').replace(/,$/, '');
};