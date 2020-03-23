// VatStats.js
import React from 'react';
import moment from 'moment';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
    root: { flexGrow: 1 },
    paper: {
        height: 100,
        padding: theme.spacing(1),
        backgroundColor: '#cfd8dc',
        position: 'relative'
    },
}));

// stat widget
const Widget = (classes, isEmpty) => ({ title, text }) => {
    const safeTitle = (isEmpty) ? '...' : title;
    const safeText = (isEmpty) ? '...' : text;
    return (
        <Grid item key={text} xs={6} md={2} lg={2} className={classes.root}>
            <Paper className={classes.paper}>
                <Typography variant='h6'>{safeTitle}</Typography>
                <Typography variant='subtitle2'>{safeText}</Typography>
            </Paper>
        </Grid>
    );
}

// Stat Container
export const VatStats = (props) => {
    const { unexported } = props;
    const {
        latest_export_create_date,
        new_docs_after_export_count,
        new_docs_before_export_count,
        changed_docs,
        deleted_docs,
        start_date,
        end_date,
        doc_count
    } = unexported;
    const isEmpty = (Object.keys(unexported).length === 0);
    const classes = useStyles();

    const latestExportDate = (latest_export_create_date) ?
        moment(latest_export_create_date).format('D MMM YYYY')
        : 'nog nooit';
    const addedDocsCount = new_docs_after_export_count + new_docs_before_export_count;
    const hasBeforeDocs = (new_docs_before_export_count > 0);

    return <Grid container spacing={2}>
        {(doc_count > 0 || isEmpty) ?
            [
                { title: latestExportDate, text: 'Laatste export gemaakt' },
                {
                    title: `${addedDocsCount}${hasBeforeDocs ? ` (${new_docs_before_export_count})` : ''}`,
                    text: 'Docs toegevoegd' + (hasBeforeDocs ? ' (met datum eerder dan export)' : '')
                },
                { title: changed_docs, text: 'Documenten aangepast' },
                { title: deleted_docs, text: 'Documenten verwijderd' },
                { title: moment(start_date).format('D MMM YYYY'), text: 'Factuurdatum vanaf' },
                { title: moment(end_date).format('D MMM YYYY'), text: 'Factuurdatum tot en met' },
            ].map(Widget(classes, isEmpty))
            : [
                { title: latestExportDate, text: 'Laatste export gemaakt' },
                { title: 'Helemaal bij!', text: 'Geen wijzigingen om te exporteren.' }
            ].map(Widget(classes, isEmpty))
        }
    </Grid>
}