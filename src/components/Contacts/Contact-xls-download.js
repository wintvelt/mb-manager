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

export const contactDownload = (selectedRows) => {
    const workbook = makeXls([
        { header: 'Id', key: 'id', width: 20 },
        { header: 'Nr', key: 'customer_id', width: 10 },
        { header: 'Contact', key: 'company_name', width: 20 },
        { header: 'Owner', key: 'owner', width: 10 },
        { header: 'Std categorie', key: 'std_ledger_name', width: 20 },
        { header: 'Keywords', key: 'keywords_current', width: 60, style: { alignment: { wrapText: true } } }
    ], selectedRows);
    const filename = `moblybird contacten ${timestamp()}.xlsx`;

    workbook.xlsx.writeBuffer().then(function (data) {
        let blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(blob, filename);
    });
}