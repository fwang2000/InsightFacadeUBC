import Log from "../Util";
import { InsightError, InsightDataset, InsightDatasetKind } from "./IInsightFacade";
import { parse } from "path";
import ProcessTransformAndOptions from "./ProcessTransformAndOptions";
const JSZip = require("jszip");

export default class ProcessCoursesTransformAndOptions extends ProcessTransformAndOptions {

    constructor(columns: any, order: any, id: string) {
        super(columns, order, id);
        Log.trace("DatasetController::init()");
    }

    public sortResult(result: any[], order: any, mOp: any, sOp: any): any {

        result.sort((a: any, b: any) => {
            switch (order) {
                case (this.id + "_avg"):
                    return mOp(a.courses_avg, b.courses_avg);
                case (this.id + "_pass"):
                    return mOp(a.courses_pass, b.courses_pass);
                case (this.id + "_fail"):
                    return mOp(a.courses_fail, b.courses_fail);
                case (this.id + "_audit"):
                    return mOp(a.courses_audit, b.courses_audit);
                case (this.id + "_year"):
                    return mOp(a.courses_year, b.courses_year);
                case (this.id + "_dept"):
                    if (sOp(a.courses_dept, b.courses_dept)) {
                        return -1;
                    }
                    return 1;
                case (this.id + "_this.id"):
                    if (sOp(a.courses_this.id, b.courses_this.id)) {
                        return -1;
                    }
                    return 1;
                case (this.id + "_instructor"):
                    if (sOp(a.courses_instructor, b.courses_instructor)) {
                        return -1;
                    }
                    return 1;
                case (this.id + "_title"):
                    if (sOp(a.courses_title, b.courses_title)) {
                        return -1;
                    }
                    return 1;
                case (this.id + "_uuid"):
                    if (sOp(a.courses_uuid, b.courses_uuid)) {
                        return -1;
                    }
                    return 1;
            }
        });
        return result;
    }
}
