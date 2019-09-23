// AWS API actions
import {
	setIncomingSums, setExportPending, setSyncPending, setOptDeleted,
	doSnack, doSnackError
} from './actions';
import { postData, getData } from './apiActions';

export function getIncomingSums(access_token) {
	return function (dispatch) {
		// const url = (process.env.NODE_ENV === 'development') ?
		// 	'http://localhost:3030/export?method=GET&filename=incoming-summary-list.json'
		// 	: '';
		const url = 'https://pkvewvsg52.execute-api.eu-central-1.amazonaws.com/Prod/export?filename=incoming-summary-list.json';

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
		const url = 'https://pkvewvsg52.execute-api.eu-central-1.amazonaws.com/Prod/export';
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
		const url = 'https://pkvewvsg52.execute-api.eu-central-1.amazonaws.com/Prod/sync';

		dispatch(setSyncPending(true));
		dispatch(doSnack('Laatste stand van zaken van Moneybird ophalen'));
		getData(url, access_token)
			.then(res => {
				dispatch(setSyncPending(false));
				dispatch(setIncomingSums({
					incomingSums: res,
					lastSync: Date.now()
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
		const url = 'https://pkvewvsg52.execute-api.eu-central-1.amazonaws.com/Prod/export';

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
