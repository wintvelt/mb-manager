// Payment-xls download
import Excel from 'exceljs/modern.browser';

export const makeXls = (columns, rows) => {
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