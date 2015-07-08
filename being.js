var Being = function(name, ch, col, x, y, vision_radius) {
    var that = this;
    this.name = name;
    this.col = col;
    this.ch = ch;
    this.x = x;
    this.y = y;
    this.vision_radius = vision_radius || 5;
    this.equipment = {};
    Game.map.list[this.x][this.y].being = this;
    Game.map.list[this.x][this.y].blocked = true;
    //all beings have an inventory and a purse
    this.inventory = [];
    this.purse = {};
    //keeps track of a beings latest move
    this.last_move = null;
    
    //DRAW
    this.draw = function() {
        if (Game.map.list[that.x][that.y].isThisLit()) {
            //the tile is lit so give the being the tile's normal background
            Game.display.draw(that.x, that.y, that.ch, that.col, Game.map.list[that.x][that.y].bg);
        } else {
            //the tile is in darkness so give the being the tile's darkened background
            Game.display.draw(that.x, that.y, that.ch, that.col, Game.map.list[that.x][that.y].bg_dark);
        };
    };
    
    //ERASE
    this.erase = function() {
        //essentially, tell the tile to draw itself
        //the being that is moving should be gone from the square when this is called
        Game.map.list[that.x][that.y].draw();
    };
    
    //check whether any of the being's equipment slots are free
    this.anyFreeHand = function() {
        for (var key in that.equipment) {
            if (that.equipment[key] === null) {
                return(key);
            };
        };
        return(false);
    };
    
    this.anyHandNotFree = function() {
        for (var key in that.equipment) {
            if (that.equipment[key] != null) {
                return(key);
            };
        };
        return(false);
    };
    
    //add item to inventory
    this.addToInventory = function(item, pickupable_item_index, inventory) {
        if (inventory.constructor === Array) {
            //remove the item from the tile it's on and put it in the player's inventory
            inventory.push( Game.map.list[item.x][item.y].items.splice(pickupable_item_index, 1)[0] );
        } else {
            inventory[that.anyFreeHand()] = Game.map.list[item.x][item.y].items.splice(pickupable_item_index, 1)[0];
        };
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
    
    //the being picks up an item from his tile
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
            //check whether to put it in the inventory or an equipment slot
            if (that.anyFreeHand() && Game.map.list[that.x][that.y].items[last_pickupable_item_i].equipment) {
                //remove from map, add to equipment
                that.addToInventory( Game.map.list[that.x][that.y].items[last_pickupable_item_i], last_pickupable_item_i, that.equipment );
                //set the player's last move to 'picked up'
                that.last_move = 'picked up';
            } else {
                //remove from map, add to inventory
                that.addToInventory( Game.map.list[that.x][that.y].items[last_pickupable_item_i], last_pickupable_item_i, that.inventory );
                //set the player's last move to 'picked up'
                that.last_move = 'picked up';
            };
            if (that instanceof Player) {
                Game.engine.unlock();
            };
        };
    };

    //remove item from inventory
    this.removeFromInventory = function(inventory) {
        //remove the item from the player's inventory and put it on the player's tile
        if (inventory.constructor === Array) { //inventory
            var item = inventory.pop();
        } else { //equipment
            var item = inventory[that.anyHandNotFree()];
            inventory[that.anyHandNotFree()] = null;
        };
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
            that.removeFromInventory(that.inventory);
            //set the player's last move to 'dropped'
            that.last_move = 'dropped';
            if (that instanceof Player) {
                Game.engine.unlock();
            };
        } else if (that.anyHandNotFree()) {
            that.removeFromInventory(that.equipment);
            //set the player's last move to 'dropped'
            that.last_move = 'dropped';
            if (that instanceof Player) {
                Game.engine.unlock();
            };
        };
    };
    
    //teleport to an available square
    this.teleport = function(x, y) {
        if (isThisOnMap(x, y) && isThisWalkable(x, y)) {
            //tell the tile that the being is no longer present
            Game.map.list[that.x][that.y].being = null;
            //unblock the tile
            Game.map.list[that.x][that.y].blocked = false;
            //draw what was underneath you at that square (i.e. erase you, or draw what remains after you've gone)
            that.erase();
            that.x = x;
            that.y = y;
            that.draw();
            //tell the new tile that the being is now present
            Game.map.list[x][y].being = that;
            //tell the new tile that it is now blocked
            Game.map.list[x][y].blocked = true;
            window.removeEventListener('keydown', that);
            //set the being's last move to 'teleport'
            that.last_move = 'teleport';
            //unlock the engine for the player
            if (that instanceof Player) {
                Game.engine.unlock();
            };
        };
    };
    
    //move the being
    this.move = function(dx, dy) {
        //check whether the target location is on the map
        if ( isThisOnMap(that.x + dx, that.y + dy) ) {
            // check if it's a closed door, and if so spend the turn opening it
            if (Game.map.list[that.x + dx][that.y + dy].tile_type == 'door' && Game.map.list[this.x + dx][this.y + dy].closed == true) {
                //alert('closed door!!');
                Game.map.list[that.x + dx][that.y + dy].open();
                Game.map.list[that.x + dx][that.y + dy].draw();
                //set the being's last move to 'opened door'
                that.last_move = 'opened door';
                //unlock the engine for the player
                if (that instanceof Player) {
                    Game.engine.unlock();
                };
            //check whether it's a valid move, and if so move there
            } else if (isThisWalkable(that.x + dx, that.y + dy)) {
                //tell the tile that the being is no longer present
                Game.map.list[that.x][that.y].being = null;
                //unblock the tile
                Game.map.list[that.x][that.y].blocked = false;
                //draw what was underneath you at that square (i.e. erase you, or draw what remains after you've gone)
                that.erase(); 
                that.x = that.x + dx; //adjust the being's position
                that.y = that.y + dy;
                that.draw(); //draw new position
                //tell the new tile that the being is now present
                Game.map.list[that.x][that.y].being = that;
                //tell the new tiel that it is now blocked
                Game.map.list[that.x][that.y].blocked = true;
                //record the being's last move
                that.last_move = [dx, dy];
                //if this was the player then a turn was completed
                //so unlock the engine and let other actors have a turn:   
                if (that instanceof Player) {
                    Game.engine.unlock();
                };
            };
        };
    };
    
};