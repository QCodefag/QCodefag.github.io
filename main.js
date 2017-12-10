const legend = {
    'Adm R': 'Admiral Michael S. Rogers - Director of the NSA',
    'AF1': 'Air Force 1 - POTUS plane',
    'AG': 'Attorney General',
    'Anon': 'Anonymous',
    'ANTIFA': 'Anti-Fascists, Soros backed domestic terrorists',
    'BIS': 'Bank for International Settlements',
    'BO': 'Barack Obama',
    'BOD': 'Board of Directors',
    'BP': 'Border Patrol',
    'CF': 'Clinton Foundation',
    'CIA': 'Central Intelligence Agency',
    'CS': 'Civil Service',
    'CTR': 'Correct The Record',
    'DC': 'District of Columbia',
    'DJT': 'President Donald John Trump',
    'DNC': 'Democratic National Committee',
    'DOE': 'Department Of Energy',
    'DOJ': 'Department Of Justice',
    'D\'s': 'Democrats',
    'EMS': 'Emergency Medical Services',
    'EU': 'European Union',
    'F&F': 'Fast and Furious - Feinstein\'s failed gun sale attempt',
    'f2f': 'Face to Face',
    'FB': 'Facebook',
    'FBI': 'Federal Bureau of Investigation',
    'FED': 'Federal Reserve',
    'FOIA': 'Freedom Of Information Act',
    'HI': 'Hawaii',
    'HRC': 'Hillary Rodham Clinton',
    'HS': 'Homeland Security',
    'HUMA': 'Harvard University Muslim Alumni',
    'H-wood': 'Hollywood',
    'IC': 'Intelligence Community',
    'ID': 'Identification',
    'IRS': 'Internal Revenue Agency ',
    'ISIS': 'Israeli Secret Intelligence Service',
    'JA': 'Julian Assange',
    'JFK': 'John Fitzgereld Kennedy ',
    'JK': 'John Kerry, Jared Kushner',
    'KKK': 'Klu Klux Klan - started by D\'s',
    'KSA': 'Kingdom of Saudi Arabia',
    'LV': 'Las Vegas',
    'MB': 'Muslim Brotherhood',
    'MI': 'Military Intelligence',
    'ML': 'Marshal Law',
    'MM': 'Media Matters',
    'MS-13': 'Latino Drug Cartel',
    'MSM': 'Mainstream Media',
    'NG': 'National Guard',
    'NK': 'North Korea, also NORK, NOK',
    'NP': 'Non-Profit',
    'NSA': 'National Security Agency',
    'OP': 'Original Poster',
    'PG': 'Pizzagate/Pedogate',
    'PM': 'Prime Minister',
    'POTUS': 'President of the United States ',
    'RNC': 'Republican National Committee',
    'RR': 'Rod Rosenstein',
    'R\'s': 'Republicans',
    'SA': 'Saudi Arabia',
    'SAP': 'Special Access Programs',
    'SC': 'Supreme Court',
    'SK': 'South Korea',
    'SS': 'Secret Service',
    'ST': 'Seal Team (eg. Seal Team 6)',
    'U1': 'Uranium 1',
    'US': 'United States  ',
    'USSS': 'United States Secret Service',
    'VJ': 'Valerie Jarret ',
    'WH': 'White House',
    'WW': 'World War, and possibly World Wide?'
};
let posts;
function main() {
    polNonTrip4chanPosts.forEach(p => p.source = '4chan_pol_anon');
    polTrip4chanPosts.forEach(p => p.source = '4chan_pol');
    polTrip8chanPosts.forEach(p => p.source = '8chan_pol');
    cbtsTrip8chanPosts.forEach(p => p.source = '8chan_cbts');
    posts = []
        .concat(polNonTrip4chanPosts)
        .concat(polTrip4chanPosts)
        .concat(polTrip8chanPosts)
        .concat(cbtsTrip8chanPosts)
    ;
    let counter = 1;
    posts.forEach(p => p.counter = counter++);
    posts.reverse();

    const searchElement = document.querySelector('input[type=search]');

    searchElement.oninput = () => {
        const value = searchElement.value.toLowerCase();
        const ids = posts
            .filter(p => p.text && p.text.toLowerCase().includes(value))
            .map(p => p.postId);
        applyFilter(ids);
    };

    render(posts);

    const postLines = posts
        .filter(p => p.text)
        .map(p => ({id: p.postId, lines: p.text
            .split('\n')
            .map(t => t.trim().replace(/[\.\?]/g, ''))}));

    const result = {};
    for(const post of postLines) {
        for(const line of post.lines) {
            if(line == '') continue;
            if(!result[line]) result[line] = new Set();
            result[line].add(post.id);
        }
    }
    const resultList = Object.keys(result)
        .map(k => ({line: k, ids: result[k]}))
        .filter(a => a.ids.size > 2);

    resultList.sort((a, b) => b.ids.size - a.ids.size);
    const datalist = document.querySelector('#hints');
    datalist.innerHTML = resultList.map(i => `<option label="${i.ids.size}">${i.line}</option>`).join('\n')
}

function applyFilter(ids) {
    const countElement = document.querySelector('#count');

    let count = 0;
    for (const post of posts) {
        if (ids.includes(post.postId)) {
            post.element.hidden = false;
            count++;
        } else {
            post.element.hidden = true;
        }
    }
    countElement.textContent = `${count}`;
}

function render(items) {
    const container = document.querySelector('main');
    container.innerHTML = '';
    for (const item of items) {
        const element = postToHtmlElement(item);
        item.element = element;
        container.appendChild(element);
    }
}

function postToHtmlElement(e) {
    const date = new Date(e.timestamp * 1000);
    const wrapper = document.createElement('div');
    const deleted = e.timestampDeletion ? 'deleted' : '';

    const extraImages = e.extraImageUrls ? e.extraImageUrls.map(img).join('') : '';

    wrapper.innerHTML = `
      <article id="post${e.postId}" class="source_${e.source} ${deleted}">
        <span class="counter">${e.counter}</span>
        ${referenceToHtmlString(e.reference)}
        <header>
          <time datetime="${date.toISOString()}">${formatDate(date)}</time>${
            span(e.name, 'name')+ 
            span(e.trip, 'trip')+
            span(e.email, 'email')}
          <span>${e.postId}</span>
        </header>
        ${img(e.imageUrl)}
        ${extraImages}
        <div class="text">${addHighlights(e.text)}</div>
        </article>`;
    return wrapper.firstElementChild;
}

function span(content, className) {
    const cls = className ? ` class="${className}"` : '';
    return content ? `<span${cls}>${content}</span>` : '';
}

function referenceToHtmlString(e) {
    if (!e) return '';
    const date = new Date(e.timestamp * 1000);
    const email = e.email ? `<span class="email">${e.email}</span>` : '';
    const name = e.name ? `<span class="name">${e.name}</span>` : '';
    const trip = e.trip ? `<span class="trip">${e.trip}</span>` : '';
    return `<blockquote id="post${e.postId}">
        ${referenceToHtmlString(e.reference)}
        <header><time datetime="${date.toISOString()}">${formatDate(date)}</time>${name}${trip}${email}<span>${e.postId}</span></header>
        ${img(e.imageUrl)}
        <div class="text">${addHighlights(e.text)}</div>
        </blockquote>`;
}

function img(src) {
    if(!src) return '';
    return `<a href="${src}" target="_blank"><img src="${src}" class="contain" width="300" height="300"></a>`
}

const legendPattern = new RegExp(`([^a-zA-Z])(${Object.keys(legend).join('|')})([^a-zA-Z])`, 'g');

function addHighlights(text) {
    if (!text) return '';
    return text
        .replace(/(^>[^>].*\n?)+/g,
            (match) => `<q>${match}</q>`)
        .replace(/(https?:\/\/[.\w\/?\-=&]+)/g,
            (match) => match.endsWith('.jpg') ? `<img src="${match}" alt="image">` : `<a href="${match}" target="_blank">${match}</a>`)
        .replace(/(\[[^[]+\])/g,
            (match) => `<strong>${match}</strong>`)
        .replace(legendPattern,
            (match, p1, p2, p3, o, s) => `${p1}<abbr title="${legend[p2]}">${p2}</abbr>${p3}`)
        ;
}

function formatDate(date) {
    return `${date.getDate()}-${date.getMonth() + 1} ${xx(date.getHours())}:${xx(date.getMinutes())}:${xx(date.getSeconds())}`;
}

function xx(x) {
    return (x < 10 ? '0' : '') + x;
}

Object.filter = (obj, predicate) =>
    Object.keys(obj)
        .filter( key => predicate(obj[key]) )
        .reduce( (res, key) => {res[key] = obj[key]; return res}, {} );

document.addEventListener('DOMContentLoaded', () => {
    main();
}, false);
