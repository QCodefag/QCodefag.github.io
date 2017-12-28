const getJson = url => fetch(url).then(response => response.json());


const pipe = (...funcs) => i => funcs.reduce((p, c) => c(p), i);


const forAll = (items, htmlCallback) => items && items instanceof Array ? items.map(htmlCallback).join('') : '';
const ifExists = (item, htmlCallback) => item ? htmlCallback(item) : '';
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const xx = x => (x < 10 ? '0' : '') + x;
const formatDate = date => `${months[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`;
const formatTime = date => `${xx(date.getHours())}:${xx(date.getMinutes())}:${xx(date.getSeconds())}`;

const tag = name => {
    return document.createElement(name);
};
tag.fromString = string => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = string;
    return wrapper.firstElementChild;
};

const getParams = query => {
    if (!query) {
        return { };
    }

    return (/^[?#]/.test(query) ? query.slice(1) : query)
        .split('&')
        .reduce((params, param) => {
            let [ key, value ] = param.split('=');
            params[key] = value ? decodeURIComponent(value
                // .replace(/\+/g, ' ')
            ) : '';
            return params;
        }, { });
};

const setParams = params => {
    if(Object.keys(params).length) {
        const value = Object.keys(params)
            .map(k => `${k}=${encodeURIComponent(params[k]
                // .replace(/ /g, '+')
            )}`)
            .join('&');

        history.replaceState({}, null, `?${value}`);
    } else {
        history.replaceState({}, null, `?`);
    }
};