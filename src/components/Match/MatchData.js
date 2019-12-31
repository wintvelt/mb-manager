// MatchData.js
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getPayments, getReceipts, getPurchaseInvoices } from '../../actions/apiActions-new';
import { makeLoadingApiData, DataPanel } from '../Page/DataPanel';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import { periodOptions } from '../../constants/helpers';


// styles
const useStyles = makeStyles(theme => ({
    listButton: {
        marginRight: '1rem'
    }
}));

// Main data loading component
// receives data through props
export default (props) => {
    const { access_token, payments, accounts, ledgers,
        receipts, purchaseInvoices, expanded, onChange } = props;

    const apiDataSources = [payments, accounts, ledgers, receipts, purchaseInvoices];

    const [period, setPeriod] = useState(0);

    const curPeriod = periodOptions[period].label;
    const nextPeriod = (period < periodOptions.length - 1) ?
        periodOptions[period + 1].label
        : null;
    const loadingApiData = makeLoadingApiData(apiDataSources);
    const loadingApiText = (loadingApiData.hasAllData) ?
        `${payments.toJS().data.length} onverwerkte betalingen ${curPeriod} opgehaald.`
        : loadingApiData.hasError ? 'Fout bij het laden.'
            : loadingApiData.isLoading ? `...betalingen ${curPeriod} ophalen.`
                : '';

    const dispatch = useDispatch();
    useEffect(() => {
        const extraFilter1 = ',state:unprocessed,mutation_type:credit';
        // const extraFilter1 = ',mutation_type:credit';
        dispatch(getPayments(access_token, periodOptions[period].value, extraFilter1));
        const extraFilter2 = encodeURI(',state:saved|open|late');
        dispatch(getReceipts(access_token, periodOptions[period].value, extraFilter2));
        dispatch(getPurchaseInvoices(access_token, periodOptions[period].value, extraFilter2));
    }, [dispatch, access_token, period]);

    const handleMore = () => {
        setPeriod(period + 1);
    }

    const classes = useStyles();

    return <DataPanel expanded={expanded} onChange={onChange}
        title='betalingen'
        apiDataSources={apiDataSources}
        apiTitles={[
            `betalingen ${periodOptions[period].label}`,
            'rekeningen',
            'categorieën',
            'bonnetjes',
            'facturen'
        ]}
        loadingText={loadingApiText} >
        <Button color='primary' className={classes.listButton}
            disabled={(nextPeriod) ? false : true}
            onClick={handleMore}>
            {(nextPeriod) ?
                `Gegevens ${nextPeriod} ophalen..`
                : `Alle onverwerkte betalingen (${curPeriod}) zijn opgehaald`}
        </Button>
    </DataPanel >
}