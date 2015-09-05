(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var RoomTransitions;

RoomTransitions = (function() {
  function RoomTransitions() {
    var i, room, _i, _j, _k, _l;
    engine.currentRoom.name = 'room1';
    engine.currentRoom.addChildren(new JSEngine.Views.Rectangle(0, 0, 600, 400, '#F00'));
    for (i = _i = 0; _i < 5; i = ++_i) {
      engine.currentRoom.addChildren(new JSEngine.Views.Sprite('Character', 100 + Math.random() * 400, 100 + Math.random() * 200));
    }
    room = new JSEngine.Room('room2');
    room.addChildren(new JSEngine.Views.Rectangle(0, 0, 600, 400, '#0F0'));
    for (i = _j = 0; _j < 5; i = ++_j) {
      room.addChildren(new JSEngine.Views.Sprite('Rock', 100 + Math.random() * 400, 100 + Math.random() * 200));
    }
    room = new JSEngine.Room('room3');
    room.addChildren(new JSEngine.Views.Rectangle(0, 0, 600, 400, '#00F'));
    for (i = _k = 0; _k < 10; i = ++_k) {
      room.addChildren(new JSEngine.Views.Sprite('Folder.Star2', 100 + Math.random() * 400, 100 + Math.random() * 200));
    }
    room = new JSEngine.Room('room4');
    room.addChildren(new JSEngine.Views.Rectangle(0, 0, 600, 400, '#FFF'));
    for (i = _l = 0; _l < 20; i = ++_l) {
      room.addChildren(new JSEngine.Views.Sprite('Folder.Star3', 100 + Math.random() * 400, 100 + Math.random() * 200));
    }
    engine.loader.hideOverlay((function(_this) {
      return function() {
        return engine.masterRoom.loops.eachFrame.attachFunction(_this, _this.doKeyboardControl);
      };
    })(this));
  }

  RoomTransitions.prototype.doKeyboardControl = function() {
    if (engine.keyboard.isPressed(JSEngine.Globals.KEY_SPACE)) {
      if (engine.currentRoom.name === 'room1') {
        return engine.goToRoom('room2', JSEngine.Globals.ROOM_TRANSITION_SLIDE_SLIDE, {
          duration: 1000,
          from: ['left', 'right', 'top', 'bottom'][Math.floor(Math.random() * 4)]
        });
      } else if (engine.currentRoom.name === 'room2') {
        return engine.goToRoom('room3', JSEngine.Globals.ROOM_TRANSITION_SQUEEZE_SQUEEZE, {
          duration: 1000,
          from: ['left', 'right', 'top', 'bottom'][Math.floor(Math.random() * 4)]
        });
      } else if (engine.currentRoom.name === 'room3') {
        return engine.goToRoom('room4', JSEngine.Globals.ROOM_TRANSITION_SLIDE_SQUEEZE, {
          duration: 1000,
          from: ['left', 'right', 'top', 'bottom'][Math.floor(Math.random() * 4)]
        });
      } else {
        return engine.goToRoom('room1', JSEngine.Globals.ROOM_TRANSITION_SQUEEZE_SLIDE, {
          duration: 1000,
          from: ['left', 'right', 'top', 'bottom'][Math.floor(Math.random() * 4)]
        });
      }
    }
  };

  return RoomTransitions;

})();

new JSEngine({
  gameClass: RoomTransitions,
  themes: ['Example'],
  canvasResX: 600,
  canvasResY: 400
});



},{}]},{},[1]);
