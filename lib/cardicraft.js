var UtilsR = require("./utils.js");
var Utils = new UtilsR();

var Cardicraft = function () {
    this._isMentioningCardicraft = function (message) {
        return message.text.toLowerCase().indexOf("!cc") == 0;
    };

    this._replyCardicraft = function (message, cardibot) {
        // La commande commence par !cc
        var self = this;
        var channel = Utils._getChannelOrUser(message, cardibot);
        var ID = message.user;
        // On fait une affectation pour attendre le résultat de la fonction
        self._MajCardior(Math.trunc(message.ts), cardibot);
        var resString = "";
        if (channel.name == "random" || channel.name == "general" || channel.name == "clope" || channel.name == "evol-du-futur" || channel.name == "tech") {
            cardibot.postTo(channel.name, "Tu devrais plutot essayer dans un message privé à Cardibot ....", {as_user: true});
        } else if (self._isMentioningSommaireCardicraft(message)) {
            self._replySommaireCardicraft(message, cardibot);
        } else if (self._isMentioningStartCardicraft(message)) {
            self._replyStartCardicraft(message, cardibot);
        } else if (self._isMentioningInfosCardicraft(message)) {
            self._replyInfosCardicraft(message, cardibot);
        } else if (self._isMentioningCoutsCardicraft(message)) {
            self._replyCoutsCardicraft(message, cardibot);
        } else if (self._isMentioningAchatmineCardicraft(message)) {
            self._replyAchatmineCardicraft(message, cardibot);
        } else if (self._isMentioningAchatcaserneCardicraft(message)) {
            self._replyAchatcaserneCardicraft(message, cardibot);
        } else if (self._isMentioningTrainCardicraft(message)) {
            self._replyTrainCardicraft(message, cardibot);
        } else if (self._isMentioningCibleCardicraft(message)) {
            self._replyCibleCardicraft(message, cardibot);
        } else if (self._isMentioningAttackCardicraft(message)) {
            self._replyAttackCardicraft(message, cardibot);
        } else if (self._isMentioningResetCardicraft(message)) {
            self._replyResetCardicraft(message, cardibot);
        } else {
            self._replySommaireCardicraft(message, cardibot);
        }
    };

    this._isMentioningSommaireCardicraft = function (message) {
        return (message.text.toLowerCase().indexOf("sommaire") == 4);
    };

    this._replySommaireCardicraft = function (message, cardibot) {
        var channel = Utils._getChannelOrUser(message, cardibot);
        var resString = "";
        resString += "--------------------Sommaire de CARDICRAFT---------------------\n";
        resString += "Commandes disponibles :\n";
        resString += "!cc start : commande activable une seule fois pour commencer une partie\n";
        resString += "!cc sommaire : voir le sommaire du jeu\n";
        resString += "!cc infos : connaitre son nombre de CardiOr et le cout d'amélioration\n";
        resString += "!cc couts : savoir combien coute la prochaine amélioration des batiment\n";
        resString += "!cc achat mine : acheter le niveau de mine de CardiOr supérieur\n";
        resString += "!cc achat caserne : acheter le niveau de caserne supérieur (améliorer vos CardiBarbares)\n";
        resString += "!cc train X : entrainez X CardiBarbares au même niveau que votre caserne\n";
        resString += "!cc cible : récupérer la liste des cible possible pour une attaque (liste des joueurs)\n";
        resString += "!cc attack X Y : attaquer le joueur X (donner le meme nom que celui qui apparait dans les cibles) avec Y CardiBarbares\n";
        resString += "!cc reset cardicraft inchallah : ! DANGER cette commande reset cardicraft DANGER ! \n";
        resString += "-----------------------------------------------------------------------\n";
        cardibot.postTo(channel.name, resString, {as_user: true});
    };

    this._isMentioningStartCardicraft = function (message) {
        return (message.text.toLowerCase().indexOf("start") == 4);
    };

    // Pour démarrer une session cardicraft
    this._replyStartCardicraft = function (message, cardibot) {
        var channel = Utils._getChannelOrUser(message, cardibot);
        var ID = message.user;
        var resString = "";
        cardibot.db.query("SELECT id FROM cardicraft WHERE id = $1", [ID], function (err, result) {
            if (result.rows.length == 0) {
                cardibot.db.query("INSERT INTO cardicraft (id, nom, ressource, niveaubat, niveauunit, timest) VALUES($1, $2, $3, $4, $5, $6)", [ID, channel.name, 0, 0, 0, Math.trunc(message.ts)]);
                cardibot.db.query("UPDATE cardicraft SET niveaubat=1, niveauunit=1 WHERE id = $1", [ID]);
                resString += "Tu viens de commencer ta partie de CardiCraft !\n";
                resString += "N'hésites pas à utiliser la commande '!cc sommaire' pour connaitre toutes les commandes.";
                cardibot.postTo(channel.name, resString, {as_user: true});
            } else {
                resString += "Tu as déjà une partie en cours.\n";
                resString += "Plus d'informations avec la commande '!cc sommaire'.\n";
                cardibot.postTo(channel.name, resString, {as_user: true});
            }
        });
    };

    this._isMentioningInfosCardicraft = function (message) {
        return (message.text.toLowerCase().indexOf("infos") == 4);
    };

    // Demande d'info sur la session de cardicraft
    this._replyInfosCardicraft = function (message, cardibot) {
        var channel = Utils._getChannelOrUser(message, cardibot);
        var ID = message.user;
        var resString = "";
        cardibot.db.query("SELECT nom, ressource, niveaubat, niveauunit, nbunit FROM cardicraft WHERE id = $1", [ID], function (err, result) {
            if (result.rows.length == 1) {
                resString += result.rows[0].nom + "\n";
                resString += "Ton Batiment de production de CardiOr est niveau " + result.rows[0].niveaubat + "\n";
                resString += "Ta caserne est niveau " + result.rows[0].niveauunit + "\n";
                resString += "Tu possèdes " + result.rows[0].ressource + " CardiOr\n";
                resString += "Tu possèdes " + result.rows[0].nbunit + " CardiBarbares\n";
                cardibot.postTo(channel.name, resString, {as_user: true});
            } else {
                resString += "Tu devrais d'abord lancer ta partie.\n";
                resString += "Plus d'informations avec la commande '!cc sommaire'.\n";
                cardibot.postTo(channel.name, resString, {as_user: true});
            }
        });
    };

    this._isMentioningCoutsCardicraft = function (message) {
        return message.text.toLowerCase().indexOf("couts") == 4;
    };

    // Demande du cout du niveau supérieur des batiments
    this._replyCoutsCardicraft = function (message, cardibot) {
        var self = this;
        var channel = Utils._getChannelOrUser(message, cardibot);
        var ID = message.user;
        var resString = "";
        cardibot.db.query("SELECT nom, ressource, niveaubat, niveauunit FROM cardicraft WHERE id = $1", [ID], function (err, result) {
            if (result.rows.length == 1) {
                resString += result.rows[0].nom + "\n";
                resString += "Ta mine de CardiOr est niveau " + result.rows[0].niveaubat + "\n";
                var level_mine = parseInt(result.rows[0].niveaubat) + 1;
                var resCoutMine = self._CoutMine(level_mine);
                resString += "Pour l'améliorer tu vas devoir débourser " + resCoutMine + " CardiOr\n";
                resString += "Ta caserne est niveau " + result.rows[0].niveauunit + "\n";
                var level_caserne = parseInt(result.rows[0].niveauunit) + 1;
                var resCoutCaserne = self._CoutCaserne(level_caserne);
                resString += "Pour l'améliorer tu vas devoir débourser " + resCoutCaserne + " CardiOr\n";
                resString += "Chaque CardiBarbare coute 15 CardiOr\n";
                cardibot.postTo(channel.name, resString, {as_user: true});
            } else {
                resString += "Tu devrais d'abord lancer ta partie.\n";
                resString += "Plus d'informations avec la commande '!cc sommaire'.\n";
                cardibot.postTo(channel.name, resString, {as_user: true});
            }
        });
    };

    this._isMentioningAchatmineCardicraft = function (message) {
        return (message.text.toLowerCase().indexOf("achat mine") == 4);
    };

    // Achat du niveau supérieur de mine de Cardior
    this._replyAchatmineCardicraft = function (message, cardibot) {
        var self = this;
        var channel = Utils._getChannelOrUser(message, cardibot);
        var ID = message.user;
        var resString = "";
        cardibot.db.query("SELECT nom, ressource, niveaubat FROM cardicraft WHERE id = $1", [ID], function (err, result) {
            if (result.rows.length == 1) {
                var level = parseInt(result.rows[0].niveaubat) + 1;
                var resCout = self._CoutMine(level);
                if (result.rows[0].ressource >= resCout) {
                    //il peut acheter
                    cardibot.db.query("UPDATE cardicraft SET ressource = $1, niveaubat = $2 WHERE id = $3", [result.rows[0].ressource - resCout, level, ID]);
                    resString += "Tu as bien acheté la mine de CardiOr de niveau " + level + "\n";
                    resString += "Bon courage pour la suite !\n";
                    cardibot.postTo(channel.name, resString, {as_user: true});
                } else {//il peut pas acheter
                    resString += "T'es trop pauvre mon vieux revient avec un plus gros pactole !\n";
                    resString += "il te manque " + (resCout - result.rows[0].ressource) + " CardiOr LOL\n";
                    cardibot.postTo(channel.name, resString, {as_user: true});
                }
            } else {
                resString += "Tu devrais d'abord lancer ta partie.\n";
                resString += "Plus d'informations avec la commande '!cc sommaire'.\n";
                cardibot.postTo(channel.name, resString, {as_user: true});
            }
        });
    };

    this._isMentioningAchatcaserneCardicraft = function (message) {
        return (message.text.toLowerCase().indexOf("achat caserne") == 4);
    };

    // Achat du niveau supérieur de caserne
    this._replyAchatcaserneCardicraft = function (message, cardibot) {
        var self = this;
        var channel = Utils._getChannelOrUser(message, cardibot);
        var ID = message.user;
        var resString = "";
        cardibot.db.query("SELECT nom, ressource, niveauunit FROM cardicraft WHERE id = $1", [ID], function (err, result) {
            if (result.rows.length == 1) {
                var level = parseInt(result.rows[0].niveauunit) + 1;
                var resCout = self._CoutCaserne(level);
                if (result.rows[0].ressource >= resCout) {
                    //il peut acheter
                    cardibot.db.query("UPDATE cardicraft SET ressource = $1, niveauunit = $2 WHERE id = $3", [result.rows[0].ressource - resCout, level, ID]);
                    resString += "Tu as bien acheté la caserne de niveau " + level + "\n";
                    resString += "Bon courage pour la suite !\n";
                    cardibot.postTo(channel.name, resString, {as_user: true});
                } else {//il peut pas acheter
                    resString += "T'es trop pauvre mon vieux revient avec un plus gros pactole !\n";
                    resString += "il te manque " + (resCout - result.rows[0].ressource) + " CardiOr LOL\n";
                    cardibot.postTo(channel.name, resString, {as_user: true});
                }
            } else {
                resString += "Tu devrais d'abord lancer ta partie.\n";
                resString += "Plus d'informations avec la commande '!cc sommaire'.\n";
                cardibot.postTo(channel.name, resString, {as_user: true});
            }
        });
    };

    this._isMentioningTrainCardicraft = function (message) {
        return (message.text.toLowerCase().indexOf("train") == 4 && //commande train
        message.text.toLowerCase().split(" ").length == 3 && //on vérifie qu'il y a 3 parties
        message.text.toLowerCase().split(" ")[2] == parseInt(message.text.toLowerCase().split(" ")[2], 10)); //et que la 3eme est un entier
    };

    // Demande d'info sur la session de cardicraft
    this._replyTrainCardicraft = function (message, cardibot) {
        var channel = Utils._getChannelOrUser(message, cardibot);
        var ID = message.user;
        var resString = "";
        cardibot.db.query("SELECT nom, ressource, nbunit FROM cardicraft WHERE id = $1", [ID], function (err, result) {
            if (result.rows.length == 1) {
                var training = parseInt(message.text.toLowerCase().split(" ")[2]);
                if (result.rows[0].ressource >= training * 15) {
                    // Il peut acheter
                    cardibot.db.query("UPDATE cardicraft SET ressource = $1, nbunit = $2 WHERE id = $3", [result.rows[0].ressource - (training * 15), result.rows[0].nbunit + training, ID]);
                    resString += "Tu as bien acheté " + training + " CardiBarbares.\n";
                    resString += "Bon courage pour la suite !\n";
                    cardibot.postTo(channel.name, resString, {as_user: true});
                } else {
                    // Il peut pas acheter
                    resString += "T'es trop pauvre mon vieux revient avec un plus gros pactole !\n";
                    resString += "il te manque " + ((training * 15) - result.rows[0].ressource) + " CardiOr LOL\n";
                    cardibot.postTo(channel.name, resString, {as_user: true});
                }
            } else {
                resString += "Tu devrais d'abord lancer ta partie.\n";
                resString += "Plus d'informations avec la commande '!cc sommaire'.\n";
                cardibot.postTo(channel.name, resString, {as_user: true});
            }
        });
    };

    this._isMentioningCibleCardicraft = function (message) {
        return message.text.toLowerCase().indexOf("cible") == 4;
    };

    // Demande des cibles potentielles
    this._replyCibleCardicraft = function (message, cardibot) {
        var channel = Utils._getChannelOrUser(message, cardibot);
        var ID = message.user;
        var resString = "";
        cardibot.db.query("SELECT nom FROM cardicraft", function (err, result) {
            resString += "Cibles potentielles : \n";
            for (var i = 0; i < result.rows.length; i++) {
                resString += "- " + result.rows[i].nom + "\n";
            }
            cardibot.postTo(channel.name, resString, {as_user: true});
        });
    };

    this._isMentioningAttackCardicraft = function (message) {
        return (message.text.toLowerCase().indexOf("attack") == 4 && //commande train
        message.text.toLowerCase().split(" ").length == 4 && //on vérifie qu'il y a 3 parties
        message.text.toLowerCase().split(" ")[3] == parseInt(message.text.toLowerCase().split(" ")[3], 10)); //et que la 4eme est un entier
    };

    // Demande d'attaque sur un joueur
    this._replyAttackCardicraft = function (message, cardibot) {
        var channel = Utils._getChannelOrUser(message, cardibot);
        var ID = message.user;
        var resString_att = "";
        var resString_def = "";
        var resString = "";
        var def = message.text.toLowerCase().split(" ")[2];
        var nb_attack = parseInt(message.text.toLowerCase().split(" ")[3]);
        console.error("le nombre d'attaquants !!! " + nb_attack);
        cardibot.db.query("SELECT nom, nbunit, niveauunit, ressource FROM cardicraft WHERE id = $1", [ID], function (err, result) {
            if (result.rows.length != 1) {//l'attaquant n'existe pas
                resString += "Tu devrais d'abord lancer ta partie.\n";
                resString += "Plus d'informations avec la commande '!cc sommaire'.\n";
                cardibot.postTo(channel.name, resString, {as_user: true});
            } else if (nb_attack > result.rows[0].nbunit) {//l'attaquant n'a pas assez d'unités
                resString += "Tu essayes de me baiser ?\n";
                resString += "T'as pas assez de CardiBarbares espèce de faible.\n";
                resString += "Plus d'informations avec la commande '!cc sommaire'.\n";
                cardibot.postTo(channel.name, resString, {as_user: true});
            } else {//On est ok pour l'attaquant on va checker le défenseur
                cardibot.db.query("SELECT nbunit, niveauunit, ressource, nom FROM cardicraft WHERE nom = $1", [def], function (err2, result2) {
                    if (result2.rows.length != 1) {//le défenseur n'existe pas
                        resString += "Tu veux attaquer quelqu'un qui n'existe pas ...\n";
                        resString += "T'es complétement débile ou ça se passe comment ?\n";
                        resString += "Plus d'informations avec la commande '!cc sommaire'.\n";
                        cardibot.postTo(channel.name, resString, {as_user: true});
                    } else {//le def existe donc c'est bon (c'est la seule condition min pour le def)
                        //on va calculer le ratio random de l'attaquant
                        var aleat = Math.floor(Math.random() * (11 + 10)) - 10;
                        var coef_Attack = (aleat / 100) + 1;
                        var force_attack = (1 + ((result.rows[0].niveauunit - 1) * 0.3)) * nb_attack * coef_Attack;
                        var force_def = (1.2 + ((result2.rows[0].niveauunit - 1) * 0.3)) * result2.rows[0].nbunit;
                        var res = force_attack - force_def;
                        if (res > 0) {//l'attaquant win
                            var restant_att = Math.round((res / force_attack) * nb_attack);//nombre de soldats restants à l'attaque
                            var restant_def = 0;
                            var gains = restant_att * 20;//pillage
                            if (gains > result2.rows[0].ressource) {//si l'attaquant gagne trop il gagne tout.
                                gains = result2.rows[0].ressource;
                            }
                            resString_att += "Tu as gagné ! Tu reviens avec " + restant_att + " CardiBarbares et " + gains + " CardiOr. Bravo";
                            resString_def += "Tu t'es fait attaqué par " + result.rows[0].nom + " et tu as perdu. Tes défenses se sont faites décimer et tu t'es fait voler " + gains + " CardiOr.";
                        } else {//le défenseur win
                            var restant_def = Math.round(-(res / force_def) * result2.rows[0].nbunit);//nombre de soldats restants à la défense
                            var restant_att = 0;
                            var gains = 0;
                            resString_att += "Tu as perdu ! Tes troupes se sont faites décimer et tu rentres brocouille. Bravo, c'était bien malin de s'attaquer a plus fort que toi.";
                            resString_def += "Tu t'es fait attaqué par " + result.rows[0].nom + " et tu as gagné. Il te reste maintenant " + restant_def + " CardiBarbares mais tu as gardé tout ton CardiOr.";
                        }
                        //update attaquant
                        var newRessource = parseInt(result.rows[0].ressource) + parseInt(gains);
                        cardibot.db.query("UPDATE cardicraft SET nbunit = $1, ressource = $2 WHERE id = $3", [restant_att, newRessource, ID]);
                        cardibot.postTo(result.rows[0].nom, resString_att, {as_user: true});
                        //update défenseur
                        newRessource = parseInt(result2.rows[0].ressource) - parseInt(gains);
                        cardibot.db.query("UPDATE cardicraft SET ressource = $1, nbunit = $2 WHERE nom = $3", [newRessource, restant_def, result2.rows[0].nom]);
                        cardibot.postTo(result2.rows[0].nom, resString_def, {as_user: true});
                        //on modifie les unités
                    }
                });
            }
        });
    };

    this._isMentioningResetCardicraft = function (message) {
        return (message.text.toLowerCase().indexOf("reset cardicraft inchallah") == 4);
    };

    this._replyResetCardicraft = function (message, cardibot) {
        var channel = Utils._getChannelOrUser(message, cardibot);
        var ID = message.user;
        var resString = "";
        if (ID == 'U0M2ZCL6T'){
            cardibot.db.query("DELETE FROM cardicraft");
            resString += ":rotating_light: ALERTE ! CARDICRAFT A ETE REINITIALISE ! ALERTE ! :rotating_light:  \n Bonne chance les Kim-Jung-Un Junior :rocket: <!channel>"
        } else {
            resString += "L'individu <@" + ID + "> a essayé de réinitialiser CARDICRAFT, merci de le lyncher sur la place publique ! <!channel>";
        }
        cardibot.postTo("bots", resString, {as_user: true});
    };

    // Réponse pour une fonction pas encore implémentée
    this._replyNotImplementedYet = function (message, cardibot) {
        var channel = Utils._getChannelOrUser(message, cardibot);
        var ID = message.user;
        var resString = "";
        resString += "Cette fonctionnalité n'est pas encore implémentée.\nSi vous voulez accélerez la cadence donnez de l'argent aux développeurs bandes de chacaux c'est pas un free to play ici.";
        cardibot.postTo(channel.name, resString, {as_user: true});
    };

    this._CoutMine = function (level) {
        var res;
        if (level < 11) {
            res = 4;
            for (var i = 1; i < level; i++) {
                res = (res * 2) + 2;
            }
        }
        else {
            res = 3070;
            for (var j = 10; j < level; j++) {
                res = res * 1.4;
            }
        }
        return Math.trunc(res);
    };

    this._CoutCaserne = function (level) {
        var res = 270;
        for (var i = 1; i < level; i++) {
            res = (res * 1.8);
        }
        return Math.trunc(res);
    };

    this._MajCardior = function (timestamp2, cardibot) {
        cardibot.db.query("SELECT nom, ressource, niveaubat, timest FROM cardicraft", function (err, result) {
            for (var j = 0; j < result.rows.length; j++) {
                if (err == null && result.rows[j] != undefined) {
                    // Production par minute au niveau 1
                    var prod = 1;
                    var coef;
                    for (var i = 1, tot = result.rows[j].niveaubat; i < tot; i++) {
                        coef = 1.05 + (1 / i);
                        prod = coef * prod;
                    }
                    var deltaT = timestamp2 - result.rows[j].timest;
                    var res = Math.trunc(parseInt(result.rows[j].ressource) + parseInt((deltaT / 60) * prod));
                    if (res != 0) {
                        cardibot.db.query("UPDATE cardicraft SET ressource = $1, timest = $2 WHERE nom = $3", [res, timestamp2, result.rows[j].nom]);
                    }
                }
            }
        });
    };
};

module.exports = Cardicraft;

// TODO: Rajouter un système de temps pour les améliorations de batiments
// TODO: Rajouter une amélioration d'unité
