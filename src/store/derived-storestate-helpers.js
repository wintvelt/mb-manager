//derived-storestate-helpers.js

export const hasData = (store) => {
    const apiDataKeys = [
        { key: 'payments', isMulti: true },
        { key: 'contactsNew', isMulti: true },
        { key: 'accountsNew' },
        { key: 'receipts', isMulti: true },
        { key: 'purchaseInvoices', isMulti: true },
        { key: 'ledgersNew' },
    ];
    return apiDataKeys.reduce((res, entry) => {
        const hasData = entry.isMulti ?
            store[entry.key].get('apiData').toJS().hasData : store[entry.key].toJS().hasData
        return res || hasData;
    }, false) || store.accessVerified;
}