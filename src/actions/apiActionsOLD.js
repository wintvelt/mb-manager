// voor actions die fetch enzo doen. Met middleware.
import {
	setAccessToken, deleteAccessToken,
	testConnection, doSnackError
} from './actions';
import { setCookie, deleteCookie } from '../store/cookies';

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
		if (!stuff) console.log('DID NOT FIND dataState in Store for field "'+storeField+'"', path);
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
		storeField: 'ledgers',
		path: '/ledger_accounts/243957415182075767.json',
		storeSetFunc: testConnection,
		errorMsg: 'Connectie met Moneybird mislukt. Probeer het opnieuw of log uit en in'
	}
	return getMBOnce(params);
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