// ExportAction.js
import React from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import { makeStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';

const useStyles = makeStyles(theme => ({
    paper: {
        height: '100%',
        padding: theme.spacing(2)
    },
    button: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2)
    },
    caption: {
        marginTop: theme.spacing(2),
        color: '#757575',
        fontSize: '14px'
    }
}));

export const VatAction = props => {
    const { vatExportPending, docCount, onExport } = props;
    const classes = useStyles();
    return (
        <Grid item xs={6} style={{ paddingBottom: '24px' }}>
            <Paper className={classes.paper}>
                <Typography variant='h5' gutterBottom>Export maken</Typography>
                <Grid container spacing={1}>
                    <Grid item xs={6}>
                        <Button variant='contained' color='primary' className={classes.button}
                            onClick={onExport}
                            disabled={!!vatExportPending && docCount > 0}
                            startIcon={<Icon>cloud_download</Icon>} >
                            Maak xlsx export
                        </Button>
                    </Grid>
                    {(!!vatExportPending) &&
                        <Grid item xs={6}>
                            <Typography className={classes.caption}>Export-bestand aan het maken..</Typography>
                            <LinearProgress />
                        </Grid>
                    }
                </Grid>
            </Paper>
        </Grid >)
}