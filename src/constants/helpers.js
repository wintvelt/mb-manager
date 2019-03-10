// helpers.js
import moment from 'moment';
import 'moment/locale/nl';

export const since = (date) => {
	moment.locale('nl');
	return (date)?
		moment(date).fromNow()
		: "nooit";
}

export const uniqByKey = (arr, key) => {
    var seen = {};
    var out = [];
    var len = arr.length;
    var j = 0;
    for(var i = 0; i < len; i++) {
         var item = arr[i][key];
         if(seen[item] !== 1) {
               seen[item] = 1;
               out[j++] = arr[i];
         }
    }
    return out;
}