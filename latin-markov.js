// This file sets up the training data for creating random Latin names using Markov chains

var LATIN_CONSONANTS = "bcdfghjklmnpqrstvwxz";
var LATIN_VOWELS = "aeiouy";
var LATIN_SONORANTS = "lrmn";
var LATIN_BAD_COMBINATIONS = [
    new RegExp("qu[" + LATIN_CONSONANTS + "]"),
    new RegExp("^[" + LATIN_SONORANTS + "][" + LATIN_CONSONANTS + "]"),
    new RegExp("gn[" + LATIN_CONSONANTS + "]"),
    /pspt/,
    /rbd/,
    /ibus$/,
    /orum$/,
    /sususu/,
    /ccc/,
    /xx/,
    /^ss/,
    /^pth/,
    /^cc/,
    /^ff/,
    new RegExp("[" + LATIN_SONORANTS + "]cc"),
    new RegExp("[" + LATIN_CONSONANTS + "][" + LATIN_SONORANTS + "][" + LATIN_CONSONANTS + "]"),
    new RegExp("[" + LATIN_CONSONANTS + "]{5}"),
    new RegExp("[" + LATIN_VOWELS + "]{4}")];

// use the .training-text class to find the variable names for each of the Latin training texts
var latin_texts = $.map($(".training-text"), function(x) {
    return(/([^/]+)(?=\.js)/.exec(x.src));}).filter(getUnique);
// join all the texts together in a single variable
var latin_text = $.map(latin_texts, function(x) {return window[x];}).join(' ');
latin_text = latin_text.toLowerCase();

var latin_words = getWordsFromText(latin_text);
latin_words = filterRomanNumerals(latin_words); // remove roman numerals from list of words
var latin_genders = {
    "feminine": {
        "ending": "a",
        "variations": [/ae$/, /as$/]},
    "feminine_ia": {
        "ending": "ia",
        "variations": [/iae$/, /ias$/]},
    "masculine": {
        "ending": "us",
        "variations": [/i$/, /os$/, /o$/],
        "false_endings": ["ibus"]},
    "neuter": {
        "ending": "um",
        "false_endings": ["orum", "arum"]}}

for (var gender in latin_genders) {
    var ending = latin_genders[gender]["ending"];
    var words_of_gender = getWordsOfMinLength(getWordsEndingWith(latin_words, ending), 4);
    // get variant words of this gender and add them in too, e.g. -ae words
    for (var variation_i in latin_genders[gender]["variations"]) {
        var variation = latin_genders[gender]["variations"][variation_i];
        var variation_words = getWordsOfMinLength(getWordsEndingWith(latin_words, regexToString(variation)), 4);
        variation_words = normalizeVariations(variation_words, variation, ending);
        words_of_gender = words_of_gender.concat(variation_words);
    };
    // remove some false case endings like "ibus" and "orum"
    for (var ending_i in latin_genders[gender]["false_endings"]) {
        var false_ending = latin_genders[gender]["false_endings"][ending_i];
        words_of_gender  = getWordsNotEndingWith(words_of_gender, false_ending);
    };
    words_of_gender = separateLetters(words_of_gender);
    var terminals = [];
    var startletters = [];
    var letterstats = [];

    for (var i = 0; i < words_of_gender.length; i++) {
        var letters = words_of_gender[i].split(' ');
        terminals[letters[letters.length-1]] = true;
        startletters.push(letters[0]);
        for (var j = 0; j < letters.length - 1; j++) {
            if (letterstats.hasOwnProperty(letters[j])) {
                letterstats[letters[j]].push(letters[j+1]);
            } else {
                letterstats[letters[j]] = [letters[j+1]];
            };
        };
    };
    latin_genders[gender]["words"] = words_of_gender;
    latin_genders[gender]["terminals"] = terminals;
    latin_genders[gender]["startletters"] = startletters;
    latin_genders[gender]["letterstats"] = letterstats;
};
