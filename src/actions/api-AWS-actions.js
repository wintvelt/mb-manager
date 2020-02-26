// AWS API actions
import {
	setIncomingSums, doSnackError
} from '../actions/actions';

const baseUrlAWS = 'https://uh211h81ig.execute-api.eu-central-1.amazonaws.com/Prod/export';

export function getIncomingSums(access_token) {
	return function (dispatch) {
		// const url = (process.env.NODE_ENV === 'development') ?
		// 	'http://localhost:3030/export?method=GET&filename=incoming-summary-list.json'
		// 	: '';
		const url = baseUrlAWS+'?filename=incoming-summary-list.json';

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

