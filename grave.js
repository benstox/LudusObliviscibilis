"use strict";
var GraveName = function(sex) {
    this.sex = sex || 'male';
    //a placeholder name generator
    if (sex == 'male') {
        this.nom = randChoice(['Irdanus', 'Domitianus', 'Exerikus', 'Akkraticus', 'Devistianus', 'Doromitus', 'Thesmanius', 'Crodonus', 'Caelivinus', 'Stamblinius', 'Hofarrus', 'Tavlinius', 'Diraeus', 'Corophanus', 'Mivius', 'Hiridinus', 'Horodinus']);
    } else {
        this.nom = randChoice(['Bellina', 'Stallia', 'Davria', 'Davenna', 'Hoptina', 'Mantia', 'Savvia', 'Catana', 'Delvinia', 'Cerminia', 'Domira', 'Vureca', 'Talissa', 'Lotreca', 'Konda', 'Loba', 'Hammoda', 'Bathesba', 'Selacia']);
    };
    this.gen = getGenitive(this.nom);
    this.genPlur = getGenitivePlural(this.nom);
    this.abl = getAblative(this.nom);
    this.dat = getDative(this.nom);
};


var NationName = function() {
    GraveName.apply(this, ['female']);
    this.demonymNom = this.nom + 'nus';
    this.demonymGen = getGenitive(this.demonymNom);
    this.demonymGenPlur = getGenitivePlural(this.demonymNom);
    this.demonymAbl = getAblative(this.demonymNom);
    this.demonymDat = getDative(this.demonymNom);
};
NationName.prototype = Object.create(GraveName.prototype);
NationName.prototype.constructor = NationName;


var GravePerson = function(grave, sex, name, spouse, lord, occupation, deathDate, hasBrother, surname) {
    this.grave = grave || null;
    this.sex = sex || randChoice(['male', 'female']);
    this.name = name || new GraveName(this.sex);
    this.spouse = spouse || null;
    this.lord = lord;
    if (this.lord === undefined) {
        var lord_sex = randChoice(['male', 'female']);
        this.lord = new GravePerson( null, lord_sex, new GraveName(lord_sex), null, null, getRoyalOccupation(lord_sex) );
    };
    this.occupation = occupation || getRandomOccupation(this);
    this.deathDate = new GraveDeathDate(deathDate) || new GraveDeathDate( randInt(800, 1534) );
    this.hasBrother = hasBrother || false;
    this.surname = surname || null;    
    this.nameTitle = {
        "nom": [this.name.nom, this.occupation.nom].join(" "),
        "gen": [this.name.gen, this.occupation.gen].join(" ")
    }
};


var GraveDeathDate = function(year) {
    this.year = year;
    if (this.year % 4 == 0) {
        this.leapYear = true;
        var leap = 1;
    } else {
        this.leapYear = false;
        var leap = 0;
    };
    var dayNo = randInt(365 + leap);
    this.dayNo = dayNo;
    if (dayNo <= 30) {
        this.month = "Januarii";
        this.day = dayNo + 1;
    } else if (dayNo <= 58 + leap) {
        this.month = "Februarii";
        this.day = dayNo - 30;
    } else if (dayNo <= 89 + leap) {
        this.month = "Martii";
        this.day = dayNo - (58 + leap);
    } else if (dayNo <= 119 + leap) {
        this.month = "Aprilis";
        this.day = dayNo - (89 + leap);
    } else if (dayNo <= 150 + leap) {
        this.month = "Maii";
        this.day = dayNo - (119 + leap);
    } else if (dayNo <= 180 + leap) {
        this.month = "Junii";
        this.day = dayNo - (150 + leap);
    } else if (dayNo <= 211 + leap) {
        this.month = "Julii";
        this.day = dayNo - (180 + leap);
    } else if (dayNo <= 242 + leap) {
        this.month = "Augusti";
        this.day = dayNo - (211 + leap);
    } else if (dayNo <= 272 + leap) {
        this.month = "Septembris";
        this.day = dayNo - (242 + leap);
    } else if (dayNo <= 303 + leap) {
        this.month = "Octobris";
        this.day = dayNo - (272 + leap);
    } else if (dayNo <= 333 + leap) {
        this.month = "Novembris";
        this.day = dayNo - (303 + leap);
    } else {
        this.month = "Decembris";
        this.day = dayNo - (333 + leap);
    };
    this.text = numberToRoman(this.day) + " " + this.month + " AD " + numberToRoman(this.year);
};


var getRandomOccupation = function(person) {
    return( randChoice( GRAVE_OCCUPATIONS[person.sex] ) );
};


var getRoyalOccupation = function(sex) {
    return(GRAVE_OCCUPATIONS[sex].filter(function(x){return x['royal'] == true;}));
};


var getNonCelibateOccupation = function(sex) {
    return(GRAVE_OCCUPATIONS[sex].filter(function(x){return x['celibate'] == false;}));
};

    
var GRAVE_OCCUPATIONS = {
    'male': [
        {'nom': 'miles', 'gen': 'militis', 'hasLord': 'sub abl'},
        {'nom': 'armiger', 'gen': 'armigeri', 'hasLord': 'gen'},
        {'nom': 'comes', 'gen': 'comitis'},
        {'nom': 'capellanus', 'gen': 'capellanus', 'hasLord': 'dat', 'celibate': true},
        {'nom': 'rex', 'gen': 'regis', 'dat': 'regi', 'hasPeople': 'genPlu', 'royal': true},
        {'nom': 'monachus', 'gen': 'monachi', 'celibate': true, 'hasMonastery': 'gen'}
    ],
    'female': [
        {'nom': 'uxor', 'gen': 'uxoris', 'hasSpouse': 'gen'},
        {'nom': 'abbatissa', 'gen': 'abbatissae', 'celibate': true, 'hasMonastery': 'gen'},
        {'nom': 'monialis', 'gen': 'monialis', 'celibate': true, 'hasMonastery': 'gen'},
        {'nom': 'regina', 'gen': 'reginae', 'dat': 'reginae', 'hasPeople': 'genPlu', 'royal': true}
    ]
};


var LATIN_WORDS = {
    'this': {
        'm': {'nom': 'hic', 'gen': 'hujus', 'abl': 'hoc'},
        'f': {'nom': 'haec', 'gen': 'hujus', 'abl': 'hac'},
        'n': {'nom': 'hoc', 'gen': 'hujus', 'abl': 'hoc'}
    }
};


var MATERIALS = [
    {'nom': 'petra', 'gen': 'petrae', 'abl': 'petra', 'gender': 'f'},
    {'nom': 'marmor', 'gen': 'marmoris', 'abl': 'marmore', 'gender': 'n'}
];


var GraveIncipit = function(material) {
    this.material = material || MATERIALS[0];
    this.location = randChoice([
        'hic',
        [
            LATIN_WORDS['this'][this.material.gender].abl,
            'sub',
            this.material.abl
        ].join(" ")
    ]);
    
    this.incipit = [
        capitalizeFirstLetter(this.location),
        "jacet"
    ].join(" ");
};


var Grave = function(deceasedNumber, material, structure) {
    this.occupants = []; //will hold the Person objects
    this.deceasedNumber = deceasedNumber || 1;
    //this.nation = Game.nation;
    this.nation = new NationName();
    this.material = material || randChoice(MATERIALS);
    this.structure = structure || 'floor';
    this.incipit = new GraveIncipit(this.material).incipit;
    if (this.deceasedNumber >= 2) {
        this.couple = true;
    } else {
        this.couple = false;
    };
    //add each person to the list of occupants
    for(var i=0; i < this.deceasedNumber; i++) {
        if (i == 0 && this.couple == true) {
            //the husband
            this.occupants.push(new GravePerson(this, 'male', null, null, getNonCelibateOccupation('male')));
        } else if (i == 1 && this.couple == true) {
            //the wife
            this.occupants.push(new GravePerson(this, 'female', null, this.occupants[0], getNonCelibateOccupation('female')));
            this.occupants[0].spouse = this.occupants[1];
        } else {
            //unmarried
            this.occupants.push(new GravePerson(this));
        };
    };
    
    this.inscription = [
        'An inscription reads,',
        '"' + this.incipit,
        this.occupants[0].nameTitle.nom,
        'cujus animae propitietur Deus. Amen."'
    ].join(" ");
};
