var Util = require("util");
var Bot = require("slackbots");
var Pg = require("pg");
var CronJob = require("cron").CronJob;

var UtilsR = require("./utils.js");
var MangerR = require("./manger.js");
var JdhR = require("./jdh.js");
var CardicraftR = require("./cardicraft.js");

var Utils = new UtilsR();
var Manger = new MangerR();
var Jdh = new JdhR();
var Cardicraft = new CardicraftR();

var Cardibot = function Constructor(settings) {
    this.settings = settings;
    this.settings.name = this.settings.name || "cardibot";
    this.dbPath = settings.dbPath;
    this.user = null;
    this.db = null;
};

// Inherits methods and properties from the Bot constructor
Util.inherits(Cardibot, Bot);

Cardibot.prototype.run = function() {
    Cardibot.super_.call(this, this.settings);
    this.on("start", this._onStart);
    this.on("message", this._onMessage);
};

Cardibot.prototype._onStart = function() {
    this._loadBotUser();
    this._connectDb();
    this._cronJobs();
    this._welcomeMessage();
};

Cardibot.prototype._loadBotUser = function() {
    var self = this;
    this.user = this.users.filter(function(user) {
        return user.name === self.name;
    })[0];
};

Cardibot.prototype._connectDb = function() {
    var self = this;
    Pg.defaults.ssl = true;
    self.db = new Pg.Client(this.dbPath);
    self.db.connect();
    self.db.query("CREATE TABLE IF NOT EXISTS jdh(id TEXT PRIMARY KEY, score INT, temps TEXT)");
    self.db.query("CREATE TABLE IF NOT EXISTS duel(id TEXT PRIMARY KEY, nb_points INT)");
};

Cardibot.prototype._cronJobs = function() {
    var self = this;

    // Crons généraux

    // Pause de 10h30
    new CronJob("00 30 10 * * 1-5", function() {
        self.postTo("general", "<!everyone>: Il est 10h30, première pause de la journée mes petits cocos !", {
            as_user: true
        });
    }, null, true, "Europe/Paris");

    // Pause de midi
    new CronJob("00 00 12 * * 1-5", function() {
        self.postTo("general", "<!everyone>: Il est midi, c'est l'heure d'aller casser la croute !", {
                as_user: true
            })
            .then(function() {
                Manger._replyManger(null, self);
            });
    }, null, true, "Europe/Paris");

    // Pause de 15h
    new CronJob("00 00 15 * * 1-5", function() {
        self.postTo("general", "<!everyone>: Il est 15h, je sais que vous êtes en train de décéder, aller, ptite pause!", {
            as_user: true
        });
    }, null, true, "Europe/Paris");

    // Pause de 17h
    new CronJob("00 00 17 * * 1-5", function() {
        self.postTo("general", "<!everyone>: Il est 17h, dernière pause de la journée, courage !", {
            as_user: true
        });
    }, null, true, "Europe/Paris");

    // TEMPS PARTIEL
    new CronJob("00 02 18 * * 1-5", function() {
        self.postTo("general", "<!everyone>: Il est 18h02, c'est l'heure des temps partiels ! On fait tous un au revoir pour les touristes qui nous quittent !", {
            as_user: true
        });
    }, null, true, "Europe/Paris");

    // Crons pour le JDH

    // Sanction et récompense aléatoire à la fin de la journée (17h45)
    new CronJob("00 45 17 * * 1-5", function() {
        Jdh._sanctionAleatoire(self);
    }, null, true, "Europe/Paris");

    // Clear du jdh + duel tous les lundis à 8h
    new CronJob("00 00 08 * * 1", function() {
        self.db.query("DELETE FROM duel");
        self.db.query("DELETE FROM jdh");
        self.postTo("bots", "C'est lundi, il est 8h, les oiseaux se suicident et les scores ont été réinitialisés !", {
            as_user: true
        });
    }, null, true, "Europe/Paris");

    // Decider de la recompense que doit le perdant au gagnant a la fin de la semaine (vendredi 18h)
    new CronJob("00 00 18 * * 5", function() {
        Jdh._deciderRecompense(self);
    }, null, true, "Europe/Paris");
};

Cardibot.prototype._welcomeMessage = function() {
    this.postTo("bots", "Salut mes petits stagiaires ! Alors, la pause est enfin finie ? AU TRAVAIL !", {
        as_user: true
    });
};

Cardibot.prototype._onMessage = function(message) {
    var self = this;
    if ((Utils._isMessageOk(message, self)) && (Utils._getChannelOrUser(message, self).name !== "general")) {
        if (self._isMentioningBot(message)) {
            self._replyBasic(message);
        } else if (Manger._isMentioningMangerListe(message)) {
            Manger._replyMangerListe(message, self);
        } else if (Manger._isMentioningManger(message)) {
            Manger._replyManger(message, self);
        } else if (Manger._isMentioningATester(message)) {
            Manger._replyATester(message, self);
        }

        // else if (Cardicraft._isMentioningCardicraft(message)) {
        //     Cardicraft._replyCardicraft(message, self);
        // }
        // A la fin
        // else if (this._isMentioningExclamation(message)) {
        //   this._replyExclamation(message);
        // }
        Jdh._isMentioningJdh(message, self);
    }
    if (Utils._isMessageOk(message, self)) {
        var points = Utils._randomIntFromInterval(1, 50);
        if (points === 1) {
            self._replySpecial(message);
        }
    }
};

Cardibot.prototype._isMentioningBot = function(message) {
    return message.text.toLowerCase().indexOf(this.name) > -1;
};

Cardibot.prototype._replyBasic = function(message) {
    var self = this;
    var channel = Utils._getChannelOrUser(message, self);
    self.postTo(channel.name, "C'est moi !", {
        as_user: true
    });
};

Cardibot.prototype._isMentioningExclamation = function(message) {
    return message.text.toLowerCase().indexOf("!") == 0;
};

Cardibot.prototype._replyExclamation = function(message) {
    var self = this;
    var channel = Utils._getChannelOrUser(message, self);
    self.postTo(channel.name, "Retourne travailler sale stagiaire !", {
        as_user: true
    });
};

Cardibot.prototype._replySpecial = function(message) {
    var self = this;
    var channel = Utils._getChannelOrUser(message, self);
    self.postTo(channel.name, "Fragile !", {
        as_user: true
    });
};

module.exports = Cardibot;

// TODO: Changer horaires de pause ?
// TODO: Mieux gérer les "isMentionning" et "reply"

// @abensimon U0PLYKW9E
// @gunther U1B13MYPQ
// @harold U0M307X16
// @hermy U0M39GS4V
// @mathis U0NE89KK8
// @sacha U0M2Z0B2N
// @victor U0M2ZCL6T
