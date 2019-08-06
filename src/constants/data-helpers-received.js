// data-helpers-received
// bevat ook tabel-bouw functies en tabel logica

import { tHead, tCell } from '../constants/table-helpers-2';

export const receivedHeaders = [
	"Key", 
	{ value: "check_box_outline_blank", align: "center", sortable: false, icon: true, width: "2em", column: 0 },
	{ value: "Datum", width: "8em", column: 1 },
	{ value: "Bedrag", align: "right", width: "7em", className: "large-text", amount: true, column: 2 },
	{ value: "Valuta", align: "right", width: "100%", amount: false, column: 2 },
	{ value: "Status", align: "center", label: true, width: "8em", column: 3 }, 
	{ value : "Van/ aan", shorten: false, width: "15em", column: 1 },
	{ value : "Omschrijving", shorten: false, className: "lowercase", column: 4 },
	{ value : "Rekening", shorten: false, column: 1 }
].map(tHead);

const receivedIds = [ 
	[ "id" ], null, [ "date" ], [ "amount" ], [ "currency" ], [ "state"], [ "message" ], [ "message"], [ "financial_account_id"]
];

export const receivedRows = (accountList, receivedList) => {
	const accounts = accountDict(accountList);
	if (!accountDict || !receivedList || receivedList.length === 0) return null;
	var outArr = [];
	for (let i = 0; i < receivedList.length; i++) {
		const item = receivedList[i];
		var outRow = [];
		for (let j = 0; j < receivedIds.length; j++) {
			const idArr = receivedIds[j];
			outRow.push(valToCell(mapToVal(idArr, j, item, accounts),j));
		}
		outArr.push(outRow);
	}
	return outArr;
}

// generic helpers, gets value (string or { value, href } from nested object based on key array
const getVal = (idArr, obj) => {
	if (obj && obj.hasOwnProperty(idArr[0])) {
		const val = obj[idArr[0]];
		if (idArr.length > 1) { 
			return getVal(idArr.slice(1,), val)
		} else {
			return val;
		}
	} else {
		return "(onbekend)";
	}
}

// Create our number formatter.
var formatter = new Intl.NumberFormat('nl-NL', {
	minimumFractionDigits: 2,
	});
	

// helpers to try to get name from description
const isMyNum = (val) => {
	return (val.length === 7 && /^\d+$/.test(val) && val.slice(0,3) === "201")
}

const initCaps = (txt) => {
	return txt.toLowerCase()
    .split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    .join(' ');
}

const makeStr = (initial, arr) => {
	if ( isMyNum(arr[0]) || arr[0] === "Express") return initCaps(initial);
	if ( arr.length === 1) return "";
	return makeStr( initial + " " + arr[0], arr.slice(1));
}

const tryName = (value) => {
	const arr = value.split(" ").slice(1,);
	if (value.toLowerCase().includes('facebk')) return 'Facebook';
	if (value.toLowerCase().includes('facebook')) return 'Facebook';
	if (value.toLowerCase().includes('transip')) return 'TransIP';
	if (value.toLowerCase().includes('skype.com')) return 'Skype';
	if (value.toLowerCase().includes('atlassian')) return 'Atlassian';
	if (value.toLowerCase().includes('totalfina belgium')) return 'TotalFina';
	if (value.toLowerCase().includes('impact software')) return 'Impact Software';
	if (value.toLowerCase().includes('msft')) return 'Microsoft';
	return makeStr("", arr);
}

// returns formatted string or { value, href }
// also room to change/ adapt any data in cell
const mapToVal = (idArr, i, item, accounts) => {
	if (!idArr) return "check_box_outline_blank"; // select field if no idArr
	const value = getVal(idArr, item);
	if (i === 3 && value) return formatter.format(value); // format amount
	if (i === 5 && value) { // for status unprocessed/processed
		return (value === "processed")? "done" : "open";
	}
	if (i === 6 && value) return tryName(value); // try to extract name
	if (i === 8) return accounts[value];

	return value;
}

const valToCell = (val, i) => {
    // this is the place to convert values to something else
    return tCell(val);
}

// to get account names from ID
export const accountDict = (accountList = []) => {
	if (!accountList) return {};
	return accountList.reduce( (obj, account) => {
		const newObj = Object.assign({},obj);
		newObj[account.id] = account.name;
		return newObj;
	},{})
}