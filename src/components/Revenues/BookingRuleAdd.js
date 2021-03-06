import React, { useState, useEffect } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Icon from '@material-ui/core/Icon';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import { makeValidLedgerOptions } from './BookingRule-helpers';

const useStyles = makeStyles(theme => ({
    dialogFieldSet: {
        overflowY: 'scroll',
        maxWidth: '560px'
    },
    formControl: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(1)
    },
    button: {
        marginRight: theme.spacing(2)
    },
    tooltip: {
        maxWidth: 500
    }
}))

export const BookingRuleAdd = props => {
    const { onClick } = props;
    const classes = useStyles();
    return <Button className={classes.button} color='primary'
        startIcon={<Icon>add</Icon>}
        onClick={onClick}>
        nieuwe regel
    </Button>
}

const FormSelect = props => {
    const { label, value, handleChange, options } = props;
    const classes = useStyles();
    return <FormControl className={classes.formControl} fullWidth>
        {label && <InputLabel id={label}>{label}</InputLabel>}
        <Select
            labelId={label}
            id={'select-' + label}
            value={value}
            onChange={handleChange}
        >
            {options.map(item => (
                <MenuItem value={item.value} key={'menu-' + item.value}>
                    {!item.label ? item.value : item.value !== 'ALL' ? item.label : <em>{item.label}</em>}
                </MenuItem>
            ))}
        </Select>
    </FormControl>
}

const defaultData = JSON.stringify({
    account: '',
    ledger: '',
    include: '',
    exclude: '',
    isPositive: 'Bij'
});

const TipLine = props => {
    const { char, line } = props;
    return <Typography>
        <span style={{
            marginLeft: '8px', marginRight: '8px', fontSize: '1rem', fontWeight: 'bold',
            width: '24px', display: 'inline-block', textAlign: 'center'
        }}>
            {char}
        </span>
        {line}
    </Typography>
}

const KeywordTip = ({ title }) => {
    const classes = useStyles();
    const tooltipTitle = <>
        <Typography>{`Betalingen die ${title} keywords hebben tellen mee.`}</Typography>
        <Typography variant='body1'>Bijzondere karakters die je kunt gebruiken:</Typography>
        <TipLine char='#' line='Elk willekeurig cijfer 0-9.' />
        <TipLine char='%' line='Elk willekeurig teken.' />
        <TipLine char='?' line='Elk willekeurig teken of geen teken.' />
        <TipLine char='*' line='Geen of meer willekeurige tekens.' />
    </>
    return <Tooltip title={tooltipTitle} placement='left-start' classes={{ tooltip: classes.tooltip }}>
        <Icon style={{ marginLeft: '8px' }}>info_outline</Icon>
    </Tooltip>

}

export const BookingRuleAddDialog = props => {
    const { rule, accounts, ledgers, open, onAbort, onSubmit } = props;
    const id = (rule && rule.id) || 'id' + Date.now();
    const accountsData = (accounts && accounts.data) || [];
    const ledgersDataRaw = (ledgers && ledgers.data) || [];
    const ledgersOptions = makeValidLedgerOptions(ledgersDataRaw);
    const classes = useStyles();
    const data = (rule && rule.data) || defaultData;
    const initRule = JSON.parse(data);
    const [currentRule, setCurrentRule] = useState(initRule);
    useEffect(() => {
        setCurrentRule(JSON.parse(data));
    }, [data, open]);
    const handleChange = field => e => setCurrentRule({ ...currentRule, [field]: e.target.value });
    const isValidRule = currentRule.account && currentRule.ledger && (currentRule.include || currentRule.exclude);
    const didChange = data !== JSON.stringify(currentRule);
    const dialogTitle = (rule && rule.data) ? 'bewerken' : 'toevoegen';
    const handleSubmit = e => {
        const newOrderNeeded = currentRule.account !== initRule.account || currentRule.isPositive !== initRule.isPositive;
        const newRule = newOrderNeeded ? { ...currentRule, order: null } : currentRule;
        return onSubmit(id, newRule);
    };
    return <Dialog open={open} >
        <DialogTitle id="form-dialog-title">{'Boekingsregel ' + dialogTitle}</DialogTitle>
        <DialogContent className={classes.dialogFieldSet}>
            <DialogContentText>
                {`Hieronder kan je de boekingsregel ${dialogTitle}. Na opslaan kun je de volgorde eventueel
                aanpassen.`}
            </DialogContentText>
            <FormSelect
                label='Indien op bankrekening..'
                value={currentRule.account}
                handleChange={handleChange('account')}
                options={[
                    { value: 'ALL', label: 'Alle rekeningen' },
                    ...accountsData.map(account => ({ value: account.id, label: account.name }))
                ]}
            />
            <FormSelect
                label='een bedrag is..'
                value={currentRule.isPositive}
                handleChange={handleChange('isPositive')}
                options={[
                    { value: 'Bij', label: 'bijgeschreven' },
                    { value: 'Af', label: 'afgeschreven' },
                ]}
            />
            <TextField
                margin="normal"
                label="met 1 of meer van de keywords in omschrijving.."
                value={currentRule.include}
                onChange={handleChange('include')}
                InputProps={{
                    endAdornment: <KeywordTip title='1 of meer van de' />
                }}
                fullWidth
            />
            <TextField
                margin="normal"
                label="maar exclusief de keywords.."
                value={currentRule.exclude}
                onChange={handleChange('exclude')}
                InputProps={{
                    endAdornment: <KeywordTip title='geen van de' />
                }}
                fullWidth
            />
            <FormSelect
                label='Boek dan op categorie..'
                value={currentRule.ledger}
                handleChange={handleChange('ledger')}
                options={ledgersOptions}
            />
        </DialogContent>
        <DialogActions>
            <Button color="secondary" onClick={onAbort}>
                Afbreken
            </Button>
            <Button color="primary"
                disabled={!didChange || !isValidRule}
                onClick={handleSubmit}
            >
                Opslaan
          </Button>
        </DialogActions>
    </Dialog>
};