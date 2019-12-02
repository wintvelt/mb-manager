// Match.js
import React, { useState, useEffect, useMemo, useReducer } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { getAccounts, getLedgers } from '../../actions/apiActions-new';
import { batchMatchPost } from '../../actions/apiActions-post';
import { derivedMatch } from './Match-datatable';
import MatchData from './MatchData';
import MatchTable from './MatchTable';
import MatchAction from './MatchAction';
import { filterConfig } from './Match-filters';
import { FilterPanel } from '../Page/FilterPanel';
import { initialFilters, makeReducer, makeFilters, filterType } from '../../helpers/filters/filters';

import { makeStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import Chip from '@material-ui/core/Chip';

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
    }
}));

export default function Match() {
    const classes = useStyles();
    const accessToken = useSelector(store => store.accessToken);
    const access_token = accessToken.data;
    const payments = useSelector(store => store.payments.get('apiData'));
    const paymentsList = payments.toJS();
    const accounts = useSelector(store => store.accountsNew);
    const accountsList = accounts.toJS();
    const accountsNotAsked = accountsList.notAsked;
    const ledgers = useSelector(store => store.ledgersNew);
    const ledgersList = ledgers.toJS();
    const ledgersNotAsked = ledgersList.notAsked;
    const receipts = useSelector(store => store.receipts.get('apiData'));
    const receiptsList = receipts.toJS();
    const purchaseInvoices = useSelector(store => store.purchaseInvoices.get('apiData'));
    const purchaseInvoicesList = purchaseInvoices.toJS();
    const matchData = useMemo(() => {
        return derivedMatch(paymentsList.data, accountsList.data,
            ledgersList.data, receiptsList.data, purchaseInvoicesList.data)
    }, [paymentsList.data, accountsList.data, ledgersList.data,
    receiptsList.data, purchaseInvoicesList.data])
    const dispatch = useDispatch();
    const [expanded, setExpanded] = useState([]);
    const [selected, setSelected] = useState([]);
    const [filterState, setFilters] = useReducer(updateFilters, initFilters);
    const [filters, rows] = getFilters(matchData, selected, filterState);
    const filterObj = filters.map(f => {
        return {
            ...f,
            onChange: selected => {
                setFilters({ id: f.id, payload: selected })
            }
        }
    });
    const appliedFilters = filterState.filter(f => {
        const fConfig = filterConfig.find(fc => fc.id === f.id);
        return fConfig.type === filterType.BOOLEAN ? f.value
            : fConfig.type === filterType.SINGLE ? (f.value) ? true : false
                : f.value && f.value.length > 0

    });
    const filterCount = appliedFilters.length > 0 ? appliedFilters.length : 'Geen';
    const filterBadgeTxt = filterCount > 0 ?
        `${rows.length} van ${matchData.length}`
        : '';

    useEffect(() => {
        if (accountsNotAsked) dispatch(getAccounts(access_token));
        if (ledgersNotAsked) dispatch(getLedgers(access_token));
    }, [dispatch, access_token, accountsNotAsked, ledgersNotAsked])

    const handlePanel = panel => (event, isIn) => {
        const newExpanded = (!isIn) ?
            expanded.filter(it => it !== panel)
            : [...expanded, panel];
        setExpanded(newExpanded);
    };

    const onSubmit = e => {
        dispatch(batchMatchPost(selected, access_token));
    }

    return <div className={classes.root}>
        <MatchData expanded={expanded.includes('loading')} onChange={handlePanel('loading')}
            access_token={access_token}
            payments={payments} accounts={accounts} ledgers={ledgers} 
                        receipts={receipts} purchaseInvoices={purchaseInvoices} />
        <ExpansionPanel expanded={expanded.includes('filters')} onChange={handlePanel('filters')}>
            <ExpansionPanelSummary
                expandIcon={<Icon>expand_more</Icon>}
                aria-controls="filters-panel-header"
                id="filters-panel-header"
            >
                <Typography className={classes.heading}>
                    <Icon className={classes.icon}>filter_list</Icon>
                    Filters
                        </Typography>
                <Typography component='div' className={classes.secondaryHeading}>
                    {`${filterCount} filter${filterCount === 1 ? '' : 's'} toegepast`}
                    {filterBadgeTxt && <Chip size='small' label={filterBadgeTxt} />}
                </Typography>
            </ExpansionPanelSummary>
            <FilterPanel filterObj={filterObj} />
        </ExpansionPanel>
        <MatchAction selected={selected} onSubmit={onSubmit}/>
        <MatchTable rows={rows}
            selected={selected} onSelect={setSelected}
            tableTitle='Betalingen om te matchen' />
    </div >
}