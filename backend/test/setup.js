const expect = require("chai").expect;

const setup = require("../app/game/setup");
const gameUtils = require("../app/utils/gameUtils")

const gameIdTest = "test"

const firebase = require('./../app/services/firebase').getFirebaseClient();

describe("Setup", () => {

  describe("Create game", () => {
    it("Create game", (done) => {
      setup.createGame().then((id) => {
        firebase.database().ref().child(`games/${id}`).once('value').then((game) => {
          expect(game.val().status).to.equal("INITIAL")
          firebase.database().ref().child(`games/${id}`).remove()
          done()
        });
      });
    });
  });

  describe("Role distribution", () => {
    it("6 players distribution", (done) => {
      setup.distributeRoles(4337).then(() => {
        done()
      })
    });

    /*it("7 players distribution", (done) => {
     client.flushallAsync().then(() => {
     return client.saddAsync(gameUtils.getAliveKey(gameIdTest), "Pabs", "Qian", "Michael", "Julien", "Benjamin", "Simone", "Joachim")
     }).then(() => {
     return setup.distributeRoles(gameIdTest)
     }).then(() => {
     return client.scardAsync(gameUtils.getVillagersKey(gameIdTest)).then((res) => {
     expect(res).to.equal(5)
     })
     }).then(() => {
     return client.scardAsync(gameUtils.getAnyRoleKey(gameIdTest, "wolves")).then((res) => {
     expect(res).to.equal(2)
     })
     }).then(() => {
     done()
     })
     });

     it("8 players distribution", (done) => {
     client.flushallAsync().then(() => {
     return client.saddAsync(gameUtils.getAliveKey(gameIdTest), "Pabs", "Qian", "Michael", "Julien", "Benjamin", "Simone", "Joachim", "Alexandre")
     }).then(() => {
     return setup.distributeRoles(gameIdTest)
     }).then(() => {
     return client.scardAsync(gameUtils.getVillagersKey(gameIdTest)).then((res) => {
     expect(res).to.equal(6)
     })
     }).then(() => {
     return client.scardAsync(gameUtils.getAnyRoleKey(gameIdTest, "wolves")).then((res) => {
     expect(res).to.equal(2)
     })
     }).then(() => {
     done()
     })
     });*/
  });
})
;

