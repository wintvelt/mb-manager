// Setting config for bank transactions
import React, { useReducer } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setBank } from '../../actions/actions';
import { saveConfig, setConfigManual } from '../../actions/apiActions-new';
import { FieldsConfig } from './BankUpload-config-fields';

import { makeStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import Grid from '@material-ui/core/Grid';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import { parseCsv } from '../../store/reducer-helpers-bank';

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
        flexDirection: 'column',
        backgroundColor: '#e1f5fe'
    },
    row: {
        alignItems: 'center'
    },
    rowTitle: {
        textAlign: 'right',
        color: theme.palette.text.secondary,
    },
    panelTitle: {
        flexBasis: '25%',
        flexShrink: 0,
    },
    secTitle: {
        color: theme.palette.text.secondary,
        flex: 1
    },
    select: {
        width: '100%'
    },
    error: {
        color: theme.palette.error.main
    },
    saveButton: {
        marginRight: theme.spacing(1)
    }
}))

export const BankConfig = ({ account, config, convertResult, activeCsv, files }) => {
    const errors = convertResult && convertResult.errors;
    const rawCsv = (convertResult && convertResult.csv) || activeCsv;
    const csv = parseCsv(rawCsv);
    const { accessToken } = useSelector(store => store);
    const dispatch = useDispatch();
    const [curConfig, setCurConfig] = useReducer(configReducer, config);
    const changed = (JSON.stringify(curConfig) !== JSON.stringify(config));
    const classes = useStyles();
    const onSave = () => {
        dispatch(saveConfig(account, curConfig, accessToken.data));
        dispatch(setBank({ type: 'setConvertResult', content: { type: 'INIT' } }));
        dispatch(setConfigManual(curConfig));
    }
    const onSelect = (id, key, selection) => {
        const newValue = (Array.isArray(selection)) ?
            selection
            : (selection) ?
                selection.value || selection
                : '';
        const payload = {
            field: id,
            key,
            newValue
        }
        setCurConfig({ type: 'SET_FIELD', payload });
    }

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
            {(errors && errors.moneybird_error) &&
                <Grid container spacing={2} className={classes.row}>
                    <Grid item xs={5} className={classes.rowTitle}>Foutmelding van Moneybird bij upload:</Grid>
                    <Grid item xs={7} className={classes.error}>
                        <pre>
                            {JSON.stringify('errors.moneybird_error', null, 2)}
                        </pre>
                    </Grid>
                </Grid>
            }
            <CsvConfig config={curConfig} errors={errors} onSelect={onSelect} />
            <FieldsConfig config={config} curConfig={curConfig} errors={errors} csv={csv} onSelect={onSelect} />
        </ExpansionPanelDetails>
        <ExpansionPanelActions>
            <Button color='primary' className={classes.saveButton}
                onClick={onSave}
                disabled={!changed}
            >
                Opslaan
                </Button>
        </ExpansionPanelActions>
    </ExpansionPanel>
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
            <Grid item xs={2} className={classes.rowTitle}>
                <Typography>Conversie van csv:</Typography>
            </Grid>
            <Grid item xs={3}>
                <SepSelect options={separatorOptions} selected={selected} onChange={onSepChange} />
            </Grid>
            <Grid item xs={2}></Grid>
            <Grid item xs={2}>
                {errors && errors.csv_read_errors && errors.csv_read_errors.map(it => {
                    return <p className={classes.error}>{it}</p>
                })}
            </Grid>
            <Grid item xs={3}></Grid>
        </Grid>
        <Grid container spacing={2} className={classes.row}>
            <Grid item xs={2} className={classes.rowTitle}>
                <Typography>Paypal filter:</Typography>
            </Grid>
            <Grid item xs={3}>
                <PaypalSelect val={config.paypal_special} onChange={onPaypalChange} />
            </Grid>
            <Grid item xs={7}></Grid>
        </Grid>
    </>
}

// further helpers
const SepSelect = ({ options, selected, onChange }) => {
    const classes = useStyles();
    return (options.length > 1) ?
        <Select
            className={classes.select}
            id="select-separator"
            value={selected.value}
            onChange={e => onChange(e.target.value)}
        >
            {options.map(option => (
                <MenuItem value={option.value} key={option.label}>{option.label}</MenuItem>
            ))}

        </Select>
        : options[0].value
}

const PaypalSelect = (props) => {
    const { val, onChange } = props;
    return <FormControlLabel
        control={
            <Switch
                checked={!!val}
                onChange={(e) => onChange(e.target.checked)}
                inputProps={{ 'aria-label': 'paypal filter checkbox' }}
                color='primary'
            />
        }
        label={`(staat nu ${val ? 'aan' : 'uit'})`}
    />
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
            if (state.hasOwnProperty(field) || field === 'paypal_special') {
                newConfig[field] = newFieldConfig;
            } else {
                let newDetails = { ...state.details };
                newDetails[field] = newFieldConfig;
                newConfig = { ...state, details: newDetails };
            }
            console.log({ newConfig });
            return newConfig;

        default:
            return state;
    }
}