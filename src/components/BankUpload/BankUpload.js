// For converting csv files with bank transactions and uploading to moneybird
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { getAccounts, getBankActiveConfig, getBankActiveFiles, setBank } from '../../actions/apiActions-new';
import { ActiveAccount } from './BankUpload-ActiveAccount';
import { DataPanel } from '../Page/DataPanel';
import { AccountOptions } from './BankUpload-AccountOptions';

import { makeStyles } from '@material-ui/core/styles';


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
    const active_account = activeAccount && activeAccount.value;
    const dispatch = useDispatch();

    const classes = useStyles();

    useEffect(() => {
        if (accounts.notAsked) dispatch(getAccounts(access_token))
    }, [accounts, access_token, dispatch]);
    useEffect(() => {
        if (active_account && access_token) {
            dispatch(getBankActiveConfig(active_account, access_token));
            dispatch(getBankActiveFiles(active_account, access_token));
        }
    }, [active_account, access_token, dispatch])
    const onChangeAccount = (value) => {
        dispatch(setBank({ type: 'setActiveAccount', content: value }))
    }
    const [dataPanelOpen, setDataPanelOpen] = useState(false);
    return <div className={classes.root}>
        <DataPanel expanded={dataPanelOpen} onChange={() => {
            setDataPanelOpen(!dataPanelOpen)
        }}
            title={`Rekening ${activeAccount && activeAccount.label}`}
            noCountTitle
            apiDataSources={[accountsNew, bankData.config, bankData.files]}
            apiTitles={[
                'beschikbare rekeningen',
                `upload-gegevens voor ${activeAccount && activeAccount.label}`,
                `bestanden van ${activeAccount && activeAccount.label}`]}
            actionsInSummary
        >
            <AccountOptions accounts={accounts} activeValue={active_account} onChange={onChangeAccount} />
        </DataPanel>
        <ActiveAccount bankData={bankData} admin={admin} />
    </div>
}

export default Bankmutations;