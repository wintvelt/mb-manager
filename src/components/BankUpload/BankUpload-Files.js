// component for listing files
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setBank, doSnack } from '../../actions/actions';
import { fetchAWSAPI, base_url_AWS, adminCode } from '../../actions/apiActions-Bank';
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
    const convertAllowed = row.status !== 'sent' || isAdmin
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
                startIcon={<Icon>send</Icon>}
                onClick={() => onFileConvert(row.filename)}
            >
                verwerken
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
        selected={deleting.selected ? [deleting.selected] : []} onSelect={onDelete}
        disabled={deleting.pending ? [deleting.pending] : []}
        tableTitle='Export'
        headCells={headCells(admin, onDelete)}
        rowCells={rowCells(admin, onFileConvert)}
        initOrderBy='id'
    />
}

export const BankFilesOLD = (props) => {
    const { files, onFileConvert, isLoading, admin } = props;
    const { accessToken, bankData } = useSelector(store => ({
        accessToken: store.accessToken,
        bankData: store.bankData
    }));
    const dispatch = useDispatch();
    const [deleting, setDeleting] = useState({ selected: null, pending: null });
    const getFilesOptions = {
        stuff: bankData.files,
        path: '/files/' + bankData.activeAccount.value,
        storeSetFunc: (content) => setBank({ type: 'setFiles', content }),
        errorMsg: 'Fout bij ophalen files, melding van AWS: ',
        accessToken,
        loadingMsg: 'Even geduld terwijl we folderinhoud ophalen',
        dispatch,
    }
    const onCancelSel = () => setDeleting({ selected: null, pending: deleting.pending });
    const onClickDel = (filename) => {
        if (filename !== deleting.selected) {
            dispatch(doSnack('Klik nog een keer op delete om bestand definitief te verwijderen.'));
            setDeleting({ selected: filename, pending: deleting.pending });
        } else {
            const postBody = {
                csv_filename: filename
            }
            const deleteFileOptions = {
                method: 'DELETE',
                body: postBody,
                stuff: bankData.deleteFile,
                path: '/convert/' + bankData.activeAccount.value,
                storeSetFunc: (content) => setBank({ type: 'deleteFile', content }),
                errorMsg: 'Fout bij verwijderen: ',
                loadingMsg: `Bezig met verwijderen van bestand ${filename}`,
                accessToken,
                dispatch,
                // callback: () => fetchAWSAPI(getFilesOptions)
            }
            fetchAWSAPI(deleteFileOptions);
            setDeleting({ selected: null, pending: filename });
        }
    }
    return (
        <div>
            <div className='row file-row file-row-header'>
                <div className='col s6'><span>Bestandsnaam</span></div>
                <div className='col s3 offset-s1'><span>Doorgestuurd op</span></div>
                <div className='col s1 center'><span>Acties</span></div>
                <div className='col s1'></div>
            </div>
            {(isLoading) ?
                <div style={{ position: 'relative' }}>
                    <div className="progress" style={{ position: 'absolute', top: '-10px' }}>
                        <div className="indeterminate"></div>
                    </div>
                </div>
                : <></>}
            {/* {files.map((file) => {
                return <FileRow key={file.filename} file={file} selForDel={state.selForDel} deleting={state.deleting}
                    isConverting={bankData.convertResult.isLoading} admin={admin}
                    onClickDel={onClickDel} onCancelSel={onCancelSel} onConvert={onFileConvert} />
            })} */}
        </div>
    )
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

const fileRowDataOLD = props => {
    const { file, selForDel, isConverting, onClickDel, onCancelSel, onConvert, deleting, admin } = props;
    const filenames = file.filename.split('/');
    const fileFirstname = filenames.slice(-1);
    const fileExt = '.' + Object.keys(file.last_modified).filter(ext => (ext !== 'json'))[0];
    const filename = fileFirstname + fileExt;
    const fullFilename = file.filename + fileExt;

    const isHot = (selForDel && selForDel === filename);
    const isCold = (deleting && deleting === filename);
    const [delButtonClass, delIcon] = (isHot) ?
        ['btn-flat waves-effect waves-light red white-text', 'delete_forever']
        : ['btn-flat waves-effect waves-light grey-text', 'delete'];
    const rowStyle = (isCold) ? { color: '#e0e0e0' } : {};
    const greenClass = (file.send_result_ok) ? ' green-text' : '';
    const downloadLink = `${base_url_AWS}/download/${fullFilename}`;
    return (
        <div className='row file-row' onClick={onCancelSel} style={rowStyle}>
            <div className='col s6'>
                {(isCold) ?
                    <span>{filename}</span>
                    : <a href={downloadLink}>{filename}</a>
                }
            </div>
            <div className={'col s1 center' + greenClass}>
                {(file.last_modified.json) ?
                    (file.send_result_ok) ?
                        <i className='material-icons'>done_all</i>
                        : <i className='material-icons'>done</i>
                    : <></>
                }
            </div>
            <div className={'col s3' + greenClass}>
                {(file.send_result_ok) ?
                    <span>{simpleDate(file.last_sent)}</span>
                    : <></>
                }
            </div>
            <div className='col s1 center'>
                {(file.send_result_ok) ?
                    <a href={linkUrl(file.id)} target="_blank" rel="noopener noreferrer">
                        <i className='material-icons'>launch</i>
                    </a>
                    : (isCold) ?
                        <></>
                        : (isConverting) ?
                            <span className='btn-flat disabled'><i className='material-icons'>shuffle</i></span>
                            :
                            <span className='btn-flat waves-effect waves-light teal white-text' onClick={(e) => {
                                e.stopPropagation();
                                onConvert(filename)
                            }}>
                                <i className='material-icons'>shuffle</i>
                            </span>

                }
            </div>
            <div className='col s1 center'>
                {((!file.send_result_ok || admin) && !isCold) ?
                    <span className={delButtonClass} onClick={(e) => {
                        e.stopPropagation();
                        onClickDel(filename);
                    }}>
                        <i className='material-icons'>{delIcon}</i>
                    </span>
                    : <></>
                }
            </div>
        </div >
    )
}

// for fun

const simpleDate = (dateStr) => dateStr.slice(0, 10);
const linkUrl = (id) => 'https://moneybird.com/' + adminCode + '/financial_statements/' + id;