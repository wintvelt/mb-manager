// ExportAction.js
import React from 'react';
import moment from 'moment';

import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import { makeStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import LinearProgress from '@material-ui/core/LinearProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

const useStyles = makeStyles(theme => ({
    paper: {
        height: '100%',
        padding: theme.spacing(2)
    },
    radio: {
        marginBottom: theme.spacing(1)
    },
    chip: {
        marginRight: theme.spacing(1)
    },
    button: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2)
    },
    list: {
        padding: 0
    },
    listItem: {
        paddingTop: 0,
        paddingBottom: 0
    },
    miniStat: {
        flex: '0 0 88px',
        textAlign: 'right',
        marginRight: theme.spacing(1)
    }
}));



export const ExportAction = props => {
    const { selStats, filters, exportPending, onExport } = props;
    const classes = useStyles();
    return (
        <Grid item xs={6} style={{ paddingBottom: '24px' }}>
            <Paper className={classes.paper}>
                <Typography variant='h5' gutterBottom>Documenten in selectie</Typography>
                <Grid container spacing={1}>
                    <Grid item xs={6}>
                        <Typography variant='subtitle1' gutterBottom>
                            <Chip label={selStats.docCount} className={classes.chip} />
                            {(filters.mutSelected === 'mut') ? 'met mutaties' :
                                (filters.mutSelected === 'new') ?
                                    'nieuw te exporteren' : 'archief (zonder log)'}
                        </Typography>
                        <Button variant='contained' color='primary' className={classes.button}
                            onClick={onExport}
                            disabled={exportPending > 0}
                            startIcon={<Icon>cloud_download</Icon>} >
                            Maak xlsx export
                        </Button>
                        {(exportPending > 0) &&
                            <div>
                                <Typography>Export-bestand aan het maken..</Typography>
                                <LinearProgress />
                            </div>
                        }
                    </Grid>
                    <Grid item xs={6}>
                        <List dense className={classes.list}>
                            {[
                                { value: selStats.docCount, text: 'documenten' },
                                { value: selStats.mutatedCount, text: 'met mutaties' },
                                { value: selStats.unexportedCount, text: 'nieuw' },
                                { date: selStats.invoiceFromTo.min, text: 'eerste factuurdatum' },
                                { date: selStats.invoiceFromTo.max, text: 'laatste factuurdatum' },
                                { date: selStats.createFromTo.min, text: 'eerst opgevoerd' },
                                { date: selStats.createFromTo.max, text: 'laatst opgevoerd' }
                            ].map((props,i) => <MiniStat {...props} key={i}/>)
                            }
                        </List>
                    </Grid>
                </Grid>
            </Paper>
        </Grid >)
}

const MiniStat = props => {
    const { value, date, text } = props;
    const val = (date) ? moment(date).format('D MMM YYYY') : value;
    const classes = useStyles();
    return (
        <ListItem className={classes.listItem}>
            <span className={classes.miniStat}>{val}</span>
            {text}
        </ListItem>
    );
}