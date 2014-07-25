new Class('CreatePolygonFromWidth', {
    CreatePolygonFromWidth: function () {
        // Make a global reference to the game object
        main = this;

        loader.hideOverlay(function () {
          main.onLoaded();
        })
    },

    onLoaded: function() {
        var line, p1, p2, p3, p4, tests, t, i;

        line = new Math.Line().setFromCoordinates(10, 10, 590, 390);
        p1 = new View.Polygon(line.createPolygonFromWidth(10).getPoints(), "#88F");

        line = new Math.Line().setFromCoordinates(10, 390, 590, 10);
        p2 = new View.Polygon(line.createPolygonFromWidth(10).getPoints(), "#8F8");

        line = new Math.Line().setFromCoordinates(10, 200, 590, 200);
        p3 = new View.Polygon(line.createPolygonFromWidth(10).getPoints(), "#F88");

        line = new Math.Line().setFromCoordinates(300, 10, 300, 390);
        p4 = new View.Polygon(line.createPolygonFromWidth(10).getPoints(), "#FFF");

        engine.currentRoom.addChildren(p1, p2, p3, p4);

        // Speed tests
        tests = 10000
        t = new Date();
        for (i = 0; i < tests; i ++) {
          line.createPolygonFromWidth(10);
        }
        console.log("createPolygonFromWidth (tests/sec): " + ~~(tests / (new Date() - t)) * 1000);
    }
});
