// Payment-xls download
import Excel from 'exceljs';
import { saveAs } from 'file-saver';

const makeXls = (columns, rows) => {
    let workbook = new Excel.Workbook();
    workbook.creator = 'Moblybird';
    workbook.lastModifiedBy = 'Moblybird';
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.lastPrinted = new Date();
    let sheet = workbook.addWorksheet('Banktransacties');

    sheet.columns = columns;
    sheet.addRows(rows);
    return workbook;
}

const integerToStr = (num, size) => {
    const str = num.toString();
    const strLength = str.length;
    return (size > strLength) ?
        '0'.repeat(size - strLength) + str
        : str
}

const timestamp = () => {
    const now = new Date();
    const curYear = now.getFullYear();
    const m = now.getMonth() + 1;
    const d = now.getDate();
    return curYear + integerToStr(m) + integerToStr(d);
}

export const paymentDownload = (selectedRows) => {
    const workbook = makeXls([
        { header: 'Id', key: 'id', width: 20 },
        { header: 'Datum', key: 'date', width: 10 },
        { header: 'Owner', key: 'owner', width: 10 },
        { header: 'Contact', key: 'name', width: 20 },
        { header: 'Rekening', key: 'account_name', width: 10 },
        { header: 'Bedrag', key: 'amount', width: 10, style: { numFmt: '"€"#,##0.00;[Red]-"€"#,##0.00' } },
        { header: 'Omschrijving', key: 'message', width: 60, style: { alignment: { wrapText: true } } }
    ], selectedRows);
    const filename = `moblybird betalingen ${timestamp()}.xlsx`;

    workbook.xlsx.writeBuffer().then(function (data) {
        let blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(blob, filename);
    });
}