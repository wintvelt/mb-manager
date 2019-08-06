// voor actions die fetch enzo doen. Met middleware.
import {
	setAccessToken, deleteAccessToken,
	testConnection, doSnackError,
	setLedgers, setAccounts,
	addIncoming,
	addContacts, setCustomFields,
	addReceived
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
				dispatch(deleteAccessToken());
				const msg = "Verificatie van inlog mislukt. Server gaf foutmelding \""
					+ error.message + "\".";
				dispatch(doSnackError(msg));
			});
	}
}

// (url, name of ding uit state, setfunc in store, foutmelding)
function getMBOnce({ storeField, path, storeSetFunc, errorMsg }) {
	return function (dispatch, getState) {
		const url = base_url + path;
		const storeState = getState();
		const accessToken = storeState.accessToken;
		const stuff = (storeField)? storeState[storeField] : '';
		if (!stuff) console.log('DID NOT FIND dataState in Store for field "'+storeField+'"');
		if (stuff.hasData && accessToken.hasData) return stuff;

		dispatch(storeSetFunc({ LOADING: true }));
		return getData(url, accessToken.data)
			.then(stuffData => {
				dispatch(storeSetFunc(stuffData));
			})
			.catch(err => {
				dispatch(storeSetFunc({ ERROR: true }));
				const msg = errorMsg + '"' + err.message + '"';
				dispatch(doSnackError(msg));
			})
	}
}
export function testAccess() {
	const params = {
		storeField: '',
		path: '/ledger_accounts/243957415182075767.json',
		storeSetFunc: testConnection,
		errorMsg: 'Connectie met Moneybird mislukt. Probeer het opnieuw of log uit en in'
	}
	return getMBOnce(params);
}


export function getLedgers() {
	const params = {
		storeField: 'ledgers',
		path: '/ledger_accounts.json',
		storeSetFunc: setLedgers,
		errorMsg: 'Fout bij ophalen rekeningen. Melding van Moneybird: '
	}
	return getMBOnce(params);
}

export function getAccounts() {
	const params = {
		storeField: 'accounts',
		path: '/financial_accounts.json',
		storeSetFunc: setAccounts,
		errorMsg: 'Fout bij ophalen bankrekeningen. Melding van Moneybird: '
	}
	return getMBOnce(params);
}

export function getCustomFields() {
	const params = {
		storeField: 'customFields',
		path: '/custom_fields.json',
		storeSetFunc: setCustomFields,
		errorMsg: 'Fout bij ophalen custom fields. Melding van Moneybird: '
	}
	return getMBOnce(params);
}


// Get paged data from Moneybird
function getMBMulti(params) {
	const { storeField, path, storeSetMultiFunc, filter, errorMsg, type, page } = params;
	return function (dispatch, getState) {
		const url = base_url + path;
		const storeState = getState();
		const accessToken = storeState.accessToken;
		const stuff = storeState[storeField];
		if (!stuff) console.log('DID NOT FIND dataState in Store');
		if (stuff.hasAllData && accessToken.hasData) return stuff;

		dispatch(storeSetMultiFunc({ LOADING: true, type, page }));
		return getPagedList(url, accessToken.data, filter, page)
			.then(resultList => {
				dispatch(storeSetMultiFunc({ stuff: resultList, type, page }));
				if (resultList.length > 0) {
					dispatch(getMBMulti({ ...params, page: page + 1 }));
				}
			})
			.catch(err => {
				dispatch(storeSetMultiFunc({ ERROR: true }));
				const msg = errorMsg + '"' + err.message + '"';
				dispatch(doSnackError(msg));
			})
	}
}

export function getContacts() {
	const params = {
		storeField: 'accounts',
		path: '/contacts',
		storeSetMultiFunc: addContacts,
		errorMsg: 'Fout bij ophalen contacten. Melding van Moneybird: ',
		type: 'contacts',
		page: 1
	}
	return getMBMulti(params);
}

export function getIncoming(incomingType) {
	const params = {
		storeField: 'incoming',
		path: '/documents/' + incomingType + 's.json',
		filter: 'period:201801..201912',
		storeSetMultiFunc: addIncoming,
		errorMsg: 'Fout bij ophalen inkomende facturen. Melding van Moneybird: ',
		type: incomingType,
		page: 1
	}
	return getMBMulti(params);
}


export function getReceived(idList) {
	return function (dispatch, getState) {
		const { received, accessToken } = getState();
		if (received.hasData && accessToken.hasData && !idList) {
			return received;
		}
		if (!idList) {
			// fetch payment ids
			const url = base_url + '/financial_mutations/synchronization.json?filter=period:this_year';
			return getData(url, accessToken.data)
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
		return postData(newUrl, { ids: newIdList }, "POST", accessToken.data)
			.then(resultList => {
				dispatch(addReceived({stuff: resultList, type: 'received'}));
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
export function postData(url = '', data = {}, method = "POST", access_token) {
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
export function getData(url = '', access_token) {
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