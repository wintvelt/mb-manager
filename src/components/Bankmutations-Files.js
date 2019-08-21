// component for listing files
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setBank } from '../actions/actions';
import { fetchAWSAPI } from '../actions/apiActions-Bank';

const adminCode = '';

export const BankFiles = ({ files }) => {
    const { accessToken, bankData } = useSelector(store => store);
    const dispatch = useDispatch();
    const [selForDel, setSelForDel] = useState();
    const onCancelSel = () => setSelForDel(null);
    const onConvert = (filename) => {
        const postBody = {
            csv_filename: filename,
            convert_only: true
        }
        const convertCsvOptions = {
            method: 'POST',
            body: postBody,
            stuff: bankData.convertResult,
            path: '/convert/' + bankData.activeAccount.value,
            storeSetFunc: (content) => setBank({ type: 'setConvertResult', content }),
            errorMsg: 'Fout bij conversie: ',
            accessToken,
            dispatch,
        }
        fetchAWSAPI(convertCsvOptions);
    }
    const onClickDel = setSelForDel;
    return (
        <div>
            {files.sort(sortDesc('filename')).map((file) => {
                const filenames = file.filename.split('/');
                const filename = filenames[filenames.length - 1];

                return <FileRow key={filename} filename={filename} file={file} selForDel={selForDel}
                    onClickDel={onClickDel} onCancelSel={onCancelSel} onConvert={onConvert} />
            })}
        </div>
    )
}

const FileRow = ({ file, filename, selForDel, onClickDel, onCancelSel }) => {
    const isHot = (selForDel && selForDel === filename);
    const [delButtonClass, delIcon] = (isHot) ?
        ['btn-small red white-text', 'delete_forever'] : ['btn-small grey darkgrey-text', 'delete'];
    return (
        <div className='row' style={rowStyle} onClick={onCancelSel}>
            <div className='col l7 m8 s8' style={colStyle}>
                {(file.last_modified.json) ?
                    (file.send_result_ok) ?
                        <>
                            <span>{filename}</span>
                            <i className='material-icons'>done_all</i>
                            (verzonden op {simpleDate(file.last_sent)})
                        </>
                        : <span>{filename}<i className='material-icons'>done</i></span>
                    : <span>{filename}</span>
                }
            </div>
            <div className='col l1 m2 s2' style={colStyle}>
                {(file.send_result_ok) ?
                    <a href={linkUrl(file.id)} target="_blank" rel="noopener noreferrer">
                        <i className='material-icons'>link</i>
                    </a>
                    : <span className='btn-small' onClick={() => onConvert(filename)}>
                        <i className='material-icons'>shuffle</i>
                    </span>

                }
            </div>
            <div className='col l1 m2 s2' style={colStyle}>
                {(file.send_result_ok) ?
                    <></>
                    : <span className={delButtonClass} onClick={onClickDel}>
                        <i className='material-icons'>{delIcon}</i>
                    </span>
                }
            </div>
        </div>
    )
}

const colStyle = { border: '1px solid grey', display: 'flex' }
const rowStyle = { backgroundColor: 'lightgrey' }

// for fun
const sortDesc = (key) => {
    return (a, b) => {
        return (b[key] > a[key]) ? 1 :
            (a[key] > b[key]) ? -1 : 0;
    }
}

const simpleDate = (dateStr) => dateStr.slice(0, 10);
const linkUrl = (id) => 'https://moneybird.com/api/vs/' + adminCode + '/financial_statements/' + id;