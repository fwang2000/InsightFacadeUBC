import Log from "../Util";

export default abstract class QueryValid {

    protected id: string = null;
    protected columns: string[] = [];
    protected applykeys: string[] = [];
    protected groupkeys: string[] = [];
    private transformExists: boolean;

    constructor() {

        this.transformExists = false;
    }

    public isQueryValid(query: any): any {

        if (this.nullCheck(query) || query.constructor !== Object) {
            return false;
        }

        let queryKeys = Object.keys(query);
        if (queryKeys.length < 2 || queryKeys.length > 3) {
            return false;
        }

        if (!(query.hasOwnProperty("WHERE") && query.hasOwnProperty("OPTIONS"))) {
            return false;
        }

        if (queryKeys.length === 3) {

            if (!query.hasOwnProperty("TRANSFORMATIONS")) {

                return false;

            } else {

                this.transformExists = true;
            }
        }
        let result: boolean;
        if (this.transformExists) {
            result = this.isWhereValid(query["WHERE"]) &&
                this.isTransformationValid(query["TRANSFORMATIONS"]) &&
                this.isOptionsValid(query["OPTIONS"]);
        } else {

            result = this.isWhereValid(query["WHERE"]) && this.isOptionsValid(query["OPTIONS"]);
        }
        let retID = this.id;
        this.id = null;

        if (!result) {
            return false;
        } else {
            return retID;
        }
    }

    public isTransformationValid(transformQuery: any): boolean {

        if (this.nullCheck(transformQuery) || transformQuery.constructor !== Object) {
            return false;
        }

        if (Object.keys(transformQuery).length !== 2) {
            return false;
        }

        if (!(transformQuery.hasOwnProperty("GROUP") && transformQuery.hasOwnProperty("APPLY"))) {
            return false;
        }

        return this.isGroupValid(transformQuery["GROUP"]) && this.isApplyValid(transformQuery["APPLY"]);
    }

    public isGroupValid(groupQuery: any): boolean {
        if (this.nullCheck(groupQuery) || groupQuery.constructor !== Array) {
            return false;
        }
        this.groupkeys = [];
        if (groupQuery.length === 0) {

            return false;
        }
        for (let key of groupQuery) {

            if (!this.isKeyValid(key)) {
                return false;
            }
            this.groupkeys.push(key);
        }
        return true;
    }

    public isApplyValid(applyQuery: any): boolean {

        if (this.nullCheck(applyQuery) || applyQuery.constructor !== Array) {
            return false;
        }
        this.applykeys = [];
        for (let applyRule of applyQuery) {

            if (!this.isApplyRuleValid(applyRule)) {
                return false;
            }
        }
        return true;
    }

    public isApplyRuleValid(applyRule: any): boolean {
        if (this.nullCheck(applyRule) || applyRule.constructor !== Object) {
            return false;
        }
        let applykey = this.getKey(applyRule);
        if (applykey === false) {
            return false;
        }
        if (applykey.match(/_/g) !== null || applykey.trim().length === 0) {
            Log.trace("fail");
            return false;
        }

        if (this.applykeys.includes(applykey)) {
            return false;
        }
        this.applykeys.push(applykey);
        return this.isApplyTokenValid(applyRule[applykey]);
    }

    public isApplyTokenValid(tokenQuery: any): boolean {
        if (this.nullCheck(tokenQuery) || tokenQuery.constructor !== Object) {
            return false;
        }

        let tokens = ["MAX", "MIN", "AVG", "COUNT", "SUM"];
        let key = this.getKey(tokenQuery);
        if (!key) {
            return false;
        }
        if (!tokens.includes(key)) {
            return false;
        }
        if (key !== "COUNT") {

            if (!this.isMKey(tokenQuery[key])) {
                return false;
            }
            return true;
        }
        return this.isKeyValid(tokenQuery[key]);
    }

    public isOptionsValid(optionsQuery: any): boolean {

        if (this.nullCheck(optionsQuery) || optionsQuery.constructor !== Object) {
            return false;
        }

        let optionsKeys: string[] = Object.keys(optionsQuery);

        if (optionsKeys.length !== 1 && optionsKeys.length !== 2) {
            return false;
        }

        if (!optionsKeys.includes("COLUMNS")) {
            return false;
        }
        if (optionsKeys.length === 2 && !optionsKeys.includes("ORDER")) {
            return false;
        }
        if (this.isColumnsValid(optionsQuery["COLUMNS"])) {

            if (optionsKeys.length === 2) {
                return this.isOrderValid(optionsQuery["ORDER"]);
            }
            return true;
        }
        return false;
    }

    public isColumnsValid(columnsQuery: string[]): boolean {

        if (this.nullCheck(columnsQuery) || columnsQuery.constructor !== Array) {
            return false;
        }
        if (columnsQuery.length === 0) {
            return false;
        }
        this.columns = [];
        for (let key of columnsQuery) {

            if (this.nullCheck(key) || key.constructor !== String) {
                return false;
            }
            if (this.transformExists) {

                if (!this.checkKeyInGroupsOrApply(key)) {
                    return false;
                }
            } else if (!this.isKeyValid(key)) {
                return false;
            }
            this.columns.push(key);
        }
        return true;
    }

    public isOrderValid(orderQuery: string): boolean {

        if (this.nullCheck(orderQuery)) {
            return false;
        }
        if (orderQuery.constructor === String && this.columns.includes(orderQuery)) {
            return true;
        }
        if (orderQuery.constructor === Object) {

            return this.isSortValid(orderQuery);
        }
        return false;
    }

    public isSortValid(orderQuery: any): boolean {

        let orderKeys = Object.keys(orderQuery);
        if (orderKeys.length !== 2) {
            return false;
        }
        if (!orderKeys.includes("dir") || !orderKeys.includes("keys")) {
            Log.trace("oof");
            return false;
        }
        if (orderQuery["dir"] !== "UP" && orderQuery["dir"] !== "DOWN") {
            return false;
        }
        let keys = orderQuery["keys"];
        if (this.nullCheck(keys) || keys.constructor !== Array) {
            return false;
        }
        if (keys.length === 0) {

            return false;
        }
        for (let key of keys) {

            if (!this.columns.includes(key)) {
                return false;
            }
        }
        return true;
    }

    protected nullCheck(elem: any) {

        return elem === null || elem === undefined;
    }

    protected getKey(query: any) {

        let keys: any[] = Object.keys(query);
        if (keys.length !== 1) {
            return false;
        }
        let key = keys[0];
        if (this.nullCheck(key) || key.constructor !== String) {
            return false;
        }
        return key;
    }

    private checkKeyInGroupsOrApply(key: string): boolean {

        return this.applykeys.includes(key) || this.groupkeys.includes(key);
    }

    protected abstract isWhereValid(whereQuery: any): boolean;
    protected abstract isMKey(key: string): boolean;
    protected abstract isKeyValid(key: string): boolean;
}

