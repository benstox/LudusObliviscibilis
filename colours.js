
var getGrassColour = function() {
    var colvar = 10;
    var colourMap = {
        "r": 40 + randInt(-colvar, colvar),
        "g": 125 + randInt(-colvar, colvar),
        "b": 40 + randInt(-colvar, colvar)
    };
    colourMap["r_dark"] = Math.floor(colourMap["r"]/3);
    colourMap["g_dark"] = Math.floor(colourMap["g"]/3);
    colourMap["b_dark"] = Math.floor(colourMap["b"]/3) + 20;
    colourMap["bg"] = 'rgb(' + colourMap["r"] + ', ' + colourMap["g"] + ', ' + colourMap["b"] + ')';
    colourMap["bg_dark"] = 'rgb(' + colourMap["r_dark"] + ', ' + colourMap["g_dark"] + ', ' + colourMap["b_dark"] + ')';
    return(colourMap);
};
