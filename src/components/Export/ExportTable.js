// ExportTable.js
import React from 'react';
import { EnhancedTable } from '../Page/TablePanel';
import { adminCode } from '../../actions/apiActions';


const headCells = [
    { id: 'filename', label: 'Bestandsnaam' },
    { id: 'docCount', label: 'Docs in bestand', numeric: true, width: '32px' },
    { id: 'invoiceFrom', label: 'Factuurdatum vanaf', numeric: true, width: '112px' },
    { id: 'invoiceTo', label: 'tot en met', numeric: true, width: '112px' },
    { id: 'createFrom', label: 'Opvoerdatum vanaf', numeric: true, width: '112px' },
    { id: 'createTo', label: 'tot en met', numeric: true, width: '112px' },
    { id: 'mutatedCount', label: 'Mutaties sinds export', numeric: true, width: '128px' },
    { id: 'delete', label: 'Delete', width: '48px' },
];

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
        key: 'delete'
    }
]

export const ExportTable = (props) => {
    const { rows, selected, onSelect, edited, onEdit, onDownload, onMulti, onSaveEdit } = props;
    return <EnhancedTable rows={rows}
        selectable={false}
        tableTitle='Export'
        headCells={headCells}
        rowCells={rowCells}
    />
    //     onDownload={onDownload}
    //     onMulti={onMulti}
    //     onSaveEdit={onSaveEdit}
    //     initOrder='asc'
    //     initOrderBy='company_name'
}