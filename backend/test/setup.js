const expect = require("chai").expect;
const proxyquire = require('proxyquire');
const firebasemock = require('firebase-mock');

const rootMockPath = "testPath"

var mockdatabase = new firebasemock.MockFirebase();
var mockauth = new firebasemock.MockFirebase();
var mocksdk = firebasemock.MockFirebaseSdk(() => {
  return mockdatabase.child(rootMockPath);
}, () => {
  return mockauth;
});

var setup = proxyquire('../app/game/setup', {
  firebase: mocksdk
});


describe("Setup", () => {

  describe("Create game", () => {
    it("Create game", (done) => {
      const id = setup.createGame("device_1234");
      mockdatabase.flush();
      console.log(id)

      var data = mockdatabase.getData();
      expect(data[rootMockPath]["games"][id]['status']).to.equal("INITIAL");
      done();
    });
  });

  describe("Role distribution", () => {
    /*it("6 players distribution", (done) => {
     setup.distributeRoles(4337).then(() => {
     done()
     })
     });*/

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

