var UtilsR = require("./utils");
var Utils = new UtilsR();

var nbDuelsMax = 50;
var recompenses = [
    "une bière au prochain afterwork",
    "une viennoiserie lundi matin",
    "3 cookies au prochain Sub",
    "1 café-flemme par jour la semaine prochaine",
    "1 paquet de bonbons"
];

var Jdh = function() {

    var nbPointsDuel = 0;

    this._isMentioningJdh = function(message, cardibot) {
        if (this._isMentioningSommaire(message, cardibot)) {
            this._replySommaire(message, cardibot);
        } else if (this._isMentioningJdhChuck(message)) {
            this._replyJdhChuck(message, cardibot);
        } else if (this._isMentioningJdhBasic(message)) {
            this._replyJdhBasic(message, cardibot);
        } else if (this._isMentioningScores(message)) {
            this._replyScores(message, cardibot);
        } else if (this._isMentioningTaux(message)) {
            this._replyTaux(message, cardibot);
        } else if (this._isMentioningDuel(message, cardibot)) {
            this._replyDuel(message, cardibot);
        } else if (this._isMentioningJaccepte(message, cardibot)) {
            this._replyJaccepte(message, cardibot);
        } else if (this._isMentioningQuota(message)) {
            this._replyQuota(message, cardibot);
        } else if (this._isMentioningOuinon(message)) {
            this._replyOuinon(message, cardibot);
        } else if (this._isMentioningEatDuCaca(message)) {
            this._replyEatDuCaca(message, cardibot);
        } else if (this._isMentioningMerci(message)) {
            this._replyMerci(message, cardibot);
        } else if (this._isMentioningDogeArmy(message)) {
            this._replyDogeArmy(message, cardibot);
        } else if (this._isMentioningCatArmy(message)) {
            this._replyCatArmy(message, cardibot);
        }
    };

    this._isMentioningSommaire = function(message) {
        return message.text.toLowerCase().indexOf("!sommaire") > -1;
    };

    this._replySommaire = function(message, cardibot) {
        var channel = Utils._getChannelOrUser(message, cardibot);
        var resString = "";
        resString += "--------------------Sommaire du JDH---------------------\n";
        resString += "Commandes disponibles :\n";
        resString += "!jdh : jouer au jdh classique (-10,100)\n";
        resString += "!jdhchuck : jouer au jdh chuck (-500,500)\n";
        resString += "!scores : afficher les scores de la semaine du jdh\n";
        resString += "!taux : afficher les taux de victoire aux duels de la semaine\n";
        resString += "!duel X : proposer un duel de X points\n";
        resString += "!jaccepte : accepter un duel proposé par quelqu'un dautre\n";
        resString += "!quota : voir son nombre de duels restant de la semaine\n";
        resString += "-----------------------------------------------------------------------\n";
        cardibot.postTo(channel.name, resString, {
            as_user: true
        });
    };

    this._isMentioningJdhBasic = function(message) {
        return message.text.toLowerCase().indexOf("!jdh") > -1;
    };

    this._replyJdhBasic = function(message, cardibot) {
        // Espérance : 45
        var points = Utils._randomIntFromInterval(-10, 100);
        this._playJdh(message, points, cardibot);
    };

    this._isMentioningJdhChuck = function(message) {
        return message.text.toLowerCase().indexOf("!jdhchuck") > -1;
    };

    this._replyJdhChuck = function(message, cardibot) {
        // Espérance : 0
        var points = Utils._randomIntFromInterval(-500, 500);
        this._playJdh(message, points, cardibot);
    };

    this._isMentioningScores = function(message) {
        return message.text.toLowerCase().indexOf("!scores") > -1;
    };

    this._replyScores = function(message, cardibot) {
        var channel = Utils._getChannelOrUser(message, cardibot);

        cardibot.db.query("SELECT id, score FROM jdh ORDER BY score DESC", function(err, result) {
            // Personne n'a joué
            if (result.rows.length < 1) {
                cardibot.postTo(channel.name, "Personne n'a encore joué (attention, stu commences tu sras spammé gros !)", {
                    as_user: true
                });
            } else {
                // Affichage des resultats
                var resString = "";
                for (var i = 0, tot = result.rows.length; i < tot; i++) {
                    resString += "<@" + result.rows[i].id + "> : " + result.rows[i].score + "\n";
                }
                cardibot.postTo(channel.name, resString, {
                    as_user: true
                });
            }
        });
    };

    this._isMentioningTaux = function(message) {
        return message.text.toLowerCase().indexOf("!taux") > -1;
    };

    this._replyTaux = function(message, cardibot) {
        var channel = Utils._getChannelOrUser(message, cardibot);

        cardibot.db.query("SELECT id, defeat, victory FROM jdh ORDER BY score DESC", function(err, result) {
            // Personne n'a joué
            if (result.rows.length < 1) {
                cardibot.postTo(channel.name, "Personne n'a encore joué (attention, stu commences tu sras spammé gros !)", {
                    as_user: true
                });
            } else {
                // Affichage des resultats
                var resString = "";
                for (var i = 0, tot = result.rows.length; i < tot; i++) {
                    if (result.rows[i].victory + result.rows[i].defeat != 0) {
                        resString += "<@" + result.rows[i].id + "> : " + (result.rows[i].victory + result.rows[i].defeat) + " duels, win : " +
                            Math.trunc((result.rows[i].victory / (result.rows[i].victory + result.rows[i].defeat)) * 100) + " % \n";
                    }
                }
                cardibot.postTo(channel.name, resString, {
                    as_user: true
                });
            }
        });
    };

    this._isMentioningDuel = function(message, cardibot) {
        var self = this;
        var channel = Utils._getChannelOrUser(message, cardibot);
        var ID = message.user;

        if (message.text.toLowerCase().indexOf("!duel ") > -1 && message.text.length <= 10) {
            var nbPoints = message.text.substring(6, message.text.length);
            // Si c'est bien un int et qu'il est inférieur à 500
            if (Number.isInteger(parseInt(nbPoints)) && parseInt(nbPoints) >= 1 && parseInt(nbPoints) <= 500) {
                nbPointsDuel = parseInt(nbPoints);
                return true;
            }
        }
        return false;
    };

    this._replyDuel = function(message, cardibot) {
        var self = this;
        var channel = Utils._getChannelOrUser(message, cardibot);
        var userId = message.user;

        self._isJdhPlayer(userId, cardibot, function(res) {
            if (res === false) {
                cardibot.postTo(channel.name, "Arrête de jouer au con <@" + userId + ">, joue d'abord au jdh !", {
                    as_user: true
                });
                return;
            } else if (res === "last") {
                cardibot.postTo(channel.name, "Et nan t'as pas le droit !", {
                    as_user: true
                });
                return;
            }

            // On vérifie que le joueur n'a pas atteint son quota de duels
            cardibot.db.query("SELECT victory, defeat FROM jdh WHERE id = $1", [userId], function(err, result) {
                var nbDuels = result.rows[0].victory + result.rows[0].defeat;
                if (nbDuels >= nbDuelsMax) {
                    cardibot.postTo(channel.name, "Tu as atteint ton quota de duels pour cette semaine !", {
                        as_user: true
                    });
                    return;
                }

                var nbPoints = nbPointsDuel;

                // Clean de la table duel
                cardibot.db.query("DELETE FROM duel");
                // Stockage du duel
                cardibot.db.query("INSERT INTO duel(id, nb_points) VALUES($1, $2)", [userId, nbPoints]);

                cardibot.postTo(channel.name, "<@" + userId + "> propose un duel pour " + nbPoints, {
                    as_user: true
                });
            });
        });
    };

    this._isMentioningJaccepte = function(message) {
        return message.text.toLowerCase().indexOf("!jaccepte") > -1;
    };

    this._replyJaccepte = function(message, cardibot) {
        var self = this;
        var channel = Utils._getChannelOrUser(message, cardibot);
        var mecQuiAccepte = message.user;


        self._isJdhPlayer(mecQuiAccepte, cardibot, function(res) {
            if (res === false) {
                cardibot.postTo(channel.name, "<@" + mecQuiAccepte + ">, il faut que tu joues au jdh pour accepter un duel, bolosse...", {
                    as_user: true
                });
                return;
            }
            cardibot.db.query("SELECT id, nb_points FROM duel LIMIT 1", function(err, result) {

                // Personne n'a proposé de duel
                if (result.rows.length < 1) {
                    cardibot.postTo(channel.name, "Personne n'a encore proposé de dududu-dudu duel !", {
                        as_user: true
                    });
                    return;
                }

                var mecQuiPropose = result.rows[0].id;

                if (mecQuiAccepte === mecQuiPropose) {
                    cardibot.postTo(channel.name, "Ai-je besoin de préciser qu'on ne peut pas accepter son propre duel <@" + mecQuiAccepte + "> ? La prochaine fois tu te prends des baffes !", {
                        as_user: true
                    });
                    return;
                }

                var nbPoints = result.rows[0].nb_points;

                // On vérifie que le joueur n'a pas atteint son quota de duels
                cardibot.db.query("SELECT victory, defeat FROM jdh WHERE id = $1", [mecQuiAccepte], function(err, result) {
                    var nbDuels = result.rows[0].victory + result.rows[0].defeat;
                    if (nbDuels >= nbDuelsMax) {
                        cardibot.postTo(channel.name, "Tu as atteint ton quota de duels pour cette semaine !", {
                            as_user: true
                        });
                        return;
                    }

                    var gagnant = "";
                    var perdant = "";
                    var nbPointsGagnant = Math.floor((0.9) * nbPoints);
                    var chance = Math.floor(Math.random() * 2);
                    if (chance === 0) {
                        gagnant = mecQuiPropose;
                        perdant = mecQuiAccepte;
                    } else if (chance === 1) {
                        gagnant = mecQuiAccepte;
                        perdant = mecQuiPropose;
                    }
                    // Update des scores
                    cardibot.db.query("UPDATE jdh SET score = score + $1 WHERE id = $2", [nbPointsGagnant, gagnant]);
                    cardibot.db.query("UPDATE jdh SET victory = victory + 1 WHERE id = $1", [gagnant]);
                    cardibot.db.query("UPDATE jdh SET score = score - $1 WHERE id = $2", [nbPoints, perdant]);
                    cardibot.db.query("UPDATE jdh SET defeat = defeat + 1 WHERE id = $1", [perdant]);
                    // Clean de la table duel
                    cardibot.db.query("DELETE FROM duel");

                    cardibot.postTo(channel.name, "(duel à " + nbPoints + ") <@" + gagnant + "> a le plus de CHATTE : + " + nbPointsGagnant + " !! Dommage pour " + "<@" + perdant + ">...", {
                        as_user: true
                    });
                });
            });
        });
    };

    this._isMentioningQuota = function(message) {
        return message.text.toLowerCase().indexOf("!quota") > -1;
    };

    this._replyQuota = function(message, cardibot) {
        var channel = Utils._getChannelOrUser(message, cardibot);
        var userId = message.user;

        this._isJdhPlayer(userId, cardibot, function(res) {
            if (res === false) {
                cardibot.postTo(channel.name, "Il faut d'abord que tu aies joué au JDH pour voir ton quota, ça parait logique non ?", {
                    as_user: true
                });
                return;
            }
            cardibot.db.query("SELECT victory, defeat FROM jdh WHERE id = $1", [userId], function(err, result) {
                cardibot.postTo(channel.name, "<@" + userId + ">, il te reste " + (nbDuelsMax - (result.rows[0].victory + result.rows[0].defeat)) + " duels cette semaine, spamme pas trop !", {
                    as_user: true
                });
            });
        });
    };

    this._isJdhPlayer = function(id, cardibot, callback) {
        cardibot.db.query("SELECT id FROM jdh ORDER BY score ASC", function(err, result) {
            for (var i = 0, tot = result.rows.length; i < tot; i++) {
                if (id === result.rows[i].id) {
                    callback(i === 0 ? "last" : true);
                    return;
                }
            }
            callback(false);
        });
    };

    this._playJdh = function(message, points, cardibot) {
        var self = this;
        var channel = Utils._getChannelOrUser(message, cardibot);
        var ID = message.user;

        if (ID == "USLACKBOT") {
            cardibot.postTo(channel.name, "Dégage sale robot, c'est un jeu pour les humains ici ! " + ID, {
                as_user: true
            });
            return;
        }

        // Jackpot de +1000 ou -1000 (chance : 1/100)
        var chance = Math.floor(Math.random() * 100);
        if (chance === 0) {
            points = -1000;
        } else if (chance === 1) {
            points = 1000;
        }

        cardibot.db.query("SELECT score, temps FROM jdh WHERE id = $1", [ID], function(err, result) {
            // Joue pour la 1e fois
            if (result.rows.length < 1) {
                cardibot.db.query("INSERT INTO jdh(id, score, temps, victory, defeat) VALUES($1, $2, $3, 0, 0)", [ID, points, (Math.trunc(message.ts)).toString()]);
                cardibot.postTo(channel.name, "Bravo <@" + ID + "> ! Tu marques " + points +
                    " points et ton score passe de 0 à " + points, {
                        as_user: true
                    });
            } else {
                var ancienTemps = parseInt(result.rows[0].temps);
                // Peut pas encore jouer
                if (message.ts - ancienTemps < 3600) {
                    var ts = Math.trunc(3600 - message.ts + ancienTemps);
                    var minutes = Math.trunc(ts / 60);
                    var secondes = Math.trunc(ts % 60);
                    cardibot.postTo(channel.name, "Tu ne peux pas encore rejouer. tu pourras rejouer dans : " +
                        minutes + " minutes et " + secondes + " secondes.", {
                            as_user: true
                        });
                } else {
                    var nouveauScore = parseInt(result.rows[0].score) + points;
                    cardibot.db.query("UPDATE jdh SET score = $1 WHERE id = $2", [nouveauScore, ID]);
                    cardibot.postTo(channel.name, "Bravo <@" + ID + "> ! Tu marques " + points +
                        " points et ton score passe de " + result.rows[0].score + " à " + nouveauScore, {
                            as_user: true
                        });
                    cardibot.db.query("UPDATE jdh SET temps = $1 WHERE id = $2", [(Math.trunc(message.ts)).toString(), ID]);
                }
            }
        });
    };

    this._sanctionAleatoire = function(cardibot) {
        var sanction = 200;
        var recompense = 100;
        var userSanctionneId;
        var userRecompenseId;

        // Obtenir un id aléatoire parmi les joueurs
        cardibot.db.query("SELECT id FROM jdh OFFSET floor(random() * (SELECT COUNT(*) FROM jdh)) LIMIT 1;", function(err, result) {
            var finalString = "";
            userSanctionneId = result.rows[0].id;
            cardibot.db.query("UPDATE jdh SET score = score - $1 WHERE id = $2", [sanction, userSanctionneId]);
            finalString += "<@" + userSanctionneId + "> obtient la sanction de - " + sanction + " !\n";

            cardibot.db.query("SELECT id FROM jdh OFFSET floor(random() * (SELECT COUNT(*) FROM jdh)) LIMIT 1;", function(err, result) {
                userRecompenseId = result.rows[0].id;
                cardibot.db.query("UPDATE jdh SET score = score + $1 WHERE id = $2", [recompense, userRecompenseId]);
                finalString += "<@" + userRecompenseId + "> obtient la récompense de + " + recompense + " !";

                cardibot.postTo("bots", finalString, {
                    as_user: true
                });
            });
        });
    };

    this._deciderRecompense = function(cardibot) {
        var indice = Math.trunc(Math.random() * recompenses.length);
        cardibot.db.query("SELECT id FROM jdh ORDER BY score ASC LIMIT 1", function(err, result) {
            var finalString = "";
            finalString += "BIM : <@" + result.rows[0].id + "> doit " + recompenses[indice] + " à ";
            cardibot.db.query("SELECT id FROM jdh ORDER BY score DESC LIMIT 1", function(err, result) {
                finalString += "<@" + result.rows[0].id + "> !";
                cardibot.postTo("bots", finalString, {
                    as_user: true
                });
            });
        });
    };

    this._isMentioningOuinon = function(message) {
        return message.text.toLowerCase().indexOf("!ouinon") > -1;
    };

    this._replyOuinon = function(message, cardibot) {
        var channel = Utils._getChannelOrUser(message, cardibot);
        var chance = Math.floor(Math.random() * 2);
        if (chance === 0) {
            cardibot.postTo(channel.name, "Non.", {
                as_user: true
            });
        } else if (chance === 1) {
            cardibot.postTo(channel.name, "Oui.", {
                as_user: true
            });
        }
    };

    this._isMentioningEatDuCaca = function(message) {
        return message.text.toLowerCase().indexOf("!eatducaca") > -1;
    };

    this._replyEatDuCaca = function(message, cardibot) {
        var channel = Utils._getChannelOrUser(message, cardibot);
        var userId = message.user;

        var chance = Math.floor(Math.random() * 2);
        if (chance === 0) {
            cardibot.postTo(channel.name, "Retourne manger du caca <@" + userId + ">  :poop: :poop: ", {
                as_user: true
            });
        } else if (chance === 1) {
            cardibot.postTo(channel.name, "Retournez tous manger du caca :poop: :poop: sauf <@" + userId + "> :heart: :heart: ", {
                as_user: true
            });
        }
    };

    this._isMentioningMerci = function(message) {
        return message.text.toLowerCase().indexOf("!merci") > -1;
    };

    this._replyMerci = function(message, cardibot) {
        var channel = Utils._getChannelOrUser(message, cardibot);
        cardibot.postTo(channel.name, "De rien maggle ! :sunglasses: ", {
            as_user: true
        });
    };

    this._isMentioningDogeArmy = function(message) {
        return message.text.toLowerCase().indexOf("doge army") > -1;
    };
    
    this._isMentioningCatArmy = function(message) {
        return message.text.toLowerCase().indexOf("cat army") > -1;
    };

    this._replyDogeArmy = function(message, cardibot) {
        var channel = Utils._getChannelOrUser(message, cardibot);
        cardibot.postTo(channel.name, ":boom:  :boom:  :boom:  :star:  :earth_africa: DOGE ARMY :earth_africa:  :star:  :boom:  :boom:  :boom:\n \n         :doge:                   :doge:                      :doge:                    :doge:   :flag-fr:\n:gun:  :shirt:  :shield:    :gun:  :shirt:  :shield:      :gun:  :shirt:  :shield:     :gun:  :shirt:    |\n\n     :shoe: :shoe:              :shoe: :shoe:               :shoe: :shoe:            :shoe: :shoe: |\n\n\n\n\n         :doge:                   :doge:                      :doge:                    :doge:  \n\n:gun:  :shirt:  :shield:    :gun:  :shirt:  :shield:      :gun:  :shirt:  :shield:       :saxophone::shirt:\n\n     :shoe: :shoe:              :shoe: :shoe:               :shoe: :shoe:              :shoe: :shoe:", {
            as_user: true
        });
    };
    
    this._replyCatArmy = function(message, cardibot) {
        var channel = Utils._getChannelOrUser(message, cardibot);
        cardibot.postTo(channel.name, ":boom:  :boom:  :boom:  :star:  :earth_asia: CAT ARMY :earth_asia:  :star:  :boom:  :boom:  :boom:\n \n         :cat:                   :cat:                      :cat:                    :cat:   :flag-fr:\n:gun:  :shirt:  :shield:    :gun:  :shirt:  :shield:      :gun:  :shirt:  :shield:     :gun:  :shirt:    |\n\n     :shoe: :shoe:              :shoe: :shoe:               :shoe: :shoe:            :shoe: :shoe: |\n\n\n\n\n         :cat:                   :cat:                      :cat:                    :cat:  \n\n:gun:  :shirt:  :shield:    :gun:  :shirt:  :shield:      :gun:  :shirt:  :shield:       :saxophone::shirt:\n\n     :shoe: :shoe:              :shoe: :shoe:               :shoe: :shoe:              :shoe: :shoe:", {
            as_user: true
        });
    };
};

module.exports = Jdh;

// TODO: Trouver meilleur moyen d'empecher les bots de jouer au jdh
// TODO: Message du bot à un moment random dans la journée, et le 1er à répondre reçoit un bonus ("qui est la ?")
// TODO: Top des meilleurs scores de la semaine (negatif et positif)
// TODO: Stats de la journée et de la semaine (moyenne, max et min)
// TODO: Compteur de jdh avec +50 pour le 100e ("Vous êtes le 100e visiteur !!")
// TODO: Créer table de quotes et !addquote !quote
// TODO: Nombres spéciaux (active effets particuliers quand score tombe à 404, etc.)
// TODO: Rajouter de l'aléatoire dans les duels (plus de chance de gagner quand tu es en bas et moins quand tu es en haut)
// TODO: Autre gestion des duels et des quotas
// TODO: Faire un duel en étant 1er ne compte pas dans le quota
// TODO: Limite de duels par jour et non par semaine
