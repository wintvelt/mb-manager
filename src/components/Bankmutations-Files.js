// component for listing files
import React, { useReducer } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setBank, doSnack } from '../actions/actions';
import { fetchAWSAPI } from '../actions/apiActions-Bank';

const adminCode = "243231934476453244";
const baseUrlMB = 'https://moneybird.com/' + adminCode;

let counter = 0;

export const BankFiles = ({ files, onFileConvert, isLoading }) => {
    const { accessToken, bankData } = useSelector(store => store);
    const dispatch = useDispatch();
    const [state, stateDispatch] = useReducer(myReducer, { selForDel: null, initial: true, deleting: null });
    counter++;
    console.log('rendering files ' + counter);
    const getFilesOptions = {
        stuff: bankData.files,
        path: '/files/' + bankData.activeAccount.value,
        storeSetFunc: (content) => setBank({ type: 'setFiles', content }),
        errorMsg: 'Fout bij ophalen files, melding van AWS: ',
        accessToken,
        loadingMsg: 'Even geduld terwijl we folderinhoud ophalen',
        dispatch,
    }
    const onCancelSel = () => stateDispatch({ type: 'SET', payload: null });
    const onClickDel = (filename) => {
        if (state.initial) dispatch(doSnack('Klik nog een keer op delete om bestand definitief te verwijderen.'));
        if (state.selForDel === filename) {
            const postBody = {
                filename
            }
            const deleteFileOptions = {
                method: 'DELETE',
                body: postBody,
                stuff: bankData.deleteFile,
                path: '/files/' + bankData.activeAccount.value,
                storeSetFunc: (content) => setBank({ type: 'deleteFile', content }),
                errorMsg: 'Fout bij verwijderen: ',
                loadingMsg: `Bezig met verwijderen van bestand ${filename}`,
                accessToken,
                dispatch,
                callback: () => fetchAWSAPI(getFilesOptions)
            }
            fetchAWSAPI(deleteFileOptions);
            stateDispatch({ type: 'SET_DELETING', payload: filename });
        } else {
            stateDispatch({ type: 'SET', payload: filename });
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
            {files.map((file) => {
                return <FileRow key={file.filename} file={file} selForDel={state.selForDel} deleting={state.deleting}
                    isConverting={bankData.convertResult.isLoading}
                    onClickDel={onClickDel} onCancelSel={onCancelSel} onConvert={onFileConvert} />
            })}
        </div>
    )
}

const FileRow = ({ file, selForDel, isConverting, onClickDel, onCancelSel, onConvert, deleting }) => {
    const filenames = file.filename.split('/');
    const fileFirstname = filenames[filenames.length - 1];
    const filename = fileFirstname + '.' + Object.keys(file.last_modified).filter(ext => (ext !== 'json'))[0];

    const isHot = (selForDel && selForDel === filename);
    const isCold = (deleting && deleting === filename);
    const [delButtonClass, delIcon] = (isHot) ?
        ['btn-flat waves-effect waves-light red white-text', 'delete_forever'] 
        : ['btn-flat waves-effect waves-light grey-text', 'delete'];
    const rowStyle = (isCold) ? { color: '#e0e0e0' } : {};
    const greenClass = (file.send_result_ok)? ' green-text' : '';
    return (
        <div className='row file-row' onClick={onCancelSel} style={rowStyle}>
            <div className='col s6'>
                <span>{filename}</span>
            </div>
            <div className={'col s1 center'+greenClass}>
                {(file.last_modified.json) ?
                    (file.send_result_ok) ?
                        <i className='material-icons'>done_all</i>
                        : <i className='material-icons'>done</i>
                    : <></>
                }
            </div>
            <div className={'col s3'+greenClass}>
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
                {(file.send_result_ok || isCold) ?
                    <></>
                    : <span className={delButtonClass} onClick={(e) => {
                        e.stopPropagation();
                        onClickDel(filename);
                    }}>
                        <i className='material-icons'>{delIcon}</i>
                    </span>
                }
            </div>
        </div >
    )
}

// for fun

const myReducer = (state, action) => {
    switch (action.type) {
        case 'SET':
            return Object.assign({}, state, { selForDel: action.payload, initial: false });

        case 'SET_DELETING':
            return Object.assign({}, state, { deleting: action.payload });

        default:

            return state;
    }

}

const simpleDate = (dateStr) => dateStr.slice(0, 10);
const linkUrl = (id) => baseUrlMB + '/financial_statements/' + id;