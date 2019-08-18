// helpers.js
import moment from 'moment';
import 'moment/locale/nl';
import React from 'react';

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
export const initApiDataFlags = {
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
        notAsked: false,
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
    const newAllData = onlyNew(newData, apiData.data);
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

// Component for loading state of API
export const loadComp = (apiEl, txtLoading, txtError, txtOK) => {
    return (
        (apiEl.hasData) ?
            <p className="flex"><i className="material-icons green-text">done</i>
                <span>{apiEl.data.length + " " + txtOK + " - " +
                    since(apiEl.time)}</span></p>
            : (apiEl.hasError) ?
                <p className="flex"><i className="material-icons red-text">warning</i>
                    <span>{txtError}</span></p>
                :
                <p className="flex"><i className="material-icons grey-text">radio_button_unchecked</i>
                    <span>{txtLoading}</span></p>
    );
}

function onlyNew(oldList = [], newList = []) {
    var cleanOldList = [];
    for (let i = 0; i < oldList.length; i++) {
        const oldEl = oldList[i];
        var isInNew = false;
        for (let j = 0; j < newList.length; j++) {
            const newEl = newList[j];
            if (oldEl.id === newEl.id) isInNew = true;
        }
        if (!isInNew) cleanOldList.push(oldEl);
    }
    return [...cleanOldList, ...newList];
}