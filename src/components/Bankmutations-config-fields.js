// Setting FieldsConfig for bank transactions
import React from 'react';
import Select from 'react-select';

const fields = [
    { id: 'date', label: 'Datum:', isReq: true, isDate: true },
    { id: 'valutation_date', label: 'Valuta-datum:', isDate: true },
    { id: 'message', label: 'Omschrijving:', isReq: true, isMulti: true },
    { id: 'amount', label: 'Bedrag (eur):', isReq: true, isNum: true },
    { id: 'decimal', label: 'Decimaal:', options: [',', '.'], isReq: true },
    { id: 'contra_account_name', label: 'Naam tegenpartij:' },
    { id: 'contra_account_number', label: 'Tegenrekening:' },
    { id: 'official_balance', label: 'Saldo:', isFL: true },
    { id: 'account_servicer_transaction_id', label: 'Transactie-id:' },
    { id: 'code', label: 'Code:' },
    { id: 'offset', label: 'Offset:' }
];

const configForField = (id, config) => {
    return config[id] || config.details[id];
}

const forField = (id, config, curConfig, csv, field_errors = []) => {
    const initFConfig = configForField(id, config);
    const curFConfig = configForField(id, curConfig);
    const mappedField = (curFConfig) ?
        (curFConfig.hasOwnProperty('field')) ? curFConfig.field || ''
            : curFConfig
        : '';
    const changed = (JSON.stringify(initFConfig) !== JSON.stringify(curFConfig));
    const fieldErrors = (field_errors.filter(err => (err.field === id)).length > 0) ?
        field_errors.filter(err => (err.field === id))[0].errors
        : [];
    const headers = csv[0];
    const fieldNames = (Array.isArray(mappedField)) ? mappedField : (mappedField) ? [mappedField] : [];
    const headerIdList = fieldNames.map(n => headers.indexOf(n)).filter(idx => (idx > -1));
    const examples = (headerIdList.length === 0) ? [] :
        csv.slice(1, 3).map(row => {
            return headerIdList.map(i => row[i]).join(' - ');
        })
    return { mappedField, changed, curFConfig, fieldErrors, examples };
}


export const FieldsConfig = (props) => {
    const { csv } = props;
    const csvSafe = (Array.isArray(csv)) ? csv : [[]];
    const params = { ...props, csv: csvSafe };
    // date: select to map + formatFrom
    // valutation_date: select to map (or not) (+ formatFrom)
    // message: select multiple 
    // amount: select to map, decimal
    // contra_account_name: select to map (or not)
    // contra_account_number: select to map (or not)
    // official_balance: select to map (or not) (+ FirstLast)
    // account_servicer_transaction_id: select to map (or not)
    // code: select to map (or not)
    // offset: select to map (or not)
    // 3 kolommen: selector, error | optie, voorbeeld
    // overal max 1 error OF optie tonen + overal (evt) 2 voorbeelden van velden tonen
    // state opslaan, en vergelijken met props, zodat te volgen is of het is aangepast (enables/ disables save)
    // als er afwijkingen zijn errors niet tonen
    return <div className='row'>
        {fields.map(field => <FieldConfig key={field.id} props={{ ...field, ...params }} />)}
    </div>
}

const FieldConfig = ({ props }) => {
    const { id, label, isReq, isDate, isNum, isMulti, options, config, curConfig, csv, errors, onSelect } = props;
    const { mappedField, changed, fieldErrors, curFConfig, examples } = forField(id, config, curConfig, csv, errors && errors.field_errors);
    const headers = csv[0];
    let mapOptions = (options) ? options.map(it => { return { label: it, value: it } })
        : [...headers].map(f => { return { value: f, label: f } });
    if (!isReq) mapOptions = [{ value: '', label: '(geen)' }, ...mapOptions];
    const selectedValue = mappedField;
    const selectedList = (Array.isArray(selectedValue)) ? selectedValue : (selectedValue) ? [selectedValue] : [];
    const selected = selectedList.map(f => { return { value: f, label: f } });
    return <div className='row flex'>
        <div className='col s2 right-align'>{label}</div>
        <Select
            options={mapOptions}
            defaultValue={(isMulti) ? selected : (selectedValue) ? { value: selectedValue, label: selectedValue } : ''}
            onChange={(sel) => onSelect(id, null, sel)}
            name={id}
            className='inline_select col s3'
            classNamePrefix='inline_select'
            isMulti={isMulti}
        />
        {(isDate) ?
            <DateFormat value={curFConfig.formatFrom} onChange={(e) => onSelect(id, 'formatFrom', e.target.value)} />
            : <div className='col s2'></div>
        }
        <FieldLines lines={fieldErrors} colClass='col s2' lineClass='red-text text-lighten-1' changed={changed} />
        <FieldLines lines={examples} colClass='col s3' />
    </div>

}

const FieldLines = (props) => {
    const { lines, lineClass, changed, colClass } = props;
    return (!changed) ?
        <div className={colClass}>
            {lines && lines.map((it, i) => <p key={it + i} className={lineClass}>{it}</p>)}
        </div>
        : <div className={colClass}></div>
}

const DateFormat = (props) => {
    const { value, onChange } = props;
    return <div className='col s2'>
        <input type='text' value={value} onChange={onChange} placeholder='(bv yyyy-mm-dd)' className='csv' />
    </div>
}
