// Contacts.js
import React, { useState, useEffect, useMemo, useReducer } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { getContacts, getLedgers, getCustomFields } from '../../actions/apiActions-new';
import { batchKeywordsPost } from '../../actions/apiActions-post';

import { derivedContacts } from './Contact-datatable';
import { filterConfig } from './Contact-filters';
import { FilterPanel } from '../Page/FilterPanel';
import { DataPanel } from '../Page/DataPanel';
import { contactDownload } from './Contact-xls-download';
import { initialFilters, makeReducer, makeFilters, filterType } from '../../helpers/filters/filters';
import Dialog from '../Page/Dialog';

import { makeStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import Chip from '@material-ui/core/Chip';
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
    const contactsNotAsked = contactsList.notAsked;
    const ledgers = useSelector(store => store.ledgersNew);
    const ledgersList = ledgers.toJS();
    const ledgersNotAsked = ledgersList.notAsked;
    const customFields = useSelector(store => store.customFieldsNew);
    const customFieldsList = customFields.toJS();
    const customNotAsked = customFieldsList.notAsked;
    const contactsData = useMemo(() => {
        return derivedContacts(contactsList.data, ledgersList.data)
    }, [contactsList.data, ledgersList.data])
    const dispatch = useDispatch();
    const [expanded, setExpanded] = useState([]);
    const [selected, setSelected] = useState([]);
    const [edited, setEdited] = useState({ ids: [], edits: [] });
    const [actionOpen, setActionOpen] = useState(false);
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
    const filterBadgeTxt = filterCount > 0 ?
        `${rows.length} van ${contactsData.length}`
        : '';

    useEffect(() => {
        if (contactsNotAsked) dispatch(getContacts(access_token));
        if (ledgersNotAsked) dispatch(getLedgers(access_token));
        if (customNotAsked) dispatch(getCustomFields(access_token));
    }, [dispatch, access_token, contactsNotAsked, ledgersNotAsked, customNotAsked])

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

    const onActionSubmit = (access_token) => {
        setActionOpen(false);
        const keywordsField = customFieldsList.data.find(field => field.name === 'Keywords');
        const keywordsId = keywordsField && keywordsField.id;
        const contactsToUpdate = edited.ids.map((id, i) => {
            return {
                id,
                keywordsId,
                keywords: edited.edits[i].keywords
            }
        });
        dispatch(batchKeywordsPost(contactsToUpdate, access_token));
        setEdited({ ids: [], edits: [] });
    }

    return <div className={classes.root}>
        <DataPanel expanded={expanded.includes('loading')} onChange={handlePanel('loading')}
            title='contacten'
            apiDataSources={[contacts, ledgers, customFields]}
            apiTitles={['contacten', 'categorieën', 'extra velden']}
            />
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
        <ContactsTable rows={rows}
            selected={selected} onSelect={setSelected}
            edited={edited} onEdit={setEdited}
            onSaveEdit={edited.ids.length > 0 && (() => setActionOpen(true))}
            onDownload={handleDownload}
            tableTitle='Contacten' />
        <Dialog
            open={actionOpen}
            dialogTitle={`${edited.ids.length} ${edited.ids.length === 1 ? 'contact' : 'contacten'} met bewerking opslaan.`}
            dialogText={'Stuur de bewerkingen van keywords door naar Moneybird.'}
            onHandleClose={() => setActionOpen(false)}
            onSubmit={() => onActionSubmit(access_token)}
        />
    </div >
}