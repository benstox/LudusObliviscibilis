var Item = function(name, plural, ch, col, x, y, blocks, pickupable, pursable, equipment) {
    var that = this;
    this.name = name;
    this.plural = plural;
    this.col = col;
    this.ch = ch;
    this.x = x;
    this.y = y;
    this.blocks = blocks; //does it block the tile it's on
    this.pickupable = pickupable; //can a being put it in their inventory
    this.pursable = pursable; //goes into player's purse, not inventory
    this.equipment = equipment; //can go into a player's equipment slot
    this.light_giving = false;
    this.light_radius = null;
    this.in_line_of_sight = false; // is it in player's line of sight? needed to get correct background for torches that are known but not currently visible
    
    if (this.blocks) {
        Game.map.list[this.x][this.y].blocked = true;
    };

    if (this.x != null && this.y != null) {
        // only push it to a tile's list of items if there is an x and y provided
        // otherwise we can assume that it is in someone's inventory
        Game.map.list[this.x][this.y].items.push(this);
    };
    
    this.draw = function() {
        if (Game.map.list[that.x][that.y].isThisLit()) {
            //the tile is lit so give the item the tile's normal background
            Game.display.draw(that.x, that.y, that.ch, that.col, Game.map.list[that.x][that.y].bg);
        } else {
            //the tile is in darkness so give the item the tile's darkened background
            Game.display.draw(that.x, that.y, that.ch, that.col, Game.map.list[that.x][that.y].bg_dark);
        };
    };
    
    this.redrawAreaWithinLightRadius = function() {
        Game.map.redrawAreaWithinRadius(that.x, that.y, that.light_radius);
    };
};

//an item that can be picked up
var InventoryItem = function(name, plural, ch, col, x, y, pursable, equipment) {
    Item.apply(this, [name, plural, ch, col, x, y, false, true, pursable, equipment]);
};

var Ruby = function(x, y) {
    InventoryItem.apply(this, ['ruby', 'rubies', 'gem', 'red', x, y, true, true]);
};



var Torch = function(x, y) {
    InventoryItem.apply(this, ['torch', 'torches', 'fatdot', 'yellow', x, y, false, true]);
    
    this.light_giving = true;
    this.hidden_behind_message = false;
    this.light_radius = 8;

    if (this.x != null && this.y != null) {
        // only push it to the map's list of "flicker_items" if there is an x and y provided
        // otherwise we can assume that it is in someone's inventory
        Game.map.flicker_items.push(this);
    };
};

//an item that cannot be picked up, it might block the square or it might not
var Furniture = function(name, plural, ch, col, x, y, blocks) {
    Item.apply(this, [name, plural, ch, col, x, y, blocks, false, false, false]);
};

var Brazier = function(x, y) {
    Furniture.apply(this, ['brazier', 'braziers', 'brazier', 'yellow', x, y, true]);
    
    this.light_giving = true;
    this.hidden_behind_message = false;
    this.light_radius = 8;
    
    Game.map.flicker_items.push(this);
};

var Throne = function(x, y) {
    Furniture.apply(this, ['throne', 'thrones', 'throne', 'rgb(245, 226, 1)', x, y, false]);
};
