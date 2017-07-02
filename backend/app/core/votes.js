const _ = require('lodash');

class Votes {
  constructor(data) {
    Object.assign(this, data);
  }

  // TO_BE_REVIEWED @jsmadja
  countVotes() {
    var count = 0;
    for (var property in this) {
      if (this.hasOwnProperty(property)) {
        count++;
      }
    }
    return count;
  }

  // TO_BE_REVIEWED @jsmadja
  getMajority() {
    const result = {}
    // Additionner les voix.
    for (var property in this) {
      var count = result[this[property].voted] ? result[this[property].voted] : 0;
      result[this[property].voted] = count + 1
    }

    // Déterminer le maximum
    var chosenOnes = [];
    var chosenOneVoteAgainst = 0;
    for (var property in result) {
      if (result[property] > chosenOneVoteAgainst) {
        chosenOnes = [property];
        chosenOneVoteAgainst = result[property]
        // Déterminer une éventuelle égalité
      } else if (result[property] == chosenOneVoteAgainst) {
        chosenOnes.push(property)
      }
    }

    console.log("= Here are the vote results", chosenOnes)
    return chosenOnes;
  }

}

module.exports = Votes;
