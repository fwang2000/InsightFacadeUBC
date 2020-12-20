import Log from "../Util";
const http = require("http");

export default class RoomDataStructure {

    constructor() {
        Log.trace("DatasetController::init()");
    }

    public parseRoomDataset(roomList: any, id: any): any {
        let parsedRooms: any[] = [];   // new room list

        // return new Promise((resolve1, reject) => {
        for (const room of roomList) {
            parsedRooms.push(this.parseIndividualRoom(room, id));
        }

        return parsedRooms;
        //     Promise.all(parsedRooms).then((values: any) => {
        //         values = values.filter((value: any) =>
        //             (value !== null && value !== undefined && value !== []));
        //         return resolve1(values);
        //     });
        // });
    }

    private parseIndividualRoom(room: any, id: string): Promise<any> {
        let dataToBePushed: any = {};
        const c1: string = id + "_fullname";
        const c2: string = id + "_shortname";
        const c3: string = id + "_number";
        const c4: string = id + "_name";
        const c5: string = id + "_address";
        const c6: string = id + "_lat";
        const c7: string = id + "_lon";
        const c8: string = id + "_seats";
        const c9: string = id + "_type";
        const c10: string = id + "_furniture";
        const c11: string = id + "_href";

        let seat: number = 0;
        if (room[7] !== null) {
            seat = room[7];
        } else {
            seat = 0;
        }

        // return new Promise((resolve2, reject) => {

        //     this.getGeolocation(room[3]).then((geolocation: any) => {
        //         if (geolocation !== null && geolocation !== undefined && !geolocation.error) {
        dataToBePushed[c1] = room[2];
        dataToBePushed[c2] = room[1];
        dataToBePushed[c3] = String(room[6]);
        dataToBePushed[c4] = room[1] + "_" + room[6]; // room name is shortname_number
        dataToBePushed[c5] = room[3];
        dataToBePushed[c6] = room[4];
        dataToBePushed[c7] = room[5];
        dataToBePushed[c8] = Number(seat);
        dataToBePushed[c9] = room[9];
        dataToBePushed[c10] = room[8];
        dataToBePushed[c11] = "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/"
            + room[1] + "-" + room[6];

        return dataToBePushed;
        //         } else {
        //             return resolve2(null);
        //         }
        //         }).catch((err: any) => {
        //             Log.trace(err); // pass this room, cus can't get geodata for the building
        //             return resolve2(null);
        //         });
        // });
    }

    // private getGeolocation(address: string): Promise<any> {
    //     let url = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team153/" + this.encodeAddress(address);

    //     return new Promise((resolve3, reject) => {
    //         http.get(url, (res: any) => {
    //             // const { statusCode } = res;
    //             if (res.statusCode === 404 && res.statusCode === 400) {
    //                 return reject("invalid address");
    //             } else {
    //                 res.setEncoding("utf8");
    //                 let geoData = "";
    //                 res.on("data", (chunk: any) => {
    //                     geoData = chunk;
    //                 });
    //                 res.on("end", () => {
    //                   try {
    //                     const parsedData = JSON.parse(geoData);
    //                     // Log.trace(parsedData);
    //                     return resolve3(parsedData);
    //                   } catch (e) {
    //                     Log.trace(e);
    //                     return reject("parse error");
    //                     // return resolve3(null);
    //                   }
    //                 });
    //             }
    //         }).on("error", (err: any) => {
    //             Log.trace(err);
    //             return reject("time out");
    //             // return resolve3(null);
    //           });
    //     });
    // }

    // private encodeAddress(address: string): string {
    //     return address.split(" ").join("%20");
    // }
}
