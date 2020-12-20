import Log from "../Util";
import QueryValid from "./ValidQuery";

export default class RoomQueryValid extends QueryValid {

    public sfields: any[];
    public mfields: any[];

    constructor() {

        super();
        this.sfields = ["fullname", "shortname", "number", "name", "address", "type", "furniture", "href"];
        this.mfields = ["lat", "lon", "seats"];
        Log.trace("isRoomQueryValid::init()");
    }

    public isWhereValid(whereQuery: any): boolean {

        if (this.nullCheck(whereQuery) || whereQuery.constructor !== Object) {
            return false;
        }
        if (Object.keys(whereQuery).length === 0) {
            return true;
        }

        return this.isFilterValid(whereQuery);
    }

    public isFilterValid(filterQuery: any): boolean {

        if (this.nullCheck(filterQuery) || filterQuery.constructor !== Object) {
            return false;
        }

        let key = this.getKey(filterQuery);
        if (!key) {
            return false;
        }

        let logicComp = ["AND", "OR"];
        let mComp = ["LT", "GT", "EQ"];

        if (logicComp.includes(key)) {
            return this.isLogicValid(filterQuery[key]);
        } else if (mComp.includes(key) || key === "IS") {
            return this.isCompValid(filterQuery[key], key);
        } else if (key === "NOT") {
            return this.isFilterValid(filterQuery[key]);
        } else {
            return false;
        }
    }

    public isLogicValid(logicQuery: any): boolean {

        if (this.nullCheck(logicQuery) || logicQuery.constructor !== Array) {

            return false;
        }

        if (logicQuery.length === 0) {

            return false;
        }

        for (let filterQuery of logicQuery) {
            if (!this.isFilterValid(filterQuery)) {

                return false;
            }
        }
        return true;
    }

    public isCompValid(compQuery: any, key: string): boolean {

        if (this.nullCheck(compQuery) || compQuery.constructor !== Object) {

            return false;
        }

        let compstring = this.getKey(compQuery);

        if (!compstring) {
            return false;
        }
        if (!this.isKeyValid(compstring)) {
            return false;
        }
        if (this.nullCheck(compstring)) {
            return false;
        }

        let underscoreValue = compstring.match(/_/g);

        if (underscoreValue === null || underscoreValue.length !== 1) {

            return false;
        }

        let splitString = compstring.split("_");
        let idstring = splitString[0];
        let field = splitString[1];

        if (idstring.includes("*") || idstring.trim().length === 0) {

            return false;
        }

        if (key === "IS") {

            return this.isSCompValid(compQuery[compstring], field);

        } else {

            return this.isMCompValid(compQuery[compstring], field);
        }
    }

    public isMCompValid(mValue: any, mfield: string): boolean {

        if (!this.mfields.includes(mfield)) {

            return false;
        }

        if (mValue.constructor !== Number) {

            return false;
        }
        return true;
    }

    public isSCompValid(inputString: any, sfield: string): boolean {

        if (!(this.sfields.includes(sfield))) {
            Log.trace("here");
            return false;
        }

        if (inputString === null || inputString === undefined || inputString.constructor !== String) {

            return false;
        }

        if (inputString === "*") {
            return true;
        }

        if (inputString.substring(1, inputString.length - 1).includes("*")) {

            return false;
        }
        return true;
    }

    public isKeyValid(key: string): boolean {

        let underscoreValue = key.match(/_/g);

        if (underscoreValue === null || underscoreValue.length !== 1) {

            return false;
        }
        let splitString = key.split("_");
        let idstring = splitString[0];
        let field = splitString[1];

        if (idstring.includes("*") || idstring.trim().length === 0) {

            return false;
        }
        if (this.id === null) {

            this.id = idstring;

        } else if (this.id !== idstring) {
            Log.trace("40");
            return false;
        }
        if (!this.isValidField(field)) {
            Log.trace("there");
            return false;
        }
        return true;
    }

    public isMKey(key: string) {

        return key === this.id + "_lat" ||
            key === this.id + "_lon" ||
            key === this.id + "_seats";
    }

    private isValidField(field: string) {

        return this.sfields.includes(field) || this.mfields.includes(field);
    }
}
