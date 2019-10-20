//derived-storestate-helpers.js

export const hasData = (store) => {
    const apiDataKeys = [
        {key: 'payments', isMulti: true},
        {key: 'contactsNew', isMulti: true},
        {key: 'accountsNew'}
    ];
    return apiDataKeys.reduce((res, entry) => {
        const hasData = entry.isMulti? 
            store[entry.key].get('apiData').toJS().hasData : store[entry.key].toJS().hasData
        return res || hasData;
    },false)
}