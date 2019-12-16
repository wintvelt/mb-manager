// Component for Active account (sub of Bankmutations)
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FileZone } from '../../constants/file-helpers';
import { BankFiles } from './BankUpload-Files';
import { BankConfig } from './BankUpload-config';
import { setBank, doSnackError } from '../../actions/actions';
import { BankActiveCsv } from './BankUpload-ActiveCsv';
import { getCsv, setCsvManual } from '../../actions/apiActions-new';

import Dialog from '@material-ui/core/Dialog';


/*
csv data in store zetten met filename
*/

export const ActiveAccount = (props) => {
    const { accessToken } = useSelector(store => {
        const { accessToken } = store;
        return { accessToken };
    });
    const { bankData, admin } = props;
    const bankDataFiles = bankData.files.toJS();
    const bankDataConfig = bankData.config.toJS();
    const bankDataConvertResult = bankData.convertResult.toJS();
    const bankDataActiveCsv = bankData.activeCsv.apiData.toJS();
    const hasActiveCsv = bankDataActiveCsv.hasAllData;
    const [askConfirm, setAskConfirm] = useState({ ask: false });
    const dispatch = useDispatch();

    const fileHandler = (files) => {
        let errorMsg = '';
        if (files.length > 1) errorMsg = 'Je kunt maar 1 bestand tegelijk uploaden.';
        const file = files[0];
        const fileExt = file.name.split('.')[1];
        if (fileExt.toLowerCase() !== 'csv') errorMsg = 'Je kunt alleen .csv bestanden uploaden, geen .' + fileExt;
        if (errorMsg) {
            dispatch(doSnackError(errorMsg))
        } else {
            let reader = new FileReader();
            reader.onload = (e) => {
                dispatch(setCsvManual(file.name, e.target.result));
                maybeConvertCsvData(file.name, e.target.result)
            };
            reader.readAsText(file);
        }
    }
    const onFileConvert = (filename) => {
        if (admin) {
            dispatch(getCsv(bankData.activeAccount.value, filename, accessToken.data));
        } else {
            maybeConvertCsvData(filename)
        }
    }
    const maybeConvertCsvData = (filename, data) => {
        const alreadySentToMoneyBird = isAlreadySent(filename, bankDataFiles);
        const dialog = admin ?
            alreadySentToMoneyBird ?
                {
                    message: `Bestand ${filename} is al verwerkt in Moneybird. Hoe wil je verwerken?`,
                    buttons: [
                        { text: 'Alleen conversie', action: null },
                        { text: 'Opslaan + conversie', action: null }
                    ]
                }
                : {
                    message: `Bestand ${filename} wordt opgeslagen. Hoe wil je verwerken?`,
                    buttons: [
                        { text: 'Alleen conversie', action: null},
                        { text: 'Ook doorsturen', action: null }
                    ]
                }
                : alreadySentToMoneyBird?
                data?
                {
                    message: `Bestand ${filename} is al verwerkt in Moneybird. Weet je het zeker?`,
                    buttons: [
                        { text: 'Ja, verwerken', action: null }
                    ]
                }
                : {
                    message: `Bestand ${filename} is al verwerkt in Moneybird. Vervangt dit nieuwe bestand de oude?`,
                    buttons: [
                        { text: 'Vervang oude', action: null},
                        { text: 'Verwerk apart', action: null }
                    ]
                }
                : null;
        if (dialog) {
            setAskConfirm({ ask: true, filename, data, ...dialog });
        } else {
            alert('convert invoked');
            // convertCsvData(filename, data);
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
            // callback: () => fetchAWSAPI(getFilesOptions)
        }
        // fetchAWSAPI(convertCsvOptions);
    }
    const onConfirmConvert = (ok) => {
        if (ok) {
            convertCsvData(askConfirm.filename, askConfirm.data);
            setAskConfirm({ ask: false });
        } else {
            dispatch(setBank({ type: 'setCsv', content: { INIT: true } }));
            setAskConfirm({ ask: false });
        }
    }
    return (
        <div>
            {bankDataConfig.hasData && <FileZone
                fileHandler={fileHandler}
                message='Drop .csv bestand met transacties hier, of klik.' />
            }
            {admin && hasActiveCsv &&
                <BankActiveCsv activeCsv={bankData.activeCsv} onConvert={maybeConvertCsvData} />
            }
            {admin && hasActiveCsv &&
                <BankConfig account={bankData.activeAccount.value}
                    config={bankDataConfig.data} convertResult={bankDataConvertResult.data}
                    activeCsv={bankDataActiveCsv.data}
                    files={bankDataFiles} />
            }
            {/* {(bankData.config.hasAllData && bankData.convertResult.hasAllData && bankData.convertResult.data &&
                (bankData.convertResult.data.errors || (admin && adminIsOpen))) ?
                (admin && adminIsOpen) ?
                    'temp ding'
                    : <div className="row">
                        <div className="col s12 orange lighten-1 card">
                            <button className="btn-flat btn waves-effect close"
                                onClick={() => {
                                    dispatch(setBank({ type: 'setConvertResult', content: { INIT: true } }));
                                }}>
                                <i className='material-icons'>close</i></button>
                            <div className="card-content center">
                                <p>Dit bestand is niet converteerbaar helaas.
                                    Misschien hoort het bestand bij een andere bankrekening?</p>
                                <p>Neem anders contact op met Wouter voor meer hulp.</p>
                            </div>
                        </div>
                    </div>
                : <></>
            } */}
            {askConfirm.ask &&
                <Confirmation onClick={onConfirmConvert} filename={askConfirm.filename} />
            }
            {(bankDataFiles.hasError) ?
                <p>Er ging iets mis, probeer het later nog eens..</p>
                : (bankDataFiles.data && bankDataFiles.data.length > 0) ?
                    <BankFiles files={bankDataFiles.data} isLoading={bankDataFiles.isLoading}
                        onFileConvert={onFileConvert} admin={admin} />
                    : <></>
            }
            {/* {(admin) ? <AdminButton adminIsOpen={adminIsOpen} onClick={onClickAdmin}
                enabled={(bankData.config.hasAllData && bankData.convertResult.hasAllData)} />
                : <></>
            } */}
        </div>
    );
}

const isAlreadySent = (filename, files) => {
    const shortFilename = filename.split('.')[0];
    return (files.data && files.data.length > 0 &&
        files.data.filter(f => {
            const fileFromPath = f.filename.split('/').slice(1)[0];
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
                        <span className="btn-flat hide-on-med-and-down teal-text"
                            onClick={onConfirm}>Ja, Verwerk</span>
                    </div>
                </div>
            </div>
        </div>)
}