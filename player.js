"use strict";

var Player = function(x, y) {
    // make this a subclass of Being
    Being.apply(this, ['Diederik', '@', 'rgb(238, 238, 238)', x, y]);
    
    // the player has two equipment slots
    this.equipment['left hand'] = null;
    this.equipment['right hand'] = null;
    
    // handler below does different things depending on mode of this
    this.handler_mode = 'game';
    
    Game.scheduler.add(this, true);
};
Player.prototype = Object.create(Being.prototype);
Player.prototype.constructor = Player;
    
// what the player does on his turn?
Player.prototype.act = function() {
        
    // stops going through the list of actors (things who get a turn)
    Game.engine.lock();
        
    // console.log(this.last_move);
    // check if the player's tile has a popup message on it
    // only do this if the player didn't wait there last turn
    // or didn't pick up or drop something there last turn
    if (Game.map.list[this.x][this.y].message != null &&
         this.last_move != 'waited' &&
         this.last_move != 'picked up' &&
         this.last_move != 'dropped'
        ) {
        this.handler_mode = 'message'; // tells handler what to do with inputs
        var message_text = Game.map.list[this.x][this.y].message;
        this.message = new Message(message_text);
        this.message.trigger()
    };
        
    // wait for the player's input
    window.addEventListener('keydown', this);
};
    
// keystroke handler
Player.prototype.handleEvent = function(e) {
    var code = e.keyCode;
    // the player is in the game moving around the map as normal
    if (this.handler_mode == 'game') {
        if (code == ROT.VK_L || code == ROT.VK_RIGHT) {
            // right
            this.move(1, 0);
        } else if (code == ROT.VK_H || code == ROT.VK_LEFT) {
            // left
            this.move(-1, 0);
        } else if (code == ROT.VK_K || code == ROT.VK_UP) {
            // up
            this.move(0, -1);
        } else if (code == ROT.VK_J || code == ROT.VK_DOWN) {
            // down
            this.move(0, 1);
        } else if (code == ROT.VK_U) {
            // up, right
            this.move(1, -1);
        } else if (code == ROT.VK_Y) {
            // up, left
            this.move(-1, -1);
        } else if (code == ROT.VK_N) {
            // down, right
            this.move(1, 1);
        } else if (code == ROT.VK_B) {
            // down, left
            this.move(-1, 1);
        } else if (code == ROT.VK_PERIOD) {
            // wait
            this.last_move = 'waited';
            Game.engine.unlock();
        } else if (code == ROT.VK_G) {
            // pick up item from tile
            this.pickup();
        } else if (code == ROT.VK_D) {
            // drop an item from player's inventory
            this.drop();
        } else if (code == ROT.VK_I) {
            this.message = OpenInventory();
        };
    // a message has popped up and the player must dismiss it or something
    } else if (this.handler_mode == 'message') {
        // close the message box (draw the map), 
        // make sure any flickering items are not hidden by the message box
        // (make sure they continue to flicker),
        // kill the event listener,
        // set the handler back to game mode
        // create a new event listener
        this.message.redrawMapBehind();
        for (var i = 0; i < Game.map.flicker_items.length; i++) {
            Game.map.flicker_items[i].hidden_behind_message = false;
        };
        window.removeEventListener('keydown', this);
        this.handler_mode = 'game';
        window.addEventListener('keydown', this);
    };
};
