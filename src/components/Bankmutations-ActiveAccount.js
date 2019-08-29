// Component for Active account (sub of Bankmutations)
import React, { useState } from 'react';
import { fetchAWSAPI } from '../actions/apiActions-Bank';
import { useDispatch, useSelector } from 'react-redux';
import { FileZone } from '../constants/file-helpers';
import { BankFiles } from './Bankmutations-Files';
import { BankConfig } from './Bankmutations-config';
import { setBank } from '../actions/actions';
import { doSnack } from '../actions/actions';
import { BankActiveCsv } from './Bankmutations-ActiveCsv';

export const ActiveAccount = (props) => {
    const { accessToken } = useSelector(store => store);
    const { bankData, admin } = props;
    const [adminIsOpen, setadminIsOpen] = useState(false);
    const [askConfirm, setAskConfirm] = useState({ ask: false });
    const dispatch = useDispatch();
    const fileHandler = (files) => {
        let errorMsg = '';
        if (files.length > 1) errorMsg = 'Je kunt maar 1 bestand tegelijk uploaden.';
        const file = files[0];
        const fileExt = file.name.split('.')[1];
        if (fileExt.toLowerCase() !== 'csv') errorMsg = 'Je kunt alleen .csv bestanden uploaden, geen .' + fileExt;
        if (errorMsg) {
            dispatch(doSnack(errorMsg))
        } else {
            let reader = new FileReader();
            reader.onload = (e) => {
                dispatch(setBank({ type: 'setCsvWithOrigin', content: { data: e.target.result, filename: file.name } }));
                maybeConvertCsvData(file.name, e.target.result)
            };
            reader.readAsText(file);
        }
    }
    const onFileConvert = (filename) => {
        const getCsvOptions = {
            stuff: bankData.activeCsv,
            path: '/files/' + bankData.activeAccount.value + '/' + filename,
            storeSetFunc: (content) => setBank({ type: 'setCsv', content }),
            errorMsg: 'Fout bij ophalen csv, melding van AWS: ',
            accessToken,
            loadingMsg: 'Even geduld terwijl we csv bestand ophalen',
            dispatch,
            callback: (data) => maybeConvertCsvData(filename, data)
        }
        fetchAWSAPI(getCsvOptions);
    }
    const maybeConvertCsvData = (filename, data) => {
        console.log('checking maybe');
        // check if filename is already converted
        if (fileInList(filename, bankData.files)) {
            console.log('should ask');
            setAskConfirm({ ask: true, filename, data});
        } else {
            console.log('converting');
            convertCsvData(filename, data);
        }
    }
    const convertCsvData = (filename, data) => {
        const postBody = {
            csv_filename: filename,
            csv_content: data,
            convert_only: false
        }
        const getFilesOptions = {
            stuff: bankData.files,
            path: '/files/' + bankData.activeAccount.value,
            storeSetFunc: (content) => setBank({ type: 'setFiles', content }),
            errorMsg: 'Fout bij ophalen files, melding van AWS: ',
            accessToken,
            loadingMsg: 'Even geduld terwijl we folderinhoud ophalen',
            dispatch
        }
        const loadingMsg = `bezig met converteren ${filename}`;
        const convertCsvOptions = {
            method: 'POST',
            body: postBody,
            stuff: bankData.convertResult,
            path: '/convert/' + bankData.activeAccount.value,
            storeSetFunc: (content) => setBank({ type: 'setConvertResult', content }),
            loadingMsg,
            errorMsg: 'Fout bij conversie: ',
            accessToken,
            dispatch,
            callback: () => fetchAWSAPI(getFilesOptions)
        }
        fetchAWSAPI(convertCsvOptions);
    }
    const onClickAdmin = () => {
        setadminIsOpen(!adminIsOpen);
    }
    const onConfirmConvert = (ok) => {
        if (ok) {
            console.log({askConfirm});
            convertCsvData(askConfirm.filename, askConfirm.data);
        } else {
            dispatch(setBank({ type: 'setCsv', content: { INIT: true } }));
            setAskConfirm({ask:false});
        }
    }
    return (
        <div>
            {(bankData.convertResult.isLoading) ?
                <Loader apiData={bankData.convertResult} className='upload-zone' />
                : (bankData.activeCsv.isLoading) ?
                    <Loader apiData={bankData.activeCsv} className='upload-zone' />
                    : <FileZone fileHandler={fileHandler} message='Drop .csv bestand met transacties hier, of klik.' />
            }
            <BankActiveCsv activeCsv={bankData.activeCsv} />
            {(bankData.config.hasAllData && bankData.convertResult.hasAllData && bankData.convertResult.data &&
                (bankData.convertResult.data.errors || adminIsOpen)) ?
                <BankConfig account={bankData.activeAccount.value}
                    config={bankData.config.data} convertResult={bankData.convertResult.data}
                    files={bankData.files} />
                : <></>
            }
            {(askConfirm.ask)?
                <Confirmation onClick={onConfirmConvert} filename={askConfirm.filename} />
                : <></>
            }
            {(!bankData.files.hasAllData && !bankData.files.hasError) ?
                <Loader apiData={bankData.files} />
                : (bankData.files.data && bankData.files.data.length > 0) ?
                    <BankFiles files={bankData.files.data} isLoading={bankData.files.isLoading}
                        onFileConvert={onFileConvert} />
                    : (bankData.files.data && bankData.files.data.length === 0) ? <p>Simply empty list</p>
                        : <p>Got error, try again</p>
            }
            <pre>(config){JSON.stringify(bankData.config, null, 2)}</pre>
            <pre>(convertResult){JSON.stringify(bankData.convertResult, null, 2)}</pre>
            <pre>(files){JSON.stringify(bankData.files, null, 2)}</pre>
            {(admin) ? <AdminButton adminIsOpen={adminIsOpen} onClick={onClickAdmin}
                enabled={(bankData.config.hasAllData && bankData.convertResult.hasAllData)} />
                : <></>
            }
        </div>
    );
}

const Loader = ({ apiData, className }) => {
    const loadClass = ["section center", className].join(' ');
    return (
        <div className={loadClass}>
            <p>{apiData.loadingMsg}</p>
            <div className="progress">
                <div className="indeterminate"></div>
            </div>
        </div>
    )
}

const AdminButton = (props) => {
    const { onClick, adminIsOpen, enabled } = props;
    const btnClassBasic = 'btn btn-floating btn-small orange admin';
    const btnClass = (enabled) ? btnClassBasic : btnClassBasic + ' disabled';
    const icon = (adminIsOpen) ? 'close' : 'settings';
    return <button className={btnClass} onClick={onClick}>
        <i className='material-icons'>{icon}</i>
    </button>
}

const fileInList = (filename, files) => {
    const shortFilename = filename.split('.')[0];
    console.log({files});
    return (files.data && files.data.length > 0 &&
        files.data.filter(f => {
            const fileFromPath = f.filename.split('/').slice(1)[0];
            console.log({fileFromPath, shortFilename});
            return (fileFromPath === shortFilename && f.send_result_ok)
        }).length > 0)
}

const Confirmation = ({ filename, onClick }) => {
    const onConfirm = () => onClick(true);
    const onCancel = () => onClick(false);

    return (
        <div className="row">
            <div className="col s12 m6 offset-m3">
                <div className="card center">
                    <span className="card-title">Vraagje</span>
                    <div className="card-content">
                        <p>Het bestand {filename} heb je al eerder naar Moneybird doorgestuurd.
                        Weet je zeker dat je dit opnieuw wilt doen? 
                        Had je het bijbehorende bestand uit Moneybird al verwijderd?</p>
                    </div>
                    <div className="card-action right-align">
                        <span className="btn-flat hide-on-large-only red-text text-lighten-3" onClick={onCancel}>
                            Annuleer</span>
                        <span className="btn-flat hide-on-large-only teal-text" onClick={onConfirm}>
                            OK</span>
                        <span className="btn-flat hide-on-med-and-down red-text text-lighten-3" onClick={onCancel}>
                            Nee, Annuleren</span>
                        <span className="btn-flat hide-on-med-and-down teal-text" onClick={onConfirm}>Ja, Verwerk</span>
                    </div>
                </div>
            </div>
        </div>)
}