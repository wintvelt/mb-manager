// for getting and setting cookies + fetching data
// object based: provide object to set cookie, getCookie will return object

const cookieName = "MB_access";
const cookieTime = "MB_time";
const days = 30;

// cookies
export function getCookie(name) {
    var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return (v && v[2].length > 0) ? JSON.parse(decodeURI(v[2])) : null;
}

export function setCookie(object) {
	const value = encodeURI(JSON.stringify(object));
    var d = new Date();
    d.setTime(d.getTime() + 24*60*60*1000*days);
    document.cookie = cookieName + "=" + value + ";path=/;expires=" + d.toGMTString();
    document.cookie = cookieTime + "=" + Date.now() + ";path=/;expires=" + d.toGMTString();
}

export function deleteCookie() { 
    document.cookie = cookieName + "= ;path=/;expires=0";
}
