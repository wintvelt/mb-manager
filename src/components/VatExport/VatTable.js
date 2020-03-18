// ExportTable.js
import React from 'react';
import { EnhancedTable } from '../Page/TablePanel';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';



const headCells = onSelect => {
    return [
    { id: 'filename', label: 'Bestandsnaam' },
    { id: 'create_date', label: 'Gemaakt op', numeric: true },
    { id: 'doc_count', label: 'Docs in bestand', numeric: true },
    { id: 'start_date', label: 'Factuurdatum vanaf', numeric: true },
    { id: 'end_date', label: 'tot en met', numeric: true },
    {
        id: 'delete',
        label: <IconButton size='medium' onClick={() => onSelect('')}>
            <Icon fontSize='small'>close</Icon>
        </IconButton>,
        disableSort: true,
        width: '48px'
    },
]};

const deleteIconRender = (row, isSelected, onSelect) => {
    const isDisabled = row.noDelete;
    const icon = isSelected? 'delete_forever' : 'delete';
    const buttonStyle = isSelected? { backgroundColor: 'red' } : {}
    const iconStyle = isSelected? { color: 'white' } : {}

    return isDisabled?
        <Icon fontSize='small'>do_not_disturb</Icon>
        : <IconButton size='medium' style={buttonStyle} onClick={onSelect}>
            <Icon fontSize='small' style={iconStyle}>{icon}</Icon>
            </IconButton> 
}

const rowCells = [
    {
        key: 'filename',
        hrefBase: '',
        hrefKey: 'url'
    },
    { key: 'create_date', align: 'right' },
    { key: 'doc_count', align: 'right' },
    { key: 'start_date', align: 'right' },
    { key: 'end_date', align: 'right' },
    {
        key: 'delete',
        align: 'center',
        render: deleteIconRender
    }
]

export const VatTable = (props) => {
    const { rows, selected, onSelect } = props;
    return <EnhancedTable rows={rows}
        selectable={false}
        selected={selected} onSelect={onSelect}
        tableTitle='BTW Export archief'
        headCells={headCells(onSelect)}
        rowCells={rowCells}
        initOrderBy='filename'
    />
}