"use strict";

var BeesRampu = function(x, y) {
    Being.apply(this, ['Bees-Rampu', '@', '#ffaaaa', x, y])
    Game.scheduler.add(this, true);
};
BeesRampu.prototype = Object.create(Being.prototype);
BeesRampu.prototype.constructor = BeesRampu;


//what Bees-Rampu does on his turn?
//he takes a step in a random direction
BeesRampu.prototype.act = function() {
        //Game.engine.lock() //seems like don't actually need this for npcs
    var dx = Math.floor(Math.random() * 3) - 1;
    var dy = Math.floor(Math.random() * 3) - 1;
    if (isThisOnMap(this.x + dx, this.y + dy) == false) {
        this.move(0, 0);
    } else {
        this.move(dx, dy);
    };
};

var James = function(x, y) {
    Being.apply(this, ['James', 'J', 'brown', x, y])
    Game.scheduler.add(this, true);
};
James.prototype = Object.create(Being.prototype);
James.prototype.constructor = James;
    
//James teleports every turn
James.prototype.act = function() {
    //Game.engine.lock() //seems like don't actually need this for npcs
    var x = Math.floor(Math.random() * 80)
    var y = Math.floor(Math.random() * 25)
    this.teleport(x, y);
};

var Wormigee = function(x, y) {
    Being.apply(this, ['Wormigee', 'W', 'grey', x, y])
    this.direction = 1;
    Game.scheduler.add(this, true);
};
Wormigee.prototype = Object.create(Being.prototype);
Wormigee.prototype.constructor = Wormigee;

//Wormigee walks left and right, back and forth
Wormigee.prototype.act = function() {
    //Game.engine.lock() //seems like don't actually need this for npcs
    if (this.x == Game.screen_width - 1) {
        this.direction = -1;
    } else if (this.x == 0) {
        this.direction = 1;
    };
    var dx = Math.floor(Math.random() * 2) * this.direction;
    var dy = Math.floor(Math.random() * 3) - 1;
    if (isThisOnMap(this.x + dx, this.y + dy) == false) {
        this.move(0, 0);
    } else {
        this.move(dx, dy);
    };
};
