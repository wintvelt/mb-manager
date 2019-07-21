// data-helpers-exprt
// bevat ook tabel-bouw functies en tabel logica

import { tHead, tCell } from '../constants/table-helpers';

export const exportHeaders = [
    { value: "Bestand", shorten: false}, 
    { value: "Docs in bestand", align: "center" },
    "Documenten vanaf", "tot aan",
    "met Factuurdatum vanaf", "tot en met",
    { value: "Mutaties sinds export", align: "center" },
    { value: "clear", align: "center", sortable: false, icon: true }
].map(tHead);

const dataMap = [
    ["fileName"], ["docCount"], [ "createFromTo", "min" ], [ "createFromTo", "max" ],
    [ "invoiceFromTo", "min" ], [ "invoiceFromTo", "max" ],    
    ["mutatedCount"],
    null
];

export const exportRows = (dataList) => {
    return dataList.map((dataItem, i) => {
        const rowValues = dataMap.map((idArr, j) => mapToVal(idArr, j, dataItem));
        return rowValues.map((val, k) => valToCell(val, k));
    });
}

// generic helpers, gets value (string or { value, href } from nested object based on key array
const getVal = (idArr, obj) => {
    if (obj && obj.hasOwnProperty(idArr[0])) {
        const val = obj[idArr[0]];
        if (idArr.length > 1) {
            return getVal(idArr.slice(1), val)
        } else {
            return val;
        }
    } else {
        return "(onbekend)";
    }
}

// returns formatted string or { value, href }
// also room to change/ adapt any data in cell
const mapToVal = (idArr, i, dataItem) => {
    if (!idArr) return "delete"; // delete field if no idArr
    const value = getVal(idArr, dataItem);
    if (typeof value === 'number') return value.toString();
    return value;
}

const valToCell = (val, i) => {
    if (i === 0) { // return link
        return tCell({
            value: val,
            href: 'https://moblybird-export-files.s3.eu-central-1.amazonaws.com/' + val
        })
    }
    return tCell(val);
}


// function to extract stuff to render
// to extract info from incomingSums
// USES MUTABLES INSIDE
export function getFromSums(incomingSums, state) {
    const yearOptions = [...new Set(incomingSums.map(item => { return item.invoiceDate.slice(0,4) }))].sort().reverse()
        .map(i => { return { value: i, label: i } });
    const selectedYear = state.selectedYear || yearOptions[0];
    var createFromTo = { min: "", max: "" };
    var invoiceFromTo = { min: "", max: "" };
    var unexportedCount = 0;
    var mutatedCount = 0;
    var docCount = 0;
    var fileStats = {}; // uses fileName as key
    var selection = incomingSums.filter(item => {
        if (item.invoiceDate.slice(0, 4) !== selectedYear.value) return false;
        const inState = (state.mutSelected && item.mutations.length > 0) || (!state.mutSelected && !item.fileName);
        const inCreatedFrom = (!state.createFrom || state.createFrom.length < 7) ||
            (item.createDate >= state.createFrom);
        const inCreatedTo = (!state.createTo || state.createTo.length < 7) ||
            (item.createDate.slice(0, state.createTo.length) <= state.createTo);
        const inInvoiceFrom = (!state.invoiceFrom || state.invoiceFrom.length < 7) ||
            (item.invoiceDate >= state.invoiceFrom);
        const inInvoiceTo = (!state.invoiceTo || state.invoiceTo.length < 7) ||
            (item.invoiceDate.slice(0, state.invoiceTo.length) <= state.invoiceTo);
        return inState && inCreatedFrom && inCreatedTo && inInvoiceFrom && inInvoiceTo;
    }).map(item => item.id);
    for (let i = 0; i < incomingSums.length; i++) {
        const el = incomingSums[i];
        if (el.invoiceDate.slice(0, 4) === selectedYear.value) {
            setMinMax(createFromTo, el.createDate.slice(0, 10));
            setMinMax(invoiceFromTo, el.invoiceDate);
            if (el.fileName) {
                // update filestats
                var fileStatObj = fileStats[el.fileName] ||
                    {
                        fileName: el.fileName, mutatedCount: 0, docCount: 0,
                        createFromTo: { min: "", max: "" },
                        invoiceFromTo: { min: "", max: "" }
                    };
                fileStatObj.docCount++;
                setMinMax(fileStatObj.createFromTo, el.createDate.slice(0, 10));
                setMinMax(fileStatObj.invoiceFromTo, el.invoiceDate);
                // updated fileStat and overall mutated count if needed
                if (el.mutations && el.mutations.length > 0) {
                    mutatedCount++;
                    fileStatObj.mutatedCount++;
                }
                // add file to stats if needed
                if (!fileStats[el.fileName]) { fileStats[el.fileName] = fileStatObj }
            } else {
                unexportedCount++;
            }
            docCount++;
        }
    }
    return {
        yearOptions: yearOptions,
        createFromTo: createFromTo,
        invoiceFromTo: invoiceFromTo,
        docCount: docCount,
        unexportedCount: unexportedCount,
        mutatedCount: mutatedCount,
        fileStats: Object.keys(fileStats).map(key => fileStats[key]).sort().reverse(),
        selection: selection,
        selectedYear: selectedYear
    }
}

// helper to update min and max dates
// MUTABLE FUNCTION
function setMinMax(updatable = { min: "", max: "" }, dateValue) {
    if (!updatable.min || dateValue < updatable.min) { updatable.min = dateValue }
    if (!updatable.max || dateValue > updatable.max) { updatable.max = dateValue }
}
