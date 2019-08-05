// helpers.js
import moment from 'moment';
import 'moment/locale/nl';

export const since = (date) => {
    moment.locale('nl');
    return (date) ?
        moment(date).fromNow()
        : "nooit";
}

export const uniqByKey = (arr, key) => {
    var seen = {};
    var out = [];
    var len = arr.length;
    var j = 0;
    for (var i = 0; i < len; i++) {
        var item = arr[i][key];
        if (seen[item] !== 1) {
            seen[item] = 1;
            out[j++] = arr[i];
        }
    }
    return out;
}

// turns URL search parameter string into object
export const paramToObj = (str) => {
    if (str) {
        var search = str.substring(1);
        return JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g, '":"') + '"}',
            function (key, value) { return key === "" ? value : decodeURIComponent(value) });
    }
    return {}
}


// helper for better loading experience
// immutable, otherwise store breaks (misses re-renders)
const initApiDataFlags = {
    notAsked: false,
    isLoading: false,
    hasData: false,
    hasAllData: false,
    hasError: false
}

const initApiData = Object.assign({
    data: null,
    loading: {},
    time: null
}, initApiDataFlags)

export const newApiData = (data, time, type) => {
    const hasData = (data) ? true : false;
    const newData = (type && data) ? data.map(it => Object.assign({}, it, { type: type })) : data;
    return Object.assign({}, initApiData, {
        notAsked: !hasData,
        hasData: hasData,
        data: newData,
        time: (!time && data) ? Date.now() : null
    })
}

export const api = {
    setLoading,
    addData,
    setData,
    setError,
    set
}

function setLoading(apiData, page = 1, type) {
    const newType = type || 'NOTYPE';
    const loadingList = apiData.loading[newType] || [];
    var newLoading = Object.assign({}, apiData.loading);
    newLoading[newType] = [...loadingList, page];
    return Object.assign({}, apiData, {
        isLoading: true,
        hasError: false,
        loading: newLoading
    })
}

function addData(apiData, data, type, page = 1) {
    const newType = type || 'NOTYPE';
    const loadingList = apiData.loading[newType] || [];
    var newLoading = Object.assign({}, apiData.loading);
    newLoading[newType] = loadingList.filter(it => (it !== page));
    const loadingCount = Object.keys(newLoading)
        .reduce((prev, key) => prev + newLoading[key].length, 0);
    const newData = (data) ? data.map(it => Object.assign({}, it, { type: type })) : [];
    const newAllData = (apiData.data) ? [...new Set([...apiData.data, ...newData])] : [...newData];
    return Object.assign({}, apiData, initApiDataFlags, {
        isLoading: !(loadingCount === 0),
        hasAllData: (loadingCount === 0),
        hasData: (newAllData.length > 0),
        data: newAllData,
        loading: newLoading,
        time: Date.now()
    });
}

function setData(data, time) {
    return Object.assign({}, initApiData, {
        hasData: true,
        hasAllData: true,
        data: data,
        time: (time) ? time : Date.now()
    });
}

function setError(apiData) {
    return Object.assign({}, apiData, initApiDataFlags, {
        hasError: true
    })
}

function set(apiData, something) {
    if (something.LOADING) return setLoading(apiData, something.page, something.type);
    if (something.ERROR) return setError(apiData);
    if (something.type && something.stuff) {
        return addData(apiData, something.stuff, something.type, something.page)
    };
    return this.setData(something);
}