import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { lighten, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Icon from '@material-ui/core/Icon';
import { adminCode } from '../../actions/apiActions';

function desc(a, b, orderBy) {
  if (!a[orderBy] || b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (!b[orderBy] || b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function stableSort(array, cmp) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
}

function getSorting(order, orderBy) {
  return order === 'desc' ? (a, b) => desc(a, b, orderBy) : (a, b) => -desc(a, b, orderBy);
}

const headCells = [
  { id: 'date', numeric: true, disablePadding: true, wider: '2rem', label: 'Datum' },
  { id: 'account_name', numeric: true, disablePadding: false, label: 'Rekening' },
  { id: 'name', numeric: false, disablePadding: false, label: 'Contact' },
  { id: 'amount', numeric: true, disablePadding: false, label: 'Bedrag' },
  { id: 'owner', numeric: true, disablePadding: false, label: 'Owner' },
  { id: 'state', numeric: false, center: true, disablePadding: false, label: 'Status' },
  { id: 'message', numeric: false, disablePadding: false, label: 'Omschrijving' },
];

function EnhancedTableHead(props) {
  const { classes, onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
  const createSortHandler = property => event => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={numSelected === rowCount && rowCount > 0}
            onClick={onSelectAllClick}
            inputProps={{ 'aria-label': 'alle betalingen selecteren' }}
            color='primary'
          />
        </TableCell>
        {headCells.map(headCell => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : headCell.center ? 'center' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'default'}
            sortDirection={orderBy === headCell.id ? order : false}
            style={{ paddingLeft: headCell.wider }}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={order}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

const useToolbarStyles = makeStyles(theme => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  highlight:
    theme.palette.type === 'light'
      ? {
        color: theme.palette.primary.main,
        backgroundColor: lighten(theme.palette.primary.light, 0.85),
      }
      : {
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.secondary.dark,
      },
  spacer: {
    flex: '1 1 100%',
  },
  actions: {
    color: theme.palette.text.secondary,
  },
  title: {
    flex: '0 0 auto',
  },
}));

const EnhancedTableToolbar = props => {
  const classes = useToolbarStyles();
  const { numSelected, onDownload } = props;

  return (
    <Toolbar
      className={clsx(classes.root, {
        [classes.highlight]: numSelected > 0,
      })}
    >
      <div className={classes.title}>
        {numSelected > 0 ? (
          <Typography color="inherit" variant="subtitle1">
            {numSelected} transactie{numSelected !== 1 && 's'} geselecteerd
          </Typography>
        ) : (
            <Typography variant="h6" id="tableTitle">
              Banktransacties
          </Typography>
          )}
      </div>
      <div className={classes.spacer} />
      <div className={classes.actions}>
        {numSelected > 0 && <Tooltip title="Download selectie als xlsx">
          <IconButton aria-label="Download selectie" onClick={onDownload}>
            <Icon>cloud_download</Icon>
          </IconButton>
        </Tooltip>
        }
      </div>
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
};

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(3),
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
  badgeOK: {
    borderRadius: '4px',
    padding: '4px',
    backgroundColor: lighten(theme.palette.primary.light, 0.3),
    color: 'white'
  },
  badgeNOK: {
    borderRadius: '4px',
    padding: '4px',
    backgroundColor: theme.palette.error.main,
    color: 'white'
  },

}));

export default function EnhancedTable(props) {
  const { rows, selected, onSelect, onDownload } = props;
  const classes = useStyles();
  const [order, setOrder] = React.useState('desc');
  const [orderBy, setOrderBy] = React.useState('date');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);

  const handleRequestSort = (event, property) => {
    const isDesc = orderBy === property && order === 'desc';
    setOrder(isDesc ? 'asc' : 'desc');
    setOrderBy(property);
  };

  const handleSelectAllClick = event => {
    if (selected.length < rows.length) {
      const newSelecteds = rows.map(n => n.id);
      onSelect(newSelecteds);
      return;
    }
    onSelect([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    onSelect(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const isSelected = id => selected.indexOf(id) !== -1;

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <EnhancedTableToolbar numSelected={selected.length} onDownload={onDownload} />
        <div className={classes.tableWrapper}>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size={'medium'}
          >
            <EnhancedTableHead
              classes={classes}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {stableSort(rows, getSorting(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const isItemSelected = isSelected(row.id);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.id}
                      selected={isItemSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          color='primary'
                          onClick={event => handleClick(event, row.id)}
                          checked={isItemSelected}
                          inputProps={{ 'aria-labelledby': labelId }}
                        />
                      </TableCell>
                      <TableCell component="th" id={labelId} scope="row" padding="none" align='right'>
                        {row.date}
                      </TableCell>
                      <TableCell align="right">{row.account_name}</TableCell>
                      <TableCell align="left">
                        <a href={`https://moneybird.com/${adminCode}/documents/filter/state:open%7Clate,contact_id:${row.contactId}`}
                          target='_blank' rel='noreferrer'>
                          {row.name}
                        </a>
                      </TableCell>
                      <TableCell align="right">{prettyAmount(row.amount)}</TableCell>
                      <TableCell align="right">{row.owner}</TableCell>
                      <TableCell align="center">
                        <span className={row.state === 'processed' ? classes.badgeOK : classes.badgeNOK}
                          style={{ fontSize: '0.7rem' }}>
                          {row.state === 'processed' ? 'ok' : 'open'}
                        </span>
                      </TableCell>
                      <TableCell align="left" style={{ fontSize: '0.75rem' }}>
                        <a href={`https://moneybird.com/243231934476453244/financial_mutations/${row.id}`}
                          target='_blank' rel='noreferrer'>
                          {row.message.replace(/\//g, ' ')}
                        </a>
                      </TableCell>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: (53) * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          labelRowsPerPage='Rijen per pagina: '
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} van ${count}`}
          rowsPerPageOptions={[25, 50, 100]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          backIconButtonProps={{
            'aria-label': 'vorige pagina',
          }}
          nextIconButtonProps={{
            'aria-label': 'volgende pagina',
          }}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
}

const withThousand = (amtStr) => {
  return (amtStr.slice(0, 1) === '-') ?
    (amtStr.length > 4) ?
      withThousand(amtStr.slice(0, -3)) + '.' + amtStr.slice(-3)
      : amtStr
    : (amtStr.length > 3) ?
      withThousand(amtStr.slice(0, -3)) + '.' + amtStr.slice(-3)
      : amtStr
}

const prettyAmount = (amount) => {
  const mainAmt = Math.floor(amount);
  const cents = Math.round(amount * 100 - mainAmt * 100);
  const centStr = (cents < 10) ? '0' + cents : cents.toString();
  return <>
    <span>{withThousand(mainAmt.toString())},</span>
    <span style={{ fontSize: '.6rem', verticalAlign: 'top' }}>{centStr}</span>
  </>
}