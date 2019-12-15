// Setting config for bank transactions
import React, { useState, useReducer } from 'react';
import Select from 'react-select';
import { useDispatch, useSelector } from 'react-redux';
import { setBank } from '../../actions/actions';
import { FieldsConfig } from './BankUpload-config-fields';

import { makeStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import Grid from '@material-ui/core/Grid';

const useStyles = makeStyles(theme => ({
    root: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
        borderRadius: '4px',
        backgroundColor: '#b3e5fc',
        '&:before': {
            display: 'none',
        },
    },
    details: {
        flexDirection: 'column'
    },
    row: {
        alignItems: 'center'
    },
    rowTitle: {
        textAlign: 'right'
    },
    panelTitle: {
        flexBasis: '25%',
        flexShrink: 0,
    },
    secTitle: {
        color: theme.palette.text.secondary,
        flex: 1
    },
    error: {
        color: theme.palette.error.main
    },
}))

export const BankConfig = ({ account, config, convertResult, files }) => {
    const errors = convertResult && convertResult.errors;
    const csv = convertResult && convertResult.csv;
    const { accessToken, bankData } = useSelector(store => store);
    const dispatch = useDispatch();
    const [confirmed, setConfirmed] = useState(false);
    const [curConfig, setCurConfig] = useReducer(configReducer, config);
    const changed = (JSON.stringify(curConfig) !== JSON.stringify(config));
    const classes = useStyles();
    const onClear = () => {
        setConfirmed(true);
    }
    const onCancel = () => {
        dispatch(setBank({ type: 'setCsv', content: { INIT: true } }));
        dispatch(setBank({ type: 'setConvertResult', content: { INIT: true } }));
    }
    const onSave = () => {
        const configSave = {
            stuff: bankData.config,
            method: 'POST',
            body: curConfig,
            path: '/config/' + account,
            storeSetFunc: (content) => setBank({ type: 'setSavedConfig', content }),
            errorMsg: 'Fout bij opslaan config, melding van AWS: ',
            accessToken,
            dispatch,
        }
        dispatch(setBank({ type: 'setConvertResult', content: { INIT: true } }));
        // fetchAWSAPI(configSave);
    }
    const onSelect = (id, key, selection) => {
        const newValue = (Array.isArray(selection)) ?
            selection.map(it => it.value) : (selection) ? selection.value || selection : '';
        const payload = {
            field: id,
            key,
            newValue
        }
        setCurConfig({ type: 'SET_FIELD', payload });
    }
    if (errors && errors.field_errors && files.data && files.data.length > 1 && !confirmed) {
        return <Confirmation files={files.data.length} errors={errors.field_errors.length}
            onClear={onClear} onCancel={onCancel} />
    }
    if (!config) return <div>Some error</div>

    const saveClass = (changed) ? 'btn' : 'btn disabled';
    return <ExpansionPanel className={classes.root}>
        <ExpansionPanelSummary
            expandIcon={<Icon>expand_more</Icon>}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
        >
            <Typography className={classes.panelTitle}>Configuratie voor csv conversie</Typography>
            <Typography className={classes.secTitle}>
                {errors && 'Conversie geeft foutmeldingen'}
            </Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.details}>
            {(true || (errors && errors.moneybird_error)) &&
                <Grid container spacing={2} className={classes.row}>
                    <Grid item xs={5} className={classes.rowTitle}>Foutmelding van Moneybird bij upload:</Grid>
                    <Grid item xs={7} className={classes.error}>
                        <pre>
                            {JSON.stringify('errors.moneybird_error', null, 2)}
                        </pre>
                    </Grid>
                </Grid>
            }
            <CsvConfig config={config} errors={errors} onSelect={onSelect} />
            <FieldsConfig config={config} curConfig={curConfig} errors={errors} csv={csv} onSelect={onSelect} />
        </ExpansionPanelDetails>
        <div className='card-action col s12 right-align'>
            <span className={saveClass} onClick={onSave}>Save</span>
        </div>
    </ExpansionPanel>
}

const Confirmation = ({ errors, onCancel, onClear }) => {
    return (
        <div className="row">
            <div className="col s12 m6 offset-m3">
                <div className="card center">
                    <span className="card-title">Vraagje</span>
                    <div className="card-content">
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
    const { config, errors, onSelect } = props;
    const classes = useStyles();
    const separator = config.separator || ';';
    const separatorOptions = [
        { value: ';', label: 'separator ;' },
        { value: ',', label: 'separator ,' },
        { value: /\t/, label: 'separator (tab)' }
    ];
    const selected = separatorOptions.filter(it => (it.value === separator))[0];

    const onSepChange = (selected) => {
        onSelect('separator', null, selected);
    }
    const onPaypalChange = (val) => {
        onSelect('paypal_special', null, val);
    }
    return <>
        <Grid container spacing={2} className={classes.row}>
            <Grid item xs={2} className={classes.rowTitle}>Conversie van csv:</Grid>
            <Grid item xs={3}>
                <SepSelect options={separatorOptions} selected={selected} onChange={onSepChange} />
            </Grid>
            <Grid item xs={2}></Grid>
            <Grid item xs={2}>
                <CsvErrors errors={errors} />
            </Grid>
            <Grid item xs={3}></Grid>
        </Grid>
        <Grid container spacing={2} className={classes.row}>
            <Grid item xs={2} className={classes.rowTitle}>Paypal filter:</Grid>
            <Grid item xs={3}>
                <PaypalSelect val={config.paypal_special} onChange={onPaypalChange} />
            </Grid>
            <Grid item xs={7}></Grid>
        </Grid>
    </>
}

// further helpers
const SepSelect = ({ options, selected, onChange }) => {
    return (options.length > 1) ?
        <Select
            options={options}
            defaultValue={selected}
            onChange={onChange}
            name="Scheidingsteken"
            className='inline_select col s3'
            classNamePrefix='inline_select'
        />
        : <div className='col s3'>{options[0].value}</div>
}

const CsvErrors = (props) => {
    const { errors } = props;
    return <div className='col s2'>
        {errors && errors.csv_read_errors && errors.csv_read_errors.map(it => {
            return <p key={it} className='red-text text-lighten-1'>{it}</p>
        })}
    </div>
}

const PaypalSelect = (props) => {
    const { val, onChange } = props;
    return <div className='col s3'>
        <div className="switch">
            <label>
                Uit
                <input type="checkbox" value={val} onChange={(e) => onChange(e.target.checked)} />
                <span className="lever"></span>
                Aan
            </label>
        </div>
    </div>
}

const configReducer = (state, action) => {
    switch (action.type) {
        case 'SET_FIELD':
            const { field, key, newValue } = action.payload;
            const oldFieldConfig = state[field] || state.details[field];
            let newFieldConfig;
            if (key) {
                newFieldConfig = { ...oldFieldConfig };
                newFieldConfig[key] = newValue;
            } else {
                const newerValue = (Array.isArray(newValue) && newValue.length === 1) ? newValue[0] : newValue;
                if (oldFieldConfig && oldFieldConfig.hasOwnProperty('field')) {
                    newFieldConfig = { ...oldFieldConfig, field: newerValue };
                } else {
                    newFieldConfig = newerValue;
                }
            }
            let newConfig = { ...state };
            if (state.hasOwnProperty(field)) {
                newConfig[field] = newFieldConfig;
            } else {
                let newDetails = { ...state.details };
                newDetails[field] = newFieldConfig;
                newConfig = { ...state, details: newDetails };
            }
            return newConfig;

        default:
            return state;
    }
}