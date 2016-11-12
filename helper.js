// ------------------- STRING FUNCTIONS -------------------

//Capitalize only first letter of a string
var capitalizeFirstLetter = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

var reverseString = function(s) {
    // reverse a string
    return s.split('').reverse().join('');
};

var separateLetters = function(words) {
    // put a space between every letter of every word
    for (var i = 0; i < words.length; i++) {
        words[i] = words[i].split("").join(" ");
    };
    return(words);
};

// ------------------- MARKOV AND ARRAYS OF STRINGS -------------------

var getWordsFromText = function(text) {
    // split a text into an array of words
    var words = text.split(" ");
    return(words);
};

var getWordsStartingWith = function(words, starting) {
    // get only the words that start with a certain string from an array of words
    words = words.filter(function (x) {return(x.startsWith(starting));});
    return(words);
};

var getWordsEndingWith = function(words, ending) {
    // get only the words that end with a certain string from an array of words
    words = words.filter(function (x) {return(x.endsWith(ending));});
    return(words);
};

var getWordsNotEndingWith = function(words, ending) {
    // get only the words that don't end with a certain string from an array of words
    words = words.filter(function (x) {return(!x.endsWith(ending));});
    return(words);
};

var getWordsOfMinLength = function(words, min_length) {
    // get only the words of a certain minimum length from an array of words
    words = words.filter(function (x) {return(x.length >= min_length);});
    return(words);
};

var filterRomanNumerals = function(words) {
    // filter out roman numerals from the list of words
    words = words.filter(function (x) {return(
        !/^(?=[mdclxvi])m*(c[md]|d?c*)(x[cl]|l?x*)(i[xv]|v?i*)$/.test(x.toLowerCase()));});
    return(words);
};

var normalizeVariations = function(words, variation, ending) {
    words = words.map(function(x) {return(x.replace(variation, ending))})
    return(words);
};

var hasTooManyLettersInARow = function(
        word, letter_type, not_exceeding) {
    // does this word have too many letters of a
    // certain type in a row? E.g. too many
    // consonants in a row?
    how_many = 0
    for (var i = 0; i < word.length; i++) {
        if (letter_type.search(word[i]) != -1) {
            how_many = how_many + 1;
            if (how_many > not_exceeding) {
                return(true);
            };
        } else {
            how_many = 0;
        };
    };
    return(false);
};

var getUnique = function (value, index, self) { 
    // get unique values from an array
    return self.indexOf(value) === index;
};

var regexToString = function(regex) {
    var result = regex.toString().replace(/\//g, "").replace("$", "").replace("^", "");
    return(result);
};

var makeLatinName = function (gender, min_length, max_length) {
    // generate a random Latin name using a Markov chains
    min_length = min_length || 5;
    max_length = max_length || 15;
    var startletters = latin_genders[gender]["startletters"];
    var letterstats = latin_genders[gender]["letterstats"];
    var terminals = latin_genders[gender]["terminals"];
    letter = randChoice(startletters);
    var name = [letter];
    while (letterstats.hasOwnProperty(letter)) {
        var next_letters = letterstats[letter];
        letter = randChoice(next_letters);
        name.push(letter);
        if (name.length > min_length &&
            terminals.hasOwnProperty(letter)) break;
    };
    name = name.join("");
    if (name.length < min_length ||
        LATIN_BAD_COMBINATIONS.some(function (x) {return(x.test(name));}) ||
        name.length > max_length) {
            return makeLatinName(gender, min_length, max_length);};
    // replace certain bad endings 
    name = name.replace(/[^u]{1}s$/, "us");
    name = name.replace(/[^u]{1}m$/, "um");
    return capitalizeFirstLetter(name);
};

// ------------------- DISPLAY -------------------

//create a tilemap for terminalglyphs12x12_alpha.png
//basically a dictionary that provides a 'key' for each character in the map
var createTileMap = function() {
    tileMap = {
                " ": [0, 0],
                "@": [0, 12*4],
                '"': [12*2, 12*2],
                "!": [12, 12*2],
                "fatdot": [12*9, 12*15],
                "gem": [12*15, 0],
                "brazier": [12*7, 0],
                "throne": [12*2, 12*13]
    };
    var digits = "0123456789";
    var capitals1 = "ABCDEFGHIJKLMNO";
    var capitals2 = "PQRSTUVWXYZ";
    var lowercase1 = "abcdefghijklmno";
    var lowercase2 = "pqrstuvwxyz";
    var punctu = "#$%&'()*+,-./";
    //digits
    for (var i = 0; i < digits.length; i++) {
        tileMap[digits[i]] = [12*i, 12*3];
    };
    //capitals1
    for (var i = 0; i < capitals1.length; i++) {
        tileMap[capitals1[i]] = [12*(i+1), 12*4];
    };
    //capitals2
    for (var i = 0; i < capitals2.length; i++) {
        tileMap[capitals2[i]] = [12*i, 12*5];
    };
    //lowercase1
    for (var i = 0; i < lowercase1.length; i++) {
        tileMap[lowercase1[i]] = [12*(i+1), 12*6];
    };
    //lowercase2
    for (var i = 0; i < lowercase2.length; i++) {
        tileMap[lowercase2[i]] = [12*i, 12*7];
    };
    //some punctuation
    for (var i = 0; i < punctu.length; i++) {
        tileMap[punctu[i]] = [12*(i+3), 12*2];
    };

    //get all the hieroglyphics
    for (var j = 0; j < 16; j++) {
        for (var i = 0; i < 16; i++) {
            var serialno = i + j*16;
            tileMap["hiero" + serialno] = [12*i, 12*(j + 19)];
        };
    };

    //get single lines
    tileMap['single_v'] = [12*3, 12*11]; //straight vertical
    tileMap['single_corner_tr'] = [12*15, 12*11]; //top right corner
    tileMap['single_corner_bl'] = [0, 12*12]; //bottom left corner
    tileMap['single_h'] = [12*4, 12*12]; //straight horizontal
    tileMap['single_corner_br'] = [12*9, 12*13]; //bottom right corner
    tileMap['single_corner_tl'] = [12*10, 12*13]; //top left corner

    return(tileMap);
};

//add a certain rgb value to a colour
var addRGBToColour = function(colour_string, value_to_add, rgb) {
    var colour_array = ROT.Color.fromString(colour_string);
    if (rgb == 'r') {
        colour_array[0] = colour_array[0] + value_to_add;
    } else if (rgb == 'g') {
        colour_array[1] = colour_array[1] + value_to_add;
    } else if (rgb == 'b') {
        colour_array[2] = colour_array[2] + value_to_add;
    } else {
        colour_array = colour_array.map( function(x) { return(x + value_to_add) } );
    };
    return(ROT.Color.toRGB(colour_array));
};

var flicker = function(i) {
    //This is the colour generator I used in my python rl:
    //libtcod.Color(255, 153+libtcod.random_get_int(0,-150, 100), 0)
    //console.log('flicker' + i);
    for (var h = 0; h < Game.map.flicker_items.length; h++) {
        var x = Game.map.flicker_items[h].x;
        var y = Game.map.flicker_items[h].y;
        var g = randInt(3, 253);
        //Game.map.flicker_items[h].col = ROT.Color.toHex( ROT.Color.interpolate([255, 255, 0], [255, 0, 0], ROT.RNG.getUniform()) );
        Game.map.flicker_items[h].col = ROT.Color.toHex( [255, g, 0] );
        //console.log(Game.map.flicker_items[h].col);
        if (Game.map.flicker_items[h].hidden_behind_message == false) {
            Game.map.list[x][y].draw();
        };
    };
};

// ------------------- MAP -------------------

//check if coordinates are on the map/screen/thing
var isThisOnMap = function(x, y) {
    if (x >= 0 &&
        x < Game.screen_width &&
        y >=0 &&
        y < Game.screen_height) {
            return true;
        } else {
            return false;
        };
};

//check if the tile under coordinates is walkable
//i.e. is walkable and not blocked
var isThisWalkable = function(x, y) {
    if (Game.map.list[x][y].walkable && !Game.map.list[x][y].blocked) {
        return true;
    } else {
        return false;
    };
};

// ------------------- RANDOM NUMBERS -------------------

//get a random integer
//randInt(1) can only return 0
//randInt(2) can return 0 or 1
var randInt = function(number1, number2) {
    number2 = number2 || 0;
    if (number1 == number2) {
        return number1;
    } else if (number1 > number2) {
        var great = number1;
        var less = number2;
    } else {
        var great = number2;
        var less = number1;
    };
    var diff = great - less;
    return less + Math.floor(ROT.RNG.getUniform() * diff);
    //return less + Math.floor(Math.random()*diff); //DEBUG
};

var randChoice = function(choice_list) {
    var index = randInt(choice_list.length);
    return( choice_list[index] );
};

// ------------------- LATIN STUFF -------------------

var numberToRoman = function(num) {
    roman = "";
    //figure out the thousands first
    thousands = Math.floor(num / 1000);
    for (var i = 0; i < thousands; i++) {
        roman = roman + "m";
    };
    num = num - thousands * 1000;
    //figure out the hundreds
    hundreds = Math.floor(num / 100);
    if (hundreds == 9) {
        roman = roman + "cm";
    } else if (hundreds >= 5) {
        roman = roman + "d";
        for (var i = 0; i < hundreds - 5; i++) {
            roman = roman + "c";
        };
    } else if (hundreds == 4) {
        roman = roman + "cd";
    } else {
        for (var i = 0; i < hundreds; i++) {
            roman = roman + "c";
        };
    };
    num = num - hundreds * 100;
    //figure out the tens
    tens = Math.floor(num / 10);
    if (tens == 9) {
        roman = roman + "xc";
    } else if (tens >= 5) {
        roman = roman + "l";
        for (var i = 0; i < tens - 5; i++) {
            roman = roman + "x";
        };
    } else if (tens == 4) {
        roman = roman + "xl";
    } else {
        for (var i = 0; i < tens; i++) {
            roman = roman + "x";
        };
    };
    num = num - tens * 10;
    //figure out the ones
    if (num == 9) {
        roman = roman + "ix";
    } else if (num >= 5) {
        roman = roman + "v";
        for (var i = 0; i < num - 5; i++) {
            roman = roman + "i";
        };
    } else if (num == 4) {
        roman = roman + "iv"
    } else {
        for (var i = 0; i < num; i++) {
            roman = roman + "i";
        };
    };
    return roman;
};

var getFeminineVersionOfNom = function(nom) {
    if ( nom.substring(nom.length - 2) == 'um' || nom.substring(nom.length - 2) == 'us' ) {
        var fem = nom.substring(0, nom.length - 2) + 'a';
    } else {
        var fem = nom;
    };
    return(fem);
};

var getMasculineVersionOfNom = function(nom) {
    if ( nom.substring(nom.length - 2) == 'um' ) {
        var masc = nom.substring(0, nom.length - 2) + 'us';
    } else if ( nom.substring(nom.length - 1) == 'a' ) {
        var masc = nom.substring(0, nom.length - 1) + 'us';
    } else {
        var masc = nom;
    };
    return(masc);
};

var getNeuterVersionOfNom = function(nom) {
    if ( nom.substring(nom.length - 2) == 'us' ) {
        var neut = nom.substring(0, nom.length - 2) + 'um';
    } else if ( nom.substring(nom.length - 1) == 'a' ) {
        var neut = nom.substring(0, nom.length - 1) + 'um';
    } else {
        var neut = nom;
    };
    return(neut);
};

var getGenitive = function(nom) {
    if ( nom.substring(nom.length - 2) == 'us' || nom.substring(nom.length - 2) == 'um' ) {
        var gen = nom.substring(0, nom.length - 2) + 'i';
    } else {
        var gen = nom + 'e'; 
    };
    return(gen);
};

var getGenitivePlural = function(nom) {
    if ( nom.substring(nom.length - 2) == 'us' || nom.substring(nom.length - 2) == 'um' ) {
        var gen = nom.substring(0, nom.length - 2) + 'orum';
    } else {
        var gen = nom + 'rum'; 
    };
    return(gen);
};

var getDative = function(nom) {
    if ( nom.substring(nom.length - 2) == 'us' || nom.substring(nom.length - 2) == 'um' ) {
        var dat = nom.substring(0, nom.length - 2) + 'o';
    } else {
        var dat = nom + 'e'; 
    };
    return(dat);
};

var getDativePlural = function(nom) {
    if ( nom.substring(nom.length - 2) == 'us' || nom.substring(nom.length - 2) == 'um' ) {
        var dat = nom.substring(0, nom.length - 2) + 'is';
    } else {
        var dat = nom.substring(0, nom.length - 1) + 'is';
    };
    return(dat);
};

var getAccusative = function(nom) {
    if ( nom.substring(nom.length - 2) == 'us' ) {
        var acc = nom.substring(0, nom.length - 1) + 'm';
    } else if ( nom.substring(nom.length - 2) == 'um' ) {
        var acc = nom;
    } else {
        var acc = nom + 'm'; 
    };
    return(acc);
};

var getAccusativePlural = function(nom) {
    if ( nom.substring(nom.length - 2) == 'us' || nom.substring(nom.length - 2) == 'um' ) {
        var acc = nom.substring(0, nom.length - 2) + 'os';
    } else {
        var acc = nom + 's'; 
    };
    return(acc);
};

var getAblative = function(nom) {
    if ( nom.substring(nom.length - 2) == 'us' || nom.substring(nom.length - 2) == 'um' ) {
        var abl = nom.substring(0, nom.length - 2) + 'o';
    } else {
        var abl = nom; 
    };
    return(abl);
};

var getAblativePlural = function(nom) {
    if ( nom.substring(nom.length - 2) == 'us' || nom.substring(nom.length - 2) == 'um' ) {
        var abl = nom.substring(0, nom.length - 2) + 'is';
    } else {
        var abl = nom.substring(0, nom.length - 1) + 'is';
    };
    return(abl);
};

var getVocative = function(nom) {
    if ( nom.substring(nom.length - 3) == 'ius' ) {
        var voc = nom.substring(0, nom.length - 2);
    } else if ( nom.substring(nom.length - 2) == 'us' ) {
        var voc = nom.substring(0, nom.length - 2) + 'e';
    } else {
        var voc = nom; 
    };
    return(voc);
};

var getNominativePlural = function(nom) {
    if ( nom.substring(nom.length - 2) == 'us' || nom.substring(nom.length - 1) == 'a' ) {
        var plu = getGenitive(nom);
    } else {
        var plu = nom.substring(0, nom.length - 2) + 'a';
    };
    return(plu);
};

var getLocationAdjective = function(nom) {
    if ( nom.substring(nom.length - 2) == 'us' || nom.substring(nom.length - 2) == 'um' ) {
        var adj = nom.substring(0, nom.length - 2) + 'ensis';
    } else {
        var adj = nom.substring(0, nom.length - 1) + 'ensis';
    };
    return(adj);
};

// ------------------- OTHER -------------------

function pauseComp(ms) {
    ms += new Date().getTime();
    while (new Date() < ms){}
};
