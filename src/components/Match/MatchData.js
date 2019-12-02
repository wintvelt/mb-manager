// MatchData.js
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getPayments, getReceipts, getPurchaseInvoices } from '../../actions/apiActions-new';
import { makeLoadingApiData, DataPanel } from '../Page/DataPanel';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';


// helpers
const now = new Date();
const curYear = now.getFullYear();
const m = now.getMonth() + 1;
const month = (m) => (m < 10) ? '0' + m : m.toString()
// const curPeriod = curYear + month(m);
const xAgoPeriod = (x) => (m < x + 1) ? (curYear - 1) + month(12 + m - x) : curYear + month(m - x);
const xVanaf = (x) => ['', 'januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus',
    'september', 'oktober', 'november', 'december'][(m < x + 1) ? 12 + m - x : m - x]

const periodOptions = [
    // { label: `Van deze maand`, value: `${curPeriod}..${curPeriod}` },
    { label: `Vanaf ${xVanaf(1)}`, value: `${xAgoPeriod(1)}..${xAgoPeriod(1)}` },
    { label: `Vanaf ${xVanaf(3)} (3 maanden)`, value: `${xAgoPeriod(3)}..${xAgoPeriod(2)}` },
    { label: `Vanaf ${xVanaf(6)} (6 maanden)`, value: `${xAgoPeriod(6)}..${xAgoPeriod(4)}` },
    curYear.toString() === xAgoPeriod(6).slice(0, 4) &&
    { label: `Vanaf begin dit jaar`, value: `${curYear}01..${xAgoPeriod(7)}` },
    {
        label: 'Vanaf vorig jaar',
        value: `${curYear - 1}01..${curYear.toString() === xAgoPeriod(6).slice(0, 4) ?
            xAgoPeriod(7) : '' + curYear - 1 + '12'}`
    }
].filter(it => it);

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

    const curPeriod = periodOptions[period].label.toLowerCase();
    const nextPeriod = (period < periodOptions.length - 1) ?
        periodOptions[period + 1].label.toLowerCase()
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
            `betalingen ${periodOptions[period].label.toLowerCase()}`,
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