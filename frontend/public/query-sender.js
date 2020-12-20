/**
 * Receives a query object as parameter and sends it as Ajax request to the POST /query REST endpoint.
 *
 * @param query The query object
 * @returns {Promise} Promise that must be fulfilled if the Ajax request is successful and be rejected otherwise.
 */
CampusExplorer.sendQuery = (query) => {
    return new Promise((resolve, reject) => {
        // TODO: implement!
        console.log("CampusExplorer.sendQuery");

        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/query");
        xhr.onload = function() {
            let result = JSON.parse(xhr.responseText);
            if (typeof result.status !== "undefined" && result.status === "OK") {
                resolve(result);
            } else {
                Log.trace("error2: " + result)
                reject({ error: "response code not 200" });
            }
        };

        xhr.addEventListener("error", (err) => {
            Log.trace("errrrrr: " + err);
            reject({ error: err });
        });
        xhr.send(JSON.stringify(query));
    });
};
