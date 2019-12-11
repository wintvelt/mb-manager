// apiActions with New apiData lib
import { apiActionPaged, apiActionSync } from '../helpers/apiData/apiData-multi';
import { apiAction, apiActionManual } from '../helpers/apiData/apiData';
import { postData, getData } from './apiActions';

import {
    SET_CONTACTS_NEW, SET_PAYMENTS_NEW, SET_ACCOUNTS_NEW,
    SET_RECEIPTS, SET_PURCHASE_INVOICES, SET_LEDGERS_NEW, SET_CUSTOM_FIELDS_NEW,
    SET_INCOMING_SUMS, SET_EXPORT_PENDING, SET_SYNC_PENDING, SET_OPT_DELETED,
    SET_BANK
} from '../store/action-types';
import { doSnack, doSnackError } from './actions';

export const getContacts = (access_token, pageFrom, pageTo) => apiActionPaged({
    url: 'https://moneybird.com/api/v2/243231934476453244/contacts?per_page=50&page=',
    headers: { Authorization: 'Bearer ' + access_token },
    pageFrom,
    pageTo,
    loadingMsg: 'contacten aan het ophalen.',
    storeAction: (payload) => {
        return { type: SET_CONTACTS_NEW, payload }
    }
})

export const getPayments = (access_token, periodFilter = 'this_quarter', extraFilters = '') => {
    return apiActionSync({
        url: 'https://moneybird.com/api/v2/243231934476453244/financial_mutations/synchronization.json' +
            `?filter=period:${periodFilter}${extraFilters}`,
        headers: { Authorization: 'Bearer ' + access_token },
        storeAction: (payload) => {
            return { type: SET_PAYMENTS_NEW, payload: { key: periodFilter, apiAction: payload } }
        },
        loadingMsg: 'betalingen aan het ophalen.'
    })
}

export const getAccounts = (access_token) => apiAction({
    url: 'https://moneybird.com/api/v2/243231934476453244/financial_accounts.json',
    headers: { Authorization: 'Bearer ' + access_token },
    loadingMsg: 'bankrekeningen aan het ophalen.',
    storeAction: (payload) => {
        return { type: SET_ACCOUNTS_NEW, payload }
    }
})

export const getReceipts = (access_token, periodFilter = 'this_quarter', extraFilters = '') => {
    return apiActionSync({
        url: 'https://moneybird.com/api/v2/243231934476453244/documents/receipts/synchronization.json' +
            `?filter=period:${periodFilter}${extraFilters}`,
        headers: { Authorization: 'Bearer ' + access_token },
        storeAction: (payload) => {
            return { type: SET_RECEIPTS, payload: { key: periodFilter, apiAction: payload } }
        },
        loadingMsg: 'bonnetjes aan het ophalen.'
    })
}

export const getPurchaseInvoices = (access_token, periodFilter = 'this_quarter', extraFilters = '') => {
    return apiActionSync({
        url: 'https://moneybird.com/api/v2/243231934476453244/documents/purchase_invoices/synchronization.json' +
            `?filter=period:${periodFilter}${extraFilters}`,
        headers: { Authorization: 'Bearer ' + access_token },
        storeAction: (payload) => {
            return { type: SET_PURCHASE_INVOICES, payload: { key: periodFilter, apiAction: payload } }
        },
        loadingMsg: 'bonnetjes aan het ophalen.'
    })
}

export const getLedgers = (access_token) => apiAction({
    url: 'https://moneybird.com/api/v2/243231934476453244/ledger_accounts.json',
    headers: { Authorization: 'Bearer ' + access_token },
    loadingMsg: 'categorieën aan het ophalen.',
    storeAction: (payload) => {
        return { type: SET_LEDGERS_NEW, payload }
    }
})

export const getCustomFields = (access_token) => apiAction({
    url: 'https://moneybird.com/api/v2/243231934476453244/custom_fields.json',
    headers: { Authorization: 'Bearer ' + access_token },
    loadingMsg: 'custom velden aan het ophalen.',
    storeAction: (payload) => {
        return { type: SET_CUSTOM_FIELDS_NEW, payload }
    }
})

export const getIncomingSums = () => apiAction({
    url: 'https://pkvewvsg52.execute-api.eu-central-1.amazonaws.com/Prod/export?filename=incoming-summary-list.json',
    loadingMsg: 'statistieken van export aan het ophalen.',
    storeAction: (payload) => {
        return { type: SET_INCOMING_SUMS, payload }
    }
})

export function exportDocs(body, access_token) {
    return function (dispatch) {
        // const url = (process.env.NODE_ENV === 'development') ?
        // 	'http://localhost:3030/export'
        // 	: 'https://5ndk6t6lw4.execute-api.eu-central-1.amazonaws.com/Prod/export/';
        const url = 'https://pkvewvsg52.execute-api.eu-central-1.amazonaws.com/Prod/export';
        dispatch({ type: SET_EXPORT_PENDING, payload: body.ids.length });
        dispatch(doSnack('Export wordt gemaakt voor ' + body.ids.length + ' document(en)'));
        postData(url, body, "POST", access_token)
            .then(res => {
                dispatch({ type: SET_EXPORT_PENDING, payload: 0 });
                dispatch(doSnack('Export met ' + body.ids.length + ' documenten klaar voor download'));
                dispatch({
                    type: SET_INCOMING_SUMS,
                    payload: apiActionManual({
                        data: {
                            list: res,
                            syncDate: Date.now()
                        }
                    })
                });
            })
            .catch(error => {
                const msg = "Export helaas mislukt met fout \""
                    + error.message + "\".";
                dispatch({ type: SET_EXPORT_PENDING, payload: 0 });
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

        dispatch({ type: SET_SYNC_PENDING, payload: true });
        dispatch(doSnack('Laatste stand van zaken van Moneybird ophalen'));
        getData(url, access_token)
            .then(res => {
                dispatch({ type: SET_SYNC_PENDING, payload: false });
                dispatch({
                    type: SET_INCOMING_SUMS,
                    payload: apiActionManual({
                        data: {
                            list: res,
                            syncDate: Date.now()
                        }
                    })
                });
            })
            .catch(error => {
                const msg = "Export helaas mislukt met fout \""
                    + error.message + "\".";
                dispatch(doSnackError(msg));
                dispatch({ type: SET_SYNC_PENDING, payload: false });
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
        dispatch({type: SET_OPT_DELETED, payload: filename});
        postData(url, body, "DELETE", access_token)
            .then(res => {
                dispatch({type: SET_OPT_DELETED, payload: []});
                dispatch({
                    type: SET_INCOMING_SUMS,
                    payload: apiActionManual({
                        data: {
                            list: res,
                            syncDate: Date.now()
                        }
                    })
                });
            })
            .catch(error => {
                dispatch({type: SET_OPT_DELETED, payload: []});
                const msg = "File deleten helaas mislukt met fout \""
                    + error.message + "\".";
                dispatch(doSnackError(msg));
            })
    }
}

const base_url_AWS_Bank = 'https://87xzyymsji.execute-api.eu-central-1.amazonaws.com/Prod';

export const setBank = payload => {
    return { type: SET_BANK, payload };
}

export const getBankActiveConfig = (active_account) => apiAction({
    url: base_url_AWS_Bank + '/config/' + active_account,
    loadingMsg: 'Csv-conversie-instellingen voor deze rekening ophalen.',
    storeAction: (payload) => {
        return setBank({ type: 'setConfig', content: payload })
    }
});

export const getBankActiveFiles = (active_account) => apiAction({
    url: base_url_AWS_Bank + '/files/' + active_account,
    loadingMsg: 'Even geduld terwijl we folderinhoud ophalen',
    storeAction: (payload) => {
        return setBank({ type: 'setFiles', content: payload })
    }
});
