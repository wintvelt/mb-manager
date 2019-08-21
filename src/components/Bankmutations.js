// For converting csv files with bank transactions and uploading to moneybird
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMBAPI, fetchAWSAPI } from '../actions/apiActions-Bank';
import { setAccounts, setBank } from '../actions/actions';
import Select from 'react-select';
import { ActiveAccount } from './Bankmutations-ActiveAccount';

let counter = 0;
const maxCounter = 100;

const Bankmutations = () => {
    counter++;
    console.log('rendering ' + counter);
    const { accounts, bankData, accessToken } = useSelector(store => store);
    const dispatch = useDispatch();
    if (accounts.notAsked && counter < 20) fetchData(accounts, accessToken, dispatch);
    if (bankData.activeAccount && bankData.config.notAsked && counter < maxCounter) {
        console.log('fetching details');
        fetchActiveStuff(bankData, accessToken, dispatch)
    };
    const onChange = (value) => {
        dispatch(setBank({ type: 'setActiveAccount', content: value }))
    }

    if (accounts.hasData) return (
        <div className="container">
            <h4>Betalingen van rekening {accountComp(accounts.data, bankData.activeAccount, onChange)}</h4>
            <ActiveAccount bankData={bankData}/>
        </div>
    );
    if (accessToken.hasData && !accounts.hasError) return (
        // loading screen
        <div className="container">
            <div className="section">
                <h4>Betalingen uploaden</h4>
                <p className="flex">
                    <span>Nog even gegevens van bankrekeningen aan het ophalen..</span>
                </p>
            </div>
            <div className="divider"></div>
            <div className="section center">
                <div className="progress">
                    <div className="indeterminate"></div>
                </div>
            </div>
        </div>

    );
    // no data, no connection
    return (
        <div className="container">No connection</div>
    );

};

export default Bankmutations;

// helpers for API
const fetchData = (accounts, accessToken, dispatch) => {
    const getAccountsParams = {
        stuff: accounts,
        path: '/financial_accounts.json',
        storeSetFunc: setAccounts,
        errorMsg: 'Fout bij ophalen bankrekeningen. Melding van Moneybird: ',
        accessToken,
        dispatch,
    }
    fetchMBAPI(getAccountsParams);
}

const fetchActiveStuff = (bankData, accessToken, dispatch) => {
    const getConfigOptions = {
        stuff: bankData.config,
        path: '/config/' + bankData.activeAccount.value,
        storeSetFunc: (content) => setBank({ type: 'setConfig', content}),
        errorMsg: 'Fout bij ophalen config, melding van AWS: ',
        accessToken,
        dispatch,
    }
    fetchAWSAPI(getConfigOptions);
    const getFilesOptions = {
        stuff: bankData.files,
        path: '/files/' + bankData.activeAccount.value,
        storeSetFunc: (content) => setBank({ type: 'setFiles', content}),
        errorMsg: 'Fout bij ophalen files, melding van AWS: ',
        accessToken,
        loadingMsg: 'Even geduld terwijl we folderinhoud ophalen',
        dispatch,
    }
    fetchAWSAPI(getFilesOptions);
}

// Helpers for components
const accountOptions = (accountData) => {
    return accountData.map(account => { return { value: account.id, label: account.name } })
}

const accountComp = (accountData, selected, onChange) => {
    const options = accountOptions(accountData);
    return (options.length > 1) ?
        <div style={{ display: "inline-block", width: "300px" }}>
            <Select
                options={options}
                styles={customStyles}
                defaultValue={selected}
                onChange={onChange}
                name="bankrekening"
                className='inline_select'
                classNamePrefix='inline_select'
            />
        </div>
        : options[0].value;
}


// styling for select
const customStyles = {
    control: (base, state) => ({
        ...base,
        height: '42px',
        minHeight: '42px'
    }),
    container: (base) => ({
        ...base,
        height: '42px',
        marginRight: '8px'
    })
};
