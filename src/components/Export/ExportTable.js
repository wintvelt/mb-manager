// ExportTable.js
import React from 'react';
import { EnhancedTable } from '../Page/TablePanel';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';



const headCells = onSelect => {
    return [
    { id: 'filename', label: 'Bestandsnaam' },
    { id: 'docCount', label: 'Docs in bestand', numeric: true, width: '32px' },
    { id: 'invoiceFrom', label: 'Factuurdatum vanaf', numeric: true, width: '112px' },
    { id: 'invoiceTo', label: 'tot en met', numeric: true, width: '112px' },
    { id: 'createFrom', label: 'Opvoerdatum vanaf', numeric: true, width: '112px' },
    { id: 'createTo', label: 'tot en met', numeric: true, width: '112px' },
    { id: 'mutatedCount', label: 'Mutaties sinds export', numeric: true, width: '128px' },
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
    const isDisabled = row.id.includes('initial');
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
        hrefBase: 'https://moblybird-export-files.s3.eu-central-1.amazonaws.com/',
        hrefKey: 'filename'
    },
    { key: 'docCount', align: 'right' },
    { key: 'invoiceFrom', align: 'right' },
    { key: 'invoiceTo', align: 'right' },
    { key: 'createFrom', align: 'right' },
    { key: 'createTo', align: 'right' },
    { key: 'mutatedCount', align: 'right' },
    {
        key: 'delete',
        align: 'center',
        render: deleteIconRender
    }
]

export const ExportTable = (props) => {
    const { rows, selected, onSelect } = props;
    return <EnhancedTable rows={rows}
        selectable={false}
        selected={selected} onSelect={onSelect}
        tableTitle='Export'
        headCells={headCells(onSelect)}
        rowCells={rowCells}
        initOrderBy='id'
    />
}