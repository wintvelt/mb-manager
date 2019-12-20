// apiData.js
// the source of all the helper objects and functions
import clsx from 'clsx';
import { fromJS } from 'immutable';


export const initApiData = fromJS({
    notAsked: true,
    isLoading: false,
    hasData: false,
    hasAllData: false, // for apiDataMulti
    dataLength: 0, // for apiDataMulti Synced
    hasError: false,
    loadingMsg: '',
    errorMsg: '',
    data: null,
    id: '',
    time: null
});

// action types available for apiData
export const INIT = 'INIT'; // to reset an existing apiData object
export const SET_LOADING = 'SET_LOADING'; // to set the apiData to loading (with id)
export const SET_DATA = 'SET_DATA'; // to set the (success) data results from API call (with id)
export const SET_ERROR = 'SET_ERROR'; // if the API call resulted in error (with id)
const OVERRIDE = 'OVERRIDE'; // to manually override ID check

export const apiUpdate = (state, action) => {
    const { type, payload } = action;
    switch (type) {
        case INIT:
            return initApiData
                .set('time', (payload && payload.time) || Date.now())
                .set('id', (payload && payload.id) || '');

        case SET_LOADING:
            return (initApiData
                .merge(apiFlag('isLoading'))
                .set('loadingMsg', payload.loadingMsg)
                .set('id', payload.id)
                .set('time', payload.time)
            );

        case SET_DATA: {
            const stateId = state.get('id');
            if (payload.id !== OVERRIDE && stateId && payload.id !== stateId) {
                console.log(`tried to update apiData of id "${stateId}" with new data of id "${payload.id}"`);
                return state;
            }
            return (state
                .merge(apiFlag('hasData'))
                .set('data', fromJS(payload.data))
                .set('time', payload.time || Date.now())
            );
        }

        case SET_ERROR: {
            const stateId = state.get('id');
            if (stateId && payload.id !== stateId) {
                console.log(`tried to update apiData of id "${stateId}" with error of id "${payload.id}"`);
                return state;
            }
            return (state
                .merge(apiFlag('hasError'))
                .set('errorMsg', payload.errorMsg)
                .set('time', payload.time || Date.now())
                .set('id', payload.id)
            );
        }

        default:
            console.log(`apiUpdate called with invalid type "${type}"`);
            return state;
    }
}

// fetch API
export const apiAction = (params) => {
    return (dispatch) => {
        const {
            url,
            method = 'GET',
            headers,
            body,
            storeAction,
            errorMsg,
            loadingMsg,
            callback = null,
            transform = (data) => (data)
        } = params;
        const safeBody = (!body || typeof body === 'string') ? body : JSON.stringify(body);
        const id = url + ' ' + safeBody;
        let newHeaders = headers;
        if (body) {
            newHeaders['Content-Type'] = 'application/json';
            newHeaders['Content-Length'] = safeBody.length;
        }
        dispatch(storeAction({ type: SET_LOADING, payload: { loadingMsg, id } }));
        return fetch(url, {
            mode: "cors", cache: 'no-cache',
            method,
            body: safeBody,
            headers: newHeaders
        })
            .then(res => {
                if (res.ok && res.status >= 200 && res.status <= 299) {
                    const contentType = res.headers.get('content-type');
                    if (contentType.startsWith('application/json')) {
                        // return res.json();
                        return res.text();
                    } else {
                        return res.text()
                    };
                } else {
                    return res.text()
                        .then(msg => {
                            const fullErrorMsg = clsx(errorMsg, res.status, res.statusText, msg);
                            console.log({ error: fullErrorMsg });
                            dispatch(storeAction({ type: SET_ERROR, payload: { errorMsg: fullErrorMsg, id } }));
                            return '';
                        })
                }
            })
            .then(string => {
                if (string === '') return; // error message already handled, abort here
                let data;
                try {
                    data = JSON.parse(string)
                } catch (error) {
                    data = (string === 'no data') ? '' : string;
                }
                const newData = transform(data);
                dispatch(storeAction({ type: SET_DATA, payload: { id, data: newData } }));
                if (callback) {
                    return callback(newData);
                };
            })
            .catch(err => {
                console.log({url});
                const rawError = err.toString();
                const isTypeError = rawError === 'TypeError: Failed to fetch';
                const newError = isTypeError ?
                    url.includes('moneybird') ? 'Kan geen verbinding maken met Moneybird'
                        : 'databestanden voor Moblybird helaas niet beschikbaar'
                    : rawError;
                const fullErrorMsg = (errorMsg || '') + newError;
                console.log({ err, error: fullErrorMsg });
                dispatch(storeAction({ type: SET_ERROR, payload: { errorMsg: fullErrorMsg, id } }));
            })
    }
}

// helper to uniquely set one flag
const apiFlag = (flagId) => {
    const newObj = fromJS({
        notAsked: false,
        isLoading: false,
        hasData: false,
        hasError: false,
        [flagId]: true
    })
    return newObj.set('hasAllData', newObj.get('hasData'));
}

export const apiActionManual = params => {
    const { data } = params;
    const id = OVERRIDE;
    return { type: SET_DATA, payload: { id, data } }
}