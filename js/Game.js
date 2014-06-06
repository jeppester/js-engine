new Class('Game', {
    Game: function () {
        // Make a global reference to the game object
        game = this;

        /* LOAD GAME DATA FILES (global vars etc.)
         data=[];
         jseSyncLoad([
         'file1.js',
         'file2.js',
         'file3.js',
         'file4.js',
         ]);
         */

        /* LOAD GAME CLASSES
         loader.loadClasses([
         'js/classes/Object1.js',
         'js/classes/Object2.js',
         'js/classes/Object3.js',
         'js/classes/Object4.js'
         ]);
         */

        c = engine.mainCtx;
        image = loader.getImage('Rock');

        // Fills the buffer with the values that define a rectangle.
        function setRectangle(gl, x, y, width, height) {
          var x1 = x;
          var x2 = x + width;
          var y1 = y;
          var y2 = y + height;
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
             x1, y1,
             x2, y1,
             x1, y2,
             x1, y2,
             x2, y1,
             x2, y2]), gl.STATIC_DRAW);
        }

        // look up where the vertex data needs to go.
        var positionLocation = c.getAttribLocation(engine.program, "a_position");
        var texCoordLocation = c.getAttribLocation(engine.program, "a_texCoord");

        // provide texture coordinates for the rectance.
        var texCoordBuffer = c.createBuffer();
        c.bindBuffer(c.ARRAY_BUFFER, texCoordBuffer);
        c.bufferData(c.ARRAY_BUFFER, new Float32Array([
            0.0,  0.0,
            1.0,  0.0,
            0.0,  1.0,
            0.0,  1.0,
            1.0,  0.0,
            1.0,  1.0]), c.STATIC_DRAW);
        c.enableVertexAttribArray(texCoordLocation);
        c.vertexAttribPointer(texCoordLocation, 2, c.FLOAT, false, 0, 0);

        // Create a texture.
        var texture = c.createTexture();
        c.bindTexture(c.TEXTURE_2D, texture);

        // Set the parameters so we can render any size image.
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_S, c.CLAMP_TO_EDGE);
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_T, c.CLAMP_TO_EDGE);
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MIN_FILTER, c.NEAREST);
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MAG_FILTER, c.NEAREST);

        // Upload the image into the texture.
        c.texImage2D(c.TEXTURE_2D, 0, c.RGBA, c.RGBA, c.UNSIGNED_BYTE, image);

        // lookup uniforms
        var resolutionLocation = c.getUniformLocation(engine.program, "u_resolution");

        // set the resolution
        c.uniform2f(resolutionLocation, engine.mainCanvas.width, engine.mainCanvas.height);

        // Create a buffer for the position of the rectance corners.
        var buffer = c.createBuffer();
        c.bindBuffer(c.ARRAY_BUFFER, buffer);
        c.enableVertexAttribArray(positionLocation);
        c.vertexAttribPointer(positionLocation, 2, c.FLOAT, false, 0, 0);

        // Set a rectangle the same size as the image.
        setRectangle(c, 0, 0, image.width, image.height);

        // Draw the rectangle.
        c.drawArrays(c.TRIANGLES, 0, 6);


        this.onLoaded();
    },

    onLoaded: function() {
        // Hide loader overlay
        loader.hideOverlay();

        /* DO GAME STUFF */
    }
});