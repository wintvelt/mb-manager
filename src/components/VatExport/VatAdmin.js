// VatAdmin.js
// for extra checks
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getVatSync } from '../../actions/apiActions-new';

import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import TextField from '@material-ui/core/TextField';
import LinearProgress from '@material-ui/core/LinearProgress';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        height: 140,
        padding: theme.spacing(1),
        position: 'relative',
        backgroundColor: '#b3e5fc',
    },
    button: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
        marginRight: theme.spacing(2)
    },
    textField: {
        marginBottom: theme.spacing(2),
        marginRight: theme.spacing(2)
    }
}));

// Stat Container
export const VatAdmin = (props) => {
    const { vatSync, accessToken } = useSelector(store => {
        const { vatSync, accessToken } = store;
        return { vatSync, accessToken };
    });
    const access_token = accessToken.toJS().data;
    const vatSyncJs = vatSync.toJS();
    const syncStats = vatSyncJs.data;
    console.log({ syncStats });
    const dispatch = useDispatch();
    const [year, setYear] = useState(new Date().getFullYear());

    const syncMessage = (syncStats) ?
        (`${syncStats.synced} docs synced just now, `) +
        ((syncStats.maxExceeded) ? `${syncStats.not_synced} docs still to sync.` : 'Sync complete')
        : ''

    const classes = useStyles();

    const onSync = (year, access_token) => {
        dispatch(getVatSync(year, access_token));
    }

    return <Grid container spacing={2}>
        <Grid item xs={12} md={6} className={classes.root}>
            <Paper className={classes.paper}>
                <Typography variant='h6'>Sync</Typography>
                <Typography variant='subtitle2'>To bring DB back in sync with Moneybird (e.g. if webhook failed).
                </Typography>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                    <TextField className={classes.textField} label={'year (optional)'}
                        value={year}
                        placeholder={"yyyy"} size="small"
                        onChange={e => setYear(e.target.value)} />
                    <Button variant='contained' color='primary' className={classes.button}
                        disabled={vatSyncJs.isLoading}
                        onClick={() => onSync(year, access_token)}
                        startIcon={<Icon>sync</Icon>} >
                        sync
                    </Button>
                    {vatSyncJs.hasData && <Typography variant='caption'>{syncMessage}</Typography>}
                    {(vatSyncJs.isLoading) &&
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <Typography variant='caption'>running sync..</Typography>
                            <LinearProgress />
                        </div>}
                </div>
            </Paper>
        </Grid>
        <Grid item xs={12} md={6} className={classes.root}>
            <Paper className={classes.paper}>
                <Typography variant='h6'>Integrity check</Typography>
                <Typography variant='subtitle2'>To review integrity of historic exports.
                </Typography>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                    <Button variant='contained' color='primary' className={classes.button}
                        disabled={true}
                        onClick={() => { }}
                        startIcon={<Icon>policy</Icon>} >
                        verify
                    </Button>
                    <Typography variant='caption'>(not yet implemented)</Typography>
                </div>
            </Paper>
        </Grid>
    </Grid>
}