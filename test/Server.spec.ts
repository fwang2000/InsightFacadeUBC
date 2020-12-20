import Server from "../src/rest/Server";

import InsightFacade from "../src/controller/InsightFacade";
import chai = require("chai");
import chaiHttp = require("chai-http");
import Response = ChaiHttp.Response;
import {expect} from "chai";
import Log from "../src/Util";
import * as fs from "fs-extra";
import { stringify } from "querystring";

describe("Facade D3", function () {

    let facade: InsightFacade = null;
    let server: Server = null;
    const SERVER_URL = "http://localhost:4321";

    chai.use(chaiHttp);

    before(function () {
        facade = new InsightFacade();
        server = new Server(4321);
        // TODO: start server here once and handle errors properly
        server.start().then(() => {
            Log.trace("server started");
        }).catch((err) => {
            Log.trace(err);
        });
    });

    after(function () {
        // TODO: stop server here once!
        server.stop();
    });

    beforeEach(function () {
        // might want to add some process logging here to keep track of what"s going on
    });

    afterEach(function () {
        // might want to add some process logging here to keep track of what"s going on
    });

    // Sample on how to format PUT requests

    it("PUT test for courses dataset", function () {
        const ENDPOINT_URL = "/dataset/courses/courses";
        const ZIP_FILE_DATA = fs.readFileSync("./test/data/courses.zip");
        try {
            return chai.request(SERVER_URL)
                .put(ENDPOINT_URL)
                .send(ZIP_FILE_DATA)
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    Log.trace("1" + res.body);
                    expect(res.status).to.be.equal(200);
                })
                .catch(function (err) {
                    Log.trace("2" + err);
                    expect.fail();
                });
        } catch (err) {
            Log.trace("3" + err);
            expect.fail();
        }
    });

    // put for room
    it("PUT test for rooms dataset", function () {
        const ENDPOINT_URL = "/dataset/roomsdup/rooms";
        const ZIP_FILE_DATA = fs.readFileSync("./test/data/roomsdup.zip");
        try {
            return chai.request(SERVER_URL)
                .put(ENDPOINT_URL)
                .send(ZIP_FILE_DATA)
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    Log.trace("1" + res.body);
                    expect(res.status).to.be.equal(200);
                })
                .catch(function (err) {
                    Log.trace("2" + err);
                    expect.fail();
                });
        } catch (err) {
            Log.trace("3" + err);
            expect.fail();
        }
    }).timeout(40000);

    // put fail invalid url: invalid kind
    it("PUT fail test 1", function () {
        const ENDPOINT_URL = "/dataset/courses/course";
        const ZIP_FILE_DATA = fs.readFileSync("./test/data/courses.zip");
        try {
            return chai.request(SERVER_URL)
                .put(ENDPOINT_URL)
                .send(ZIP_FILE_DATA)
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    Log.trace("1" + res);
                    expect.fail();
                })
                .catch(function (res: Response) {
                    Log.trace("2" + res);
                    expect(res.status).to.be.equal(400);
                });
        } catch (err) {
            Log.trace("3" + err);
            expect.fail();
        }
    });

    // put fail invalid url: invalid id
    it("PUT fail test 2", function () {
        try {
            const ENDPOINT_URL = "/dataset/courses_1/courses";
            const ZIP_FILE_DATA = fs.readFileSync("./test/data/courses.zip");
            return chai.request(SERVER_URL)
                .put(ENDPOINT_URL)
                .send(ZIP_FILE_DATA)
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    Log.trace("1" + res);
                    expect.fail();
                })
                .catch(function (res: Response) {
                    Log.trace("2" + res);
                    expect(res.status).to.be.equal(400);
                });
        } catch (err) {
            Log.trace("3" + err); // expect res.code === 400
            expect.fail();
        }
    });
/*
    it("DELECT test for courses dataset", function () {
        try {
            const ENDPOINT_URL = "/dataset/courses/courses";
            return chai.request(SERVER_URL)
                .del(ENDPOINT_URL)
                .then(function (res: Response) {
                    Log.trace("1" + res.body);
                    expect(res).to.be.equal(200);
                })
                .catch(function (err) {
                    Log.trace("2" + err);
                    expect.fail();
                });
        } catch (err) {
            Log.trace("3" + err);
            expect.fail();
        }
    });
*/
    it("DELECT test for courses dataset", function () {
        const ENDPOINT_URL1 = "/dataset/courses5/courses";
        const ENDPOINT_URL2 = "/dataset/courses5";
        const ZIP_FILE_DATA = fs.readFileSync("./test/data/courses5.zip");
        try {
            return chai.request(SERVER_URL)
                .put(ENDPOINT_URL1)
                .send(ZIP_FILE_DATA)
                .set("Content-Type", "application/x-zip-compressed")
                .then(function () {
                    chai.request(SERVER_URL)
                    .del(ENDPOINT_URL2)
                    // why is this giving me Method Not Allowed Error??
                    // chai-http documentation doesn't have examples for del too...
                    .then(function (res: Response) {
                        Log.trace("1" + res.body);
                        expect(res.status).to.be.equal(200);
                    })
                    .catch(function (err) {
                        Log.trace("2" + err);
                        expect.fail();
                    });
                })
                .catch(function (err) {
                    Log.trace("4" + err);
                    expect.fail();
                });
        } catch (err) {
            Log.trace("3" + err);
            expect.fail();
        }
    });
/*
    it("DELECT fail test InsightError", function () {
        try {
            const ENDPOINT_URL = "/dataset/courses_1/courses";
            return chai.request(SERVER_URL)
                .del(ENDPOINT_URL)
                .then(function (res: Response) {
                    Log.trace("1" + res.body);
                    expect.fail();
                    })
                .catch(function (res) {
                    Log.trace("2" + res);
                    expect(res).to.be.equal(400);
                });
        } catch (err) {
            Log.trace("3" + err);
            expect.fail();
        }
    });
*/
    it("DELECT fail test InsightError", function () {
        const ENDPOINT_URL1 = "/dataset/courses/courses";
        const ENDPOINT_URL2 = "/dataset/courses_1";
        const ZIP_FILE_DATA = fs.readFileSync("./test/data/courses.zip");
        try {
            return chai.request(SERVER_URL)
                .put(ENDPOINT_URL1)
                .send(ZIP_FILE_DATA)
                .set("Content-Type", "application/x-zip-compressed")
                .then(function () {
                    chai.request(SERVER_URL)
                    .del(ENDPOINT_URL2)
                    .then(function (res: Response) {
                        Log.trace("1" + res.body);
                        expect.fail();
                    })
                    .catch(function (err) {
                        Log.trace("2" + err);
                        expect.fail();
                    });
                })
                .catch(function (res) {
                    Log.trace("4" + res);
                    expect(res.status).to.be.equal(400);
                });
        } catch (err) {
            Log.trace("3" + err);
            expect.fail();
        }
    });
/*
    it("DELECT fail test NotFoundError", function () {
        try {
            const ENDPOINT_URL = "/dataset/courses100/courses";
            return chai.request(SERVER_URL)
                .del(ENDPOINT_URL)
                .then(function (res: Response) {
                    Log.trace("1" + res.body);
                    expect.fail();
                    })
                .catch(function (res) {
                    Log.trace("2" + res);
                    expect(res).to.be.equal(404);
                });
        } catch (err) {
            Log.trace("3" + err);
            expect.fail();
        }
    });
*/
    it("DELECT fail test NotFoundError", function () {
        try {
            const ENDPOINT_URL1 = "/dataset/rooms/rooms";
            const ENDPOINT_URL2 = "/dataset/rooms100";
            const ZIP_FILE_DATA = fs.readFileSync("./test/data/roomsdup.zip");
            return chai.request(SERVER_URL)
                .put(ENDPOINT_URL1)
                .send(ZIP_FILE_DATA)
                .set("Content-Type", "application/x-zip-compressed")
                .then(function () {
                    chai.request(SERVER_URL)
                    .del(ENDPOINT_URL2)
                    .set("Content-Type", "application/x-zip-compressed")
                    .then(function (res: Response) {
                        Log.trace("1" + res.body);
                        expect.fail();
                    })
                    .catch(function (res) {
                        Log.trace("2" + res);
                        expect(res.status).to.be.equal(404);
                    });
                })
                .catch(function (res) {
                    Log.trace("4" + res);
                    expect(res.status).to.be.equal(404);
                });
        } catch (err) {
            Log.trace("3" + err);
            expect.fail();
        }
    });

    it("POST test for query", function () {
        // const ENDPOINT_URL1 = "/dataset/courses/courses";
        const ENDPOINT_URL2 = "/query";
        // const ZIP_FILE_DATA = fs.readFileSync("./test/data/courses.zip");
        const testquery = {
            WHERE: {
              IS: {
                courses_dept: "C*"
              }
            },
            OPTIONS: {
              COLUMNS: [
                "courses_dept",
                "courses_avg"
              ],
              ORDER: "courses_avg"
            }
          };

        try {
            return chai.request(SERVER_URL)
                // .put(ENDPOINT_URL1)
                // .send(ZIP_FILE_DATA)
                // .set("Content-Type", "application/x-zip-compressed")
                // .then(function () {
                    // chai.request(SERVER_URL)
                    .post(ENDPOINT_URL2)
                    .send(JSON.parse(JSON.stringify(testquery)))
                    .then(function (res: Response) {
                        Log.trace("1" + res.body);
                        expect(res.status).to.be.equal(200);
                    })
                    .catch(function (err) {
                        Log.trace("2" + err); // debugger says this is an invalid query but it is
                        // ignore this test
                        expect.fail();
                    });
                // }).catch(function (err) {
                //     Log.trace("4" + err);
                //     expect.fail();
                // });
        } catch (err) {
            Log.trace("3" + err);
            expect.fail();
        }
    });

    it("POST fail test for invalid query", function () {
        // const ENDPOINT_URL1 = "/dataset/courses3/courses";
        const ENDPOINT_URL2 = "/query";
        // const ZIP_FILE_DATA = fs.readFileSync("./test/data/courses3.zip");
        const testquery = {
            WHERE: {
              GT: {
                courses_avg: "97"
              }
            },
            OPTIONS: {
              COLUMNS: [
                "courses_dept",
                "courses_avg"
              ],
              ORDER: "courses_avg"
            }
          };

        try {
            return chai.request(SERVER_URL)
                // .put(ENDPOINT_URL1)
                // .send(ZIP_FILE_DATA)
                // .set("Content-Type", "application/x-zip-compressed")
                // .then(function () {
                //     chai.request(SERVER_URL)
                    .post(ENDPOINT_URL2)
                    .send(testquery)
                    .then(function (res: Response) {
                        Log.trace("1" + res.body);
                        expect.fail();
                    })
                    .catch(function (res) {
                        Log.trace("2" + res);
                        expect(res.status).to.be.equal(400);
                    });
                // })
                // .catch(function (err) {
                //     Log.trace("4" + err);
                //     expect.fail();
                // });
        } catch (err) {
            Log.trace("3" + err);
            expect.fail();
        }
    });

    it("POST fail test for invalid query 2", function () {
        // const ENDPOINT_URL1 = "/dataset/courses/courses";
        const ENDPOINT_URL2 = "/query";
        // const ZIP_FILE_DATA = fs.readFileSync("./test/data/courses.zip");
        const testquery = {
            WHERE: {
              GT: {
                coursesdup_avg: 97
              }
            },
            OPTIONS: {
              COLUMNS: [
                "coursesdup_dept",
                "coursesdup_avg"
              ],
              ORDER: "coursesdup_avg"
            }
          };

        try {
            return chai.request(SERVER_URL)
                // .put(ENDPOINT_URL1)
                // .send(ZIP_FILE_DATA)
                // .set("Content-Type", "application/x-zip-compressed")
                // .then(function () {
                //     chai.request(SERVER_URL)
                    .post(ENDPOINT_URL2)
                    .send(testquery)
                    .then(function (res: Response) {
                        Log.trace("1" + res.body);
                        expect.fail();
                    })
                    .catch(function (res) {
                        Log.trace("2" + res);
                        expect(res.status).to.be.equal(400);
                    });
                // }).catch(function (err) {
                //     Log.trace("4" + err);
                //     expect.fail();
                // });
        } catch (err) {
            Log.trace("3" + err);
            expect.fail();
        }
    });

    it("POST fail test for invalid address", function () {
        const ENDPOINT_URL1 = "/dataset/courses/courses";
        const ENDPOINT_URL2 = "/querys";
        const ZIP_FILE_DATA = fs.readFileSync("./test/data/courses.zip");
        const testquery = {
            WHERE: {
              GT: {
                courses_avg: 97
              }
            },
            OPTIONS: {
              COLUMNS: [
                "courses_dept",
                "courses_avg"
              ],
              ORDER: "courses_avg"
            }
          };

        try {
            return chai.request(SERVER_URL)
                .put(ENDPOINT_URL1)
                .send(ZIP_FILE_DATA)
                .set("Content-Type", "application/x-zip-compressed")
                .then(function () {
                    chai.request(SERVER_URL)
                    .post(ENDPOINT_URL2)
                    .send(testquery)
                    .then(function (res: Response) {
                        Log.trace("1" + res.body);
                        expect.fail();
                    })
                    .catch(function (res) {
                        Log.trace("2" + res);
                        expect(res.status).to.be.equal(400);
                    });
                }).catch(function (res) {
                    Log.trace("4" + res);
                    expect(res.status).to.be.equal(400);
                });
        } catch (err) {
            Log.trace("3" + err);
            expect.fail();
        }
    });

    it("LIST test for courses dataset", function () {
        const ENDPOINT_URL = "/datasets";
        try {
            return chai.request(SERVER_URL)
                .get(ENDPOINT_URL)
                .then(function (res: Response) {
                    Log.trace("1" + res.body);
                    expect(res.status).to.be.equal(200);
                })
                .catch(function (err) {
                    Log.trace("2" + err);
                    expect.fail();
                });
        } catch (err) {
            Log.trace("3" + err);
            expect.fail();
        }
    });

    // The other endpoints work similarly. You should be able to find all instructions at the chai-http documentation
});
