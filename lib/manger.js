var UtilsR = require('./utils.js');
var Utils = new UtilsR();

var restau = [
    'Mongoo',
    'Label',
    'Koss',
    'Mie dinette',
    'Elgi',
    'Toto pates',
    'Toto pizza',
    'Pizzeria',
    'Flam\'s',
    'Coréen',
    'Jap volonté',
    'Crêperie',
    'Excuse',
    'Libanais',
    'Indien',
    'Bagel',
    'Pegast',
    'Corse',
    'Sub',
    'Big Fernand',
    'Burgers hipster-bio',
    'Domac',
    'BK'
];

var aTester = [
    'Boulangerie des mamies',
    'Mamie Burger',
    'Exki',
    'Non coupable',
    'Salade sous Big Fernand'
];

var Manger = function() {
    this._isMentioningManger = function(message) {
        return message.text.toLowerCase().indexOf('!manger') > -1;
    };

    this._replyManger = function(message, cardibot) {
        var channelName;
        if (message === null) {
            channelName = 'general';
        } else {
            channelName = Utils._getChannelOrUser(message, cardibot).name;
        }
        var res = Math.trunc(Math.random() * restau.length);
        cardibot.postTo(channelName, 'Aujourd\'hui vous allez manger ' + restau[res] +
            '. Bon appétit à tous !', {
                as_user: true
            });
    };

    this._isMentioningMangerListe = function(message) {
        return message.text.toLowerCase().indexOf('!mangerliste') > -1;
    };

    this._replyMangerListe = function(message, cardibot) {
        Utils._displayMessageAndArray(message, cardibot, 'Y a quand même le choix :\n', restau);
    };

    this._isMentioningATester = function(message) {
        return message.text.toLowerCase().indexOf('!atester') > -1;
    };

    this._replyATester = function(message, cardibot) {
        Utils._displayMessageAndArray(message, cardibot, 'Les restos à découvrir :\n', aTester);
    }
};

module.exports = Manger;

// TODO: Mettre la liste des options de bouffe dans une table dans la BDD pour pouvoir modifier les options directement depuis Slack
