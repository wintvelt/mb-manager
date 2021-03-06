// ExportStats.js
import React from 'react';
import moment from 'moment';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import LinearProgress from '@material-ui/core/LinearProgress';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
    root: { flexGrow: 1 },
    paper: {
        height: 100,
        padding: theme.spacing(1),
        backgroundColor: '#cfd8dc',
        position: 'relative'
    },
    syncButton: {
        position: 'absolute',
        right: '4px',
        bottom: '4px'
    }
}));

// Stat Container
export const ExportStats = (props) => {
    const { lastSync, accessToken, onSync, syncPending, invoiceFromTo, createFromTo,
        docCount, unexportedCount, mutatedCount } = props;
    return <Grid container spacing={2}>
        {[
            {
                title: moment(lastSync).format('D MMM YYYY'),
                text: 'Datum van laatste sync',
                icon: 'sync', btnFunc: (() => onSync(accessToken.data)),
                pending: syncPending
            },
            {
                title: docCount + ' / ' + unexportedCount + ' / ' + mutatedCount,
                text: 'Documenten totaal / nieuw / met mutaties'
            },
            { title: moment(invoiceFromTo.min).format('D MMM YYYY'), text: 'Oudste factuurdatum' },
            { title: moment(invoiceFromTo.max).format('D MMM YYYY'), text: 'Laatste factuurdatum' },
            { title: moment(createFromTo.min).format('D MMM YYYY'), text: 'Eerste opvoerdatum' },
            { title: moment(createFromTo.max).format('D MMM YYYY'), text: 'Laatste opvoerdatum' },
        ].map(Widget)}
    </Grid>
}

// stat widget
function Widget({ title, text, icon, btnFunc, pending }) {
    const classes = useStyles();
    return (
        <Grid item key={text} xs={6} md={4} lg={2} className={classes.root}>
            <Paper className={classes.paper}>
                <Typography variant='h6'>{title}</Typography>
                <Typography variant='subtitle2'>{text}</Typography>
                {(icon && pending) &&
                    <LinearProgress />
                }
                {(icon && !pending) &&
                    <IconButton size='small' className={classes.syncButton} color='primary'
                        onClick={btnFunc} >
                        <Icon>{icon}</Icon>
                    </IconButton>
                }
            </Paper>
        </Grid>
    );
}
