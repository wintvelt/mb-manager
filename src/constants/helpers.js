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
// test voor classes
export class dataState {
    constructor(newData) {
        this._state = (newData)? 'HASDATA' : 'NOTASKED';
        this.data = newData;
    }
    setState({ state, data }) {
        this._state = state;
        this.data = data;
        return this;
    }
    hasData() {
        return (this._state === 'HASDATA' && this.data)
    }
}

dataState.ERROR = 'ERROR';
dataState.LOADING = 'LOADING';
dataState.NOTASKED = 'NOTASKED';
dataState.HASDATA = 'HASDATA';