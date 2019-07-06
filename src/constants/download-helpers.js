// for creating and downloading csv files
import moment from 'moment';
const SEPARATOR = ';';


// params: ( rows, indexArr, headers, filename )
// rows: input of an 2D array of objects, where each object has a 'value' property
// indexArr: array of column numbers to keep in exported file
// headers: array of strings, as headers for output
// filename: name of the file - including .csv extension

// helper
const format = (string) => {
    return string
        .replace('.', '');
        // .replace(',', '.');
}

const flattenRows = ( rows, indexArr ) => {
    return rows.map( (row, j) => {
        var newRow = [];
        indexArr.forEach( (item,i) => {
            const newValue = (i===0)? "=\""+row[item].value+"\"" : row[item].value;
            if (newValue) newRow.push( format(newValue) );
        });
        return newRow;
    });
}

const csvContent = ( rows, indexArr, headers ) => {
    const flatRows = flattenRows( rows, indexArr );
    return ( 
        "data:text/csv;charset=utf-8,"
        + "sep=;\n"
        + headers.join(SEPARATOR) + "\n"
        + flatRows.map(e=>e.join(SEPARATOR)).join("\n")
    );
}

export const downloadCsv = ( rows, indexArr, headers, filename ="download") => {
    const fileBody = csvContent( rows, indexArr, headers);
    const encodedUri = encodeURI(fileBody);
    const today=moment().format('YYMMDD');
    const filenameBig = filename + " " + today + ".csv";
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filenameBig);
    document.body.appendChild(link); // Required for FF        
    link.click(); // This will download the data file
}