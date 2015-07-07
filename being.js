var Being = function(name, ch, col, x, y, vision_radius) {
    var that = this;
    this.name = name;
    this.col = col;
    this.ch = ch;
    this.x = x;
    this.y = y;
    this.vision_radius = vision_radius || 5;
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