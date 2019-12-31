// PaymentsData.js
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getReceipts, getPurchaseInvoices } from '../../actions/apiActions-new';
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

// receives data through props
export default (props) => {
    const { access_token, receipts, purchaseInvoices, ledgers, expanded, onChange } = props;

    const apiDataSources = [receipts, purchaseInvoices, ledgers];

    const [period, setPeriod] = useState(0);
    const [unpaidOnly, setUnpaidOnly] = useState(true);

    const curPeriod = periodOptions[period].label;
    const nextPeriod = (period < periodOptions.length - 1) ?
        periodOptions[period + 1].label
        : null;
    const loadingApiData = makeLoadingApiData(apiDataSources);
    const dataCount = (receipts.toJS().data? receipts.toJS().data.length : 0) +
        (purchaseInvoices.toJS().data? purchaseInvoices.toJS().data.length : 0)
    const loadingApiText1 = (loadingApiData.hasAllData) ?
        `${dataCount} bonnetjes en facturen ${curPeriod} opgehaald.`
        : loadingApiData.hasError ? 'Fout bij het laden.'
            : loadingApiData.isLoading ? `...bonnetjes en facturen ${curPeriod} ophalen.`
                : '';
    const loadingApiText2 = ' (' + (unpaidOnly ? 'openstaand' : 'ook betaald') + ')';
    const loadingApiText = loadingApiText1 + loadingApiText2;

    const dispatch = useDispatch();
    useEffect(() => {
        const extraFilter1 = encodeURI(',state:saved|open|late' + (unpaidOnly ? '' : '|paid|pending_payment'));
        dispatch(getReceipts(access_token, periodOptions[period].value, extraFilter1));
        dispatch(getPurchaseInvoices(access_token, periodOptions[period].value, extraFilter1));
    }, [dispatch, access_token, period, unpaidOnly]);

    const handleMore = () => {
        setPeriod(period + 1);
    }

    const classes = useStyles();

    return <DataPanel expanded={expanded} onChange={onChange}
        title='bonnetjes en facturen'
        apiDataSources={apiDataSources}
        apiTitles={[
            `bonnetjes ${periodOptions[period].label}`,
            `facturen ${periodOptions[period].label}`,
            'categorieën'
        ]}
        loadingText={loadingApiText}>
        <Button color='primary' className={classes.listButton}
            disabled={(nextPeriod) ? false : true}
            onClick={handleMore}>
            {(nextPeriod) ?
                `Bonnetjes en facturen ${nextPeriod} ophalen..`
                : `Alle bonnetjes en facturen (${curPeriod}) zijn opgehaald`}
        </Button>
        <Button color='primary' className={classes.listButton}
            disabled={!unpaidOnly}
            onClick={() => setUnpaidOnly(false)}>
            {(unpaidOnly) ?
                `Ook betaalde bonnetjes ophalen`
                : `Betaalde bonnetjes ook opgehaald`}
        </Button>
    </DataPanel>
}