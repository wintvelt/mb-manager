// voor actions die fetch enzo doen. Met middleware.
import {
	setAccessObject, passedTest, doSnackError,
	setLedgers,
	addIncoming, setIncomingLoading,
	addContacts, setCustomFields, setContactsLoading,
	addReceived
} from './actions';
import { setCookie } from './cookies';

const PERPAGE = 50;

const clientID = "2cb04d78d39dae63065ef873a1b909e8";
export const adminCode = "243231934476453244";

const base_url = 'https://moneybird.com/api/v2/' + adminCode;
const redir_url = 'http://localhost:3000/connection';
// const redir_url ='http://moblybird.com/connection';

// const access_token = "5c871550f446b557d9f48e89e899dd46bb7d1e058cb76dfa000394143681a9ae";

// does NOT update state
export function getRequestToken() {
	const url = 'https://moneybird.com/oauth/authorize?'
		+ 'client_id=' + clientID
		+ '&redirect_uri=' + redir_url
		+ '&response_type=code'
		+ '&scope=sales_invoices documents estimates bank settings';
	window.location.href = url;
	// fetch(url, {mode: 'no-cors', redirect: 'follow'})
	//   .then(res => {
	//   	window.location.href=res.url;
	//   });
}

// fetches Access Object + stores result (Access Object + reqToken) in store
export function setAccess(reqToken) {
	return function (dispatch) {
		// const url = 'https://moneybird.com/oauth/token';
		const url = 'https://60bl9ynygh.execute-api.eu-central-1.amazonaws.com/beta/mbGetAccess?code='
			+ reqToken;
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
				dispatch(setAccessObject(res));
			})
			.catch(error => {
				const msg = "Ophalen Access Object helaas mislukt. Server gaf foutmelding \""
					+ error.message + "\".";
				dispatch(doSnackError(msg));
			});
	}
}

export function testAccess() {
	return function (dispatch, getState) {
		const url = base_url + '/ledger_accounts/243957415182075767.json';
		const { accessObject } = getState();
		if (accessObject && accessObject.access_token) {
			return getData(url, accessObject.access_token)
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
		const { ledgers, accessObject } = getState();
		if (ledgers && accessObject.access_token) {
			return ledgers;
		} else {
			return getData(url, accessObject.access_token)
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

export function getIncoming(page = 1) {
	return function (dispatch, getState) {
		const url = base_url + '/documents/purchase_invoices.json';
		const { incoming, incomingLoaded, incomingLoading, accessObject } = getState();
		if (incoming && incomingLoaded && accessObject.access_token) {
			return incoming;
		}
		if (!incomingLoading.includes(page)) {
			dispatch(setIncomingLoading(page));
			const filter = "period:201801..201912";
			return getPagedList(url, accessObject.access_token, filter, page)
				.then(resultList => {
					dispatch(addIncoming({ incoming: resultList, incomingDate: Date.now(), page: page }));
					if (resultList.length > 0) {
						dispatch(getIncoming(page + 1));
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
		const { contacts, contactsLoaded, contactsLoading, accessObject } = getState();
		if (contacts && contactsLoaded && accessObject.access_token) {
			return contacts;
		}
		if (!contactsLoading.includes(page)) {
			dispatch(setContactsLoading(page));
			return getPagedList(url, accessObject.access_token, "", page)
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
		const { customFields, accessObject } = getState();
		if (customFields && accessObject.access_token) {
			return customFields;
		} else {
			return getData(url, accessObject.access_token)
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

export function getReceived(idList) {
	return function (dispatch, getState) {
		const { received, accessObject } = getState();
		if (received && accessObject.access_token && !idList) {
			return received;
		}
		if (!idList) {
			// fetch payment ids
			const url = base_url + '/financial_mutations/synchronization.json?filter=period:this_year';
			return getData(url, accessObject.access_token)
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
		return postData(newUrl, { ids: newIdList }, "POST", accessObject.access_token)
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
		const url = base_url + '/documents/purchase_invoices/' + incomingId + ".json";
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