import Log from "../Util";
import { InsightError, InsightDataset, InsightDatasetKind } from "./IInsightFacade";
import { parse } from "path";
const JSZip = require("jszip");

export default class ProcessQuery {

    public numRows: number;
    public datasetType: string;

    constructor(datasetType: string) {
        this.numRows = 0;
        this.datasetType = datasetType;
        Log.trace("DatasetController::init()");
    }

    public filterHelper(origData: any[], rsf: any[], filterQuery: any): any[] {

        let resultSoFar: any[] = rsf;
        let key = Object.keys(filterQuery)[0];
        let logicComp = ["AND", "OR"];
        let mComp = ["LT", "GT", "EQ"];

        if (logicComp.includes(key)) {

            resultSoFar = this.logicHelper(origData, resultSoFar, filterQuery[key], key);
            return resultSoFar;

        } else if (mComp.includes(key) || key === "IS") {
            resultSoFar = this.compHelper(origData, resultSoFar, filterQuery[key], key);
            return resultSoFar;

        } else if (key === "NOT") {
            let result: any[] = this.filterHelper(origData, resultSoFar, filterQuery[key]);
            let notResult = [];

            for (let section of origData) {

                if (!result.includes(section)) {
                    notResult.push(section);
                }
            }
            return notResult;
        }
    }

    private logicHelper(origData: any, rsf: any, logicQuery: any, key: any): any[] {

        let resultSoFar: any[] = rsf;
        let returnResult: any[] = null;

        if (key === "AND") { // trim down if data dont satisfy both query
            for (let filterQuery of logicQuery) {

                let currResult = this.filterHelper(origData, [], filterQuery);

                if (returnResult === null) {

                    returnResult = currResult;

                } else {
                    returnResult = returnResult.filter((value) => currResult.includes(value));
                }
            }

        } else if (key === "OR") {
            returnResult = [];

            for (let filterQuery of logicQuery) {

                let result = this.filterHelper(origData, [], filterQuery);
                for (let section of result) {

                    if (!returnResult.includes(section)) {

                        returnResult.push(section);
                    }
                }
            }
        }

        for (let value of returnResult) {

            if (!resultSoFar.includes(value)) {

                resultSoFar.push(value);
            }
        }
        return resultSoFar;
    }

    private compHelper(origData: any, rsf: any, compQuery: any, key: any): any[] {

        let compstring: any = Object.keys(compQuery)[0];
        let value = compQuery[compstring];

        if (key === "IS") {

            return this.sCompHelper(origData, rsf, value, compstring);

        } else {
            return this.mCompHelper(origData, rsf, value, compstring, key);
        }
    }

    private sCompHelper(origData: any, rsf: any, compValue: any, compString: any): any[] {

        let result: any[] = [];
        if (compValue === "*") {
            for (let row of origData) {
                result.push(row);
            }
        } else if (compValue[0] === "*" && compValue[compValue.length - 1] === "*") {
            for (let row of origData) {
                if (row[compString].includes(compValue.substring(1, compValue.length - 1))) {
                    result.push(row);
                }
            }
        } else if (compValue[0] === "*") {
            for (let row of origData) {
                let rowString = row[compString].substring(row[compString].length - (compValue.length - 1));
                if (rowString === compValue.substring(1)) {
                    result.push(row);
                }
            }
        } else if (compValue[compValue.length - 1] === "*") {
            for (let row of origData) {
                let rowString = row[compString].substring(0, compValue.length - 1);
                if (rowString === compValue.substring(0, compValue.length - 1)) {
                    result.push(row);
                }
            }
        } else {
            for (let row of origData) {
                if (row[compString] === compValue) {
                    result.push(row);
                }
            }
        }
        return result;
    }

    private mCompHelper(origData: any, rsf: any, compValue: any, compString: any, mkey: any): any[] {

        let result: any[] = [];
        if (mkey === "LT") {
            for (let row of origData) {
                if (row[compString] < compValue) {
                    result.push(row);
                }
            }

        } else if (mkey === "EQ") {
            for (let row of origData) {
                if (row[compString] === compValue) {
                    result.push(row);
                }
            }
        } else {
            for (let row of origData) {
                if (row[compString] > compValue) {
                    result.push(row);
                }
            }
        }
        return result;
    }

    public emptyWhere(origData: any, result: any[]): any {

        for (let section of origData) {

            result.push(section);
        }
        return result;
    }
}
