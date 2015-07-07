var Player = function(x, y) {
    var that = this;
    //make this a subclass of Being
    Being.apply(this, ['Diederik', '@', 'rgb(238, 238, 238)', x, y]);
    
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
                that.drop(that.inventory.length - 1);
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
    
    //add item to inventory
    this.addToInventory = function(item, pickupable_item_index) {
        //remove the item from the tile it's on and put it in the player's inventory
        that.inventory.push( Game.map.list[item.x][item.y].items.splice(pickupable_item_index, 1)[0] );
        //if the item is light-giving, remove it from the 
        if (item.light_giving) {
            for (var i = 0; i < Game.map.flicker_items.length; i++) {
                if (item.name == Game.map.flicker_items[i].name &&
                        item.x == Game.map.flicker_items[i].x &&
                        item.y == Game.map.flicker_items[i].y) {
                    Game.map.flicker_items.splice(i, 1);
                    Game.map.calculateLitAreas();
                    item.redrawAreaWithinLightRadius();
                    break;
                };
            };
        };
    };
    
    //the player picks up an item from his tile
    this.pickup = function() {
        var last_item_i = Game.map.list[that.x][that.y].items.length;
        var pickupable_items = Game.map.list[that.x][that.y].items.filter( function(x) { return(x.pickupable) } );
        //check if there are any pickupable items
        if (pickupable_items.length > 0) {
            //find the index of the last pickupable item
            for (var i = last_item_i - 1; i >= 0; i--) {
                if (Game.map.list[that.x][that.y].items[i].pickupable) {
                    var last_pickupable_item_i = i;
                };
            };
            //run the function that actually removes the item from the map and puts it in inventory
            that.addToInventory( Game.map.list[that.x][that.y].items[last_pickupable_item_i], last_pickupable_item_i );
            //set the player's last move to 'picked up'
            that.last_move = 'picked up';
            Game.engine.unlock();
        };
    };

    //remove item from inventory
    this.removeFromInventory = function() {
        //remove the item from the player's inventory and put it on the player's tile
        var item = that.inventory.pop();
        item.x = that.x;
        item.y = that.y;
        Game.map.list[that.x][that.y].items.push(item);
        //if the item is light-giving, add it to the map's flicker_items array
        if (item.light_giving) {
            Game.map.flicker_items.push(item);
            Game.map.calculateLitAreas();
        };
    };
    
    //drop an item from inventory
    this.drop = function() {
        
        var last_item_i = that.inventory.length;
        if (0 < last_item_i) {
            that.removeFromInventory();
            //set the player's last move to 'dropped'
            that.last_move = 'dropped';
            Game.engine.unlock();
        };
    };
    
    Game.scheduler.add(this, true);
    
};