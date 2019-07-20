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