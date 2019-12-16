// component for listing files
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { doSnack } from '../../actions/actions';
import { base_url_AWS, adminCode } from '../../actions/apiActions-Bank';
import { onlyCsv } from '../../store/reducer-helpers-bank';

import { EnhancedTable } from '../Page/TablePanel';

import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Link from '@material-ui/core/Link';

const headCells = (isAdmin, onDelete, onConvert) => {
    return [
        { id: 'filename', label: 'Bestandsnaam' },
        { id: 'status', label: 'Status', center: true },
        { id: 'sent', label: 'Doorgestuurd op', center: true },
        { id: 'actions', label: 'Acties' },
        isAdmin && {
            id: 'delete',
            label: <IconButton size='medium' onClick={() => onDelete('')}>
                <Icon fontSize='small'>close</Icon>
            </IconButton>,
            disableSort: true,
            width: '48px'
        },
    ].filter(it => it)
};

const deleteRender = (row, isSelected, onSelect, isDisabled) => {
    const icon = isSelected ? 'delete_forever' : 'delete';
    const buttonStyle = isSelected ? { backgroundColor: 'red' } : {}
    const iconStyle = isSelected ? { color: 'white' } : {}

    return !isDisabled &&
        <IconButton size='medium' style={{ marginTop: '-10px', marginBottom: '-10px', ...buttonStyle }} onClick={onSelect}>
            <Icon fontSize='small' style={iconStyle}>{icon}</Icon>
        </IconButton>
}

const statusRender = (row, isSelected, onSelect, isDisabled) => {
    const [statusText, color] = row.status === 'open' ?
        ['open', '#ef6c00']
        : row.status === 'converted' ?
            ['bestand ok', '#0091ea'] : ['verwerkt', '#43a047'];
    const backgroundColor = isDisabled ? 'grey' : color
    return <Chip style={{ backgroundColor, color: 'white' }} label={statusText} size='small' />
}

const actionRender = (isAdmin, onFileConvert) => (row, isSelected, onSelect, isDisabled) => {
    const hasMoneybirdLink = row.status === 'sent';
    const convertAllowed = row.status !== 'sent' || isAdmin;
    const [ convertIcon, convertText ] = isAdmin? [ 'open_in_browser', 'open'] : [ 'send', 'verwerken'];
    return isDisabled ?
        null
        : <>
            {hasMoneybirdLink &&
                <Link href={linkUrl(row.moneybirdId)}
                    target='_blank' rel='noopener noreferrer'>
                    <Icon fontSize='small' style={{ marginBottom: '-5px', marginLeft: '4px', marginRight: '16px' }}>
                        launch
                        </Icon>
                </Link>}
            {convertAllowed && <Button
                style={{ marginTop: '-8px', marginBottom: '-8px' }}
                size='medium'
                color="primary"
                startIcon={<Icon>{convertIcon}</Icon>}
                onClick={() => onFileConvert(row.filename)}
            >
                {convertText}
          </Button>}
        </>
}

const rowCells = (isAdmin, onFileConvert) => [
    {
        key: 'filename',
        hrefBase: `${base_url_AWS}/download/`,
        hrefKey: 'fullFilename'
    },
    { key: 'status', align: 'center', render: statusRender },
    { key: 'sent', align: 'center' },
    {
        key: 'actions',
        render: actionRender(isAdmin, onFileConvert)
    },
    isAdmin && {
        key: 'delete',
        align: 'center',
        render: deleteRender
    }
].filter(it => it)

export const BankFiles = (props) => {
    const { files, onFileConvert, admin } = props;
    const [deleting, setDeleting] = useState({ selected: null, pending: null });
    const dispatch = useDispatch();

    const onDelete = filename => {
        if (!filename) {
            setDeleting({ selected: null, pending: deleting.pending });
        } else if (filename !== deleting.selected) {
            dispatch(doSnack(`Klik nog een keer op delete om ${filename} definitief te verwijderen.`));
            setDeleting({ selected: filename, pending: deleting.pending });
        } else {
            setDeleting({ selected: null, pending: filename });
        }
    }
    const rows = onlyCsv(files).map(makeFileRow);
    return <EnhancedTable rows={rows}
        selectable={false}
        selected={deleting.selected ? [deleting.selected] : []} 
        onSelect={onDelete}
        disabled={deleting.pending ? [deleting.pending] : []}
        tableTitle='Export'
        headCells={headCells(admin, onDelete)}
        rowCells={rowCells(admin, onFileConvert)}
        initOrderBy='id'
    />
}


const makeFileRow = file => {
    const filenames = file.filename.split('/');
    const fileFirstname = filenames.slice(-1);
    const fileExt = '.' + Object.keys(file.last_modified).filter(ext => (ext !== 'json'))[0];
    const filename = fileFirstname + fileExt;
    const fullFilename = file.filename + fileExt;
    return {
        id: filename,
        filename,
        fullFilename,
        moneybirdId: file.id,
        status: (file.last_modified.json) ?
            (file.send_result_ok) ?
                'sent' : 'converted'
            : 'open',
        sent: file.last_sent && simpleDate(file.last_sent)
    }
}


// for fun

const simpleDate = (dateStr) => dateStr.slice(0, 10);
const linkUrl = (id) => 'https://moneybird.com/' + adminCode + '/financial_statements/' + id;