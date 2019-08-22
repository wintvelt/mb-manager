// Component for Active account (sub of Bankmutations)
import React from 'react';
import { fetchAWSAPI } from '../actions/apiActions-Bank';
import { useDispatch, useSelector } from 'react-redux';
import { FileZone } from '../constants/file-helpers';
import { BankFiles } from './Bankmutations-Files';
import { setBank } from '../actions/actions';
import { doSnack } from '../actions/actions';

export const ActiveAccount = (props) => {
    const { accessToken } = useSelector(store => store);
    const { bankData } = props;
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
                dispatch(setBank({ type: 'setCsv', content: { file: file.name, content: e.target.result } }));
                convertCsvData(file.name, e.target.result)
            };
            reader.readAsText(file);
        }
    }
    const onFileConvert = (filename) => {
        const storeSetFunc = (content) => {
            if (content.LOADING || content.ERROR) {
                return setBank({ type: 'setCsv', content })
            } else {
                return setBank({ type: 'setCsv', content: { file: filename, content } })
            }
        }
        const getCsvOptions = {
            stuff: bankData.activeCsv,
            path: '/files/' + bankData.activeAccount.value + '/' + filename,
            storeSetFunc,
            errorMsg: 'Fout bij ophalen csv, melding van AWS: ',
            accessToken,
            loadingMsg: 'Even geduld terwijl we csv bestand ophalen',
            dispatch,
            callback: (csv_content) => {
                convertCsvData(filename, csv_content)
            }
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
                : <FileZone fileHandler={fileHandler} message='Drop .csv bestand met transacties hier, of klik.' />
            }
            <p>(Placeholder for config section)</p>
            {(!bankData.files.hasAllData && !bankData.files.hasError) ?
                <Loader apiData={bankData.files} />
                : (bankData.files.data.length > 0) ?
                    <> {(bankData.files.isLoading) ?
                        <div style={{ position: 'relative' }}>
                            <div className="progress" style={{ position: 'absolute' }}>
                                <div className="indeterminate"></div>
                            </div>
                        </div>
                        : <></>}
                        <BankFiles files={bankData.files.data} onFileConvert={onFileConvert} />
                    </>
                    : <></>


            }
            <pre>(deleteFile){JSON.stringify(bankData.deleteFile, null, 2)}</pre>
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