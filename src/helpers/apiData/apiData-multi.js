// apiData-multi.js
// wrapper for paged apiData - works with:
// a) sequential page fetch or
// b) synced fetch of GET for ids, and post to get details
import { Map, fromJS, List } from 'immutable';
import {
    initApiData, apiAction, apiUpdate,
    INIT, SET_LOADING, SET_DATA, SET_ERROR
} from './apiData';
import { uniqByKey } from './apiData-helpers';

// data structure is the same as apiData, with in addition: hasAllData flag, rawData list of apiData, 
// and syncList if data is synced (first get list of IDs, then series of POST to get records)
export const initApiDataMulti = Map({
    apiData: initApiData,
    rawData: Map(),
    syncList: initApiData
})

// action types available for apiDataMulti
// INIT to reset an existing apiDataMulti object (and empty all data)
export const SET_PAGED = 'SET_PAGED'; // wrapper action to set a single apiData in rawDara
export const SET_DONE = 'SET_DONE'; // to indicate last page is in, no more data on server
export const SET_SYNC = 'SET_SYNC'; // to set sync list

// actions for this one would take the form of { type: .., payload: { page, apiAction }}
// SET_PAGED must have apiAction in payload
export const apiUpdateMulti = (state, action) => {
    const { type, payload } = action;
    const newLoadingMsg = (payload && payload.apiAction && payload.apiAction.payload &&
        payload.apiAction.payload.loadingMsg) ||
        (payload && payload.loadingMsg) ||
        state.getIn(['apiData', 'loadingMsg']);
    const newErrorMsg = (payload && payload.apiAction &&
        payload.apiAction.payload && payload.apiAction.payload.errorMsg) ||
        state.getIn(['apiData', 'errorMsg']);
    const time = Date.now();
    switch (type) {
        case INIT:
            return initApiDataMulti.set('time', time);

        case SET_LOADING:
            return state.mergeIn(['apiData'], {
                notAsked: false,
                isLoading: true,
                hasAllData: false,
                loadingMsg: newLoadingMsg
            });

        case SET_PAGED:
            const payloadWithData = (payload.apiAction.type === SET_DATA || payload.apiAction.type === SET_ERROR);
            const newState = state
                .updateIn(['rawData', payload.page], initApiData, (apiData) => apiUpdate(apiData, payload.apiAction));
            const newRawData = newState.get('rawData').toList();
            return (payloadWithData) ?
                newState.mergeIn(['apiData'], {
                    isLoading: true,
                    data: newRawData.map(it => it.get('data')).filter(it => List.isList(it)).flatten(1),
                    hasData: newRawData.find(v => v.get('hasData') === true) ? true : false,
                    hasError: newRawData.find(v => v.get('hasError') === true) ? true : false,
                    hasAllData: false,
                    loadingMsg: newLoadingMsg,
                    errorMsg: newErrorMsg,
                    time
                })
                : newState;

        case SET_SYNC: {
            const newState = state
                .updateIn(['syncList'], initApiData, (apiData) => apiUpdate(apiData, payload));
            const syncIsLoading = newState.getIn(['syncList', 'isLoading']);
            const syncHasAllData = newState.getIn(['syncList', 'hasAllData']);
            return (syncIsLoading) ?
                newState.mergeIn(['apiData'], apiFlagMulti('isLoading'))
                : (syncHasAllData) ?
                    newState.setIn(['apiData', 'dataLength'], newState.getIn(['syncList', 'data']).size)
                    : newState;
        }

        case SET_DONE:
            return state.mergeIn(['apiData'], {
                hasAllData: true,
                isLoading: false,
                time
            })

        default:
            console.log(`apiUpdateMulti called with invalid type "${type}"`);
            return state;
    }
}

// update function for apiData with multiple apiDataMulti
// to use when fetching more synced data
// action needs to be { key, apiAction } to store data
// no need for action type
export const apiUpdateMultiMulti = (state, action) => {
    const { key, apiAction } = action;
    // update the apiDataMulti at the key
    const newState = state
        .updateIn(['rawData', key], initApiDataMulti,
            (apiDataMulti) => apiUpdateMulti(apiDataMulti, apiAction));
    const hasRelevantUpdate = !state.getIn(['rawData', key]) || !state.getIn(['rawData', key, 'apiData'])
        .equals(newState.getIn(['rawData', key, 'apiData']));
    // derive the new global state
    const newRawData = newState.get('rawData').toList();
    const newLoadingMsg = (apiAction && apiAction.payload && apiAction.payload.loadingMsg ) || 
        state.getIn(['apiData', 'loadingMsg']);
    const newErrorMsg = (apiAction && apiAction.payload && apiAction.payload.errorMsg) || 
        state.getIn(['apiData', 'errorMsg']);

    return (hasRelevantUpdate) ?
        newState.mergeIn(['apiData'], {
            notAsked: false,
            isLoading: newRawData.find(v => v.getIn(['apiData', 'isLoading']) === true) ? true : false,
            data: newRawData.map(it => it.getIn(['apiData','data'])).filter(it => List.isList(it)).flatten(1),
            hasData: newRawData.find(v => v.getIn(['apiData', 'hasData']) === true) ? true : false,
            hasError: newRawData.find(v => v.getIn(['apiData', 'hasError']) === true) ? true : false,
            hasAllData: newRawData.find(v => v.getIn(['apiData', 'hasAllData']) === true) ? true : false,
            loadingMsg: newLoadingMsg,
            errorMsg: newErrorMsg,
            time: Date.now()
        })
        : newState;

}

// fetch API for pages x to y
export const apiActionPaged = (params) => {
    return (dispatch) => {
        const {
            url,
            pageFrom = 1,
            pageTo = 0,
            loadingMsg,
            storeAction,
            first = true
        } = params;
        // wrapped action to store page_fetch
        const pagedUrl = url + pageFrom;
        const pagedStoreAction = (action) => storeAction({
            type: SET_PAGED,
            payload: {
                page: pageFrom,
                apiAction: action
            }
        });
        const checkDone = (data) => {
            // if data and not last page
            if (data.length > 0 && (pageTo === 0 || pageFrom < pageTo)) {
                // do recursive call for next page
                const nextPage = pageFrom + 1;
                const nextParams = { ...params, pageFrom: nextPage, first: false };
                dispatch(apiActionPaged(nextParams)); // Do recursive call here
            } else {
                // set to Done: because we got empty page this was last page to get
                dispatch(storeAction({ type: SET_DONE }))
            }
        }
        // first: set to loading
        if (first) {
            dispatch(storeAction({ type: SET_LOADING, payload: { loadingMsg } }))
        }
        // then, do paged fetch
        dispatch(apiAction({
            ...params,
            url: pagedUrl,
            storeAction: pagedStoreAction,
            callback: checkDone
        }));
    }
}

// fetch API for synced call
export const apiActionSync = (params) => {
    return (dispatch) => {
        const {
            storeAction,
            loadingMsg
        } = params;
        // callback after last page is in
        const setDone = () => dispatch(storeAction({ type: SET_DONE }));
        // to recursively fetch chuncks of data
        const fetchData = (ids, page = 1) => {
            const callback = (ids.length > 50) ? () => fetchData(ids.slice(50), page + 1)
                : setDone;
            // wrapped action to store page_fetch
            const pagedStoreAction = (action) => storeAction({
                type: SET_PAGED,
                payload: {
                    page,
                    apiAction: action
                }
            });
            dispatch(apiAction({
                ...params,
                method: 'POST',
                body: { ids: ids.slice(0, 50) },
                storeAction: pagedStoreAction,
                callback
            }))
        }
        // to fetch the actual data after IDs are in
        const fetchAllData = (data) => {
            // cut list into chunks of pages
            const idList = data.map(it => it.id);
            // chained fetch of data
            fetchData(idList);
        }
        // do paged fetch
        dispatch(storeAction({ type: SET_LOADING, payload: { loadingMsg } }))
        dispatch(apiAction({
            ...params,
            storeAction: (action) => storeAction({ type: SET_SYNC, payload: action }),
            transform: (ids) => uniqByKey(ids, 'id'),
            callback: fetchAllData
        }));
    }
}



// helper for apiDataMulti (does not autoset hasAllData)
const apiFlagMulti = (flagId) => {
    return fromJS({
        notAsked: false,
        isLoading: false,
        hasData: false,
        hasError: false
    }).set(flagId, true);
}