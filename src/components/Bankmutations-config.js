// Setting config for bank transactions
import React, { useState } from 'react';
import Select from 'react-select';
import { useDispatch } from 'react-redux';
import { setBank } from '../actions/actions';



export const BankConfig = ({ config, activeCsv, errors, files }) => {
    const dispatch = useDispatch();
    const [confirmed, setConfirmed] = useState(false);
    const onClear = () => {
        setConfirmed(true);
    }
    const onCancel = () => {
        dispatch(setBank({ type: 'setCsv', content: { INIT: true } }));
    }
    if (errors.field_errors && files.data && files.data.length > 0 && !confirmed) {
        return <Confirmation files={files.data.length} errors={errors.field_errors.length}
            onClear={onClear} onCancel={onCancel} />
    }
    return <div className='row'>
        <CsvConfig config={config} errors={errors} />
        <FieldsConfig />
    </div>
}

const Confirmation = ({ errors, onCancel, onClear }) => {
    return (
        <div className="row">
            <div className="col s12 m6 offset-m3">
                <div className="card center">
                    <div className="card-content">
                        <span className="card-title">Vraagje</span>
                        <p>Er zijn {errors} fouten gevonden in dit bestand.
                        Weet je zeker dat dit bestand bij deze rekening hoort?</p>
                    </div>
                    <div className="card-action right-align">
                        <span className="btn-flat hide-on-large-only red-text text-lighten-3" onClick={onCancel}>
                            Annuleer</span>
                        <span className="btn-flat hide-on-large-only teal-text" onClick={onClear}>
                            OK</span>
                        <span className="btn-flat hide-on-med-and-down red-text text-lighten-3" onClick={onCancel}>
                            Nee, Annuleren</span>
                        <span className="btn-flat hide-on-med-and-down teal-text" onClick={onClear}>Ja, Verwerk</span>
                    </div>
                </div>
            </div>
        </div>)
}

const CsvConfig = (props) => {
    const { config, errors } = props;
    const separator = config.separator || ';';
    const separatorOptions = [
        { value: ';', label: ';' },
        { value: ',', label: ',' },
        { value: /\t/, label: '(tab)' }
    ];
    const [selected, setSelected] = useState(separatorOptions.filter(it => (it.label === separator))[0]);

    const onChange = (selected) => {
        console.log({ selected });
        setSelected(selected);
    }

    return <div className='col s4'>
        <h5>csv instellingen</h5>
        <SepSelect options={separatorOptions} selected={selected} onChange={onChange} />
        <CsvErrors errors={errors} />
    </div>
}

const FieldsConfig = (props) => {
    // date, valutation_date, 
    // message, amount, 
    // contra_account_name, contra_account_number, 
    // account_servicer_transaction_id, official_balance, code, offset
    return <div className='col s8'>
        <h5>veld instellingen</h5>
    </div>
}

// further helpers
const SepSelect = ({ options, selected, onChange }) => {
    return (options.length > 1) ?
        <div className='row flex'>
            <span className='select'>Separator: </span>
            <div style={{ display: "inline-block", width: "7em" }}>
                <Select
                    options={options}
                    defaultValue={selected}
                    onChange={onChange}
                    name="Scheidingsteken"
                    className='inline_select'
                    classNamePrefix='inline_select'
                />
            </div>
        </div>
        : options[0].value;
}

const CsvErrors = (props) => {
    const { errors } = props;
    return (errors.csv_read_errors && errors.csv_read_errors.length > 0) ?
        <div className='row'>
            {errors.csv_read_errors.map(it => <p key={it} className='red-text text-lighten-1'>{it}</p>)}
        </div>
        : <></>
}