/**
 * Builds a query object using the current document object model (DOM).
 * Must use the browser's global document object {@link https://developer.mozilla.org/en-US/docs/Web/API/Document}
 * to read DOM information.
 *
 * @returns query object adhering to the query EBNF
 */
CampusExplorer.buildQuery = () => {

    let id = "";
    let query = {};
    let where = {};
    let options = {};
    let transformations = {};

    if (document.getElementById("tab-courses").classList.contains("active")) {

        id = "courses";
        where = createCoursesWhere(id);
        transformations = createTransformations(id);
        options = createOptions(id);

    } else if (document.getElementById("tab-rooms").classList.contains("active")) {

        id = "rooms";
        where = createRoomsWhere(id);
        transformations = createTransformations(id);
        options = createOptions(id);
    }

    query["WHERE"] = where;
    query["OPTIONS"] = options;

    if (transformations) {
        query["TRANSFORMATIONS"] = transformations;
    }

    return query;
};

function createCoursesWhere(id) {

    let mfields = ["audit", "pass", "fail", "avg", "year"];
    return createWhere(id, mfields);
}

function createRoomsWhere(id) {

    let mfields = ["lat", "lon", "seats"];
    return createWhere(id, mfields);
}

function createWhere(id, mfields) {

    let where = {};

    let controlAll = document.getElementById(id + "-conditiontype-all");
    let controlNone = document.getElementById(id + "-conditiontype-none");
    let controlAny = document.getElementById(id + "-conditiontype-any");

    let whereResult = getFilters(id, mfields);

    if (whereResult.length === 0) {

        return where;
    }

    if (whereResult.length === 1) {

        if (controlNone.checked) {

            where["NOT"] = whereResult[0];

        } else {

            where = whereResult[0];
        }

    } else if (controlAll.checked) {

        where["AND"] = whereResult;

    } else if (controlAny.checked) {

        where["OR"] = whereResult;

    } else if (controlNone.checked) {

        where["NOT"] = { "OR": whereResult }
    }

    return where;
}

function getFilters(id, mfields) {

    let tab = document.getElementById("tab-" + id);
    let array = [];

    let filters = tab.querySelectorAll("div.condition");

    for (let filter of filters) {

        let filterObject = {};
        let fields = filter.querySelector("div[class='control fields']");
        let field = fields.querySelector("option[selected='selected']").value;
        let fullfield = id + "_" + field;

        let operators = filter.querySelector("div[class='control operators']");
        let operator = operators.querySelector("option[selected='selected']").value;

        let term = filter.querySelector("div[class='control term']").querySelector("input").value;
        console.log(field);
        if (mfields.includes(field) && term !== "") {

            let numTerm = Number(term);
            if (!isNaN(numTerm)) {

                term = numTerm;
            }
        }

        let filterInternal = {};
        filterInternal[operator] = {};
        filterInternal[operator][fullfield] = term;

        let notExists = filter.querySelector("div[class='control not']").querySelector("input").checked;
        if (notExists) {

            filterObject["NOT"] = filterInternal;

        } else {

            filterObject = filterInternal;
        }
        array.push(filterObject);
    }
    return array;
}

function createOptions(id) {

    let options = {};

    let columns = [];
    let tab = document.getElementById("tab-" + id);
    let fields = tab.querySelector("div[class='form-group columns']").querySelectorAll("div.field");

    for (let field of fields) {

        if (field.querySelector("input").checked) {

            let fullfield = id + "_" + field.querySelector("input").value;
            columns.push(fullfield);
        }
    }

    let transformations = tab.querySelector("div[class='form-group columns']").querySelectorAll("div.transformation");

    for (let transform of transformations) {

        if (transform.querySelector("input").checked) {

            columns.push(transform.querySelector("input").value);
        }
    }

    let dir = "UP";
    let order = tab.querySelector("div[class='form-group order']")
    let keysSelected = order.querySelectorAll("option[selected='selected']");
    let keys = [];
    for (let key of keysSelected) {

        if (key.classList.contains("transformation")) {

            keys.push(key.value);

        } else {

            keys.push(id + "_" + key.value);
        }
    }
    console.log(order.querySelector("input[id='" + id + "-order']"));
    if (order.querySelector("input[id='" + id + "-order']").checked) {

        dir = "DOWN";
    }

    options["COLUMNS"] = columns;
    if (keys.length > 0) {

        let orderQuery = {};
        orderQuery["dir"] = dir;
        orderQuery["keys"] = keys;
        options["ORDER"] = orderQuery;
    }

    return options;
}

function createTransformations(id) {

    let transformations = {};

    let apply = [];

    let tab = document.getElementById("tab-" + id);

    let transformation = tab.querySelectorAll("div.control-group.transformation");

    for (let transform of transformation) {

        let transformObject = {};
        let fields = transform.querySelector("div[class='control fields']");
        let field = fields.querySelector("option[selected='selected']").value;
        let fullfield = id + "_" + field;

        let operators = transform.querySelector("div[class='control operators']");
        let operator = operators.querySelector("option[selected='selected']").value;

        let applykey = transform.querySelector("div[class='control term']").querySelector("input").value;

        transformObject[applykey] = {};
        transformObject[applykey][operator] = fullfield;
        apply.push(transformObject);
    }

    let group = [];
    let fields = tab.querySelector("div[class='form-group groups']").querySelectorAll("div.field");

    for (let field of fields) {

        if (field.querySelector("input").checked) {

            let fullfield = id + "_" + field.querySelector("input").value;
            group.push(fullfield);
        }
    }

    if (group.length === 0 && apply.length === 0) {

        return false;
    }

    if (group.length !== 0) {

        transformations["GROUP"] = group;
    }

    if (apply.length !== 0) {

        transformations["APPLY"] = apply;
    }

    return transformations;
}
