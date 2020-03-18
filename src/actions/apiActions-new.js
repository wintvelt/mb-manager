// apiActions with New apiData lib
import { apiActionPaged, apiActionSync } from '../helpers/apiData/apiData-multi';
import { apiAction, apiActionManual } from '../helpers/apiData/apiData';
import { deleteCookie, setCookie } from '../store/cookies';
import { clientID, redir_url, accessViaAwsUrl } from './SECRETS';

import {
    SET_CONTACTS_NEW, SET_PAYMENTS_NEW, SET_ACCOUNTS_NEW,
    SET_RECEIPTS, SET_PURCHASE_INVOICES, SET_LEDGERS_NEW, SET_CUSTOM_FIELDS_NEW,
    SET_INCOMING_SUMS, SET_EXPORT_PENDING, SET_SYNC_PENDING, SET_OPT_DELETED,
    SET_BANK,
    SET_ACCESS_TOKEN, DO_SNACK_ERROR, DELETE_ACCESS_TOKEN,
    SET_REVENUE_CONFIG, SET_REVENUE_CONFIG_UPDATE,
    SET_VAT_EXPORT_LIST, SET_VAT_EXPORT_PENDING
} from '../store/action-types';
import { doSnack, doSnackError } from './actions';

export const adminCode = "243231934476453244";

export const getContacts = (access_token, pageFrom, pageTo) => apiActionPaged({
    url: 'https://moneybird.com/api/v2/243231934476453244/contacts?per_page=50&page=',
    headers: { Authorization: 'Bearer ' + access_token },
    pageFrom,
    pageTo,
    loadingMsg: 'contacten aan het ophalen.',
    storeAction: (payload) => {
        return { type: SET_CONTACTS_NEW, payload }
    }
});

const baseUrlAwsFinvisionExport = 'https://auhidn35t6.execute-api.eu-central-1.amazonaws.com/Prod/export';
const baseUrlAwsFinvisionSync = 'https://auhidn35t6.execute-api.eu-central-1.amazonaws.com/Prod/sync';
const baseUrlAwsSimpleDb = 'https://ocankaagm4.execute-api.eu-central-1.amazonaws.com/Prod/simpledb';
const baseUrlAwsBankmutations = 'https://3pfhatqis6.execute-api.eu-central-1.amazonaws.com/Prod';
const baseUrlAwsVatExport = 'https://nt74qhnjbh.execute-api.eu-central-1.amazonaws.com/dev/btw-export';

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
    url: baseUrlAwsFinvisionExport + '?filename=incoming-summary-list.json',
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
        const url = baseUrlAwsFinvisionExport;
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
        dispatch({ type: SET_SYNC_PENDING, payload: true });
        dispatch(doSnack('Laatste stand van zaken van Moneybird ophalen'));
        getData(baseUrlAwsFinvisionSync, access_token)
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
        const url = baseUrlAwsFinvisionExport;

        const body = { filename: filename };
        dispatch({ type: SET_OPT_DELETED, payload: filename });
        postData(url, body, "DELETE", access_token)
            .then(res => {
                dispatch({ type: SET_OPT_DELETED, payload: [] });
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
                dispatch({ type: SET_OPT_DELETED, payload: [] });
                const msg = "File deleten helaas mislukt met fout \""
                    + error.message + "\".";
                dispatch(doSnackError(msg));
            })
    }
}

export const setBank = payload => {
    return { type: SET_BANK, payload };
}

export const getBankActiveConfig = (active_account, access_token) => apiAction({
    url: baseUrlAwsBankmutations + '/config/' + active_account,
    headers: { Authorization: 'Bearer ' + access_token },
    loadingMsg: 'Csv-conversie-instellingen voor deze rekening ophalen.',
    storeAction: (payload) => {
        return setBank({ type: 'setConfig', content: payload })
    }
});

export const getBankActiveFiles = (active_account, access_token) => apiAction({
    url: baseUrlAwsBankmutations + '/files/' + active_account,
    headers: { Authorization: 'Bearer ' + access_token },
    loadingMsg: 'Even geduld terwijl we folderinhoud ophalen',
    storeAction: (payload) => {
        return setBank({ type: 'setFiles', content: payload })
    }
});

export const getCsv = (active_account, filename, access_token) => apiAction({
    url: baseUrlAwsBankmutations + '/files/' + active_account + '/' + filename,
    headers: { Authorization: 'Bearer ' + access_token },
    loadingMsg: 'Even geduld terwijl we csv bestand ophalen',
    storeAction: (payload) => {
        return setBank({
            type: 'setCsv', content: {
                apiAction: payload,
                filename
            }
        })
    }
});

export const setCsvManual = (filename, data) => {
    return setBank({
        type: 'setCsv',
        content: {
            apiAction: apiActionManual({ data }),
            filename
        }
    })
}

export const saveConfig = (active_account, body, access_token) => apiAction({
    url: baseUrlAwsBankmutations + '/config/' + active_account,
    method: 'POST',
    body,
    headers: { Authorization: 'Bearer ' + access_token },
    loadingMsg: 'Bezig met opslaan van conversie-configuratie..',
    storeAction: (content) => {
        return setBank({ type: 'setSavedConfig', content })
    }
});

export const setConfigManual = (data) => {
    return setBank({
        type: 'setConfig',
        content: apiActionManual({ data })
    })
}

export const convertCsv = (active_account, body, access_token, callback) => apiAction({
    url: baseUrlAwsBankmutations + '/convert/' + active_account,
    method: 'POST',
    body,
    headers: { Authorization: 'Bearer ' + access_token },
    loadingMsg: 'Bezig met converteren van csv bestand..',
    storeAction: (content) => {
        return setBank({ type: 'setConvertResult', content })
    },
    callback
});

export const resetConvertResult = () => {
    return setBank({
        type: 'resetConvertResult',
        content: null
    })
}

export const resetCsv = () => {
    return setBank({
        type: 'resetCsv',
        content: null
    })
}

export const deleteConvertFile = (active_account, filename, access_token, callback) => apiAction({
    url: baseUrlAwsBankmutations + '/convert/' + active_account,
    method: 'DELETE',
    body: { csv_filename: filename },
    headers: { Authorization: 'Bearer ' + access_token },
    loadingMsg: 'Bezig met verwijderen van csv bestand..',
    storeAction: (content) => {
        return setBank({ type: 'deleteFile', content })
    },
    callback
})

const configFilename = 'revenue-config.json';

// for revenue config
export const getRevenueConfig = () => apiAction({
    url: baseUrlAwsSimpleDb + '/' + configFilename,
    loadingMsg: 'Boekingsregels aan het ophalen.',
    storeAction: (payload) => {
        return { type: SET_REVENUE_CONFIG, payload }
    }
})

export const saveRevenueConfig = (id, data, callback) => apiAction({
    url: baseUrlAwsSimpleDb + '/' + configFilename + '/' + encodeURI(id),
    method: 'POST',
    body: data,
    headers: {},
    loadingMsg: 'Boekingsregel opslaan..',
    storeAction: (payload) => {
        return { type: SET_REVENUE_CONFIG_UPDATE, payload }
    },
    callback
})

export const deleteRevenueConfig = (id) => apiAction({
    url: baseUrlAwsSimpleDb + '/' + configFilename + '/' + encodeURI(id),
    method: 'DELETE',
    loadingMsg: 'Boekingsregel verwijderen..',
    storeAction: (payload) => {
        return { type: SET_REVENUE_CONFIG_UPDATE, payload }
    }
})

const env = () => {
    if (process.env.NODE_ENV !== 'production') {
        return 'dev';
    }
    return 'prod';
}

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

        const url = accessViaAwsUrl + '?code='
            + reqToken + '&env=' + env();
        fetch(url, {
            credentials: "same-origin"
        })
            .then(handleError)
            .then(res => {
                setCookie(res);
                dispatch({ type: SET_ACCESS_TOKEN, payload: apiActionManual({ data: res }) });
                dispatch(getAccounts(res));
            })
            .catch(error => {
                dispatch({ type: DELETE_ACCESS_TOKEN });
                const msg = "Verificatie van inlog mislukt. Server gaf foutmelding \""
                    + error.message + "\".";
                dispatch({ type: DO_SNACK_ERROR, payload: msg });
            });
    }
}

// initial POST command, returns promise
export function postData(url = '', data, method = "POST", access_token) {
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
        body: (data) ? JSON.stringify(data) : null // body data type must match "Content-Type" header
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

function handleError(res) {
    if (res.ok && res.status >= 200 && res.status <= 299) {
        return res.json();
    } else {
        throw Error('Request rejected with status: ' + res.status + " " + res.statusText);
    }
}

export const getVatExportData = (access_token, year) => apiAction({
    url: `${baseUrlAwsVatExport}/${adminCode}?year=${year}`,
    headers: { Authorization: 'Bearer ' + access_token },
    loadingMsg: 'export statistieken aan het ophalen.',
    storeAction: (payload) => {
        return { type: SET_VAT_EXPORT_LIST, payload }
    }
})

export function exportVat(body, year, access_token) {
    return function (dispatch) {
        const url = `${baseUrlAwsVatExport}/${adminCode}/export`;
        const periodStr =
            ((body.start_date) ? 'vanaf ' + body.start_date : '') +
            ((body.start_date && body.end_date) ? ' ' : '') +
            ((body.end_date) ? 'tot en met ' + body.end_date : '');
        dispatch({ type: SET_VAT_EXPORT_PENDING, payload: periodStr });
        dispatch(doSnack('Export wordt gemaakt voor periode ' + periodStr));
        postData(url, body, "POST", access_token)
            .then(res => {
                dispatch({ type: SET_VAT_EXPORT_PENDING, payload: '' });
                dispatch(doSnack('Export voor periode ' + periodStr + ' documenten klaar voor download'));
                dispatch(getVatExportData(access_token, year));
            })
            .catch(error => {
                const msg = "Export helaas mislukt met fout \""
                    + error.message + "\".";
                dispatch({ type: SET_VAT_EXPORT_PENDING, payload: '' });
                dispatch(doSnackError(msg));
            })
    }
}

export function deleteVatFile(filename, year, access_token) {
    return function (dispatch) {
        const url = `${baseUrlAwsVatExport}/${adminCode}/export/${encodeURI(filename)}`;
        const body = '';

        dispatch({ type: SET_OPT_DELETED, payload: filename });
        postData(url, body, "DELETE", access_token)
            .then(res => {
                setTimeout(() => {
                    dispatch(getVatExportData(access_token, year))
                    dispatch({ type: SET_OPT_DELETED, payload: [] });
                }, 30);

            })
            .catch(error => {
                dispatch({ type: SET_OPT_DELETED, payload: [] });
                const msg = "File deleten helaas mislukt met fout \""
                    + error.message + "\".";
                dispatch(doSnackError(msg));
            })
    }
}