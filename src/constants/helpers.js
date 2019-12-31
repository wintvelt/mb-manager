// helpers.js
import moment from 'moment';
import 'moment/locale/nl';

export const since = (date) => {
    moment.locale('nl');
    return (date) ?
        moment(date).fromNow()
        : "nooit";
}

// turns URL search parameter string into object
export const paramToObj = (str) => {
    if (str) {
        var search = str.substring(1);
        return JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g, '":"') + '"}',
            function (key, value) { return key === "" ? value : decodeURIComponent(value) });
    }
    return {}
}

// helpers
const now = new Date();
const curY = now.getFullYear();
const curM = now.getMonth();
const curQ = Math.floor(curM / 3);

const monthStr = (mn) => ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus',
    'september', 'oktober', 'november', 'december'][mn];
const monthNumStr = (m) => (m < 9) ? '0' + (m + 1) : (m + 1).toString();


const makeQ = offset => {
    const newQ = (curQ + offset + 4) % 4;
    const newM = newQ * 3;
    const newY = newQ < curQ ? curY : curY - 1;
    return {
        label: `vanaf ${monthStr(newM)} (Q${newQ + 1} ${newY})`,
        value: `${newY}${monthNumStr(newM)}..${newY}${monthNumStr(newM + 2)}`
    }
}

export const periodOptions = [
    {
        label: `vanaf begin dit kwartaal (Q${curQ + 1})`,
        value: `${curY}${monthNumStr(curQ*3)}..${curY}${monthNumStr(curM)}`
    },
    makeQ(-1),
    makeQ(-2),
    makeQ(-3),
    {
        label: `vanaf begin ${curY -1}`,
        value: `${curY-1}01..${curY-1}${monthNumStr((curQ*3)+2)}`
    }
]