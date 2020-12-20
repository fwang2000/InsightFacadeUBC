import Log from "../Util";
import { InsightError, InsightDataset, InsightDatasetKind } from "./IInsightFacade";
import { parse } from "path";
const JSZip = require("jszip");

export default class ProcessDataHelper {

    public numRows: number;

    constructor() {
        this.numRows = 0;
        Log.trace("DatasetController::init()");
    }

    public processData(id: string, parsedContent: any): any {
        let parsedCourse: any[] = [];   // course array containing data in each section (as an object {})

        const c1: string = id + "_dept";
        const c2: string = id + "_id";
        const c3: string = id + "_avg";
        const c4: string = id + "_instructor";
        const c5: string = id + "_title";
        const c6: string = id + "_pass";
        const c7: string = id + "_fail";
        const c8: string = id + "_audit";
        const c9: string = id + "_uuid";
        const c10: string = id + "_year";
        const sections = parsedContent.result;
        if (sections.length !== 0) {
            for (const section of sections) {
                if (this.containAllKeys(section)) {
                    let year: number;
                    let dataToBePushed: any = {};
                    if (section.Section === "overall") {
                        year = 1900;
                    } else {
                        year = Number(section.Year);
                    }
                    dataToBePushed[c1] = section.Subject;
                    dataToBePushed[c2] = section.Course;
                    dataToBePushed[c3] = section.Avg;
                    dataToBePushed[c4] = section.Professor;
                    dataToBePushed[c5] = section.Title;
                    dataToBePushed[c6] = section.Pass;
                    dataToBePushed[c7] = section.Fail;
                    dataToBePushed[c8] = section.Audit;
                    dataToBePushed[c9] = String(section.id);
                    dataToBePushed[c10] = year;
                    this.numRows++;
                    parsedCourse.push(dataToBePushed);
                }
            }
        }
        return parsedCourse;
    }

    private containAllKeys(section: any): boolean {

        return (section.Subject !== null &&
            section.Course !== null &&
            section.Avg !== null &&
            section.Professor !== null &&
            section.Title !== null &&
            section.Pass !== null &&
            section.Audit !== null &&
            section.id !== null &&
            section.Year !== null);
    }

    public loadDataset(id: string, content: string): any {

        let jszip = JSZip();
        let promises: any[] = [];
        let validFiles: any[] = [];

        return new Promise((resolve, reject) => {

            jszip.loadAsync(content, { base64: true }).then((zip: typeof JSZip) => {

                zip.folder("courses").forEach((relativePath: string, file: any) => {
                    // looping through all the files
                    if (file !== null) {

                        let resultArray = this.getParsedCourse(id, file, validFiles);
                        validFiles = resultArray[1];
                        promises.push(
                            resultArray[0]
                        );

                    }
                });
                Promise.all(promises).then(() => {

                    validFiles = this.filterCourses(validFiles);

                    let datasetInterface: InsightDataset = {

                        id: id,
                        kind: InsightDatasetKind.Courses,
                        numRows: this.numRows
                    };

                    this.numRows = 0;

                    let returned = [validFiles, datasetInterface];

                    return resolve(returned);
                }).catch((err: Error) => {

                    return reject(new InsightError(err));
                });

            }).catch((err: Error) => {
                return reject(new InsightError(err));
            });
        });
    }

    public getParsedCourse(id: string, file: any, validFiles: any[]): any {

        return [file.async("string").then((data: string) => { // each file is a course

            validFiles.push(this.handleFile(id, data));

        }), validFiles];
    }

    public filterCourses(validFiles: any[]): any {

        return validFiles.filter(
            (course: any) => course !== 0,
        );
    }

    public handleFile(id: string, data: string): any {

        try {

            let parsedContent = JSON.parse(data);    // parse data into JSON object

            if (parsedContent.result.length !== 0) {

                return this.processData(id, parsedContent);
            }

        } catch (err) {
            return 0;
        }
    }
}
