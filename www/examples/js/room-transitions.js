(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var RoomTransitions;

RoomTransitions = (function() {
  function RoomTransitions() {
    var i, j, k, l, m, room;
    engine.currentRoom.name = 'room1';
    engine.currentRoom.addChildren(new Engine.Views.Rectangle(0, 0, 600, 400, '#F00'));
    for (i = j = 0; j < 5; i = ++j) {
      engine.currentRoom.addChildren(new Engine.Views.Sprite('Character', 100 + Math.random() * 400, 100 + Math.random() * 200));
    }
    room = new Engine.Room('room2');
    room.addChildren(new Engine.Views.Rectangle(0, 0, 600, 400, '#0F0'));
    for (i = k = 0; k < 5; i = ++k) {
      room.addChildren(new Engine.Views.Sprite('Rock', 100 + Math.random() * 400, 100 + Math.random() * 200));
    }
    room = new Engine.Room('room3');
    room.addChildren(new Engine.Views.Rectangle(0, 0, 600, 400, '#00F'));
    for (i = l = 0; l < 10; i = ++l) {
      room.addChildren(new Engine.Views.Sprite('Folder.Star2', 100 + Math.random() * 400, 100 + Math.random() * 200));
    }
    room = new Engine.Room('room4');
    room.addChildren(new Engine.Views.Rectangle(0, 0, 600, 400, '#FFF'));
    for (i = m = 0; m < 20; i = ++m) {
      room.addChildren(new Engine.Views.Sprite('Folder.Star3', 100 + Math.random() * 400, 100 + Math.random() * 200));
    }
    engine.loader.hideOverlay((function(_this) {
      return function() {
        return engine.masterRoom.loops.eachFrame.attachFunction(_this, _this.doKeyboardControl);
      };
    })(this));
  }

  RoomTransitions.prototype.doKeyboardControl = function() {
    if (engine.keyboard.isPressed(Engine.Globals.KEY_SPACE)) {
      if (engine.currentRoom.name === 'room1') {
        return engine.goToRoom('room2', Engine.Globals.ROOM_TRANSITION_SLIDE_SLIDE, {
          duration: 1000,
          from: ['left', 'right', 'top', 'bottom'][Math.floor(Math.random() * 4)]
        });
      } else if (engine.currentRoom.name === 'room2') {
        return engine.goToRoom('room3', Engine.Globals.ROOM_TRANSITION_SQUEEZE_SQUEEZE, {
          duration: 1000,
          from: ['left', 'right', 'top', 'bottom'][Math.floor(Math.random() * 4)]
        });
      } else if (engine.currentRoom.name === 'room3') {
        return engine.goToRoom('room4', Engine.Globals.ROOM_TRANSITION_SLIDE_SQUEEZE, {
          duration: 1000,
          from: ['left', 'right', 'top', 'bottom'][Math.floor(Math.random() * 4)]
        });
      } else {
        return engine.goToRoom('room1', Engine.Globals.ROOM_TRANSITION_SQUEEZE_SLIDE, {
          duration: 1000,
          from: ['left', 'right', 'top', 'bottom'][Math.floor(Math.random() * 4)]
        });
      }
    }
  };

  return RoomTransitions;

})();

new Engine({
  gameClass: RoomTransitions,
  themes: ['Example'],
  disableWebGL: true,
  canvasResX: 600,
  canvasResY: 400
});



},{}]},{},[1]);
