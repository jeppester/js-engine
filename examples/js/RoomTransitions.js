RoomTransitions = createClass('RoomTransitions', {
    RoomTransitions: function () {
        var i, room;

        // Make a global reference to the game object
        game = this;

        // Add five objects to the engine's default room and change the name of the room
        engine.currentRoom.name = 'room1';
        engine.currentRoom.addChildren(new View.Rectangle(0, 0, 600, 400, '#F00'));
        for (i = 0; i < 5; i ++) {
            engine.currentRoom.addChildren(new View.Sprite('Character', 100 + Math.random() * 400, 100 + Math.random() * 200));
        }

        // Create second room
        room = new Engine.Room('room2');
        room.addChildren(new View.Rectangle(0, 0, 600, 400, '#0F0'));
        for (i = 0; i < 5; i ++) {
            room.addChildren(new View.Sprite('Rock', 100 + Math.random() * 400, 100 + Math.random() * 200));
        }

        // Create third room
        room = new Engine.Room('room3');
        room.addChildren(new View.Rectangle(0, 0, 600, 400, '#00F'));
        for (i = 0; i < 10; i ++) {
            room.addChildren(new View.Sprite('Folder.Star2', 100 + Math.random() * 400, 100 + Math.random() * 200));
        }

        // Create fourth room
        room = new Engine.Room('room4');
        room.addChildren(new View.Rectangle(0, 0, 600, 400, '#FFF'));
        for (i = 0; i < 20; i ++) {
            room.addChildren(new View.Sprite('Folder.Star3', 100 + Math.random() * 400, 100 + Math.random() * 200));
        }

        // Hide loader overlay
        loader.hideOverlay(function () {
            // Start keyboard listener (The listener is placed in the persistent master room)
            engine.masterRoom.loops.eachFrame.attachFunction(game, game.doKeyboardControl);
        });
    },

    doKeyboardControl: function () {
        if (keyboard.isPressed(KEY_SPACE)) {
            if (engine.currentRoom.name === 'room1') {
                engine.goToRoom('room2', ROOM_TRANSITION_SLIDE_SLIDE, {duration: 1000, from: ['left', 'right', 'top', 'bottom'][Math.floor(Math.random() * 4)]});
            }
            else if (engine.currentRoom.name === 'room2') {
                engine.goToRoom('room3', ROOM_TRANSITION_SQUEEZE_SQUEEZE, {duration: 1000, from: ['left', 'right', 'top', 'bottom'][Math.floor(Math.random() * 4)]});
            }
            else if (engine.currentRoom.name === 'room3') {
                engine.goToRoom('room4', ROOM_TRANSITION_SLIDE_SQUEEZE, {duration: 1000, from: ['left', 'right', 'top', 'bottom'][Math.floor(Math.random() * 4)]});
            }
            else{
                engine.goToRoom('room1', ROOM_TRANSITION_SQUEEZE_SLIDE, {duration: 1000, from: ['left', 'right', 'top', 'bottom'][Math.floor(Math.random() * 4)]});
            }
        }
    },
});
