// Component for Active account (sub of Bankmutations)
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FileZone } from '../../constants/file-helpers';
import { BankFiles } from './BankUpload-Files';
import { BankConfig } from './BankUpload-config';
import { doSnackError } from '../../actions/actions';
import { BankActiveCsv } from './BankUpload-ActiveCsv';
import {
    getCsv, setCsvManual, convertCsv, getBankActiveFiles,
    resetConvertResult, resetCsv, deleteConvertFile
} from '../../actions/apiActions-new';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import LinearProgress from '@material-ui/core/LinearProgress';

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
    const [hideConvertResult, setHideConvertResult] = useState(false);
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
        const postBody = {
            csv_filename: filename,
            csv_content: data,
            convert_only
        }
        const doAfterConvert = (data || !convert_only) &&
            (() => dispatch(getBankActiveFiles(bankData.activeAccount.value, accessToken.data)));
        dispatch(convertCsv(bankData.activeAccount.value, postBody, accessToken.data, doAfterConvert));
        setAskConfirm({ ask: false });
    }
    const onCloseConvertResult = e => {
        if (admin) {
            setHideConvertResult(true)
        } else {
            dispatch(resetConvertResult());
        }
    }
    const onClearCsv = e => {
        dispatch(resetCsv());
        setHideConvertResult(false);
    }
    const onDeleteFile = (filename) => {
        const doAfterDelete = () => dispatch(getBankActiveFiles(bankData.activeAccount.value, accessToken.data));
        dispatch(deleteConvertFile(bankData.activeAccount.value, filename, accessToken.data, doAfterDelete));
    }
    return (
        <div>
            {bankDataConfig.hasData && <FileZone
                fileHandler={fileHandler}
                message='Drop .csv bestand met transacties hier, of klik.' />
            }
            {admin && hasActiveCsv &&
                <BankActiveCsv activeCsv={bankData.activeCsv} onConvert={maybeConvertCsvData}
                    onClearCsv={onClearCsv} />
            }
            {admin && hasActiveCsv &&
                <BankConfig account={bankData.activeAccount.value}
                    config={bankDataConfig.data} convertResult={bankDataConvertResult.data}
                    activeCsv={bankDataActiveCsv.data}
                    files={bankDataFiles} />
            }
            <ConvertResult open={!bankDataConvertResult.notAsked && !hideConvertResult}
                isAdmin={admin}
                onClose={onCloseConvertResult}
                convertResult={bankDataConvertResult} />
            <Confirmation askConfirm={askConfirm} />
            {bankDataFiles.hasError && <p>Er ging iets mis, probeer het later nog eens..</p>}
            {bankDataFiles.hasData &&
                <BankFiles files={bankDataFiles.data} isLoading={bankDataFiles.isLoading}
                    onFileConvert={onFileConvert} admin={admin}
                    onDeleteFile={onDeleteFile} />
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
const simpleStyle = { padding: '8px', display: 'flex' }
const errorStyle = { ...simpleStyle, backgroundColor: 'orange' };

const ConvertResult = props => {
    const { open, isAdmin, onClose, convertResult } = props;
    const { data, hasData } = convertResult;
    const errors = data && data.errors;
    const fieldErrorCount = errors && errors.field_errors && errors.field_errors.length;
    const otherErrorCount = errors && Object.keys(errors).length - (fieldErrorCount > 0 ? 1 : 0);
    const csv = data && data.csv;
    const lineCount = csv && csv.length - 1;
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Resultaten van conversie</DialogTitle>
            {hasData && <DialogContent style={{ overflowY: 'scroll' }}>
                <DialogContentText>
                    {`Het bestand met ${lineCount} regel${lineCount !== 1 && 's'} is verwerkt.`}
                </DialogContentText>
                {errors && <DialogContentText style={otherErrorCount ? errorStyle : simpleStyle}>
                    <Icon style={{ marginRight: '8px' }}>{otherErrorCount ? 'warning' : 'done'}</Icon>
                    {`${otherErrorCount || 0} algemene bestandsfouten gevonden.`}
                </DialogContentText>}
                {fieldErrorCount > 0 && <DialogContentText style={errorStyle}>
                    <Icon style={{ marginRight: '8px' }}>warning</Icon>
                    {`${fieldErrorCount || 0} fouten in de mapping van velden.`}
                </DialogContentText>}
                {!errors && <DialogContentText style={errorStyle}>
                    YES! Helemaal zonder fouten geconverteerd.
                </DialogContentText>}
                {isAdmin && <pre style={errorStyle}>{JSON.stringify(errors, null, 2)}</pre>}
            </DialogContent>}
            {!hasData && <DialogContent>
                <LinearProgress />
                <DialogContentText>Wachten op respons (spannend toch?)</DialogContentText>
            </DialogContent>}
            <DialogActions>
                <Button onClick={onClose} color='primary'>Duidelijk</Button>
            </DialogActions>
        </Dialog>)
}