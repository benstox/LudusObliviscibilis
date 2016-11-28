"use strict";
var GraveName = function(sex) {
    this.sex = sex || 'male';
    //a placeholder name generator
    if (sex == 'male') {
        this.nom = makeLatinName("masculine");
    } else if (sex == 'female') {
        this.nom = makeLatinName("feminine");
    } else if (sex == 'nation') {
        this.nom = makeLatinName("feminine_ia");
    } else {
        this.nom = makeLatinName("neuter");
    };
    this.gen = getGenitive(this.nom);
    this.genPlur = getGenitivePlural(this.nom);
    this.abl = getAblative(this.nom);
    this.dat = getDative(this.nom);
};


var NationName = function() {
    GraveName.apply(this, ['nation']);
    this.demonymNom = this.nom + 'nus';
    this.demonymGen = getGenitive(this.demonymNom);
    this.demonymGenPlur = getGenitivePlural(this.demonymNom);
    this.demonymAbl = getAblative(this.demonymNom);
    this.demonymDat = getDative(this.demonymNom);
};
NationName.prototype = Object.create(GraveName.prototype);
NationName.prototype.constructor = NationName;


var GravePerson = function(grave, sex, name, spouse, lord, social_class, occupation, deathDate, hasBrother, surname) {
    this.grave = grave || null;
    this.sex = sex || randChoice(['male', 'female']);
    this.name = name || new GraveName(this.sex);
    this.spouse = spouse || null;
    this.lord = lord;
    if (this.lord === undefined) {
        var lord_sex = randChoice(['male', 'female']);
        this.lord = new GravePerson( null, lord_sex, new GraveName(lord_sex), null, null, null, getRoyalOccupation(lord_sex) );
    };
    this.social_class = social_class || null;
    if (this.social_class) {
        this.occupation = getClassOccupation(this.sex, social_class);
    } else {
        this.occupation = occupation || getRandomOccupation(this);
    };
    this.deathDate = new GraveDeathDate(deathDate) || new GraveDeathDate( randInt(800, 1534) );
    this.hasBrother = hasBrother || false;
    this.surname = surname || null;
    // how their name will appear on inscriptions
    this.nameTitle = {
        "nom": [this.name.nom, this.occupation.nom],
        "gen": [this.name.gen, this.occupation.gen].join(" ")
    };
    // add some extras onto the end of the occupation in the nameTitle
    if (this.occupation["hasPeople"]) {
        this.nameTitle["nom"].push(getGenitivePlural(Game.nation.demonymNom));
    } else if (this.occupation["hasNation"]) {
        this.nameTitle["nom"].push(getLocationAdjective(Game.nation.nom));
    } else if (this.occupation["hasMonastery"]) {
        var saint = randChoice(Game.local_saints);
        if (saint.endsWith("us")) {
            this.nameTitle["nom"].push("Sancti");
        } else {
            this.nameTitle["nom"].push("Sanctae");
        };
        this.nameTitle["nom"].push(getGenitive(saint));
    };
    this.nameTitle["nom"] = this.nameTitle["nom"].join(" ");
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
    return( randChoice(_.filter(GRAVE_OCCUPATIONS[sex], function(x){return x['social_class'] == "monarch";})) );
};


var getNonCelibateOccupation = function(sex) {
    return( randChoice(_.filter(GRAVE_OCCUPATIONS[sex], function(x){return x['celibate'] == false;})) );
};

var getClassOccupation = function(sex, social_class) {
    return( randChoice(_.filter(GRAVE_OCCUPATIONS[sex], function(x){return x['social_class'] == social_class;})) );
};

var getNotClassOccupation = function(sex, social_class) {
    return( randChoice(_.filter(GRAVE_OCCUPATIONS[sex], function(x){return x['social_class'] != social_class;})) );
};

    
var GRAVE_OCCUPATIONS = {
    'male': [
        {'nom': 'panifex', 'gen': 'panificis', 'social_class': 'commoner'},
        {'nom': 'piscator', 'gen': 'piscatoris', 'social_class': 'commoner'},
        {'nom': 'agricola', 'gen': 'agricolae', 'social_class': 'commoner'},
        {'nom': 'cervesarius', 'gen': 'cervesarii', 'social_class': 'commoner'},
        {'nom': 'vespillo', 'gen': 'vespillonis', 'social_class': 'commoner'},
        {'nom': 'mercator', 'gen': 'mercatoris', 'social_class': 'middle'},
        {'nom': 'miles', 'gen': 'militis', 'hasLord': 'sub abl', 'social_class': 'military'},
        {'nom': 'armiger', 'gen': 'armigeri', 'hasLord': 'gen', 'social_class': 'military'},
        {'nom': 'comes', 'gen': 'comitis', 'social_class': 'aristocrat'},
        {'nom': 'dux', 'gen': 'ducis', 'social_class': 'aristocrat'},
        {'nom': 'clerus', 'gen': 'cleri', 'celibate': true, 'social_class': 'ecclesiastic'},
        {'nom': 'presbyter', 'gen': 'presbyteris', 'celibate': true, 'social_class': 'ecclesiastic'},
        {'nom': 'sacerdos', 'gen': 'sacerdotis', 'celibate': true, 'social_class': 'ecclesiastic'},
        {'nom': 'monachus', 'gen': 'monachi', 'celibate': true, 'hasMonastery': true, 'social_class': 'ecclesiastic'},
        {'nom': 'capellanus', 'gen': 'capellanus', 'hasLord': 'dat', 'celibate': true, 'social_class': 'ecclesiastic'},
        {'nom': 'episcopus', 'gen': 'episcopi', 'hasNation': 'loc_adj', 'celibate': true, 'social_class': 'ecclesiastic'},
        {'nom': 'rex', 'gen': 'regis', 'dat': 'regi', 'hasPeople': true, 'social_class': 'monarch'},
        {'nom': 'consors', 'gen': 'consortis', 'dat': 'consorti', 'hasLord': 'gen', 'social_class': 'royal'},
        {'nom': 'princeps', 'gen': 'principis', 'dat': 'principi', 'social_class': 'royal'},
    ],
    'female': [
        {'nom': 'uxor', 'gen': 'uxoris', 'hasSpouse': 'gen', 'social_class': 'commoner'},
        {'nom': 'comitessa', 'gen': 'comitessae', 'social_class': 'aristocrat'},
        {'nom': 'ducissa', 'gen': 'ducissae', 'social_class': 'aristocrat'},
        {'nom': 'abbatissa', 'gen': 'abbatissae', 'celibate': true, 'hasMonastery': true, 'social_class': 'ecclesiastic'},
        {'nom': 'monialis', 'gen': 'monialis', 'celibate': true, 'hasMonastery': true, 'social_class': 'ecclesiastic'},
        {'nom': 'regina', 'gen': 'reginae', 'dat': 'reginae', 'hasPeople': true, 'social_class': 'monarch'},
        {'nom': 'regina', 'gen': 'reginae', 'dat': 'reginae', 'hasLord': 'gen', 'social_class': 'royal'},
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


var TOMBS = [
    {'nom': 'sepulchrum', 'gen': 'sepulchri', 'abl': 'sepulchro', 'gender': 'n'},
    {'nom': 'tumulus', 'gen': 'tumuli', 'abl': 'tumulo', 'gender': 'm'},
    {'nom': 'monumentum', 'gen': 'monumenti', 'abl': 'monumento', 'gender': 'n'}
];


var SOCIAL_CLASSES = [];


var GraveIncipit = function(material, occupants) {
    this.material = material || MATERIALS[0];
    this.occupants = occupants || new GravePerson();
    this.tomb = randChoice(TOMBS);
    this.location = randChoice([
        'hic',
        [
            LATIN_WORDS['this'][this.material.gender].abl,
            'sub',
            this.material.abl
        ].join(" "),
        [
            'in',
            LATIN_WORDS['this'][this.tomb.gender].abl,
            this.tomb.abl
        ].join(" "),
    ]);
    var jacet_choices = [
        "jacet",
        "requiescit",
        "quiescit",
        "resurrectionem expectat",
        "diem expectat resurrectionis"
    ];
    var jacet_choice = randChoice(jacet_choices);
    this.incipit = [
        capitalizeFirstLetter(this.location),
        jacet_choice
    ];
    if(randInt(3) == 0 && jacet_choice.search('resurrection') == -1) {
        var plenus = 'plenus';
        if(this.occupants[0].sex == 'female') {
            plenus = getFeminineVersionOfNom(plenus);
        };
        this.incipit.push(
            randChoice([
                "in spe",
                "in spe resurrectionis",
                "in spe beatae resurrectionis",
                "resurrectionem expectans",
                "in pace",
                "in Christo",
                plenus + " spe", // redo these three so that they can be applied independently??
                plenus + " fide",
                plenus + " charitate"
            ])
        );
    };
    if(randInt(3) == 0) {
        var servus = ['servus', 'famulus', 'amicus'];
        if(this.occupants[0].sex == 'female') {
            for(var i = 0; i < servus.length; i++) {
                servus[i] = getFeminineVersionOfNom(servus[i]);
            };
        };
        this.incipit.push(
            [
                randChoice(servus),
                'Dei'
            ].join(" ")
        );
    };
    this.incipit = this.incipit.join(" ");
};


var Grave = function(deceasedNumber, material, structure, social_class) {
    this.occupants = []; // will hold the Person objects
    this.deceasedNumber = deceasedNumber || 1;
    this.nation = Game.nation;
    this.material = material || randChoice(MATERIALS);
    this.structure = structure || randChoice(['floor', 'monument']);
    this.social_class = social_class || null;
    
    if (this.deceasedNumber >= 2) {
        this.couple = true;
    } else {
        this.couple = false;
    };
    // add each person to the list of occupants
    for(var i=0; i < this.deceasedNumber; i++) {
        if (i == 0 && this.couple == true) {
            // the husband
            this.occupants.push(new GravePerson(this, 'male', null, null, undefined, this.social_class, getNonCelibateOccupation('male')));
        } else if (i == 1 && this.couple == true) {
            // the wife
            this.occupants.push(new GravePerson(this, 'female', null, this.occupants[0], undefined, this.social_class, getNonCelibateOccupation('female')));
            this.occupants[0].spouse = this.occupants[1];
        } else {
            // unmarried
            this.occupants.push(new GravePerson(this, randChoice(["male", "female"]), null, null, undefined, this.social_class));
        };
    };
    
    this.incipit = new GraveIncipit(this.material, this.occupants).incipit;
    
    this.inscription = [
        'An inscription reads,',
        '"' + this.incipit,
        this.occupants[0].nameTitle.nom];

    if (this.deceasedNumber == 1) {
        this.inscription.push('cujus animae propitietur Deus. Amen."');
    } else {
        this.inscription.push('quorum animabus propitietur Deus. Amen."');
    };
    this.inscription = this.inscription.join(" ");
};
