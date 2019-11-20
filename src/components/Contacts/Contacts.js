// Contacts.js
import React, { useState, useEffect, useMemo, useReducer } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { getContacts, getLedgers } from '../../actions/apiActions-new';
import { derivedContacts } from './Contact-datatable';
import ContactData from './ContactData';
import { filterConfig } from './Contact-filters';
import { FilterPanel } from '../Page/FilterPanel';
import { contactDownload } from './Contact-xls-download';
import { initialFilters, makeReducer, makeFilters, filterType } from '../../helpers/filters/filters';

import { makeStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import ContactsTable from './ContactTable';

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

export default function Contacts() {
    const classes = useStyles();
    const accessToken = useSelector(store => store.accessToken);
    const access_token = accessToken.data;
    const contacts = useSelector(store => store.contactsNew.get('apiData'));
    const contactsList = contacts.toJS();
    const notAsked = contactsList.notAsked;
    const ledgers = useSelector(store => store.ledgersNew);
    const ledgersList = ledgers.toJS();
    const contactsData = useMemo(() => {
        return derivedContacts(contactsList.data, ledgersList.data)
    }, [contactsList.data, ledgersList.data])
    const dispatch = useDispatch();
    const [expanded, setExpanded] = useState([]);
    const [selected, setSelected] = useState([]);
    const [edited, setEdited] = useState({ ids: [], edits: [] });
    const [filterState, setFilters] = useReducer(updateFilters, initFilters);
    const [filters, rows] = getFilters(contactsData, selected, filterState, edited.ids);
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
        if (notAsked) {
            dispatch(getContacts(access_token));
            dispatch(getLedgers(access_token));
        }
    }, [dispatch, access_token, notAsked])

    const handlePanel = panel => (event, isIn) => {
        const newExpanded = (!isIn) ?
            expanded.filter(it => it !== panel)
            : [...expanded, panel];
        setExpanded(newExpanded);
    };

    const handleDownload = () => {
        const selectedRows = contactsData.filter(item => selected.includes(item.id));
        contactDownload(selectedRows);
    }

    return <div className={classes.root}>
        <ContactData expanded={expanded.includes('loading')} onChange={handlePanel('loading')}
            access_token={access_token}
            contacts={contacts} ledgers={ledgers} />
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
        <ContactsTable rows={rows}
            selected={selected} onSelect={setSelected}
            edited={edited} onEdit={setEdited}
            onDownload={handleDownload}
            tableTitle='Contacten' />
    </div >
}