Helpers = {
	getCanvasContext: function (canvas) {
		return canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
	}
}