function mixin(inheritorClass, inheritClass) {
	var functionName;

	inheritorClass.prototype.inheritedClasses.push(inheritClass);
	Array.prototype.push.apply(inheritorClass.prototype.inheritedClasses, inheritClass.prototype.inheritedClasses);

	for (functionName in inheritClass.prototype) {
		if (inheritClass.prototype.hasOwnProperty(functionName)) {
			if (typeof inheritClass.prototype[functionName] === "function") {
				inheritorClass.prototype[functionName] = inheritClass.prototype[functionName];
			}
		}
	}
}

function nameSpace(name) {
	var i;

	name = name.split('.');

	// Create namespace if missing
	for (i = 0; i < name.length; i++) {
		// Create eval string
		str = name.slice(0, i + 1).join('.');

		if (eval('window.' + str) === undefined) {
			eval(str + ' = {}');
		}
	}
}
