// array helpers

// helper to update one item in an array
// if updateFunc(null) has output, the output will be added to the array, if the key was not found
export const updateArray = (arr, key, value, updateFunc) => {
    let isNewItem = true;
    let outArr = arr.map(it => {
        if (it[key] === value) {
            isNewItem = false;
            return updateFunc(it)
        } else {
            return it
        }
    });
    const newItem = updateFunc();
    if (isNewItem && newItem) outArr.push(newItem);
    return outArr;
}

// combine 2 arrays but only keep latest unique by key (default 'id')
// NB old and new array should already have unique keys
export const combineArrays = (oldArr, newArr, key = 'id') => {
    const updArr = oldArr.map(oldItem => {
        const foundInNew = newArr.find(newItem => (oldItem[key] === newItem[key]));
        return foundInNew || oldItem;
    });
    const newerArr = newArr.filter(newItem => {
        const foundInOld = oldArr.find(oldItem => (newItem[key] === oldItem[key]));
        return (foundInOld) ? false : true;
    })
    return [...updArr, ...newerArr];
}

// home brewn flatMap for array
const concat = (x, y) => {
    return x.concat(y)
}
export const flatMap = (arr, func) => {
    return arr.map(func).reduce(concat, [])
}

// slice array into chunks of [size]
export const sliceArr = (arr, size, outArr = []) => {
    return (arr.length <= size) ?
        [...outArr, arr]
        : sliceArr(arr.slice(size), size, [...outArr, arr.slice(0, size)]);
}

// filter array of objects to keep only unique keys
export const uniqByKey = (arr, key) => {
    var seen = {};
    var out = [];
    var len = arr.length;
    var j = 0;
    for (var i = 0; i < len; i++) {
        var item = arr[i][key];
        if (seen[item] !== 1) {
            seen[item] = 1;
            out[j++] = arr[i];
        }
    }
    return out;
}
