new Class('CreatePolygonFromWidth', {
    CreatePolygonFromWidth: function () {
        // Make a global reference to the game object
        main = this;

        loader.hideOverlay(function () {
          main.onLoaded();
        })
    },

    onLoaded: function() {
        var line, tests, t, i;

        polygons = [];

        line = new Math.Line().setFromCoordinates(10, 10, 590, 310);
        polygons.push(new View.Polygon(line.createPolygonFromWidth(10).getPoints(), "#88F"));

        line = new Math.Line().setFromCoordinates(10, 30, 590, 330);
        polygons.push(new View.Polygon(line.createPolygonFromWidth(10, 'square').getPoints(), "#88F"));

        line = new Math.Line().setFromCoordinates(10, 370, 590, 10);
        polygons.push(new View.Polygon(line.createPolygonFromWidth(10).getPoints(), "#8F8"));

        line = new Math.Line().setFromCoordinates(10, 390, 590, 30);
        polygons.push(new View.Polygon(line.createPolygonFromWidth(10, 'square').getPoints(), "#8F8"));

        line = new Math.Line().setFromCoordinates(10, 200, 590, 200);
        polygons.push(new View.Polygon(line.createPolygonFromWidth(10).getPoints(), "#F88"));

        line = new Math.Line().setFromCoordinates(10, 220, 590, 220);
        polygons.push(new View.Polygon(line.createPolygonFromWidth(10, 'round').getPoints(), "#F88"));

        line = new Math.Line().setFromCoordinates(300, 10, 300, 390);
        polygons.push(new View.Polygon(line.createPolygonFromWidth(10).getPoints(), "#FFF"));

        line = new Math.Line().setFromCoordinates(320, 10, 320, 390);
        polygons.push(new View.Polygon(line.createPolygonFromWidth(10, 'square').getPoints(), "#FFF"));

        // WebGL Line drawing tests
        polygons.push(new View.Line(new Math.Vector(10, 50), new Math.Vector(590, 350), "#88F", 10, 'butt'));
        polygons.push(new View.Line(new Math.Vector(10, 70), new Math.Vector(590, 370), "#88F", 10, 'round'));
        polygons.push(new View.Line(new Math.Vector(10, 90), new Math.Vector(590, 390), "#88F", 10, 'square'));

        engine.currentRoom.addChildren.apply(engine.currentRoom, polygons);

        // Speed tests
        tests = 10000
        t = new Date();
        for (i = 0; i < tests; i ++) {
          line.createPolygonFromWidth(10);
        }
        console.log("createPolygonFromWidth (tests/sec): " + ~~(tests / (new Date() - t)) * 1000);
    }
});
