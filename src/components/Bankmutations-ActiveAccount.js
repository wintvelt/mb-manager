// Component for Active account (sub of Bankmutations)
import React from 'react';
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
                dispatch(setBank({ type: 'setCsv', content: e.target.result }));
                convertCsvData(file.name, e.target.result)
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
            callback: (data) => convertCsvData(filename, data)
        }
        fetchAWSAPI(getCsvOptions);
    }
    const convertCsvData = (filename, data) => {
        const postBody = {
            csv_filename: filename,
            csv_content: data,
            convert_only: true
        }
        const loadingMsg = `bezig met converteren ${filename}`;
        const getFilesOptions = {
            stuff: bankData.files,
            path: '/files/' + bankData.activeAccount.value,
            storeSetFunc: (content) => setBank({ type: 'setFiles', content }),
            errorMsg: 'Fout bij ophalen files, melding van AWS: ',
            accessToken,
            loadingMsg: 'Even geduld terwijl we folderinhoud ophalen',
            dispatch
        }
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
    return (
        <div>
            {(bankData.convertResult.isLoading) ?
                <Loader apiData={bankData.convertResult} className='upload-zone' />
                : (bankData.activeCsv.isLoading) ?
                    <Loader apiData={bankData.activeCsv} className='upload-zone' />
                    : <FileZone fileHandler={fileHandler} message='Drop .csv bestand met transacties hier, of klik.' />
            }
            <BankActiveCsv activeCsv={bankData.activeCsv} />
            {(bankData.convertResult.hasAllData && bankData.convertResult.data && 
                (bankData.convertResult.data.errors || admin )) ?
                <BankConfig account={bankData.activeAccount.value}
                    config={bankData.config.data} convertResult={bankData.convertResult.data}
                    files={bankData.files} />
                : <></>
            }
            {(!bankData.files.hasAllData && !bankData.files.hasError) ?
                <Loader apiData={bankData.files} />
                : (bankData.files.data && bankData.files.data.length > 0) ?
                    <BankFiles files={bankData.files.data} isLoading={bankData.files.isLoading}
                        onFileConvert={onFileConvert} />
                    : (bankData.files.data.length === 0) ? <p>Simply empty list</p>
                        : <p>Got error, try again</p>
            }
            <pre>(config){JSON.stringify(bankData.config, null, 2)}</pre>
            <pre>(convertResult){JSON.stringify(bankData.convertResult, null, 2)}</pre>
            <pre>(activeCsv){JSON.stringify(bankData.activeCsv, null, 2)}</pre>
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