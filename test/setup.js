const expect = require("chai").expect;
const setup = require("../setup");

const gameUtils = require("../gameUtils")

const redis = require("../redis")
const client = redis.getRedisClient()

const gameIdTest = "test"

describe("Setup", () => {
    describe("Role distribution", () => {
        it("6 players distribution", (done) => {
            client.flushallAsync().then(() => {
                return client.saddAsync(gameUtils.getAliveKey(gameIdTest), "Pabs", "Qian", "Michael", "Julien", "Benjamin", "Simone")
            }).then(() => {
                return setup.distributeRoles(gameIdTest)
            }).then(() => {
                return client.scardAsync(gameUtils.getVillagersKey(gameIdTest)).then((res) => {
                    expect(res).to.equal(4)
                })
            }).then(() => {
                return client.scardAsync(gameUtils.getAnyRoleKey(gameIdTest, "wolves")).then((res) => {
                    expect(res).to.equal(2)
                })
            }).then(() => {
                done()
            })
        });

        it("7 players distribution", (done) => {
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
        });
    });

    describe("Add player", () => {
        it("Add non existing player", (done) => {
            client.flushallAsync().then(() => {
                setup.addPlayer(gameIdTest, "Pabs").then(() => {
                    client.scardAsync(gameUtils.getAliveKey(gameIdTest)).then((res) => {
                        expect(res).to.equal(1)
                        done()
                    })
                })
            })
        });

        it("Add another non existing player", (done) => {
            setup.addPlayer(gameIdTest, "Qian").then(() => {
                client.scardAsync(gameUtils.getAliveKey(gameIdTest)).then((res) => {
                    expect(res).to.equal(2)
                    done()
                })
            })
        });

        it("Add existing player", (done) => {
            setup.addPlayer(gameIdTest, "Pabs").then(() => {
                client.scardAsync(gameUtils.getAliveKey(gameIdTest)).then((res) => {
                    expect(res).to.equal(2)
                    done()
                })
            })
        });
    });
});

