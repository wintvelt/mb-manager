// Component for Active account (sub of Bankmutations)
import React from 'react';
import { useDispatch } from 'react-redux';
import { FileZone } from '../constants/file-helpers';
import { doSnack } from '../actions/actions';

export const ActiveAccount = (props) => {
    const { bankData } = props;
    const dispatch = useDispatch();
    const fileHandler = (files) => {
        let errorMsg = '';
        if (files.length > 1) errorMsg = 'Je kunt maar 1 bestand tegelijk uploaden.';
        const file = files[0];
        const fileExt = file.name.split('.')[1];
        if (fileExt !== 'csv') errorMsg = 'Je kunt alleen .csv bestanden uploaden, geen .'+fileExt;
        if (errorMsg) {
            dispatch(doSnack(errorMsg))
        } else {
            console.log(file);
        }
    }
    return (
        <div>
            <p>I am here</p>
            <FileZone fileHandler={fileHandler}/>
            <pre>{JSON.stringify(bankData.files.data, null, 2)}</pre>
        </div>
    );
}


// let reader = new FileReader();
// reader.onload = (e) => {
//     const csvString = e.target.result;
//     const csvArr = csvString.split(/\n|\r/);
//     console.log(csvArr.length);
//     const arr2 = csvArr.map(it => {
//         try {
//             return JSON.parse('[' + it + ']');
//         } catch (_) {
//             return it.split(',')
//         }
//     });
//     console.log(JSON.stringify(arr2, null, 2));
// };
// reader.readAsText(e.dataTransfer.files[0]);

