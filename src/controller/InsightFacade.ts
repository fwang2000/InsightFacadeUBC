import Log from "../Util";
import {
    IInsightFacade,
    InsightDatasetKind,
    InsightDataset,

    ResultTooLargeError
} from "./IInsightFacade";
import { InsightError, NotFoundError } from "./IInsightFacade";
import isCourseQueryValid from "./ValidCourseQuery";
import isQueryValid from "./ValidQuery";

import ProcessCoursesDataHelper from "./ProcessCoursesDataHelper";
import ProcessRoomsDataHelper from "./ProcessRoomsDataHelper";
import StoreHelper from "./StoreHelper";
import fs = require("fs");
import LoadQuery from "./loadQuery";
import isRoomQueryValid from "./ValidRoomQuery";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */

export default class InsightFacade implements IInsightFacade {
    public ids: string[];
    public dsiList: InsightDataset[];
    public datasets: Map<string, any[]>;   // selected internal data structure: a map <id, an array of valid files>
    private pdchelper = new ProcessCoursesDataHelper();
    private pdrhelper = new ProcessRoomsDataHelper();
    private sthelper = new StoreHelper();
    private loadQueryHelper: LoadQuery;
    private queryValid: isQueryValid;

    constructor() {
        this.ids = [];
        this.dsiList = [];
        this.datasets = new Map<string, any[]>();
        Log.trace("InsightFacadeImpl::init()");
    }

    public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
        if (!this.checkId(id)) { // check for invalid ID
            return Promise.reject(new InsightError("invalid id"));
        }
        if (kind === InsightDatasetKind.Courses) {
            return new Promise((resolve, reject) => {
                try { // load and read Zip
                    this.pdchelper.loadDataset(id, content).then((datasetArray: any) => {

                        if (datasetArray[0].length !== 0) {  // there are more than one valid files
                            this.storeLocal(id, datasetArray);
                            this.sthelper.storeToDisk(id, datasetArray[0]).then(() => { // store course list into disk
                                this.ids.push(id);
                                Log.trace(id + " added");
                                return resolve(this.ids);
                            });
                        } else {
                            return reject(new InsightError());
                        }
                    }).catch((err: Error) => {
                        return reject(new InsightError());
                    });
                } catch (err) {
                    return reject(new InsightError(err));
                }
            });
        } else if (kind === InsightDatasetKind.Rooms) {
            return new Promise((resolve, reject) => {
                try {   // load and read zip
                    this.pdrhelper.loadDataset(id, content).then((datasetArray: any) => {
                        if (datasetArray[0] !== null && datasetArray[0] !== undefined && datasetArray[0].length > 0) {
                            this.storeLocal(id, datasetArray);
                            this.sthelper.storeToDisk(id, datasetArray[0]).then(() => { // store room list into disk
                                this.ids.push(id);
                                return resolve(this.ids);
                            });
                        } else {
                            return reject(new InsightError("no valid rooms"));
                        }
                    }).catch((err: any) => {
                        return reject(new InsightError("load fail"));
                    });
                } catch {
                    return reject(new InsightError("load fail"));
                }
            });
        } else {
            return Promise.reject("kind invalid");
        }
    }

    public storeLocal(id: string, datasetArray: any[]): any {

        this.datasets.set(id, datasetArray[0]);  // storing id and dataset(valid files) into the map
        this.dsiList.push(datasetArray[1]);
    }

    public checkId(id: string): boolean {
        if (id === null || id.includes("_") || !id.replace(/\s/g, "").length) {
            return false;
        }
        if (this.ids.includes(id)) {
            return false;
        }
        return true;
    }

    public removeDataset(id: string): Promise<string> {
        // TODO: Check the validity of the ID string - only whitespace, contains underscore, not in the datasets
        // TODO: Throw errors in proper scenarios: - NotFoundError if ID is not in datasets, else InsightError
        // TODO: Delete from disk and memory cache
        const path: string = "./data/" + id + "datasetMap.txt";  // will need to change this cus loading from disk
        Log.trace(id);
        return new Promise((fulfill, reject) => {

            if (id === null || id === undefined || id.includes("_") || !id.replace(/\s/g, "").length) {
                return reject(new InsightError("Invalid ID"));
            }

            if (!fs.existsSync(path)) {
                return reject(new NotFoundError("Dataset with ID " + id + " not found"));
            }

            try {
                if (this.datasets.has(id)) {   // if the id exists in the datasets map's list of keys
                    this.datasets.delete(id);  // delete the entire entry from the datasets map
                }

                this.dsiList = this.dsiList.filter(
                    (dataset: InsightDataset) => dataset.id === id,
                );
                this.ids = this.ids.filter((elem) => elem === id);

                fs.unlinkSync(path); // DELETE FROM DISK
                Log.trace("deleted");
                return fulfill(id);
            } catch (err) {
                return reject(new NotFoundError("Dataset with ID " + id + " not found"));
            }
        });
    }

    public performQuery(query: any): Promise<any[]> {

        let id: any;

        return new Promise((fulfill, reject) => {
            if (query === null || query === undefined || query.constructor !== Object) {
                return reject(new InsightError("Null Query"));
            }
            let type: any = this.getDatasetType(query);
            if (!type) {

                return reject(new InsightError("invalid query"));

            } else if (type === "rooms") {

                this.queryValid = new isRoomQueryValid();

            } else {

                this.queryValid = new isCourseQueryValid();
            }

            id = this.queryValid.isQueryValid(query);

            if (id === false) {
                return reject(new InsightError("Invalid Query"));
            }
            if (!this.ids.includes(id)) {

                return reject(new InsightError("Dataset Not Added"));
            }

            let datasetPath: string = __dirname + "/../../data/";
            let fileString: string = "/" + id + "datasetMap.txt";

            try {
                this.loadQueryHelper = new LoadQuery(id);
                this.loadQueryHelper.getQueryResult(datasetPath + fileString, query, type).then((result: any) => {
                    return fulfill(result);
                }).catch((err: any) => {  // i still need this catch to solve unhandled promise rejections...
                    Log.trace(err);
                    return reject(new ResultTooLargeError("ResultTooLargeError"));
                    // option / where reversed order
                });
            } catch (err) {
                return reject(new InsightError("noooooooooo"));
            }
        });
    }

    public getDatasetType(query: any) {

        let idstring: any;
        let key: any;

        if (Object.keys(query).includes("TRANSFORMATIONS")) {

            key = this.getTypeFromTransform(query["TRANSFORMATIONS"]);

        } else if (Object.keys(query).includes("OPTIONS")) {

            key = this.getTypeFromOptions(query["OPTIONS"]);

        } else {
            Log.trace("invalid");
            return false;
        }

        if (key === null || key === undefined || key.constructor !== String) {
            Log.trace("failed here");
            return false;
        }

        let underscoreValue = key.match(/_/g);
        if (underscoreValue === null || underscoreValue.length !== 1) {
            return false;
        }
        let splitString = key.split("_");
        idstring = splitString[0];
        let dataset = this.dsiList.find((dsi) => dsi.id === idstring);
        if (dataset === undefined) {
            return false;

        } else if (dataset.kind === InsightDatasetKind.Courses) {
            return "courses";

        } else {
            return "rooms";
        }
    }

    public getTypeFromTransform(query: any) {

        if (query === null || query === undefined || query.constructor !== Object) {
            return false;
        }

        if (query["GROUP"]) {

            return query["GROUP"][0];
        }
        return false;
    }

    public getTypeFromOptions(query: any) {

        if (query === null || query === undefined || query.constructor !== Object) {

            return false;
        }

        if (query["COLUMNS"]) {

            return query["COLUMNS"][0];
        }

        return false;
    }

    public listDatasets(): Promise<InsightDataset[]> {

        return new Promise((fulfill) => {
            return fulfill(this.dsiList);
        });
    }
}
