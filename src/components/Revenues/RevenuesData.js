// PaymentsData.js
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getPayments } from '../../actions/apiActions-new';
import { makeLoadingApiData, DataPanel } from '../Page/DataPanel';
import { periodOptions } from '../../constants/helpers';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

// styles
const useStyles = makeStyles(theme => ({
    listButton: {
        marginRight: '1rem'
    }
}));

// receives data through props
export default (props) => {
    const { access_token, payments, ledgers, accounts, revenueConfig, expanded, onChange } = props;

    const apiDataSources = [payments, ledgers, accounts, revenueConfig];

    const [period, setPeriod] = useState(0);

    const curPeriod = periodOptions[period].label;
    const nextPeriod = (period < periodOptions.length - 1) ?
        periodOptions[period + 1].label
        : null;
    const loadingApiData = makeLoadingApiData(apiDataSources);
    const loadingApiText = (loadingApiData.hasAllData) ?
        `${payments.toJS().data.length} onverwerkte betalingen ${curPeriod} opgehaald.`
        : loadingApiData.hasError ? 'Fout bij het laden.'
            : loadingApiData.isLoading ? `...onverwerkte betalingen ${curPeriod} ophalen.`
                : '';

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(getPayments(access_token, periodOptions[period].value, ',state:unprocessed'));
    }, [dispatch, access_token, period]);

    const handleMore = (e) => {
        e.stopPropagation();
        setPeriod(period + 1);
    }

    const classes = useStyles();

    return <DataPanel expanded={expanded} onChange={onChange}
        title='onverwerkte betalingen'
        apiDataSources={apiDataSources}
        apiTitles={[
            `onverwerkte betalingen ${periodOptions[period].label}`,
            'categorieën',
            'bankrekeningen',
            'boekingsregels'
        ]}
        loadingText={loadingApiText} 
        actionsInSummary>
        <Button color='primary' className={classes.listButton} variant='contained'
            disabled={(nextPeriod) ? false : true}
            onClick={handleMore}>
            {(nextPeriod) ?
                `meer ophalen: ${nextPeriod}`
                : `Alles (${curPeriod}) opgehaald`}
        </Button>
    </DataPanel >
}