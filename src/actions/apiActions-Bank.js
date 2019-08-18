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
    const base_url_AWS = 'https://87xzyymsji.execute-api.eu-central-1.amazonaws.com/Prod';
    const url = base_url_AWS + params.path;

    const options = Object.assign({}, params, { url });
    return fetchAPI(options);
}


const fetchAPI = ({ stuff, url, accessToken, dispatch, storeSetFunc, errorMsg }) => {
    if (stuff.hasData && accessToken.hasData) return;
    dispatch(storeSetFunc({ LOADING: true }));
    return getData(url, accessToken.data)
        .then(res => res.json())
        .then(stuffData => {
            dispatch(storeSetFunc(stuffData));
        })
        .catch(err => {
            dispatch(storeSetFunc({ ERROR: true }));
            const msg = errorMsg + '"' + err.message + '"';
            dispatch(doSnackError(msg));
        })
}

const getData = (url, access_token) => {
    return fetch(url, {
        mode: "cors", cache: 'no-cache',
        headers: {
            Authorization: 'Bearer ' + access_token // ACCESS_TOKEN
        }
    })
}

