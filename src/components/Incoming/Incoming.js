// Incoming.js
import React, { useState, useEffect, useMemo, useReducer } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { getLedgers } from '../../actions/apiActions-new';
import { derivedIncoming } from './Incoming-datatable';
import IncomingData from './IncomingData';
import { filterConfig } from './Incoming-filters';
import { FilterPanel } from '../Page/FilterPanel';
import { paymentDownload } from './Incoming-xls-download';
import { initialFilters, makeReducer, makeFilters, filterType } from '../../helpers/filters/filters';

import { makeStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import IncomingTable from './IncomingTable';
import Dialog from '../Page/Dialog';

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

export default function Incoming() {
    const classes = useStyles();
    const accessToken = useSelector(store => store.accessToken);
    const access_token = accessToken.data;
    const receipts = useSelector(store => store.receipts.get('apiData'));
    const receiptsList = receipts.toJS();
    const purchaseInvoices = useSelector(store => store.purchaseInvoices.get('apiData'));
    const purchaseInvoicesList = purchaseInvoices.toJS();
    const ledgers = useSelector(store => store.ledgersNew);
    const ledgersList = ledgers.toJS();
    const hasLedgers = ledgersList.hasAllData;
    const incomingData = useMemo(() => {
        return derivedIncoming(receiptsList.data, purchaseInvoicesList.data, ledgersList.data)
    }, [receiptsList.data, purchaseInvoicesList, ledgersList.data])
    const dispatch = useDispatch();
    const [expanded, setExpanded] = useState([]);
    const [selected, setSelected] = useState([]);
    const numSelected = selected.length;
    const [actionState, setActionState] = useState({ open: false, selected: {} });
    const [filterState, setFilters] = useReducer(updateFilters, initFilters);
    const [filters, rows] = getFilters(incomingData, selected, filterState);
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

    useEffect(() => {
        if (!hasLedgers) {
            dispatch(getLedgers(access_token));
        }
    }, [dispatch, access_token, hasLedgers])

    const handlePanel = panel => (event, isIn) => {
        const newExpanded = (!isIn) ?
            expanded.filter(it => it !== panel)
            : [...expanded, panel];
        setExpanded(newExpanded);
    };

    const onActionOpen = (newActionOpenState) => {
        setActionState({
            open: newActionOpenState,
            selected: {}
        });
    }
    const actionOptions = ledgersList.data && ledgersList.data.map(ledger => {
        return { 
            label: ledger.name+(ledger.account_id?` (${ledger.account_id})`:''), 
            value: ledger.id }
    }).sort((a, b) => a.label > b.label ? 1 : a.label < b.label ? -1 : 0)

    const handleDownload = () => {
        const selectedRows = incomingData.filter(item => selected.includes(item.id));
        paymentDownload(selectedRows);
    }

    return <div className={classes.root}>
        <IncomingData expanded={expanded.includes('loading')} onChange={handlePanel('loading')}
            access_token={access_token}
            receipts={receipts} purchaseInvoices={purchaseInvoices}
            ledgers={ledgers} />
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
                <Typography className={classes.secondaryHeading}>
                    {`${filterCount} filter${filterCount === 1 ? '' : 's'} toegepast`}
                </Typography>
            </ExpansionPanelSummary>
            <FilterPanel filterObj={filterObj} />
        </ExpansionPanel>
        <IncomingTable rows={rows}
            selected={selected} onSelect={setSelected}
            onDownload={handleDownload}
            onMulti={() => onActionOpen(true)}
            tableTitle='Bonnetjes en facturen' />
        <Dialog
            open={actionState.open}
            dialogTitle={`${numSelected} ${numSelected === 1 ? 'bonnetje of factuur' : 'bonnetjes en facturen'} bewerken`}
            dialogText={'Kies een nieuwe categorie voor je selectie.'}
            label='Categorie'
            placeholder='kies een categorie'
            onHandleClose={() => onActionOpen(false)}
            onChange={item => setActionState({ open: true, selected: item })}
            onSubmit={() => alert('submitted ' + JSON.stringify(actionState.selected))}
            options={actionOptions}
            selected={actionState.selected}
        />
    </div >
}