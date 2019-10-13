import React, { useState, useEffect, useMemo, useReducer } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { getPayments, getContacts, getAccounts } from '../../actions/apiActions-new';
import { derivedPayments } from './Payments-table';
import EnhancedTable from './Payments-table-helpers';
import { PaymentFilters } from './Payment-filters';

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

import { filterConfig } from './Payment-filters';

import { LoadingComp, LoadingIcon } from '../../helpers/apiData/apiData-components';
import { initialFilters, makeReducer, makeFilters, filterType } from '../../helpers/filters/filters';

const updateFilters = makeReducer(filterConfig);
const initFilters = initialFilters(filterConfig);
const getFilters = makeFilters(filterConfig);

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
    },
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

const ExpandMoreIcon = () => <Icon>expand_more</Icon>

export default function Payments() {
    const classes = useStyles();
    const accessToken = useSelector(store => store.accessToken);
    const access_token = accessToken.data;
    const payments = useSelector(store => store.payments.get('apiData'));
    const paymentsList = payments.toJS();
    const contacts = useSelector(store => store.contactsNew.get('apiData'));
    const contactsList = contacts.toJS();
    const hasContacts = contactsList.hasAllData;
    const accounts = useSelector(store => store.accountsNew);
    const accountsList = accounts.toJS();
    const paymentsData = useMemo(() => {
        return derivedPayments(paymentsList.data, contactsList.data, accountsList.data)
    }, [paymentsList.data, contactsList.data, accountsList.data])
    // const paymentsData = derivedPayments(paymentsList.data, contactsList.data, accountsList.data);
    const dispatch = useDispatch();
    const [expanded, setExpanded] = useState(['filters']);
    const [period, setPeriod] = useState(0);
    const curPeriod = periodOptions[period].label.toLowerCase();
    const nextPeriod = (period < periodOptions.length) ?
        periodOptions[period + 1].label.toLowerCase()
        : null;
    const loadingApiData = {
        isLoading: paymentsList.isLoading || contactsList.isLoading || accounts.isLoading,
        hasError: paymentsList.hasError || contactsList.hasError || accounts.hasError,
        hasAllData: paymentsList.hasAllData && contactsList.hasAllData && accountsList.hasAllData
    }
    const loadingApiText = (loadingApiData.hasAllData) ?
        `${paymentsList.data.length} betalingen ${curPeriod} opgehaald.`
        : loadingApiData.hasError ? 'Fout bij het laden.'
            : loadingApiData.isLoading ? `...betalingen ${curPeriod} ophalen.`
                : '';

    const [filterState, setFilters] = useReducer(updateFilters, initFilters);
    const [filters, rows] = getFilters(paymentsData, [], filterState);
    const filterObj = filters.map(f => {
        return {
            ...f,
            onChange: selected => {
                setFilters({ id: f.id, payload: selected })
            }
        }
    });
    const filtersApplied = filterState.filter(f => {
        const fConfig = filterConfig.find(fc => fc.id === f.id);
        return fConfig.type === filterType.BOOLEAN ? f.value
            : fConfig.type === filterType.SINGLE ? (f.value) ? true : false
                : f.value && f.value.length > 0

    });
    const filterCount = filtersApplied.length > 0 ? filtersApplied.length : 'Geen';

    useEffect(() => {
        if (!hasContacts) {
            dispatch(getAccounts(access_token));
            dispatch(getContacts(access_token));
        }
    }, [dispatch, access_token, hasContacts])

    useEffect(() => {
        dispatch(getPayments(access_token, periodOptions[period].value));
    }, [dispatch, access_token, period])

    const handlePanel = panel => (event, isIn) => {
        const newExpanded = (!isIn) ?
            expanded.filter(it => it !== panel)
            : [...expanded, panel];
        setExpanded(newExpanded);
    };

    const handleMore = () => {
        setPeriod(period + 1);
    }

    return (
        <div className={classes.root}>
            <ExpansionPanel expanded={expanded.includes('loading')} onChange={handlePanel('loading')}>
                <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}
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
                        <LoadingComp name={`betalingen ${periodOptions[period].label.toLowerCase()}`} apiData={paymentsList} />
                        <LoadingComp name='rekeningen' apiData={accountsList} />
                        <LoadingComp name='contacten' apiData={contactsList} />
                    </List>
                </ExpansionPanelDetails>
                <Divider />
                <ExpansionPanelActions>
                    <Button color='primary' className={classes.listButton}
                        disabled={(nextPeriod) ? false : true}
                        onClick={handleMore}>
                        {(nextPeriod) ?
                            `Betalingen ${nextPeriod} toevoegen..`
                            : `Alle betalingen (${curPeriod}) zijn opgehaald`}
                    </Button>
                </ExpansionPanelActions>
            </ExpansionPanel>
            <ExpansionPanel expanded={expanded.includes('filters')} onChange={handlePanel('filters')}>
                <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="filters-panel-header"
                    id="filters-panel-header"
                >
                    <Typography className={classes.heading}>
                        <Icon className={classes.icon}>filter_list</Icon>
                        Filters
                        </Typography>
                    <Typography className={classes.secondaryHeading}>
                        {`${filterCount} filter${filterCount === 1 ? '' : 's'} toegepast`}
                    </Typography>
                </ExpansionPanelSummary>
                <PaymentFilters filterObj={filterObj}/>
                <PaymentFilters filterObj={
                    [
                        {
                            id: 'state', type: filterType.SINGLE, options: ['', 'unprocessed', 'processed'],
                            label: 'Status',
                            placeholder: 'Alles',
                            selected: filterState.find(f => f.id === 'state').value, 
                            onChange: selected => {
                                setFilters({ id: 'state', payload: selected });
                            }
                        },
                        {
                            id: 'selected', type: filterType.BOOLEAN,
                            label: 'Alleen selectie tonen',
                            selected: filterState.find(f => f.id === 'selected').value, 
                            onChange: selected => {
                                setFilters({ id: 'selected', payload: selected });
                            }
                        },
                        {
                            id: 'owner', type: filterType.MULTI,
                            options: ['Arjen', 'Alex', 'Gerrit'],
                            label: 'Owner',
                            placeholder: 'Alle owners',
                            selected: filterState.find(f => f.id === 'owner').value, 
                            onChange: selected => {
                                setFilters({ id: 'owner', payload: selected });
                            }
                        },
                    ]
                } />
            </ExpansionPanel>
            <ExpansionPanel expanded={expanded.includes('actions')} onChange={handlePanel('actions')} disabled>
                <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel3bh-content"
                    id="panel3bh-header"
                >
                    <Typography className={classes.heading}>
                        <Icon className={classes.icon}>build</Icon>
                        Actie
                    </Typography>
                    <Typography className={classes.secondaryHeading}>
                        Geen selectie gemaakt.
                    </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <Typography>
                        Nunc vitae orci ultricies, auctor nunc in, volutpat nisl. Integer sit amet egestas eros,
                        vitae egestas augue. Duis vel est augue.
                    </Typography>
                </ExpansionPanelDetails>
            </ExpansionPanel>
            <EnhancedTable rows={rows} />
            <ExpansionPanel expanded={true}>
                <ExpansionPanelSummary />
                <ExpansionPanelDetails>
                    Dit is dan een titel
                </ExpansionPanelDetails>
                <pre style={{ display: 'table', overflow: 'hidden', width: '100%', tableLayout: ' fixed' }}>
                    {JSON.stringify(paymentsData, null, 2)}</pre>
                <DebugPre apiData={paymentsList} name='paymentsApiData' />
            </ExpansionPanel>
        </div >
    );
}

// temp debugger
const DebugPre = (props) => {
    const { apiData, name } = props;
    const apiClean = { ...apiData, data: apiData.data && apiData.data.length }
    return <div style={{ display: 'flex' }}>
        <h6>{name}</h6>
        <pre>{JSON.stringify(apiClean, null, 2)}</pre>
    </div>
}

// helpers
const now = new Date();
const curYear = now.getFullYear();
const m = now.getMonth() + 1;
const month = (m) => (m < 10) ? '0' + m : m.toString()
const curPeriod = curYear + month(m);
const xAgoPeriod = (x) => (m < x + 1) ? (curYear - 1) + month(12 + m - x) : curYear + month(m - x);
const xVanaf = (x) => ['', 'januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus',
    'september', 'oktober', 'november', 'december'][(m < x + 1) ? 12 + m - x : m - x]

const periodOptions = [
    { label: `Van deze maand`, value: `${curPeriod}..${curPeriod}` },
    { label: `Vanaf ${xVanaf(1)}`, value: `${xAgoPeriod(1)}..${xAgoPeriod(1)}` },
    { label: `Vanaf ${xVanaf(3)} (3 maanden)`, value: `${xAgoPeriod(3)}..${xAgoPeriod(2)}` },
    { label: `Vanaf ${xVanaf(6)} (6 maanden)`, value: `${xAgoPeriod(6)}..${xAgoPeriod(4)}` },
    curYear.toString() === xAgoPeriod(6).slice(0, 4) && { label: `Vanaf begin dit jaar`, value: `${curYear}01..${xAgoPeriod(7)}` },
    {
        label: 'Vanaf vorig jaar',
        value: `${curYear - 1}01..${curYear.toString() === xAgoPeriod(6).slice(0, 4) ? xAgoPeriod(7) : '' + curYear - 1 + '12'}`
    }
].filter(it => it);