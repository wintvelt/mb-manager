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
    constructor(newData, time) {
        this._state = (newData) ? 'DONE' : 'NOTASKED';
        this._loading = [];
        this.data = newData;
        this.time = (newData) ? Date.now() : time;
    }
    setLoading(page = 1) {
        this._state = 'LOADING';
        this.data = (this._loading.length === 0) ? null : this.data;
        this._loading = [...this._loading, page];
        return this;
    }
    add(data, page = 1) {
        this._loading = this._loading.filter(it => (it !== page));
        this._state = (this._loading.length === 0) ? 'DONE' : 'LOADING';
        this.data = (this.data) ? [...this.data, ...data] : [...data];
        this.time = Date.now();
        return this;
    }
    setNew(data, time) {
        this._state = 'DONE';
        this._loading = [];
        this.data = data;
        this._time = (time)? time : Date.now();
        return this;
    }
    setError() {
        this._state = 'ERROR';
        return this;
    }
    set(something) {
        if (something.LOADING) return this.setLoading();
        if (something.ERROR) return this.setError();
        return this.setNew(something);
    }
    // check for state
    hasData() {
        return (this.data);
    }
    hasAllData() {
        return (this._state === 'DONE')
    }
    hasError() {
        return (this._state === 'ERROR')
    }
    isLoading() {
        return (this._state === 'LOADING')
    }
    notAsked() {
        return (this._state === 'NOTASKED')
    }
}