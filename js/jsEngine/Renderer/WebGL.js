new Class('Renderer.WebGL', [Mixin.MatrixCalculation], {
	WebGL: function (canvas) {
		var gl, options;

		this.canvas = canvas;

		// Cache variables
		this.cache = {
			currentAlpha: undefined,
			currentResolution: {
				width: 0,
				height: 0,
			}
		};

		this.programs = {};
		this.currentProgram = false;

		// Get gl context
		options = {
			premultipliedAlpha: false,
			alpha: false,
		};
		this.gl = canvas.getContext('webgl', options) || canvas.getContext('experimental-webgl', options);
		gl = this.gl;

		// Optimize options
		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);

		// Set default blending
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.enable(gl.BLEND);

		// Init shader programs
		this.programs = {
			texture: new Renderer.WebGL.TextureShaderProgram(gl),
			color: new Renderer.WebGL.ColorShaderProgram(gl),
		};
	},

	setProgram: function (program) {
		if (this.currentProgram !== program) {
			var gl;
			gl = this.gl;

			// Set program
			this.currentProgram = program;
			gl.useProgram(program.program);

			// Bind stuff
			program.onSet(gl);

			// Set current resolution var
			gl.uniform2f(
				program.locations.u_resolution,
				this.cache.currentResolution.width,
				this.cache.currentResolution.height
			);

			// Set current alpha
			gl.uniform1f(
				this.currentProgram.locations.u_alpha,
				this.cache.currentAlpha
			);
		}
	},

	render: function (cameras) {
		var camerasLength, roomsLength, i, ii, wm, gl, w, h;

		gl = this.gl;
		camerasLength = cameras.length;

		for (i = 0; i < camerasLength; i ++) {
			camera = cameras[i];

			// Setup camera resolution
			w = camera.captureRegion.width;
			h = camera.captureRegion.height;
			if (this.cache.currentResolution.width !== w || this.cache.currentResolution.height !== h) {
				this.cache.currentResolution.width = w;
				this.cache.currentResolution.height = h;

				if (this.currentProgram) {
					gl.uniform2f(this.currentProgram.locations.u_resolution, w, h);
				}
			}

			// Set camera position
			wm = this.makeTranslation(-camera.captureRegion.x, -camera.captureRegion.y);

			// Set camera projection viewport
			gl.viewport(
				camera.projectionRegion.x,
				camera.projectionRegion.y,
				camera.projectionRegion.width,
				camera.projectionRegion.height
			);

			rooms = [engine.masterRoom, camera.room];
			roomsLength = rooms.length;

			for (ii = 0; ii < roomsLength; ii ++) {
				// Draw rooms
				this.renderTree(rooms[ii], wm);
			}
		}
	},

	renderTree: function(object, wm) {
		var i, len, child, localWm, offset, gl;

		gl = this.gl;
		localWm = this.matrixMultiplyArray([this.calculateLocalMatrix(object), wm]);
		offset = this.makeTranslation(-object.offset.x, -object.offset.y);

		if (!object.isVisible()) {
			return;
		}

		// Set object alpha (because alpha is used by ALL rendered objects)
		if (this.cache.currentAlpha !== object.opacity) {
			this.cache.currentAlpha = object.opacity;

			if (this.currentProgram) {
				gl.uniform1f(this.currentProgram.locations.u_alpha, object.opacity);
			}
		}

		switch (object.renderType) {
			// Texture based objects
			case 'textblock':
			case 'sprite':
				this.setProgram(this.programs.texture);
				this.currentProgram.renderSprite(gl, object, this.matrixMultiply(offset, localWm));
				break;

			// Geometric objects
			case 'line':
				this.setProgram(this.programs.color);
				this.currentProgram.renderLine(gl, object, this.matrixMultiply(offset, localWm));
				break;
			case 'rectangle':
				this.setProgram(this.programs.color);
				this.currentProgram.renderRectangle(gl, object, this.matrixMultiply(offset, localWm));
				break;
			case 'circle':
				this.setProgram(this.programs.color);
				this.currentProgram.renderCircle(gl, object, this.matrixMultiply(offset, localWm));
		}

		if (object.children) {
			len = object.children.length;
			for (i = 0; i < len; i ++) {
				this.renderTree(object.children[i], localWm);
			}
		}
	},
});
