// ExportFilters.js
import React from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from '@material-ui/core/TextField';
import { makeStyles, withStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
    paper: {
        height: '100%',
        padding: theme.spacing(2),
    },
    radio: {
        marginBottom: theme.spacing(1)
    }
}));



export const ExportFilters = props => {
    const { unexportedCount, docCount, mutatedCount, filters, onChangeInput } = props;
    const { mutSelected, invoiceFrom, invoiceTo, createFrom, createTo } = filters;
    const classes = useStyles();
    const handleChange = field => e => {
        onChangeInput(field, e.target.value)
    }
    return (
        <Grid item xs={6} style={{ paddingBottom: '24px' }}>
            <Paper className={classes.paper}>
                <Typography variant='h5' gutterBottom>Filters voor export</Typography>
                <RadioGroup aria-label="type facturen" name="invoicetype" className={classes.radio}
                    value={mutSelected}
                    onChange={handleChange('mutSelected')}>
                    <RadioLine value='new'
                        label={`Nieuwe documenten (${unexportedCount})`}
                        disabled={unexportedCount === 0} />
                    <RadioLine value="mut"
                        label={`Met mutaties sinds export (${mutatedCount})`}
                        disabled={mutatedCount === 0} />
                    <RadioLine value="all"
                        label={`Archief (${docCount} documenten, zonder log)`} />
                </RadioGroup>
                <Grid container spacing={1}>
                    <Grid item lg={6}>
                        <InputLine label='Factuurdatum van' value={invoiceFrom}
                            onChange={handleChange('invoiceFrom')} />
                        <InputLine label='tot' value={invoiceTo}
                            onChange={handleChange('invoiceTo')} />
                    </Grid>
                    <Grid item lg={6}>
                        <InputLine label='Opgevoerd van' value={createFrom}
                            onChange={handleChange('createFrom')} />
                        <InputLine label='tot' value={createTo}
                            onChange={handleChange('createTo')} />
                    </Grid>
                </Grid>
            </Paper>
        </Grid>)
}

const InputLine = props => {
    const { label, onChange } = props;
    return <TextField label={label} placeholder="jjjj-mm-dd" size="small"
        onChange={onChange} />
}

const SmallRadio = withStyles({
    root: {
        paddingTop: '4px',
        paddingBottom: '4px'
    },
    checked: {},
})(props => <Radio color="default" {...props} />);

const RadioLine = props => {
    const { value, label, disabled } = props;
    return <FormControlLabel value={value} control={<SmallRadio color='primary' />}
        label={label}
        disabled={disabled} />
}