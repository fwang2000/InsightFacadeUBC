import { expect } from "chai";
import * as chai from "chai";
import * as fs from "fs-extra";
import * as chaiAsPromised from "chai-as-promised";
import {
    InsightDatasetKind,
    InsightDataset,
} from "../src/controller/IInsightFacade";
import InsightFacade from "../src/controller/InsightFacade";
import Log from "../src/Util";
import TestUtil from "./TestUtil";
import { InsightError, NotFoundError } from "../src/controller/IInsightFacade";

// This should match the schema given to TestUtil.validate(..) in TestUtil.readTestQueries(..)
// except 'filename' which is injected when the file is read.
export interface ITestQuery {
    title: string;
    query: any; // make any to allow testing structurally invalid queries
    isQueryValid: boolean;
    result: any;
    filename: string; // This is injected when reading the file
}

describe("InsightFacade Add/Remove/List Dataset", function () {
    // Reference any datasets you've added to test/data here and they will
    // automatically be loaded in the 'before' hook.
    const datasetsToLoad: { [id: string]: string } = {
        "courses": "./test/data/courses.zip",
        "textfile": "./test/data/textfile.txt",
        "courses2": "./test/data/courses2.zip",
        "noDir": "./test/data/noDir.zip",
        "notJSON": "./test/data/notJSON.zip",
        "courses3": "./test/data/courses3.zip",
        "oneFileIncorrect": "./test/data/oneFileIncorrect.zip",
        "coursesdup": "./test/data/coursesdup.zip",
        "courses4": "./test/data/courses4.zip",
        "courses5": "./test/data/courses5.zip",
        "courses_0": "./test/data/courses_0.zip",
        " ": "./test/data/courses5.zip",
        "emptyZip": "./test/data/emptyZip.zip",
        "incorrectDirName": "./test/data/incorrectDirName.zip",

        "rooms": "./test/data/rooms.zip",
        "noIndexFile": "./test/data/noIndexFIle.zip",
        "noValidRooms": "./test/data/noValidRooms.zip",
        "textfileRoom": "./test/data/textfileRooms.txt",
        "noDirRoom": "./test/data/noDirRoom.zip",
        "rooms_0": "./test/data/rooms_0.zip",
        "  ": "./test/data/rooms.zip",
        "roomsdup": "./test/data/roomsdup.zip",
        "someValidRooms": "./test/data/someValidRooms.zip",
        "containsInvalidAddress": "./test/data/containsInvalidAddress.zip",
        "noValidAddress": "./test/data/noValidAddress.zip"
    };
    let datasets: { [id: string]: string } = {};
    let insightFacade: InsightFacade;
    const cacheDir = __dirname + "/../data";

    before(function () {
        // This section runs once and loads all datasets specified in the datasetsToLoad object
        // into the datasets object
        Log.test(`Before all`);
        chai.use(chaiAsPromised);
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir);
        }
        for (const id of Object.keys(datasetsToLoad)) {
            datasets[id] = fs
                .readFileSync(datasetsToLoad[id])
                .toString("base64");
        }
        try {
            insightFacade = new InsightFacade();
        } catch (err) {
            Log.error(err);
        }
    });

    beforeEach(function () {
        Log.test(`BeforeTest: ${this.currentTest.title}`);
    });

    after(function () {
        Log.test(`After: ${this.test.parent.title}`);
    });

    afterEach(function () {
        // This section resets the data directory (removing any cached data) and resets the InsightFacade instance
        // This runs after each test, which should make each test independent from the previous one
        Log.test(`AfterTest: ${this.currentTest.title}`);
        try {
            fs.removeSync(cacheDir);
            fs.mkdirSync(cacheDir);
            insightFacade = new InsightFacade();
        } catch (err) {
            Log.error(err);
        }
    });

    // This is a unit test. You should create more like this!
    /*it("Should add a valid dataset - courses", function () {
        const id: string = "courses";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.eventually.deep.equal(expected);
    });
    /*
    it("Should add a valid dataset - rooms", function () {
        const id: string = "rooms";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Rooms,
        );
        return expect(futureResult).to.eventually.deep.equal(expected);
    }).timeout(40000);

    it("Invalid Dataset - Directory not named courses", function () {

        const id: string = "incorrectDirName";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.eventually.be.rejectedWith(InsightError);
    });

    it("Invalid Dataset - Directory not named rooms", function () {

        const id: string = "incorrectDirNameRooms";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Rooms,
        );
        return expect(futureResult).to.eventually.be.rejectedWith(InsightError);
    });

    it("Invalid Courses Dataset Add: Courses file is not zip", function () {
        const id: string = "textfile";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );

        const err = InsightError;

        return expect(futureResult).to.be.rejectedWith(err);
    });

    it("Invalid Rooms Dataset Add: Rooms file is not zip", function () {
        const id: string = "textfileRoom";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Rooms,
        );

        const err = InsightError;

        return expect(futureResult).to.be.rejectedWith(err);
    });

    it("Invalid Courses Dataset Add: No Directory - Word Doc", function () {
        const id: string = "noDir";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );

        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Invalid Rooms Dataset Add: No Directory - Word Doc", function () {
        const id: string = "noDirRoom";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Rooms,
        );

        return expect(futureResult).to.be.rejectedWith(InsightError);
    });


    it("Invalid ID: Courses zip file doesn't exist", function () {
        const id: string = "nonexistant";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );

        return expect(futureResult).to.eventually.be.rejectedWith(InsightError);
    });

    it("Invalid ID: Rooms zip file doesn't exist", function () {
        const id: string = "nonexistantRoom";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Rooms,
        );

        return expect(futureResult).to.eventually.be.rejectedWith(InsightError);
    });

    it("Invalid ID: contains '_'", function () {
        const id: string = "courses_0";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.eventually.be.rejectedWith(InsightError);
    });

    it("Invalid ID: contains '_'", function () {
        const id: string = "rooms_0";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Rooms,
        );
        return expect(futureResult).to.eventually.be.rejectedWith(InsightError);
    });

    it("Invalid ID: Courses all whitespace", function () {
        const id: string = " ";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.eventually.be.rejectedWith(InsightError);
    });

    it("Invalid ID: Rooms all whitespace", function () {
        const id: string = "  ";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Rooms,
        );
        return expect(futureResult).to.eventually.be.rejectedWith(InsightError);
    });

    it("Invalid ID: Courses repeated id", function () {
        const id: string = "courses";
        const additionExpect: string[] = [id];

        const futureResult = insightFacade
            .addDataset(id, datasets[id], InsightDatasetKind.Courses)
            .then((e) => {
                expect(e).to.deep.equal(additionExpect);
                return insightFacade.addDataset(
                    id,
                    datasets[id],
                    InsightDatasetKind.Courses,
                );
            });

        return expect(futureResult).to.eventually.be.rejectedWith(InsightError);
    });

    it("Invalid ID: Rooms repeated id", function () {
        const id: string = "rooms";
        const additionExpect: string[] = [id];

        const futureResult = insightFacade
            .addDataset(id, datasets[id], InsightDatasetKind.Rooms)
            .then((e) => {
                expect(e).to.deep.equal(additionExpect);
                return insightFacade.addDataset(
                    id,
                    datasets[id],
                    InsightDatasetKind.Rooms,
                );
            });

        return expect(futureResult).to.eventually.be.rejectedWith(InsightError);
    }).timeout(25000);

    it("Invalid Dataset: Files Not JSON", function () {
        const id: string = "notJSON";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );

        return expect(futureResult).to.eventually.be.rejectedWith(InsightError);
    });

    it("Invalid Dataset: JSON file - Incorrect Format", function () {
        const id: string = "oneFileIncorrect";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );

        return expect(futureResult).to.eventually.be.rejectedWith(InsightError);
    });

    it("invalidDataset: no index.htm", function () {
        const id: string = "noIndexFile";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Rooms,
        );

        return expect(futureResult).to.eventually.be.rejectedWith(InsightError);
    });

    it("Invalid Dataset: no valid rooms", function () {
        const id: string = "noValidRooms";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Rooms,
        );

        return expect(futureResult).to.eventually.be.rejectedWith(InsightError);
    });

    it("Valid dataset - some valid buildings (have rooms)", function () {
        const id: string = "someValidRooms";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Rooms,
        );
        return expect(futureResult).to.eventually.deep.equal(expected);
    });

    it("Valid Dataset: Duplicate Dataset, Different ID", function () {
        const id: string = "coursesdup";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );

        return expect(futureResult).to.eventually.deep.equal(expected);
    });

    it("Valid Dataset: One File Misformatted", function () {
        const id: string = "courses4";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );

        return expect(futureResult).to.eventually.deep.equal(expected);
    });

    it("Valid Dataset: JSON Files Valid, One Non-JSON File", function () {
        const id: string = "courses3";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );

        return expect(futureResult).to.eventually.deep.equal(expected);
    });

    it("Valid Dataset: Several Files Misformatted", function () {
        const id: string = "courses2";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );

        return expect(futureResult).to.eventually.deep.equal(expected);
    });

    it("Valid Dataset: Smaller Dataset", function () {
        const id: string = "courses5";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );

        return expect(futureResult).to.eventually.deep.equal(expected);
    });

    it("Valid Dataset: some invalid address", function () {
        const id: string = "containsInvalidAddress";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Rooms,
        );

        return expect(futureResult).to.eventually.deep.equal(expected);
    });

    it("inValid Dataset: no valid address - no valid buildings", function () {
        const id: string = "noValidAddress";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Rooms,
        );

        return expect(futureResult).to.eventually.be.rejectedWith(InsightError);
    });

    it("Valid Datasets: Add Two Courses Datasets", function () {

        const id: string = "courses";
        const id2: string = "courses5";
        const expected: string[] = [id, id2];
        const additionExpect: string[] = [id];

        const futureResult = insightFacade
            .addDataset(id, datasets[id], InsightDatasetKind.Courses)
            .then((e) => {
                expect(e).to.deep.equal(additionExpect);
                return insightFacade.addDataset(id2, datasets[id2], InsightDatasetKind.Courses);
            });

        return expect(futureResult).to.eventually.deep.equal(expected);
    });

    it("Valid Datasets: Add Two Rooms Datasets", function () {

        const id: string = "rooms";
        const id2: string = "someValidRooms";
        const expected: string[] = [id, id2];
        const additionExpect: string[] = [id];

        const futureResult = insightFacade
            .addDataset(id, datasets[id], InsightDatasetKind.Rooms)
            .then((e) => {
                expect(e).to.deep.equal(additionExpect);
                return insightFacade.addDataset(id2, datasets[id2], InsightDatasetKind.Rooms);
            });

        return expect(futureResult).to.eventually.deep.equal(expected);
    }).timeout(25000);

    it("Valid Datasets: Add Courses and Rooms Datasets", function () {

        const id: string = "rooms";
        const id2: string = "courses5";
        const expected: string[] = [id, id2];
        const additionExpect: string[] = [id];

        const futureResult = insightFacade
            .addDataset(id, datasets[id], InsightDatasetKind.Rooms)
            .then((e) => {
                expect(e).to.deep.equal(additionExpect);
<<<<<<< Updated upstream
=======
                return insightFacade.addDataset(id2, datasets[id2], InsightDatasetKind.Rooms);
            });

        return expect(futureResult).to.eventually.deep.equal(expected);
    }).timeout(25000);*/

    it("Valid Datasets: Add Courses and Rooms Datasets", function () {

        const id: string = "rooms";
        const id2: string = "courses5";
        const expected: string[] = [id, id2];
        const additionExpect: string[] = [id];

        const futureResult = insightFacade
            .addDataset(id, datasets[id], InsightDatasetKind.Rooms)
            .then((e) => {
                expect(e).to.deep.equal(additionExpect);
                return insightFacade.addDataset(id2, datasets[id2], InsightDatasetKind.Courses);
            });

        return expect(futureResult).to.eventually.deep.equal(expected);
    }).timeout(20000);

    /*
    it("Should remove a dataset - Courses", function () {
        const id: string = "courses";
        const additionExpect: string[] = [id];
        const futureResult = insightFacade
            .addDataset(id, datasets[id], InsightDatasetKind.Courses)
            .then((e) => {
                expect(e).to.deep.equal(additionExpect);
                return insightFacade.removeDataset(id);
            });
        return expect(futureResult).to.eventually.deep.equal(id);
    });

    it("Should remove a dataset - Rooms", function () {
        const id: string = "rooms";
        const additionExpect: string[] = [id];
        const futureResult = insightFacade
            .addDataset(id, datasets[id], InsightDatasetKind.Rooms)
            .then((e) => {
                expect(e).to.deep.equal(additionExpect);
                return insightFacade.removeDataset(id);
            });
        return expect(futureResult).to.eventually.deep.equal(id);
    }).timeout(20000);

    it("Invalid Removal: ID doesn't exist", function () {
        const id: string = "nonexistant";
        const futureResult: Promise<string> = insightFacade.removeDataset(id);
        return expect(futureResult).to.eventually.be.rejectedWith(
            NotFoundError,
        );
    });

    it("Invalid Removal: ID contains only whitespaces", function () {
        const id: string = " ";
        const futureResult: Promise<string> = insightFacade.removeDataset(id);
        return expect(futureResult).to.eventually.be.rejectedWith(InsightError);
    });

    it("Invalid Removal: ID contains '_'", function () {
        const id: string = "courses_0";
        const futureResult: Promise<string> = insightFacade.removeDataset(id);
        return expect(futureResult).to.eventually.be.rejectedWith(InsightError);
    });

    it("Invalid Removal: Remove Courses dataset, then attempt to remove again", function () {
        const id: string = "coursesdup";
        const additionExpect: string[] = [id];
        const futureResult = insightFacade
            .addDataset(id, datasets[id], InsightDatasetKind.Courses)
            .then((e) => {
                expect(e).to.deep.equal(additionExpect);
                return insightFacade.removeDataset(id).then((e1) => {
                    expect(e1).to.deep.equal(id);
                    return insightFacade.removeDataset(id);
                });
            });
        return expect(futureResult).to.eventually.be.rejectedWith(NotFoundError);
    });

    it("Invalid Removal: Remove Rooms dataset, then attempt to remove again", function () {
        const id: string = "roomsdup";
        const additionExpect: string[] = [id];
        const futureResult = insightFacade
            .addDataset(id, datasets[id], InsightDatasetKind.Rooms)
            .then((e) => {
                expect(e).to.deep.equal(additionExpect);
                return insightFacade.removeDataset(id).then((e1) => {
                    expect(e1).to.deep.equal(id);
                    return insightFacade.removeDataset(id);
                });
            });
        return expect(futureResult).to.eventually.be.rejectedWith(NotFoundError);
    }).timeout(20000);

    it("List Grab: Empty Dataset List", function () {
        const futureResult: Promise<
            InsightDataset[]
        > = insightFacade.listDatasets();

        return expect(futureResult).to.eventually.deep.equal([]);
    });

    it("List Grab: One Valid Courses Dataset", function () {
        const expected: InsightDataset = {
            id: "courses",
            kind: InsightDatasetKind.Courses,
            numRows: 64612,
        };

        const additionExpect: string[] = ["courses"];
        const futureResult = insightFacade
            .addDataset(
                "courses",
                datasets["courses"],
                InsightDatasetKind.Courses,
            )
            .then((e) => {
                expect(e).to.deep.equal(additionExpect);
                return insightFacade.listDatasets();
            });

        return expect(futureResult).to.eventually.deep.equal([expected]);
    });

    it("List Grab: One Valid Rooms Dataset", function () {
        const expected: InsightDataset = {
            id: "rooms",
            kind: InsightDatasetKind.Rooms,
            numRows: 364,
        };

        const additionExpect: string[] = ["rooms"];
        const futureResult = insightFacade
            .addDataset(
                "rooms",
                datasets["rooms"],
                InsightDatasetKind.Rooms,
            )
            .then((e) => {
                expect(e).to.deep.equal(additionExpect);
                return insightFacade.listDatasets();
            });

        return expect(futureResult).to.eventually.deep.equal([expected]);
    }).timeout(40000);

    it("List Grab: One Valid Rooms Dataset with some invalid address", function () {
        const expected: InsightDataset = {
            id: "containsInvalidAddress",
            kind: InsightDatasetKind.Rooms,
            numRows: 38,
        };

        const additionExpect: string[] = ["containsInvalidAddress"];
        const futureResult = insightFacade
            .addDataset(
                "containsInvalidAddress",
                datasets["containsInvalidAddress"],
                InsightDatasetKind.Rooms,
            )
            .then((e) => {
                expect(e).to.deep.equal(additionExpect);
                return insightFacade.listDatasets();
            });

        return expect(futureResult).to.eventually.deep.equal([expected]);
    });

    it("List Grab: Multiple Courses Datasets", function () {

        const expected1: InsightDataset = {
            id: "courses",
            kind: InsightDatasetKind.Courses,
            numRows: 64612,
        };

        const expected2: InsightDataset = {
            id: "coursesdup",
            kind: InsightDatasetKind.Courses,
            numRows: 64612,
        };

        const expected: InsightDataset[] = [expected1, expected2];

        const additionExpect1: string[] = ["courses"];
        const additionExpect2: string[] = ["courses", "coursesdup"];

        const futureResult = insightFacade
            .addDataset(
                "courses",
                datasets["courses"],
                InsightDatasetKind.Courses,
            )
            .then((e) => {
                expect(e).to.deep.equal(additionExpect1);
                return insightFacade
                    .addDataset(
                        "coursesdup",
                        datasets["coursesdup"],
                        InsightDatasetKind.Courses,
                    )
                    .then((e1) => {
                        expect(e1).to.deep.equal(additionExpect2);
                        return insightFacade.listDatasets();
                    });
            });

        expect(typeof futureResult).to.equal(typeof expected);

        return expect(futureResult).to.eventually.deep.equal(expected);
    });

    it("List Grab: Multiple Rooms Datasets", function () {

        const expected1: InsightDataset = {
            id: "rooms",
            kind: InsightDatasetKind.Rooms,
            numRows: 364,
        };

        const expected2: InsightDataset = {
            id: "roomsdup",
            kind: InsightDatasetKind.Rooms,
            numRows: 364,
        };

        const expected: InsightDataset[] = [expected1, expected2];

        const additionExpect1: string[] = ["rooms"];
        const additionExpect2: string[] = ["rooms", "roomsdup"];

        const futureResult = insightFacade
            .addDataset(
                "rooms",
                datasets["rooms"],
                InsightDatasetKind.Rooms,
            )
            .then((e) => {
                expect(e).to.deep.equal(additionExpect1);
                return insightFacade
                    .addDataset(
                        "roomsdup",
                        datasets["roomsdup"],
                        InsightDatasetKind.Rooms,
                    )
                    .then((e1) => {
                        expect(e1).to.deep.equal(additionExpect2);
                        return insightFacade.listDatasets();
                    });
            });

        expect(typeof futureResult).to.equal(typeof expected);

        return expect(futureResult).to.eventually.deep.equal(expected);
    }).timeout(40000);

    it("List Grab: Courses and Rooms Datasets", function () {

        const expected1: InsightDataset = {
            id: "courses",
            kind: InsightDatasetKind.Courses,
            numRows: 64612,
        };

        const expected2: InsightDataset = {
            id: "rooms",
            kind: InsightDatasetKind.Rooms,
            numRows: 364,
        };

        const expected: InsightDataset[] = [expected1, expected2];

        const additionExpect1: string[] = ["courses"];
        const additionExpect2: string[] = ["courses", "rooms"];

        const futureResult = insightFacade
            .addDataset(
                "courses",
                datasets["courses"],
                InsightDatasetKind.Courses,
            )
            .then((e) => {
                expect(e).to.deep.equal(additionExpect1);
                return insightFacade
                    .addDataset(
                        "rooms",
                        datasets["rooms"],
                        InsightDatasetKind.Rooms,
                    )
                    .then((e1) => {
                        expect(e1).to.deep.equal(additionExpect2);
                        return insightFacade.listDatasets();
                    });
            });

        expect(typeof futureResult).to.equal(typeof expected);

        return expect(futureResult).to.eventually.deep.equal(expected);
    }).timeout(40000);*/
});

/*
 * This test suite dynamically generates tests from the JSON files in test/queries.
 * You should not need to modify it; instead, add additional files to the queries directory.
 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
 */
/*
describe("InsightFacade PerformQuery", () => {
    const datasetsToQuery: {
        [id: string]: { path: string; kind: InsightDatasetKind };
    } = {
        courses: {
            path: "./test/data/courses.zip",
            kind: InsightDatasetKind.Courses,
        },
        courses2: {
            path: "./test/data/courses2.zip",
            kind: InsightDatasetKind.Courses,
        },
        coursesdup: {
            path: "./test/data/coursesdup.zip",
            kind: InsightDatasetKind.Courses,
        },
        courses3: {
            path: "./test/data/courses3.zip",
            kind: InsightDatasetKind.Courses,
        },
        coursesTest: {
            path: "./test/data/coursesTest.zip",
            kind: InsightDatasetKind.Courses,
        },
        rooms: {
            path: "./test/data/rooms.zip",
            kind: InsightDatasetKind.Rooms,
        },
        someValidRooms: {
            path: "./test/data/someValidRooms.zip",
            kind: InsightDatasetKind.Rooms,
        }
    };
    let insightFacade: InsightFacade;
    let testQueries: ITestQuery[] = [];

    // Load all the test queries, and call addDataset on the insightFacade instance for all the datasets
    before(function () {
        Log.test(`Before: ${this.test.parent.title}`);

        // Load the query JSON files under test/queries.
        // Fail if there is a problem reading ANY query.
        try {
            testQueries = TestUtil.readTestQueries();
        } catch (err) {
            expect.fail(
                "",
                "",
                `Failed to read one or more test queries. ${err}`,
            );
        }

        // Load the datasets specified in datasetsToQuery and add them to InsightFacade.
        // Will fail* if there is a problem reading ANY dataset.
        const loadDatasetPromises: Array<Promise<string[]>> = [];
        insightFacade = new InsightFacade();
        for (const id of Object.keys(datasetsToQuery)) {
            const ds = datasetsToQuery[id];
            const data = fs.readFileSync(ds.path).toString("base64");
            loadDatasetPromises.push(
                insightFacade.addDataset(id, data, ds.kind),
            );
        }

        return Promise.all(loadDatasetPromises);

/* *IMPORTANT NOTE: This catch is to let this run even without the implemented addDataset,
 * for the purposes of seeing all your tests run.
 * TODO For C1, remove this catch block (but keep the Promise.all)
 */
/*

    beforeEach(function () {
        Log.test(`BeforeTest: ${this.currentTest.title}`);
    });

    after(function () {
        Log.test(`After: ${this.test.parent.title}`);
    });

    afterEach(function () {
        Log.test(`AfterTest: ${this.currentTest.title}`);
    });

    // Dynamically create and run a test for each query in testQueries
    // Creates an extra "test" called "Should run test queries" as a byproduct. Don't worry about it
    it("Should run test queries", function () {
        describe("Dynamic InsightFacade PerformQuery tests", function () {
            for (const test of testQueries) {
                it(`[${test.filename}] ${test.title}`, function () {
                    const futureResult: Promise<
                        any[]
                        > = insightFacade.performQuery(test.query);
                    return TestUtil.verifyQueryResult(futureResult, test);
                });
            }
        });
    });
});*/
