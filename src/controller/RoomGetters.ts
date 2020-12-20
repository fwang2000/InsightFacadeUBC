import Log from "../Util";
const JSZip = require("jszip");
const parse5 = require("parse5");
const http = require("http");

export default class RoomGetters {

    constructor() {
        Log.trace("DatasetController::init()");
    }

    public getBody(parsedIndexFile: any): any {
        // get html node
        let htmlNode: any;
        for (let child of parsedIndexFile.childNodes) {
            if (child.nodeName === "html") {
                htmlNode = child;
            }
        }
        // get body node
        let bodyNode: any;
        for (const child of htmlNode.childNodes) {
            if (child.nodeName === "body") {
                bodyNode = child;
            }
        }
        return bodyNode;
    }

    // get list of buildings with their attributes, return null if index.html doesn't contain that building
    public getBuildings(bodyNode: any): any {
        let buildingList: any[] = [];
        for (const childNode of bodyNode.childNodes) {
            buildingList.push(this.getBuildingsRecursiveHelper(childNode)); // will return room list actually
            // if null, means found no building, pass
        }
        if (buildingList !== null) {
            return buildingList.filter((building: any) =>
                (building !== null && building !== undefined && building.length > 0));
        } else {
            return [];
        }
    }

    // traverse down a lot of childNodes to get those with nodeName 'tr'
    public getBuildingsRecursiveHelper(node: any): any {
        let buildingList: any[] = [];
        if (node !== null && node !== undefined) {
            if (node.nodeName === "tr" && node.parentNode.nodeName === "tbody") { // find tr nodes (table row)
                // Log.trace("tr node found");
                for (const otherTr of node.parentNode.childNodes) {
                    if (otherTr.nodeName === "tr") {
                        buildingList.push(this.processBuilding(otherTr));
                    }
                }
                // Log.trace(buildingList);
                return buildingList;
            } else if (!node.childNodes) {
                return null; // there is no building (tr node) contained in this list
            } else {
                for (const childNode of node.childNodes) {
                    let child = this.getBuildingsRecursiveHelper(childNode);
                    if (child !== null && child !== undefined) {
                        return child;
                    }
                }
            }
        } else {
            return null;
        }
    }

    // get all 5 td nodes under the tr node
    public processBuilding(trNode: any): any {
        let tdNodes: any[] = [];
        for (const child of trNode.childNodes) {
            if (child.nodeName === "td") {
                tdNodes.push(child);
            }
        }
        // there should be 5 td nodes containing: image, code, full name, address, more info link
        // but it is fine if some attributes are missing (?)
        let buildingData: any[] = [];
        const imgLink: string = this.getImgLink(tdNodes[0]);
        const code: string = this.getTextValue(tdNodes[1]);
        const fullName: string = this.getBuildingOrRoomName(tdNodes[2]);
        const address: string = this.getTextValue(tdNodes[3]);
        const moreInfoContent: string = this.getMoreInfo(tdNodes[4]);

        buildingData.push([imgLink, code, fullName, address, moreInfoContent]);
        return buildingData;
    }

    public getImgLink(node: any): string {
        for (const tdChild of node.childNodes) {
            if (tdChild.nodeName === "a") {
                for (const aChild of tdChild.childNodes) {
                    if (aChild.nodeName === "img") {
                        return aChild.attrs[0].value;
                    }
                }
            }
        }
    }

    // get building code and address, their node structur is the same
    public getTextValue(node: any): string {
        for (const tdChild of node.childNodes) {
            if (tdChild.nodeName === "#text") {
                return tdChild.value.trim();
            }
        }
    }

    public getBuildingOrRoomName(node: any): string {
        for (const tdChild of node.childNodes) {
            if (tdChild.nodeName === "a") {
                for (const aChild of tdChild.childNodes) {
                    if (aChild.nodeName === "#text") {
                        return aChild.value.trim();
                    }
                }
            }
        }
    }

    public getMoreInfo(node: any): string {
        for (const tdChild of node.childNodes) {
            if (tdChild.nodeName === "a") {
                return tdChild.attrs[0].value;
            }
        }
    }

    public getBuildingsWithGeolocation(buildingList: any[]): Promise<any> {
        let promises: any[] = [];

        return new Promise((resolve1, reject) => {
            for (const building of buildingList) {
                promises.push(this.getGeolocationByIndividualBuilding(building[0])); // address of building
            }

            Promise.all(promises).then((values: any) => {
                values = values.filter((value: any) =>   // filter out buildings without valid geolocation
                    (value !== null && value[5] !== undefined && value[6] !== undefined && value !== []));
                return resolve1(values);
            });
        });

    }

    public getGeolocationByIndividualBuilding(building: any): Promise<any> {
        return new Promise((resolve2, reject) => {

            this.getGeolocation(building[3]).then((geolocation: any) => {
                building.push(geolocation.lat, geolocation.lon);
                return resolve2(building);
            }).catch((err: any) => {
                Log.trace(err); // pass this building, cus can't get geodata for the building
                return resolve2(null);
            });
        });
    }

    public getGeolocation(address: string): Promise<any> {
        let url = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team153/" + this.encodeAddress(address);

        return new Promise((resolve3, reject) => {
            http.get(url, (res: any) => {
                // const { statusCode } = res;
                if (res.statusCode === 404 && res.statusCode === 400) {
                    return reject("invalid address");
                } else {
                    res.setEncoding("utf8");
                    let geoData = "";
                    res.on("data", (chunk: any) => {
                        geoData = chunk;
                    });
                    res.on("end", () => {
                        try {
                            const parsedData = JSON.parse(geoData);
                            // Log.trace(parsedData);
                            return resolve3(parsedData);
                        } catch (e) {
                            Log.trace(e);
                            return reject("parse error");
                            // return resolve3(null);
                        }
                    });
                }
            }).on("error", (err: any) => {
                Log.trace(err);
                return reject("time out");
                // return resolve3(null);
            });
        });
    }

    private encodeAddress(address: string): string {
        return address.split(" ").join("%20");
    }

}
