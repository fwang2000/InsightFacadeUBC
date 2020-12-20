import Log from "../Util";
import { InsightError, InsightDataset, InsightDatasetKind } from "./IInsightFacade";
const JSZip = require("jszip");
const parse5 = require("parse5");
import RoomGetters from "./RoomGetters";
import RoomDataStructure from "./RoomDataStructure";

export default class ProcessRoomsDataHelper {

    public content: any;
    private roomds = new RoomDataStructure();
    private rg = new RoomGetters();
    public numRows: number;

    constructor() {
        this.numRows = 0;
        Log.trace("DatasetController::init()");
    }

    public loadDataset(id: string, content: string): Promise<any> {

        let jszip = JSZip();
        this.content = content;

        return new Promise((resolve, reject) => {

            jszip.loadAsync(content, { base64: true }).then((zip: any) => {   // unzip rooms zip
                // don't need to create a new folder for 'rooms' this time
                return resolve(this.handleZip(zip, id));
                // .catch((err: any) => {
                //     return reject(new InsightError("no html to be parse/ no index.htm found"));
                // });
            }).catch ((error: any) => {
                Log.trace(error);
                return reject(new InsightError("not zip"));
            });
        });
    }

    private handleZip(zip: any, id: string): Promise<any> {

        return new Promise((resolve) => {

            let buildings: any[] = [];

            zip.file("rooms/index.htm").async("string").then((indexFile: string) => {
                const parsedIndexFile = parse5.parse(indexFile);  // parse index.htm
                // Log.trace(parsedIndexFile.childNodes[6]);
                const bodyNode = this.rg.getBody(parsedIndexFile);
                buildings = this.rg.getBuildings(bodyNode)[0];

                this.rg.getBuildingsWithGeolocation(buildings).then((buildingList: any[]) => {

                    if (buildingList === null || buildingList.length <= 0) {
                        return resolve(null);
                    }

                    return resolve(this.handleEachBuilding(buildingList, id));
                });
            });
        });
    }

    private handleEachBuilding(buildingList: any[], id: string): Promise<any> {

        let rooms: any[] = [];

        return new Promise((resolve) => {
            for (const building of buildingList) {
                rooms.push(this.getRooms(building[4])); // pass in the file path
            }

            Promise.all(rooms).then((values) => {

                return resolve(this.getFinalList(buildingList, values, id));
                // Log.trace(values);

            });
        });
    }

    private getFinalList(buildings: any[], values: any[], id: string): any {

        let finalList = this.combineBuildingRoom(buildings, values, id);

        let datasetInterface: InsightDataset = {
            id: id,
            kind: InsightDatasetKind.Rooms,
            numRows: finalList.length
        };

        this.numRows = 0;

        let returned = [finalList, datasetInterface];

        return returned;
    }

    private combineBuildingRoom(buildings: any, rooms: any, id: any): any {
        let combined: any[] = [];
        let roomList: any[] = [];

        for (let i = 0; i < buildings.length; i++) {
            if (rooms[i].length > 0) {
                combined.push([buildings[i], rooms[i]]);
            }
        }
        // hahaha this is so badly designed but don't wanna fix it for now..
        for (const each of combined) {
            // for (let i = 0; i < each[1][0].length; i++) {
            let i = 0;
            while (i < each[1][0].length) {
                roomList.push([each[0][0], each[0][1], each[0][2], each[0][3], each[0][5], each[0][6],
                    each[1][0][i][0], each[1][0][i][1], each[1][0][i][2], each[1][0][i][3]]);
                i++;
            }
        }
        let finalList = this.roomds.parseRoomDataset(roomList, id);
        if (finalList !== null) {
            return finalList;
        } else {
            return [];
        }
    }

    private getRooms(filePath: any): Promise<any> {
        let roomList: any[] = [];
        let jszip = JSZip();

        return new Promise((resolve, reject) => {
            jszip.loadAsync(this.content, { base64: true }).then((zip: any) => {
                try {
                    zip.file("rooms" + filePath.substring(1)).async("string").then((buildingFile: string) => {
                        const parsedBuildingFile = parse5.parse(buildingFile);
                        const bodyNode = this.rg.getBody(parsedBuildingFile);

                        for (const childNode of bodyNode.childNodes) {
                            roomList.push(this.getRoomsRecursiveHelper(childNode));
                            // if null, means found no room, pass
                        }
                        roomList = this.filterInvalidRooms(roomList);
                        return resolve(roomList);
                    });
                } catch (err) {
                    return resolve([]); // if found no building file, return empty list
                }
            });
        });
    }

    private filterInvalidRooms(roomList: any): any {
        return roomList.filter((room: any) => (room !== null && room !== undefined));
    }

    // should actually be refactored bc the implementation of getting tr node from building and room is the same
    private getRoomsRecursiveHelper(node: any): any {
        let roomList: any[] = [];
        if (node !== null && node !== undefined) {
            if (node.nodeName === "tr" && node.parentNode.nodeName === "tbody") { // find tr nodes (table row)
                for (const otherTr of node.parentNode.childNodes) {
                    if (otherTr.nodeName === "tr") {
                        roomList.push(this.processRoom(otherTr));
                    }
                }
                return roomList;
            } else if (!node.childNodes) {
                return null; // there is no room (tr node) contained in this list
            } else {
                for (const childNode of node.childNodes) {
                    let child = this.getRoomsRecursiveHelper(childNode);
                    if (child !== null && child !== undefined) {
                        return child;
                    }
                }
            }
        } else {
            return null;
        }
    }

    private processRoom(trNode: any): any {
        let tdNodes: any[] = [];
        for (const child of trNode.childNodes) {
            if (child.nodeName === "td") {
                tdNodes.push(child);
            }
        }
        const roomCode: string = this.rg.getBuildingOrRoomName(tdNodes[0]);
        const capacity: number = Number(this.rg.getTextValue(tdNodes[1]));
        const furnitureType: string = this.rg.getTextValue(tdNodes[2]);
        const roomType: string = this.rg.getTextValue(tdNodes[3]);

        return [roomCode, capacity, furnitureType, roomType];
    }
}
