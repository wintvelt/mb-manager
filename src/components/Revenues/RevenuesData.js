// PaymentsData.js
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getPayments } from '../../actions/apiActions-new';
import { RESET_PAYMENTS_NEW } from '../../store/action-types';
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
    const { access_token, payments, ledgers, accounts, revenueConfig, simulation,
        expanded, onChange } = props;

    const apiDataSources = [payments, ledgers, accounts, revenueConfig];

    const [periodState, setPeriodState] = useState({ simulation, period: 0 });
    const period = periodState.period;

    const curPeriod = periodOptions[period].label;
    const nextPeriod = (period < periodOptions.length - 1) ?
        periodOptions[period + 1].label
        : null;
    const loadingApiData = makeLoadingApiData(apiDataSources);
    const paymentType = simulation ? 'ontvangsten (voor simulatie)' : 'onverwerkte betalingen'
    const loadingApiText = (loadingApiData.hasAllData) ?
        `${payments.toJS().data.length} ${paymentType} ${curPeriod} opgehaald.`
        : loadingApiData.hasError ? 'Fout bij het laden.'
            : loadingApiData.isLoading ? `...${paymentType} ${curPeriod} ophalen.`
                : '';

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch({ type: RESET_PAYMENTS_NEW })
        setPeriodState({ simulation, period: 0 });
    }, [dispatch, simulation]);

    useEffect(() => {
        const extraFilters = periodState.simulation ? ',mutation_type:debit' : ',state:unprocessed';
        dispatch(getPayments(access_token, periodOptions[periodState.period].value, extraFilters));
    }, [dispatch, access_token, periodState]);

    const handleMore = (e) => {
        e.stopPropagation();
        setPeriodState({ ...periodState, period: period + 1});
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