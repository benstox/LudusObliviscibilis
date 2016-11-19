"use strict";

var Being = function(name, ch, col, x, y, vision_radius) {
    this.name = name;
    this.col = col;
    this.ch = ch;
    this.x = x;
    this.y = y;
    this.vision_radius = vision_radius || 8;
    this.equipment = {};
    Game.map.list[this.x][this.y].being = this;
    Game.map.list[this.x][this.y].blocked = true;
    // all beings have an inventory and a purse
    this.inventory = [];
    this.purse = {};
    // keeps track of a beings latest move
    this.last_move = null;
};


// DRAW
Being.prototype.draw = function() {
    if (Game.map.list[this.x][this.y].isThisLit()) {
        // the tile is lit so give the being the tile's normal background
        Game.display.draw(this.x, this.y, this.ch, this.col, Game.map.list[this.x][this.y].bg);
    } else if (this == Game.player) {
        // the tile is in darkness so give the being the tile's darkened background
        Game.display.draw(this.x, this.y, this.ch, this.col, Game.map.list[this.x][this.y].bg_dark);
    } else if (Game.map.list[this.x][this.y].explored == false){
        // the tile is unexplored so keep it black
        Game.display.draw(this.x, this.y, " ", this.col, "black");
    } else {
        // the tile is explored but not lit
        Game.display.draw(this.x, this.y, this.ch, this.col, Game.map.list[this.x][this.y].bg_dark);
    };
};

    
// ERASE
Being.prototype.erase = function() {
    // essentially, tell the tile to draw itself
    // the being this is moving should be gone from the square when this is called
    Game.map.list[this.x][this.y].draw();
};

    
// check whether any of the being's equipment slots are free
Being.prototype.anyFreeHand = function() {
    for (var key in this.equipment) {
        if (this.equipment[key] === null) {
            return(key);
        };
    };
    return(false);
};


// check whether any of the being's equipment slots are full
Being.prototype.anyHandNotFree = function() {
    for (var key in this.equipment) {
        if (this.equipment[key] != null) {
            return(key);
        };
    };
    return(false);
};


// check whether the being is carrying a light source in equipment
Being.prototype.equippedLightSource = function() {
    if ((this.equipment["left hand"] && this.equipment["left hand"].light_giving) ||
        (this.equipment["right hand"] && this.equipment["right hand"].light_giving)) {
        return(true);
    } else {
        return(false);
    };
};


// assuming the being has equipped a light source, what is its radius?
Being.prototype.getLightRadius = function() {
    if (this.equipment["left hand"] && this.equipment["left hand"].light_giving) {
        var left_radius = this.equipment["left hand"].light_radius;
    } else {
        var left_radius = 0;
    };
    if (this.equipment["right hand"] && this.equipment["right hand"].light_giving) {
        var right_radius = this.equipment["right hand"].light_radius;
    } else {
        var right_radius = 0;
    };
    var radius = Math.max(left_radius, right_radius);
    return(radius);
};

    
// add item to inventory
Being.prototype.addToInventory = function(item, pickupable_item_index, inventory) {
    if (inventory.constructor === Array) {
        // remove the item from the tile it's on and put it in the player's inventory
        inventory.push( Game.map.list[item.x][item.y].items.splice(pickupable_item_index, 1)[0] );
    } else {
        inventory[this.anyFreeHand()] = Game.map.list[item.x][item.y].items.splice(pickupable_item_index, 1)[0];
    };
    // if the item is light-giving, remove it from flicker items
    if (item.light_giving) {
        for (var i = 0; i < Game.map.flicker_items.length; i++) {
            if (item.name == Game.map.flicker_items[i].name &&
                    item.x == Game.map.flicker_items[i].x &&
                    item.y == Game.map.flicker_items[i].y) {
                Game.map.flicker_items.splice(i, 1); // remove 1 item at index i
                Game.map.calculateLitAreas();
                item.redrawAreaWithinLightRadius();
                break;
            };
        };
    };
};


// the being picks up an item from his tile
Being.prototype.pickup = function() {
    var last_item_i = Game.map.list[this.x][this.y].items.length;
    var pickupable_items = Game.map.list[this.x][this.y].items.filter( function(x) { return(x.pickupable) } );
    // check if there are any pickupable items
    if (pickupable_items.length > 0) {
        // find the index of the last pickupable item
        for (var i = last_item_i - 1; i >= 0; i--) {
            if (Game.map.list[this.x][this.y].items[i].pickupable) {
                var last_pickupable_item_i = i;
            };
        };
        // check whether to put it in the inventory or an equipment slot
        if (this.anyFreeHand() && Game.map.list[this.x][this.y].items[last_pickupable_item_i].equipment) {
            // remove from map, add to equipment
            this.addToInventory( Game.map.list[this.x][this.y].items[last_pickupable_item_i], last_pickupable_item_i, this.equipment );
            // set the player's last move to 'picked up'
            this.last_move = 'picked up';
        } else {
            // remove from map, add to inventory
            this.addToInventory( Game.map.list[this.x][this.y].items[last_pickupable_item_i], last_pickupable_item_i, this.inventory );
            // set the player's last move to 'picked up'
            this.last_move = 'picked up';
        };
        if (this instanceof Player) {
            Game.engine.unlock();
        };
    };
};


// remove item from inventory
Being.prototype.removeFromInventory = function(inventory) {
    // remove the item from the player's inventory and put it on the player's tile
    if (inventory.constructor === Array) { //inventory
        var item = inventory.pop();
    } else { // equipment
        var item = inventory[this.anyHandNotFree()];
        inventory[this.anyHandNotFree()] = null;
    };
    item.x = this.x;
    item.y = this.y;
    Game.map.list[this.x][this.y].items.push(item);
    // if the item is light-giving, add it to the map's flicker_items array
    if (item.light_giving) {
        Game.map.flicker_items.push(item);
        Game.map.calculateLitAreas();
    };
};


// drop an item from inventory
Being.prototype.drop = function() {
    var last_item_i = this.inventory.length;
    if (0 < last_item_i) {
        this.removeFromInventory(this.inventory);
        // set the player's last move to 'dropped'
        this.last_move = 'dropped';
        if (this instanceof Player) {
            Game.engine.unlock();
        };
    } else if (this.anyHandNotFree()) {
        this.removeFromInventory(this.equipment);
        // set the player's last move to 'dropped'
        this.last_move = 'dropped';
        if (this instanceof Player) {
            Game.engine.unlock();
        };
    };
};


// teleport to an available square
Being.prototype.teleport = function(x, y) {
    if (isThisOnMap(x, y) && isThisWalkable(x, y)) {
        // tell the tile that the being is no longer present
        Game.map.list[this.x][this.y].being = null;
        // unblock the tile
        Game.map.list[this.x][this.y].blocked = false;
        // draw what was underneath you at this square (i.e. erase you, or draw what remains after you've gone)
        this.erase();
        this.x = x;
        this.y = y;
        if (this == Game.player) {
            this.draw();
        };
        // tell the new tile that the being is now present
        Game.map.list[x][y].being = this;
        // tell the new tile that it is now blocked
        Game.map.list[x][y].blocked = true;
        window.removeEventListener('keydown', this);
        // set the being's last move to 'teleport'
        this.last_move = 'teleport';
        // unlock the engine for the player
        if (this instanceof Player) {
            Game.engine.unlock();
        };
    };
};


// move the being
Being.prototype.move = function(dx, dy) {
    // check whether the target location is on the map
    if ( isThisOnMap(this.x + dx, this.y + dy) ) {
        // check if it's a closed door, and if so spend the turn opening it
        if (Game.map.list[this.x + dx][this.y + dy].tile_type == 'door' && Game.map.list[this.x + dx][this.y + dy].closed == true) {
            // alert('closed door!!');
            Game.map.list[this.x + dx][this.y + dy].open();
            Game.map.list[this.x + dx][this.y + dy].draw();
            // set the being's last move to 'opened door'
            this.last_move = 'opened door';
            // unlock the engine for the player
            if (this instanceof Player) {
                Game.engine.unlock();
            };
        // check whether it's a valid move, and if so move there
        } else if (isThisWalkable(this.x + dx, this.y + dy)) {
            // tell the tile this the being is no longer present
            Game.map.list[this.x][this.y].being = null;
            // unblock the tile
            Game.map.list[this.x][this.y].blocked = false;
            // draw what was underneath you at that square (i.e. erase you, or draw what remains after you've gone)
            this.erase(); 
            this.x = this.x + dx; // adjust the being's position
            this.y = this.y + dy;
            this.draw(); // draw new position
            // tell the new tile that the being is now present
            Game.map.list[this.x][this.y].being = this;
            // tell the new tiel that it is now blocked
            Game.map.list[this.x][this.y].blocked = true;
            // record the being's last move
            this.last_move = [dx, dy];
            // redraw light radius
            if (this.equippedLightSource()) {
                Game.map.calculateLitAreas();
                var radius = this.getLightRadius();
                Game.map.redrawAreaWithinRadius(this.x, this.y, radius+1);
            } else if (this == Game.player) {
                // always do this for the player, even if not carrying light source
                Game.map.calculateLitAreas();
            };
            // if this was the player then a turn was completed
            // so unlock the engine and let other actors have a turn:   
            if (this instanceof Player) {
                Game.engine.unlock();
            };
        };
    };
};
