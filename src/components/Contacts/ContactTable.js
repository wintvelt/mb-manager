import React from 'react';
import { EnhancedTable } from '../Page/TablePanel';
import { adminCode } from '../../actions/apiActions';


const headCells = [
  { id: 'company_name', disablePadding: true, label: 'Naam' },
  { id: 'customer_id', center: true, label: 'Nummer' },
  { id: 'country', label: 'Land' },
  { id: 'owner', label: 'Owner' },
  { id: 'std_ledger_name', label: 'Std categorie' },
  { id: 'keywords', label: 'Keywords', wider: '12rem' },
];

const rowCells = [
  {
    key: 'company_name',
    padding: 'none',
    hrefBase: `https://moneybird.com/${adminCode}/contacts/`,
    hrefKey: 'id'
  },
  { key: 'customer_id', align: 'center' },
  { key: 'country' },
  { key: 'owner' },
  { key: 'std_ledger_name' },
  {
    key: 'keywords',
    editable: true
  }
]

export default function ContactsTable(props) {
  const { rows, selected, onSelect, edited, onEdit, onDownload, onMulti } = props;
  return <EnhancedTable rows={rows}
    selected={selected} onSelect={onSelect}
    edited={edited} onEdit={onEdit}
    tableTitle='Contacten'
    onDownload={onDownload}
    onMulti={onMulti}
    headCells={headCells}
    rowCells={rowCells}
    initOrder='asc'
    initOrderBy='company_name'
  />
}