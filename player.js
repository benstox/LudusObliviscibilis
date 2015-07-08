var Player = function(x, y) {
    var that = this;
    //make this a subclass of Being
    Being.apply(this, ['Diederik', '@', 'rgb(238, 238, 238)', x, y]);
    
    //the player has two equipment slots
    this.equipment['left hand'] = null;
    this.equipment['right hand'] = null;
    
    //handler below does different things depending on mode of this
    this.handler_mode = 'game';
    
    //what the player does on his turn?
    this.act = function() {
        if (Game.first_turn) {
            Game.map.draw();
            Game.first_turn = false;
        };
        
        // //draw the new field of view around the player
        // Game.fov.compute(
            // that.x, that.y, that.vision_radius,
            // function(x, y, r, transparency) {
                // Game.display.draw(x, y, 'X', 'yellow', 'blue');
            // }
        // );
        
        //stops going through the list of actors (things who get a turn)
        Game.engine.lock();
        
        //console.log(that.last_move);
        //check if the player's tile has a popup message on it
        //only do this if the player didn't wait there last turn
        //or didn't pick up or drop something there last turn
        if (Game.map.list[that.x][that.y].message != null &&
             that.last_move != 'waited' &&
             that.last_move != 'picked up' &&
             that.last_move != 'dropped'
            ) {
            that.handler_mode = 'message'; //tells handler what to do with inputs
            var message_text = Game.map.list[that.x][that.y].message;
            that.message = new Message(message_text);
            that.message.trigger()
        };
        
        //wait for the player's 
        window.addEventListener('keydown', that);
    };
    
    //keystroke handler
    this.handleEvent = function(e) {
        var code = e.keyCode;
        //the player is in the game moving around the map as normal
        if (that.handler_mode == 'game') {
            if (code == ROT.VK_L || code == ROT.VK_RIGHT) {
                //right
                that.move(1, 0);
            } else if (code == ROT.VK_H || code == ROT.VK_LEFT) {
                //left
                that.move(-1, 0);
            } else if (code == ROT.VK_K || code == ROT.VK_UP) {
                //up
                that.move(0, -1);
            } else if (code == ROT.VK_J || code == ROT.VK_DOWN) {
                //down
                that.move(0, 1);
            } else if (code == ROT.VK_U) {
                //up, right
                that.move(1, -1);
            } else if (code == ROT.VK_Y) {
                //up, left
                that.move(-1, -1);
            } else if (code == ROT.VK_N) {
                //down, right
                that.move(1, 1);
            } else if (code == ROT.VK_B) {
                //down, left
                that.move(-1, 1);
            } else if (code == ROT.VK_PERIOD) {
                //wait
                that.last_move = 'waited';
                Game.engine.unlock();
            } else if (code == ROT.VK_G) {
                //pick up item from tile
                that.pickup();
            } else if (code == ROT.VK_D) {
                //drop an item from player's inventory
                that.drop();
            } else if (code == ROT.VK_I) {
                that.message = OpenInventory();
            };
        //a message has popped up and the player must dismiss it or something
        } else if (that.handler_mode == 'message') {
            //close the message box (draw the map), 
            //make sure any flickering items are not hidden by the message box
            //(make sure they continue to flicker),
            //kill the event listener,
            //set the handler back to game mode
            //create a new event listener
            that.message.redrawMapBehind();
            for (var i = 0; i < Game.map.flicker_items.length; i++) {
                Game.map.flicker_items[i].hidden_behind_message = false;
            };
            window.removeEventListener('keydown', that);
            that.handler_mode = 'game';
            window.addEventListener('keydown', that);
        };
    };
    
    Game.scheduler.add(this, true);
    
};