import Log from "../Util";
import Decimal from "decimal.js";
import { InsightError, InsightDataset, InsightDatasetKind } from "./IInsightFacade";
import { parse } from "path";
const JSZip = require("jszip");

export default abstract class ProcessTransformAndOptions {

    protected numRows: number;
    protected columns: any;
    protected order: any;
    protected id: string;
    protected applykeys: any[] = [];
    protected transformExists: boolean;

    constructor(columns: any, order: any, id: string) {
        this.numRows = 0;
        this.columns = columns;
        this.order = order;
        this.id = id;
        this.transformExists = true;
        Log.trace("DatasetController::init()");
    }

    public performTransform(transform: any, filterResult: any): any {

        if (transform === null || transform === undefined) {
            this.transformExists = false;
            return filterResult;
        }
        let groups: any[] = this.getGroups(transform["GROUP"], filterResult);
        return this.apply(transform["APPLY"], groups);
    }

    private getGroups(groupArray: any[], filterResult: any): any {

        let groups: any = [];
        for (let element of filterResult) {

            groups = this.addToGroup(element, groups, groupArray);
        }
        return groups;
    }

    private addToGroup(element: any, groups: any[], groupArray: any[]): any {

        let match: boolean;
        let added: boolean = false;
        for (let group of groups) {

            match = true;
            for (let groupKey of groupArray) {

                if (element[groupKey] !== group[0][groupKey]) {

                    match = false;
                    break;
                }
            }

            if (match) {

                group.push(element);
                added = true;
                break;
            }
        }

        if (!added) {

            groups.push([element]);
        }
        return groups;
    }

    private apply(applyQuery: any, groups: any[]): any {

        let result: any[] = [];
        for (let group of groups) {

            let applyRules: any[] = [];
            for (let applyRule of applyQuery) {

                applyRules.push(this.performApplyRule(applyRule, group));
            }
            let element: any = {};
            for (let column of this.columns) {

                if (column.match(/_/g) === null) {
                    let applyRule = applyRules.find((x) => Object.keys(x)[0] === column);
                    element[column] = applyRule[column];

                } else {

                    element[column] = group[0][column];
                }
            }
            result.push(element);
        }
        return result;
    }

    private performApplyRule(applyRule: any, group: any[]): any {

        let applyKey = Object.keys(applyRule)[0];
        this.applykeys.push(applyKey);
        let applyRuleQuery = applyRule[applyKey];
        let applyToken = Object.keys(applyRuleQuery)[0];
        let obj: any = {};
        switch (applyToken) {
            case ("MAX"):
                let max = this.performMax(group, applyRuleQuery[applyToken]);
                obj[applyKey] = max;
                return obj;
            case ("MIN"):
                let min = this.performMin(group, applyRuleQuery[applyToken]);
                obj[applyKey] = min;
                return obj;
            case ("AVG"):
                let avg = this.performAvg(group, applyRuleQuery[applyToken]);
                obj[applyKey] = avg;
                return obj;
            case ("SUM"):
                let sum = this.performSum(group, applyRuleQuery[applyToken]);
                obj[applyKey] = sum;
                return obj;
            case ("COUNT"):
                let count = this.performCount(group, applyRuleQuery[applyToken]);
                obj[applyKey] = count;
                return obj;
        }
        return 0;
    }

    private performMax(group: any[], key: string): any {

        let max = 0;
        for (let elem of group) {
            if (elem[key] > max) {
                max = elem[key];
            }
        }
        return max;
    }

    private performMin(group: any[], key: string): any {

        let min = Number.MAX_SAFE_INTEGER;
        for (let elem of group) {

            if (elem[key] < min) {
                min = elem[key];
            }
        }

        return min;
    }

    private performAvg(group: any[], key: string): any {

        let total = new Decimal(0);
        for (let elem of group) {

            let added = new Decimal(elem[key]);
            total = total.add(added);
        }
        let avg = total.toNumber() / group.length;
        let res = Number(avg.toFixed(2));
        return res;
    }

    private performSum(group: any[], key: string): any {

        let total = 0;
        for (let elem of group) {

            total += elem[key];
        }
        let res = Number(total.toFixed(2));
        return res;
    }

    private performCount(group: any[], key: string): any {

        let values: any[] = [];
        for (let elem of group) {

            if (!values.includes(elem[key])) {
                values.push(elem[key]);
            }
        }
        return values.length;
    }

    public listResult(groupResult: any): any[] {
        let result: any[] = [];
        if (!this.transformExists) {
            for (let row of groupResult) {
                let buffer: any = {};
                for (let eachColumn of this.columns) {
                    buffer[eachColumn] = row[eachColumn];
                }
                result.push(buffer);
            }
        } else {
            result = groupResult;

        }

        if (this.order === null || this.order === undefined) {
            return result;
        } else {
            return this.sort(result);
        }
    }

    private sort(groupResult: any[]): any {

        let sOp = this.lessThan;
        let mOp = this.aMinusB;
        if (this.order["dir"] === "DOWN") {

            sOp = this.greaterThan;
            mOp = this.bMinusA;
        }

        if (this.order.constructor === String) {
            if (this.applykeys.includes(this.order)) {
                return this.sortApplyKey(groupResult, mOp, this.order);
            } else {
                return this.sortResult(groupResult, this.order, mOp, sOp);
            }
        }
        return this.sortTransform(groupResult, mOp, sOp);
    }

    private sortTransform(groupResult: any[], mOp: any, sOp: any): any {

        let result: any[] = [];
        let orderKeys = this.order["keys"];
        for (let i = orderKeys.length - 1; i >= 0; i--) {
            if (this.applykeys.includes(orderKeys[i])) {

                result = this.sortApplyKey(groupResult, mOp, orderKeys[i]);

            } else {
                result = this.sortResult(groupResult, orderKeys[i], mOp, sOp);
            }
        }
        return result;
    }

    private sortApplyKey(groupResult: any[], mOp: any, applykey: any): any {

        groupResult.sort((a: any, b: any) => {
            return mOp(a[applykey], b[applykey]);
        });
        return groupResult;
    }

    protected lessThan(a: any, b: any): boolean {

        return a < b;
    }

    protected greaterThan(a: any, b: any): boolean {

        return a > b;
    }

    protected aMinusB(a: any, b: any): number {

        return a - b;
    }

    protected bMinusA(a: any, b: any): number {

        return b - a;
    }

    protected abstract sortResult(result: any[], order: any, mOp: any, sOp: any): any;
}
