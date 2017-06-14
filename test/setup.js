const expect = require("chai").expect;
const setup = require("../setup");

const gameUtils = require("../gameUtils")

const redis = require("../redis")
const client = redis.getRedisClient()

const gameIdTest = "test"

const checkCardinality = (key, card, callback) => {
    client.scardAsync(key).then((res) => {
        expect(res).to.equal(card)
        if (callback) {
            callback()
        }
    })
}

describe("Setup", () => {
    describe("Role distribution", () => {
        it("6 players distribution", (done) => {
            client.flushall();
            client.saddAsync(gameUtils.getAliveKey(gameIdTest), "Pabs", "Qian", "Michael", "Julien", "Benjamin", "Simone").then((res) => {
                setup.distributeRoles(gameIdTest)
                setTimeout(checkCardinality, 100, gameUtils.getVillagersKey(gameIdTest), 4, null);
                setTimeout(checkCardinality, 100, gameUtils.getAnyRoleKey(gameIdTest, "wolves"), 2, done);
            })
        });

        it("7 players distribution", (done) => {
            client.flushall();
            client.saddAsync(gameUtils.getAliveKey(gameIdTest), "Pabs", "Qian", "Michael", "Julien", "Benjamin", "Simone", "Joachim").then((res) => {
                setup.distributeRoles(gameIdTest)
                setTimeout(checkCardinality, 100, gameUtils.getVillagersKey(gameIdTest), 5, null);
                setTimeout(checkCardinality, 100, gameUtils.getAnyRoleKey(gameIdTest, "wolves"), 2, done);
            })
        });


    });

    describe("Add player", () => {
        client.flushall(() => {
            it("Add non existing player", (done) => {
                setup.addPlayer(gameIdTest, "Pabs")
                setTimeout(checkCardinality, 100, gameUtils.getAliveKey(gameIdTest), 1, done);
            });
            it("Add another non existing player", (done) => {
                setup.addPlayer(gameIdTest, "Qian")
                setTimeout(checkCardinality, 100, gameUtils.getAliveKey(gameIdTest), 2, done);
            });
            it("Add existing player", (done) => {
                setup.addPlayer(gameIdTest, "Pabs")
                setTimeout(checkCardinality, 100, gameUtils.getAliveKey(gameIdTest), 2, done);
            });
        })

    });
});

