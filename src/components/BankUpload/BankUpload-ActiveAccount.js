// Component for Active account (sub of Bankmutations)
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FileZone } from '../../constants/file-helpers';
import { BankFiles } from './BankUpload-Files';
import { BankConfig } from './BankUpload-config';
import { doSnackError } from '../../actions/actions';
import { BankActiveCsv } from './BankUpload-ActiveCsv';
import { getCsv, setCsvManual, convertCsv, 
    resetConvertResult, deleteConvertFile } from '../../actions/apiActions-new';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';


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
        const onConvert = (filename, data, convert_only) => e => convertCsvData(filename, data, convert_only);
        const altFilename = filename.split('.').map((it, i) => i === 0 ? it + '-2' : it).join('.');
        const dialog = admin ?
            alreadySentToMoneyBird ?
                {
                    message: `Bestand ${filename} is al verwerkt in Moneybird. Hoe wil je verwerken?`,
                    buttons: [
                        { text: 'Alleen conversie', action: onConvert(filename, null, true) },
                        { text: 'Opslaan + conversie', action: onConvert(filename, data, true) }
                    ]
                }
                : {
                    message: `Bestand ${filename} wordt opgeslagen. Hoe wil je verwerken?`,
                    buttons: [
                        { text: 'Alleen conversie', action: onConvert(filename, data, true) },
                        { text: 'Ook doorsturen', action: onConvert(filename, data, false) }
                    ]
                }
            : alreadySentToMoneyBird ?
                data ?
                    {
                        message: `Bestand ${filename} is al verwerkt in Moneybird. Vervangt dit nieuwe bestand de oude?`,
                        buttons: [
                            { text: 'Vervang oude', action: onConvert(filename, data, false) },
                            { text: 'Verwerk apart', action: onConvert(altFilename, data, false) }
                        ]
                    }
                    : {
                        message: `Bestand ${filename} is al verwerkt in Moneybird. Weet je het zeker?`,
                        buttons: [
                            { text: 'Ja, verwerken', action: onConvert(filename, null, false) }
                        ]
                    }
                : null;
        if (dialog) {
            setAskConfirm({
                ask: true, filename, data, ...dialog,
                onCancel: () => setAskConfirm({ ask: false })
            });
        } else {
            convertCsvData(filename, data, false);
        }
    }
    const convertCsvData = (filename, data, convert_only = false) => {
        console.log({ convert_only, data })
        const postBody = {
            csv_filename: filename,
            csv_content: data,
            convert_only
        }
        dispatch(convertCsv(bankData.activeAccount.value, postBody, accessToken.data));
        setAskConfirm({ ask: false });
        // const getFilesOptions = {
        //     stuff: bankData.files,
        //     path: '/files/' + bankData.activeAccount.value,
        //     storeSetFunc: (content) => setBank({ type: 'setFiles', content }),
        //     errorMsg: 'Fout bij ophalen files, melding van AWS: ',
        //     accessToken,
        //     loadingMsg: 'Even geduld terwijl we folderinhoud ophalen',
        //     dispatch
        // }
        // const loadingMsg = `bezig met converteren ${filename}`;
        // const convertCsvOptions = {
        //     method: 'POST',
        //     body: postBody,
        //     stuff: bankData.convertResult,
        //     path: '/convert/' + bankData.activeAccount.value,
        //     storeSetFunc: (content) => setBank({ type: 'setConvertResult', content }),
        //     loadingMsg,
        //     errorMsg: 'Fout bij conversie: ',
        //     accessToken,
        //     dispatch,
        // callback: () => fetchAWSAPI(getFilesOptions)
        // }
        // fetchAWSAPI(convertCsvOptions);
    }
    const onCloseConvertResult = e => {
        dispatch(resetConvertResult());
    }
    const onDeleteFile = (filename) => {
        dispatch(deleteConvertFile(bankData.activeAccount.value, filename, accessToken.data));
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
            <ConvertResult open={bankDataConvertResult.hasData} isAdmin={admin}
                onClose={onCloseConvertResult}
                convertResult={bankDataConvertResult.data} />
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
            <Confirmation askConfirm={askConfirm} />
            {bankDataFiles.hasError && <p>Er ging iets mis, probeer het later nog eens..</p>}
            {bankDataFiles.hasData &&
                <BankFiles files={bankDataFiles.data} isLoading={bankDataFiles.isLoading}
                    onFileConvert={onFileConvert} admin={admin} 
                    onDeleteFile={onDeleteFile}/>
            }
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

const Confirmation = (props) => {
    const { askConfirm } = props;
    const { ask, message, buttons, onCancel } = askConfirm;
    return (
        <Dialog open={ask} onClose={onCancel}>
            <DialogTitle>Conversie bevestigen</DialogTitle>
            <DialogContent>
                <DialogContentText>{message}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel}>Afbreken</Button>
                {buttons && buttons.map(button => (
                    <Button key={button.text} onClick={button.action} color='primary'>
                        {button.text}
                    </Button>
                ))}
            </DialogActions>
        </Dialog>)
}

const ConvertResult = props => {
    const { open, isAdmin, onClose, convertResult } = props;
    const errors = convertResult && convertResult.errors;
    const fieldErrorCount = errors && errors.field_errors && errors.field_errors.length;
    const otherErrorCount = errors && Object.keys(errors).length - (fieldErrorCount > 0 ? 1 : 0);
    const csv = convertResult && convertResult.csv;
    const lineCount = csv && csv.length - 1;
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Resultaten van conversie</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {`Het bestand met ${lineCount} regel${lineCount !== 1 && 's'} is geconverteerd.`}
                </DialogContentText>
                <DialogContentText>
                    {errors && `Er zijn in totaal ${otherErrorCount} algemene bestandsfouten gevonden, 
                    en ${fieldErrorCount} fouten in de mapping van velden.`}
                    {!errors && 'YES! Helemaal zonder fouten geconverteerd.'}
                </DialogContentText>
                {isAdmin && <pre>{JSON.stringify(errors, null, 2)}</pre>}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color='primary'>Duidelijk</Button>
            </DialogActions>
        </Dialog>)
}