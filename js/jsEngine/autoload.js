// Load necessary files without making a mess
(function () {
	var loadFiles, scripts, enginePath;

	// Create file loader function
	loadFiles = function (filePaths) {
		var i, req, script;

		if (typeof filePaths === "string") {
			filePaths = [filePaths];
		}

		// Load first file
		for (i = 0; i < filePaths.length; i ++) {
			req = new XMLHttpRequest();
			req.open('GET', filePaths[i], false);
			req.send();

			script = document.createElement('script');
			script.type = 'text/javascript';
			script.text = req.responseText + "\n//# sourceURL=/" + filePaths[i];
			document.body.appendChild(script);
		}

		if (window.loadedFiles === undefined) {window.loadedFiles = []; }
		window.loadedFiles = window.loadedFiles.concat(filePaths);
	};

	// Find file path of autoload script
	scripts = document.getElementsByTagName("script");
	enginePath = scripts[scripts.length-1].src.replace(/\/autoload\.js$/, '');

	// Load all engine files
	loadFiles([
		enginePath + '/Extension/Object.js',

		enginePath + '/Polyfill/requestAnimationFrame.js',

		enginePath + '/functions.js',
		enginePath + '/Engine/Globals.js',
		enginePath + '/Engine/Engine.js',
		enginePath + '/Engine/Loader.js',

		enginePath + '/Mixin/Animatable.js',
		enginePath + '/Mixin/MatrixCalculation.js',
		enginePath + '/Mixin/WebGLHelpers.js',

		enginePath + '/Renderer/WebGL.js',
		enginePath + '/Renderer/WebGL.TextureShaderProgram.js',
		enginePath + '/Renderer/WebGL.ColorShaderProgram.js',
		enginePath + '/Renderer/Canvas.js',

		enginePath + '/Math/Vector.js',
		enginePath + '/Math/Line.js',
		enginePath + '/Math/Circle.js',
		enginePath + '/Math/Rectangle.js',
		enginePath + '/Math/Polygon.js',

		enginePath + '/View/Child.js',
		enginePath + '/View/Line.js',
		enginePath + '/View/Circle.js',
		enginePath + '/View/Rectangle.js',
		enginePath + '/View/Polygon.js',
		enginePath + '/View/Container.js',
		enginePath + '/View/Sprite.js',
		enginePath + '/View/Collidable.js',
		enginePath + '/View/TextBlock.js',
		enginePath + '/View/GameObject.js',

		enginePath + '/Engine/Room.js',
		enginePath + '/Engine/Camera.js',
		enginePath + '/Engine/CustomLoop.js',

		enginePath + '/Input/Keyboard.js',
		enginePath + '/Input/Pointer.js',

		enginePath + '/Sound/Effect.js',
		enginePath + '/Sound/Music.js',
	]);
})();
