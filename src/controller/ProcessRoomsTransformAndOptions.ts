import Log from "../Util";
import { InsightError, InsightDataset, InsightDatasetKind } from "./IInsightFacade";
import { parse } from "path";
import ProcessTransformAndOptions from "./ProcessTransformAndOptions";
const JSZip = require("jszip");

export default class ProcessRoomsTransformAndOptions extends ProcessTransformAndOptions {

    constructor(columns: any, order: any, id: string) {
        super(columns, order, id);
        Log.trace("DatasetController::init()");
    }

    public sortResult(result: any[], order: any, mOp: any, sOp: any): any {
        result.sort((a: any, b: any) => {
            return this.switchOnOrder(order, a, b, mOp, sOp);
        });
        return result;
    }

    private switchOnOrder(order: any, a: any, b: any, mOp: any, sOp: any): any {
        switch (order) {
            case (this.id + "_seats"):
                return mOp(a.rooms_seats, b.rooms_seats);
            case (this.id + "_lat"):
                return mOp(a.rooms_lat, b.rooms_lat);
            case (this.id + "_lon"):
                return mOp(a.rooms_lon, b.rooms_lon);
            case (this.id + "_fullname"):
                if (sOp(a.rooms_fullname, b.rooms_fullname)) {
                    return -1;
                }
                return 1;
            case (this.id + "_shortname"):
                if (sOp(a.rooms_shortname, b.rooms_shortname)) {
                    return -1;
                }
                return 1;
            case (this.id + "_number"):
                if (sOp(a.rooms_number, b.rooms_number)) {
                    return -1;
                }
                return 1;
            case (this.id + "_name"):
                if (sOp(a.rooms_name, b.rooms_name)) {
                    return -1;
                }
                return 1;
            case (this.id + "_address"):
                if (sOp(a.rooms_address, b.rooms_address)) {
                    return -1;
                }
                return 1;
            case (this.id + "_type"):
                if (sOp(a.rooms_type, b.rooms_type)) {
                    return -1;
                }
                return 1;
            case (this.id + "_furniture"):
                if (sOp(a.rooms_furniture, b.rooms_furniture)) {
                    return -1;
                }
                return 1;
            case (this.id + "_href"):
                if (sOp(a.rooms_href, b.rooms_href)) {
                    return -1;
                }
                return 1;
        }
    }
}
