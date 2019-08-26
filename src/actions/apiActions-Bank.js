// specifically for Bank (with hooks)
import { doSnackError } from '../actions/actions';

// returns accounts or fetches them from store - to use with hooks
// hope this works
export const fetchMBAPI = (params) => {
    const adminCode = "243231934476453244";
    const base_url_MB = 'https://moneybird.com/api/v2/' + adminCode;

    const options = Object.assign({}, params, { url: base_url_MB + params.path });
    return fetchAPI(options);
}

export const fetchAWSAPI = (params) => {
    // const base_url_AWS = 'https://87xzyymsji.execute-api.eu-central-1.amazonaws.com/Prod';
    const base_url_AWS = 'http://localhost:3030';
    const url = base_url_AWS + params.path;

    const options = Object.assign({}, params, { url });
    return fetchAPI(options);
}


const fetchAPI = ({ stuff, url, accessToken, dispatch, storeSetFunc, 
    errorMsg, method = 'GET', body, loadingMsg, callback=null }) => {
    console.log('fetching: '+url);
    if (stuff.hasData && accessToken.hasData) console.log('fetching again');
    const safeBody = (!body || typeof body === 'string') ? body : JSON.stringify(body);
    dispatch(storeSetFunc({ LOADING: true, loadingMsg, origin: url }));
    return fetch(url, {
        mode: "cors", cache: 'no-cache',
        method,
        body: safeBody,
        headers: { Authorization: 'Bearer ' + accessToken.data }
    })
        .then(res => {
            if (res.ok) {
                return res.text();
            } else {
                return res.text()
                    .then(errorMsg => {
                        throw new Error(errorMsg);
                    })
            }
        })
        .then(string => {
            try {
                return JSON.parse(string)
            } catch (error) {
                return string;
            }
        })
        .then(stuffData => {
            dispatch(storeSetFunc({ data: stuffData, origin: url }));
            if (callback) {
                return callback(stuffData);
            };
        })
        .catch(err => {
            dispatch(storeSetFunc({ ERROR: true, message: err.message, origin: url }));
            const msg = errorMsg + '"' + err.message + '"';
            console.error({error: msg});
            dispatch(doSnackError(msg));
        })
}