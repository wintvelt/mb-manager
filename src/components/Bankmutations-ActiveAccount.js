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
            reader.onload = (e) => onLoad(e.target.result, file.name);
            reader.readAsText(file);
        }
    }
    const onLoad = (data, filename) => {
        dispatch(setBank({ type: 'setCsv', content: { filename, content: data } }));
        const postBody = {
            csv_filename: filename,
            csv_content: data,
            convert_only: true
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
        }
        fetchAWSAPI(convertCsvOptions);
    }
    return (
        <div>
            {(bankData.convertResult.isLoading) ?
                <Loader apiData={bankData.convertResult} className='upload-zone'/>
                : <FileZone fileHandler={fileHandler} />
            }
            <p>(Placeholder for config section)</p>
            {(!bankData.files.hasData && !bankData.files.hasError) ?
                <Loader apiData={bankData.files} />
                : <BankFiles files={bankData.files.data} />
            }
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