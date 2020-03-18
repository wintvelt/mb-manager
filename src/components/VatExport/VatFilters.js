// VatFilters.js
import React from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
    paper: {
        height: '100%',
        padding: theme.spacing(2),
    },
}));



export const VatFilters = props => {
    const { selection, onChangeInput } = props;
    const { invoiceFrom, invoiceTo } = selection;
    const classes = useStyles();
    const handleChange = field => e => {
        onChangeInput(field, e.target.value)
    }
    return (
        <Grid item xs={6} style={{ paddingBottom: '24px' }}>
            <Paper className={classes.paper}>
                <Typography variant='h5' gutterBottom>Selectie voor BTW export</Typography>
                <Grid container spacing={1}>
                    <Grid item xs={6}>
                        <InputLine label='Factuurdatum vanaf' value={invoiceFrom}
                            onChange={handleChange('invoiceFrom')} />
                    </Grid>
                    <Grid item xs={6}>
                        <InputLine label='tot en met' value={invoiceTo}
                            onChange={handleChange('invoiceTo')} />
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