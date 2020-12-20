import Log from "../Util";
import { InsightError, ResultTooLargeError } from "./IInsightFacade";
const fs = require("fs");
import ProcessQuery from "./ProcessQuery";
import ProcessTransformAndOptions from "./ProcessTransformAndOptions";
import ProcessRoomsTransformAndOptions from "./ProcessRoomsTransformAndOptions";
import ProcessCoursesTransformAndOptions from "./ProcessCoursesTransformAndOptions";

export default class LoadQuery {

    public queryHelper: ProcessQuery;
    public toHelper: ProcessTransformAndOptions;
    public datasetType: string;
    public id: string;

    constructor(id: string) {
        this.id = id;
        Log.trace("Retrieving Query Results...init()");
    }

    public getQueryResult(path: string, query: any, datasetType: string): Promise<any[]> {

        this.datasetType = datasetType;
        this.queryHelper = new ProcessQuery(this.datasetType);

        return new Promise((resolve, reject) => {

            fs.readFile(path, (err: any, data: any) => {
                if (err) {
                    Log.trace(err);
                    return reject(err);
                }

                let result = this.process(data, query);

                if (result.length > 5000 || result === false) {
                    return reject(new ResultTooLargeError("ResultTooLargeError"));

                } else {
                    return resolve(result);
                }
            });
        });
    }

    private process(fileContent: any, query: any): any {
        const datasetToBePerformed = JSON.parse(fileContent);
        const result = this.getResultHelper(datasetToBePerformed, query);
        return result;
    }

    private getResultHelper(dataset: any, query: any): any {
        const where: any = query["WHERE"];
        const options: any = query["OPTIONS"];
        const columns: any = options["COLUMNS"];
        let order: any = options["ORDER"];
        let transform: any;
        let filterResult: any;

        if (query["TRANSFORMATIONS"]) {

            transform = query["TRANSFORMATIONS"];
        }

        dataset = this.filterDataset(dataset);

        let sections: any = [];
        for (const element of dataset) {
            if (this.datasetType === "rooms") {

                sections.push(element);

            } else {

                for (let section of element) {

                    sections.push(section);
                }
            }
        }

        if (Object.keys(where).length === 0) {

            filterResult = this.queryHelper.emptyWhere(sections, []);

        } else {

            filterResult = this.queryHelper.filterHelper(sections, [], where);
        }
        if (filterResult.length === 0) {

            return filterResult;

        }

        return this.performTransformAndList(filterResult, transform, columns, order);
    }

    private performTransformAndList(filterResult: any, transform: any, columns: any, order: any): any {

        if (this.datasetType === "rooms") {
            this.toHelper = new ProcessRoomsTransformAndOptions(columns, order, this.id);

        } else {

            this.toHelper = new ProcessCoursesTransformAndOptions(columns, order, this.id);
        }
        let transformResult = this.toHelper.performTransform(transform, filterResult);

        return this.toHelper.listResult(transformResult);
    }

    private filterDataset(dataset: any[]): any {

        dataset = dataset.filter((value: any) => value !== null);

        return dataset;
    }
}
