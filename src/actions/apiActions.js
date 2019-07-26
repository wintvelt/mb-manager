// voor actions die fetch enzo doen. Met middleware.
import {
	setAccessToken,
	passedTest, doSnackError,
	setLedgers, setAccounts,
	addIncoming, setIncomingLoading,
	addContacts, setCustomFields, setContactsLoading,
	addReceived,
	setIncomingSums, setExportPending, setSyncPending, setOptDeleted,
	doSnack
} from './actions';
import { setCookie, deleteCookie } from './cookies';

const PERPAGE = 50;

export const adminCode = "243231934476453244";
const base_url = 'https://moneybird.com/api/v2/' + adminCode;

const clientID = () => {
	if (process.env.NODE_ENV !== 'production') {
		return '5da951a273977ed8f70d07b57aa31cc9';
	}
	return '2cb04d78d39dae63065ef873a1b909e8';
}

const redir_url = () => {
	if (process.env.NODE_ENV !== 'production') {
		return 'http://localhost:3000/connection';
	}
	return 'https://moblybird.com/connection';
}

const env = () => {
	if (process.env.NODE_ENV !== 'production') {
		return 'dev';
	}
	return 'prod';
}

// does not update store
export function getRequestToken() {
	// remove accessToken from cookie
	deleteCookie();
	const url = 'https://moneybird.com/oauth/authorize?'
		+ 'client_id=' + clientID()
		+ '&redirect_uri=' + redir_url()
		+ '&response_type=code'
		+ '&scope=sales_invoices documents estimates bank settings';
	window.location.href = url;
}

// fetches Access Object + save in cookie and store
export function setAccess(reqToken) {
	return function (dispatch) {

		// const url = 'https://moneybird.com/oauth/token';
		const url = 'https://60bl9ynygh.execute-api.eu-central-1.amazonaws.com/beta/mbGetAccess?code='
			+ reqToken + '&env=' + env();
		// const data = {
		// 	client_id : clientID,
		// 	client_secret : secretKey,
		// 	code : reqToken,
		// 	redirect_uri : redir_url,
		// 	grant_type : 'authorization_code'
		// };
		fetch(url, {
			credentials: "same-origin"
		})
			.then(handleError)
			.then(res => {
				setCookie(res);
				dispatch(setAccessToken(res));
			})
			.catch(error => {
				const msg = "Verificatie van inlog mislukt. Server gaf foutmelding \""
					+ error.message + "\".";
				dispatch(doSnackError(msg));
			});
	}
}

export function testAccess() {
	return function (dispatch, getState) {
		const url = base_url + '/ledger_accounts/243957415182075767.json';
		const { accessToken } = getState();
		if (accessToken) {
			return getData(url, accessToken)
				.then(contact => {
					dispatch(passedTest());
				}
				)
				.catch(error => {
					const msg = "Test is helaas mislukt. Server gaf foutmelding \""
						+ error.message + "\".";
					dispatch(doSnackError(msg))
				})
		} else { // access object not present or invalid
			const msg = "Test is helaas mislukt. Access Object is (toch) niet aanwezig, of niet correct.";
			dispatch(doSnackError(msg));
		}
	}
}

export function getLedgers() {
	return function (dispatch, getState) {
		const url = base_url + '/ledger_accounts.json';
		const { ledgers, accessToken } = getState();
		if (ledgers && accessToken) {
			return ledgers;
		} else {
			return getData(url, accessToken)
				.then(ledgers => {
					dispatch(setLedgers({ ledgers: ledgers, ledgerDate: Date.now() }));
				})
				.catch(error => {
					const msg = "Rekeningen ophalen helaas mislukt. Server gaf de fout \""
						+ error.message + "\".";
					dispatch(doSnackError(msg));
				})
		}
	}
}

export function getAccounts() {
	return function (dispatch, getState) {
		const url = base_url + '/financial_accounts.json';
		const { accounts, accessToken } = getState();
		if (accounts && accessToken) {
			return accounts;
		} else {
			return getData(url, accessToken)
				.then(accounts => {
					dispatch(setAccounts({ accounts: accounts, accountDate: Date.now() }));
				})
				.catch(error => {
					const msg = "Bankrekeningen ophalen helaas mislukt. Server gaf de fout \""
						+ error.message + "\".";
					dispatch(doSnackError(msg));
				})
		}
	}
}
export function getIncoming(incomingType, page = 1) {
	return function (dispatch, getState) {
		const url = base_url + '/documents/' + incomingType + 's.json';
		const { incoming, incomingLoaded, incomingLoading, accessToken } = getState();
		if (incoming && incomingLoaded[incomingType] && accessToken) {
			return incoming;
		}
		if (!incomingLoading[incomingType] || !incomingLoading[incomingType].includes(page)) {
			dispatch(setIncomingLoading({ incomingType: incomingType, page: page }));
			const filter = "period:201801..201912";
			return getPagedList(url, accessToken, filter, page)
				.then(resultList => {
					dispatch(addIncoming({
						incoming: resultList,
						incomingType: incomingType,
						incomingDate: Date.now(),
						page: page
					}));
					if (resultList.length > 0) {
						dispatch(getIncoming(incomingType, page + 1));
					}
				})
				.catch(error => {
					const msg = "Ophalen is helaas mislukt. Server gaf de fout \""
						+ error.message + "\".";
					dispatch(doSnackError(msg));
				});
		}
	}
}

export function getContacts(page = 1) {
	return function (dispatch, getState) {
		const url = base_url + '/contacts';
		const { contacts, contactsLoaded, contactsLoading, accessToken } = getState();
		if (contacts && contactsLoaded && accessToken) {
			return contacts;
		}
		if (!contactsLoading.includes(page)) {
			dispatch(setContactsLoading(page));
			return getPagedList(url, accessToken, "", page)
				.then(resultList => {
					dispatch(addContacts({ contacts: resultList, contactsDate: Date.now(), page: page }));
					if (resultList.length > 0) {
						dispatch(getContacts(page + 1));
					}
				})
				.catch(error => {
					const msg = "Ophalen is helaas mislukt. Server gaf de fout \""
						+ error.message + "\".";
					dispatch(doSnackError(msg));
				});
		}
	}
}

export function getCustomFields() {
	return function (dispatch, getState) {
		const url = base_url + '/custom_fields.json';
		const { customFields, accessToken } = getState();
		if (customFields && accessToken) {
			return customFields;
		} else {
			return getData(url, accessToken)
				.then(customFields => {
					dispatch(setCustomFields({
						customFields: customFields,
						customFieldsDate: Date.now()
					}));
				})
				.catch(error => {
					const msg = "Custom velden ophalen helaas mislukt. Server gaf de fout \""
						+ error.message + "\".";
					dispatch(doSnackError(msg));
				})
		}
	}
}

export function getIncomingSums(access_token) {
	return function (dispatch) {
		// const url = (process.env.NODE_ENV === 'development') ?
		// 	'http://localhost:3030/export?method=GET&filename=incoming-summary-list.json'
		// 	: '';
		const url = 'https://5ndk6t6lw4.execute-api.eu-central-1.amazonaws.com/Prod/export?filename=incoming-summary-list.json';

		return fetch(url, {
			mode: "cors", cache: 'no-cache', 
			// credentials: 'include',
			// headers: {
			// 	Authorization: "Bearer " + access_token // ACCESS_TOKEN
			// }
		})
			.then(res => res.json())
			.then(res => {
				dispatch(setIncomingSums({
					incomingSums: res.list,
					lastSync: res.syncDate
				}));
			})
			.catch(error => {
				const msg = "Ophalen van Moneybird documenten helaas mislukt met fout \""
					+ error.message + "\".";
				dispatch(doSnackError(msg));
			})
	}
}

export function exportDocs(body, access_token) {
	return function (dispatch) {
		// const url = (process.env.NODE_ENV === 'development') ?
		// 	'http://localhost:3030/export'
		// 	: 'https://5ndk6t6lw4.execute-api.eu-central-1.amazonaws.com/Prod/export/';
		const url = 'https://5ndk6t6lw4.execute-api.eu-central-1.amazonaws.com/Prod/export';
		dispatch(setExportPending(body.ids.length));
		dispatch(doSnack('Export wordt gemaakt voor ' + body.ids.length + ' document(en)'));
		postData(url, body, "POST", access_token)
			.then(res => {
				dispatch(setExportPending(0));
				dispatch(doSnack('Export met ' + body.ids.length + ' documenten klaar voor download'));
				dispatch(setIncomingSums({
					incomingSums: res
				}));
			})
			.catch(error => {
				const msg = "Export helaas mislukt met fout \""
					+ error.message + "\".";
				dispatch(setExportPending(0));
				dispatch(doSnackError(msg));
			})
	}
}

export function syncFiles(access_token) {
	return function (dispatch) {
		// const url = (process.env.NODE_ENV === 'development') ?
		// 	'http://localhost:3030/sync'
		// 	: 'https://';
		const url = 'https://5ndk6t6lw4.execute-api.eu-central-1.amazonaws.com/Prod/sync';

		dispatch(setSyncPending(true));
		dispatch(doSnack('Laatste stand van zaken van Moneybird ophalen'));
		getData(url, access_token)
			.then(res => {
				dispatch(setSyncPending(false));
				dispatch(setIncomingSums({
					incomingSums: res
				}));
			})
			.catch(error => {
				const msg = "Export helaas mislukt met fout \""
					+ error.message + "\".";
				dispatch(doSnackError(msg));
				dispatch(setSyncPending(false));
			})
	}
}

export function deleteFile(filename, access_token) {
	return function (dispatch) {
		// const url = (process.env.NODE_ENV === 'development') ?
		// 	'http://localhost:3030/export'
		// 	: 'https://';
		const url = 'https://5ndk6t6lw4.execute-api.eu-central-1.amazonaws.com/Prod/export';

		const body = { filename: filename };
		dispatch(setOptDeleted([filename]));
		postData(url, body, "DELETE", access_token)
			.then(res => {
				dispatch(setOptDeleted([]));
				dispatch(setIncomingSums({
					incomingSums: res
				}));
			})
			.catch(error => {
				dispatch(setOptDeleted([]));
				const msg = "File deleten helaas mislukt met fout \""
					+ error.message + "\".";
				dispatch(doSnackError(msg));
			})
	}
}

export function getReceived(idList) {
	return function (dispatch, getState) {
		const { received, accessToken } = getState();
		if (received && accessToken && !idList) {
			return received;
		}
		if (!idList) {
			// fetch payment ids
			const url = base_url + '/financial_mutations/synchronization.json?filter=period:this_year';
			return getData(url, accessToken)
				.then(idListRaw => {
					const idList = [...new Set(idListRaw.map(it => it.id))];
					if (idList.length > 0) {
						dispatch(getReceived(idList));
					}
				})
				.catch(error => {
					const msg = "Ophalen is helaas mislukt. Server gaf de fout \""
						+ error.message + "\".";
					dispatch(doSnackError(msg));
				});
		}
		// get payments from fetched ids
		const newIdList = idList.slice(0, PERPAGE);
		const nextIds = idList.slice(PERPAGE);
		const newUrl = base_url + '/financial_mutations/synchronization.json';
		return postData(newUrl, { ids: newIdList }, "POST", accessToken)
			.then(resultList => {
				dispatch(addReceived({ received: resultList, receivedDate: Date.now() }));
				if (nextIds.length > 0) {
					dispatch(getReceived(nextIds));
				}
			})
			.catch(error => {
				const msg = "Ophalen is helaas mislukt. Server gaf de fout \""
					+ error.message + "\".";
				dispatch(doSnackError(msg));
			});
	}
}

// returns promise
export function patchIncomingLedger(batchId, incomingId, body, access_token) {
	return function (dispatch) {
		const type = Object.keys(body)[0];
		const url = base_url + '/documents/' + type + 's/' + incomingId + ".json";
		return (
			postData(url, body, "PATCH", access_token)
				.then((res) => {
					// do OK message in dispatch { batchId, fetchId, res, msg }
					return {
						batchId: batchId,
						fetchId: incomingId,
						res: true,
						msg: "inkomende facturen bijgewerkt"
					};
				})
				.catch((err) => {
					return {
						batchId: batchId,
						fetchId: incomingId,
						res: true,
						msg: "regels zijn niet gelukt :("
					};
				})
		)
	}
}

// patches payment in incoming
export function patchPayment(batchId, incomingId, body, access_token) {
	return function (dispatch) {
		const url = base_url + '/documents/purchase_invoices/' + incomingId + "/payments.json";
		return (
			postData(url, body, "POST", access_token)
				.then((res) => {
					// do OK message in dispatch { batchId, fetchId, res, msg }
					return {
						batchId: batchId,
						fetchId: incomingId,
						res: true,
						error: false,
						msg: "betalingen toegevoegd"
					};
				})
		)
	}
}

// patches field in contact
export function patchContactField(batchId, contactId, body, access_token) {
	return function (dispatch) {
		const url = base_url + '/contacts/' + contactId + ".json";
		return (
			postData(url, body, "PATCH", access_token)
				.then((res) => {
					// do OK message in dispatch { batchId, fetchId, res, msg }
					return {
						batchId: batchId,
						fetchId: contactId,
						res: true,
						error: false,
						msg: "contacten bijgewerkt"
					};
				})
		)
	}
}

// initial POST command, returns promise
function postData(url = '', data = {}, method = "POST", access_token) {
	// Default options are marked with *
	return fetch(url, {
		method: method, // *GET, POST, PUT, DELETE, etc.
		mode: "cors", // no-cors, cors, *same-origin
		cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
		// credentials: "include", // include, *same-origin, omit
		headers: {
			"Content-Type": "application/json",
			Authorization: "Bearer " + access_token // ACCESS_TOKEN
			// "Content-Type": "application/x-www-form-urlencoded",
		},
		body: JSON.stringify(data) // body data type must match "Content-Type" header
	})
		.then(handleError)
}
// standard authenticated GET request, returns promise
function getData(url = '', access_token) {
	return fetch(url, {
		// credentials: "include", // include, *same-origin, omit
		headers: {
			Authorization: "Bearer " + access_token // ACCESS_TOKEN
		}
	})
		.then(handleError);
}

// recursive (chained) GET, for getting all pages, returns promise
function getPagedList(url = '', access_token, filter = "", page = 1) {
	const pagedUrl =
		(filter) ? url + '?per_page=' + PERPAGE + '&page=' + page + "&filter=" + filter
			: url + '?per_page=' + PERPAGE + '&page=' + page;
	return fetch(pagedUrl, {
		// credentials: "include", // include, *same-origin, omit
		headers: {
			Authorization: "Bearer " + access_token // ACCESS_TOKEN
		}
	})
		.then(handleError)
}

function handleError(res) {
	if (res.ok) {
		return res.json();
	} else {
		throw Error('Request rejected with status: ' + res.status + " " + res.statusText);
	}
}