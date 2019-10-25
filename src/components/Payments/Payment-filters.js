// Payment-filters.js
import React from 'react';
import { filterType } from '../../helpers/filters/filters';

import { makeStyles } from '@material-ui/core/styles';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import Switch from '@material-ui/core/Switch';
import Select from '@material-ui/core/Select';
import MultiSelect from './Multi-Select';

const useStyles = makeStyles(theme => ({
    list: {
        flexGrow: 1
    },
    listItem: {
        flexGrow: 1,
    },
    listItemText: {
        justifyContent: 'flex-end',
        flex: '0 0 240px',
        display: 'flex',
        paddingRight: theme.spacing(2)
    },
    listItemAction: {
        flexGrow: 1,
    }
}));

export const filterConfig = [
    {
        id: 'state',
        label: 'Alleen onverwerkte regels',
        placeholder: 'Alle statussen',
        type: filterType.BOOLEAN,
        itemFilter: (selected, filterState, item) => !filterState || item.state === 'unprocessed',
        initial: false
    },
    {
        id: 'afBij',
        label: 'Bij- of afgeschreven',
        placeholder: 'Alle transacties',
        type: filterType.SINGLE,
        itemFilter: (selected, filterState, item) => !filterState || filterState === item.afBij,
        // initial: 'Afgeschreven'
    },
    {
        id: 'account_name',
        label: 'Rekening',
        placeholder: 'Alle rekeningen',
        type: filterType.SINGLE,
        itemFilter: (selected, filterState, item) => !filterState || filterState === item.account_name
    },
    {
        id: 'selected',
        label: 'Alleen selectie tonen',
        placeholder: 'Alles',
        type: filterType.BOOLEAN,
        itemFilter: (selected, filterState, item) => !filterState || (selected.find(s => s === item.id) ? true : false)
    },
    {
        id: 'owner',
        label: 'Owner',
        placeholder: 'Alle owners',
        type: filterType.MULTI,
        itemFilter: (selected, filterState, item) => {
            return filterState.length === 0 || (filterState.find(s => s === item.owner) ? true : false)
        }
    },
    {
        id: 'noEmptyOwner',
        label: 'Alleen met owner tonen',
        placeholder: 'Alles tonen',
        type: filterType.BOOLEAN,
        itemFilter: (selected, filterState, item) => {
            return !filterState || item.owner? true : false
        },
        initial: true
    }
]

export const PaymentFilters = (props) => {
    const { filterObj } = props;
    const classes = useStyles();
    return <ExpansionPanelDetails>
        <List className={classes.list}>
            {filterObj.map(FilterComp)}
        </List>
    </ExpansionPanelDetails >
}

const FilterComp = (props) => {
    const { id, label, placeholder, type, onChange, options, selected } = props;
    const classes = useStyles();

    switch (type) {
        case filterType.SINGLE: {
            const safeSelected = selected || 'NONE';
            return <ListItem key={id} className={classes.listItem}>
                <ListItemText className={classes.listItemText}>{label}</ListItemText>
                <Select
                    className={classes.listItemAction}
                    value={safeSelected}
                    onChange={(e) => {
                        const newValue = (e.target.value === 'NONE') ? '' : e.target.value;
                        onChange(newValue);
                    }}
                    name={id}
                >
                    {options.map(option => {
                        const safeOption = option || 'NONE';
                        return <MenuItem value={safeOption} key={safeOption}>
                            {option || <em>{placeholder}</em>}
                        </MenuItem>
                    })}
                </Select>
            </ListItem>
        }
        case filterType.BOOLEAN: {
            return <ListItem className={classes.listItem} key={id}>
                <ListItemText className={classes.listItemText}>{label}</ListItemText>
                <Switch
                    color='primary'
                    inputProps={{ 'aria-labelledby': `switch-list-label-${label}` }}
                    onClick={(e) => onChange(!selected)}
                    checked={selected}
                />
            </ListItem>
        }
        case filterType.MULTI: {
            const multiOptions = options.map(o => { return { value: o, label: o } });
            return <ListItem className={classes.listItem} key={id}>
                <ListItemText className={classes.listItemText}>{label}</ListItemText>
                <MultiSelect 
                    options={multiOptions} 
                    placeholder={placeholder} 
                    selected={selected}
                    onChange={newSelected => onChange(newSelected)}/>
            </ListItem>
        }
        default:
            return <pre>invalid filter type</pre>;
    }
}