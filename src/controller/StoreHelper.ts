import Log from "../Util";
import fs = require("fs");
import { rejects } from "assert";
const JSZip = require("jszip");

export default class StoreHelper {
    constructor() {
        Log.trace("Storing Data...init()");
    }

    public storeToDisk(id: string, datasetEntries: any): Promise<any> {
        const path: string = __dirname + "/../../data/";
        const fileString = "/" + id + "datasetMap.txt";

        return new Promise((resolve, reject) => {

            fs.writeFile(path + fileString, JSON.stringify(datasetEntries), (err) => {
                if (err) {
                    return reject(err);
                } else {
                    return resolve();
                }
            });
        });
    }
}
