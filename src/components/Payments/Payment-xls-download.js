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

const integerToStr = (num, size) => {
    const str = num.toString();
    const strLength = str.length;
    return (size > strLength) ?
        '0'.repeat(size - strLength) + str
        : str
}

export const timestamp = () => {
    const now = new Date();
    const curYear = now.getFullYear();
    const m = now.getMonth() + 1;
    const d = now.getDate();
    return curYear + integerToStr(m) + integerToStr(d);
}