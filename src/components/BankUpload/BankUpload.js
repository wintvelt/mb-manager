// For converting csv files with bank transactions and uploading to moneybird
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getAccounts, getBankActiveConfig, getBankActiveFiles, setBank } from '../../actions/apiActions-new';
// import { ActiveAccount } from './BankUpload-ActiveAccount';
import { DataPanel } from '../Page/DataPanel';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';


const useStyles = makeStyles(theme => ({
    root: {
        width: '100%'
    }
}));

const Bankmutations = (props) => {
    const admin = (props.location && props.location.search && props.location.search === '?admin=true');
    const { accountsNew, bankData, accessToken } = useSelector(store => {
        const { accountsNew, bankData, accessToken } = store;
        return { accountsNew, bankData, accessToken };
    });
    const accounts = accountsNew.toJS();
    const access_token = accessToken.data;
    const activeAccount = bankData && bankData.activeAccount;
    const active_account =  activeAccount && activeAccount.value;
    const dispatch = useDispatch();

    const classes = useStyles();

    useEffect(() => {
        if (accounts.notAsked) dispatch(getAccounts(access_token))
    }, [accounts, access_token, dispatch]);
    useEffect(() => {
        if (active_account) {
            dispatch(getBankActiveConfig(active_account));
            dispatch(getBankActiveFiles(active_account));
        }
    }, [active_account, dispatch])
    const onChange = (value) => {
        dispatch(setBank({ type: 'setActiveAccount', content: value }))
    }

    return <div className={classes.root}>
        <DataPanel expanded={false} onChange={() => {
            //
        }}
            title={`Upload van transacties van rekening ${activeAccount && activeAccount.label}`}
            apiDataSources={[]}
            apiTitles={['statistieken']}
            flat
        >
            {true ?
                <Button color='primary'>
                    Data ophalen
        </Button>
                : <></>}
        </DataPanel>
        
    </div>
}
//     if (accounts.hasData) return (
//         <div className="container">
//             <h4>Transacties van rekening {accountComp(accounts.data, bankData.activeAccount, onChange)}</h4>
//             <ActiveAccount bankData={bankData} admin={admin} />
//         </div>
//     );
//     if (accessToken.hasData && !accounts.hasError) return (
//         // loading screen
//         <div className="container">
//             <div className="section">
//                 <h4>Transacties uploaden</h4>
//                 <p className="flex">
//                     <span>Nog even gegevens van bankrekeningen aan het ophalen..</span>
//                 </p>
//             </div>
//             <div className="divider"></div>
//             <div className="section center">
//                 <div className="progress">
//                     <div className="indeterminate"></div>
//                 </div>
//             </div>
//         </div>
//     );
// };

export default Bankmutations;


// Helpers for components
const accountOptions = (accountData) => {
    return accountData
        .filter(account => (account.active))
        .map(account => { return { value: account.id, label: account.name } })
}

// const accountComp = (accountData, selected, onChange) => {
//     const options = accountOptions(accountData);
//     return (options.length > 1) ?
//         <div style={{ display: "inline-block", width: "320px" }}>
//             <Select
//                 options={options}
//                 styles={customStyles}
//                 defaultValue={selected}
//                 onChange={onChange}
//                 name="bankrekening"
//                 className='inline_select'
//                 classNamePrefix='inline_select'
//             />
//         </div>
//         : options[0].value;
// }


// // styling for select
// const customStyles = {
//     control: (base, state) => ({
//         ...base,
//         height: '42px',
//         minHeight: '42px'
//     }),
//     container: (base) => ({
//         ...base,
//         height: '42px',
//         marginRight: '8px'
//     })
// };
