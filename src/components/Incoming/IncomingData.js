// PaymentsData.js
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getReceipts, getPurchaseInvoices } from '../../actions/apiActions-new';
import { LoadingComp, LoadingIcon } from '../../helpers/apiData/apiData-components';

import { makeStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
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
    heading: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
        flexBasis: '10rem',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center'
    },
    secondaryHeading: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.primary,
        alignSelf: 'center'
    },
    icon: {
        marginRight: '1rem',
        height: '24px;'
    },
    listButton: {
        marginRight: '1rem'
    }
}));

// receives data through props
export default (props) => {
    const { access_token, receipts, purchaseInvoices, ledgers, expanded, onChange } = props;

    const receiptsList = receipts.toJS();
    const purchaseInvoicesList = purchaseInvoices.toJS();
    const ledgersList = ledgers.toJS();

    const [period, setPeriod] = useState(0);
    const [unpaidOnly, setUnpaidOnly] = useState(true);

    const curPeriod = periodOptions[period].label.toLowerCase();
    const nextPeriod = (period < periodOptions.length - 1) ?
        periodOptions[period + 1].label.toLowerCase()
        : null;
    const loadingApiData = {
        isLoading: receiptsList.isLoading || ledgersList.isLoading,
        hasError: receiptsList.hasError || ledgersList.hasError,
        hasAllData: receiptsList.hasAllData && ledgersList.hasAllData
    }
    const loadingApiText1 = (loadingApiData.hasAllData) ?
        `${receiptsList.data.length + purchaseInvoicesList.data.length} bonnetjes en facturen ${curPeriod} opgehaald.`
        : loadingApiData.hasError ? 'Fout bij het laden.'
            : loadingApiData.isLoading ? `...bonnetjes en facturen ${curPeriod} ophalen.`
                : '';
    const loadingApiText2 = ' (' + (unpaidOnly ? 'openstaand' : 'ook betaald') + ')';
    const loadingApiText = loadingApiText1 + loadingApiText2;

    const dispatch = useDispatch();
    useEffect(() => {
        const extraFilter1 = encodeURI(',state:saved|open|late' + (unpaidOnly ? '|paid|pending_payment' : ''));
        dispatch(getReceipts(access_token, periodOptions[period].value, extraFilter1));
        dispatch(getPurchaseInvoices(access_token, periodOptions[period].value, extraFilter1));
    }, [dispatch, access_token, period, unpaidOnly]);

    const handleMore = () => {
        setPeriod(period + 1);
    }

    const classes = useStyles();

    return <ExpansionPanel expanded={expanded} onChange={onChange}>
        <ExpansionPanelSummary
            expandIcon={<Icon>expand_more</Icon>}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
        >
            <Box className={classes.heading}>
                <span className={classes.icon}>
                    <LoadingIcon apiData={loadingApiData} defaultIcon='cloud_queue' />
                </span>
                Gegevens
        </Box>
            <Typography className={classes.secondaryHeading}>
                {loadingApiText}
            </Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
            <List>
                <LoadingComp name={`bonnetjes ${periodOptions[period].label.toLowerCase()}`}
                    apiData={receiptsList} />
                <LoadingComp name={`facturen ${periodOptions[period].label.toLowerCase()}`}
                    apiData={purchaseInvoicesList} />
                <LoadingComp name='categorieën' apiData={ledgersList} />
            </List>
        </ExpansionPanelDetails>
        <Divider />
        <ExpansionPanelActions>
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
        </ExpansionPanelActions>
    </ExpansionPanel>
}