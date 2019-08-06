// data-helpers-exprt
// bevat ook tabel-bouw functies en tabel logica

import { tHead, tCell } from '../constants/table-helpers';

export const exportHeaders = [
    { value: "Bestand", shorten: false },
    { value: "Docs in bestand", align: "center" },
    "Factuurdatum vanaf", "tot en met",
    "Aangemaakt vanaf", "tot aan",
    { value: "Mutaties sinds export", align: "center" },
    { value: "clear", align: "center", sortable: false, icon: true }
].map(tHead);

const dataMap = [
    ["fileName"], ["docCount"], 
    ["invoiceFromTo", "min"], ["invoiceFromTo", "max"],
    ["createFromTo", "min"], ["createFromTo", "max"],
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
export function getFromSums(incomingSums, state, optDeleted) {
    const yearOptions = [...new Set(incomingSums.map(item => { 
        return item.createDate.slice(0, 4) }))].sort().reverse()
        .map(i => { return { value: i, label: i } });
    const selectedYear = state.selectedYear || yearOptions[0];
    var createFromTo = { min: "", max: "" };
    var invoiceFromTo = { min: "", max: "" };
    var unexportedCount = 0;
    var mutatedCount = 0;
    var docCount = 0;
    var fileStats = {}; // uses fileName as key
    var selStatObj = {
        mutatedCount: 0, docCount: 0, unexportedCount: 0,
        createFromTo: { min: "", max: "" },
        invoiceFromTo: { min: "", max: "" }
    };

    var selection = incomingSums.filter(item => {
        if (item.createDate.slice(0, 4) !== selectedYear.value) return false;
        const inState =
            (state.mutSelected === 'mut' && item.mutations.length > 0) ||
            (state.mutSelected === 'new' && (!item.fileName || optDeleted.includes(item.fileName))) ||
            (state.mutSelected === 'all');
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
        if (el.createDate.slice(0, 4) === selectedYear.value) {
            setMinMax(createFromTo, el.createDate.slice(0, 10));
            setMinMax(invoiceFromTo, el.invoiceDate);
            if (el.mutations && el.mutations.length > 0) {
                mutatedCount++;
            }
            if (!el.fileName) {
                unexportedCount++;
            }
            const fileList = el.allFiles || [];
            for (let j = 0; j < fileList.length; j++) {
                const expFileName = fileList[j];
                if (expFileName && !optDeleted.includes(expFileName)) {
                    // update filestats
                    var fileStatObj = fileStats[expFileName] ||
                        {
                            fileName: expFileName, mutatedCount: 0, docCount: 0,
                            createFromTo: { min: "", max: "" },
                            invoiceFromTo: { min: "", max: "" }
                        };
                    fileStatObj.docCount++;
                    setMinMax(fileStatObj.createFromTo, el.createDate.slice(0, 10));
                    setMinMax(fileStatObj.invoiceFromTo, el.invoiceDate);
                    // updated fileStat mutated count if needed
                    if (el.mutations && el.mutations.length > 0) {
                        fileStatObj.mutatedCount++;
                    }
                    // add file to stats if needed
                    if (!fileStats[expFileName]) { fileStats[expFileName] = fileStatObj }
                }
            }
            if (selection.includes(el.id)) {
                // update selStats
                selStatObj.docCount++;
                setMinMax(selStatObj.createFromTo, el.createDate.slice(0, 10));
                setMinMax(selStatObj.invoiceFromTo, el.invoiceDate);
                // updated fileStat mutated count if needed
                if (el.mutations && el.mutations.length > 0) {
                    selStatObj.mutatedCount++;
                }
                if (!el.fileName) selStatObj.unexportedCount++;
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
        fileStats: Object.keys(fileStats).map(key => fileStats[key]),
        selection: selection,
        selStats: selStatObj,
        selectedYear: selectedYear
    }
}

// helper to update min and max dates
// MUTABLE FUNCTION
function setMinMax(updatable = { min: "", max: "" }, dateValue) {
    if (!updatable.min || dateValue < updatable.min) { updatable.min = dateValue }
    if (!updatable.max || dateValue > updatable.max) { updatable.max = dateValue }
}
