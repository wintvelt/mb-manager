// Setting FieldsConfig for bank transactions
import React from 'react';
import Select from '@material-ui/core/Select';
import MultiSelect from '../Page/Multi-Select';
import MenuItem from '@material-ui/core/MenuItem';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
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
}))


const fields = [
    { id: 'identifier', label: 'Check rekeningnummer' },
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
    const fieldErrors = (field_errors && field_errors.filter(err => (err.field === id)).length > 0) ?
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
    const { id, label, isReq, isDate, isMulti, options, config, curConfig, csv, errors, onSelect } = props;
    const classes = useStyles();
    const { mappedField, changed, fieldErrors, curFConfig, examples } =
        forField(id, config, curConfig, csv, errors && errors.field_errors);
    const headers = csv[0];
    let mapOptions = (options) ? options.map(it => { return { label: it, value: it } })
        : [...headers].map(f => { return { value: f, label: f } });
    const mappedFieldInOptions = !!mapOptions.find(it => it.value === mappedField);
    if (!isReq || !mappedFieldInOptions) mapOptions = [{ value: '', label: '(geen)' }, ...mapOptions];
    const selectedValue = mappedFieldInOptions? mappedField : '';
    const selectedList = (Array.isArray(selectedValue)) ? selectedValue : (selectedValue) ? [selectedValue] : [];
    return <Grid container spacing={2} className={classes.row}>
        <Grid item xs={2} className={classes.rowTitle}>
            <Typography>{label}</Typography>
        </Grid>
        <Grid item xs={3}>
            {(mapOptions.length > 1) ?
                isMulti ?
                    <MultiSelect
                        options={mapOptions}
                        placeholder=''
                        selected={selectedList}
                        onChange={(sel) => onSelect(id, null, sel)}
                        />
                    : <Select
                        className={classes.select}
                        id={`select-${label}`}
                        value={typeof selectedValue.value === 'string'? selectedValue.value : selectedValue}
                        onChange={e => onSelect(id, null, e.target.value)}
                    >
                        {mapOptions.map(option => (
                            <MenuItem value={option.value} key={option.label}>{option.label}</MenuItem>
                        ))}

                    </Select>
                : options[0].value
            }
        </Grid>
        <Grid item xs={2}>
            {(isDate) ?
                <DateFormat value={curFConfig.formatFrom} onChange={(e) => onSelect(id, 'formatFrom', e.target.value)} />
                : <div className='col s2'></div>
            }
        </Grid>
        <FieldLines lines={fieldErrors} colWidth={2} isError changed={changed} />
        <FieldLines lines={examples} colWidth={3} />
    </Grid>
}

const FieldLines = (props) => {
    const { lines, isError, changed, colWidth } = props;
    const classes = useStyles();
    return <Grid item xs={colWidth}>
        {!changed && lines && lines.map((it, i) => (
            <Typography color='textSecondary' variant='subtitle2'
                key={it + i} className={isError && classes.error}>
                {it}
            </Typography>
        ))}
    </Grid>
}

const DateFormat = (props) => {
    const { value, onChange } = props;
    return <TextField value={value} onChange={onChange} placeholder='(bv yyyy-mm-dd)' />
}
