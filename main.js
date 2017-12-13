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
let posts = [];
let statusElement;
let counter = 1;

function main() {
    statusElement = document.querySelector('#status');

    polNonTrip4chanPosts.forEach(p => {
        p.source = '4chan_pol_anon';
        p.link = `https://archive.4plebs.org/pol/thread/${p.threadId}/#${p.postId}`;
    });
    polTrip4chanPosts.forEach(p => {
        p.source = '4chan_pol';
        p.link = `https://archive.4plebs.org/pol/thread/${p.threadId}/#${p.postId}`;
    });
    polTrip8chanPosts.forEach(p => {
        p.source = '8chan_pol';
        p.link = `https://8ch.net/pol/res/${p.threadId}.html#${p.postId}`;
    });
    cbtsTrip8chanPosts.forEach(p => {
        p.source = '8chan_cbts';
        p.link = `https://8ch.net/cbts/res/${p.threadId}.html#${p.postId}`;
    });
    posts = []
        .concat(polNonTrip4chanPosts)
        .concat(polTrip4chanPosts)
        .concat(polTrip8chanPosts)
        // .concat(cbtsTrip8chanPosts)
    ;

    posts.forEach(p => p.counter = counter++);
    posts.reverse();

    const searchElement = document.querySelector('input[type=search]');

    searchElement.oninput = () => {
        const value = searchElement.value;
        let filter = (text) => text.includes(value);

        if (value === value.toLowerCase())
            filter = (text) => text.toLowerCase().includes(value);

        const ids = posts
            .filter(p => p.text && filter(p.text))
            .map(p => p.postId);
        applyFilter(ids);
    };

    render(posts);

    const postLines = posts
        .filter(p => p.text)
        .map(p => ({
            id: p.postId, lines: p.text
                .split('\n')
                .map(t => t.trim().replace(/[\.\?]/g, ''))
        }));

    const result = {};
    for (const post of postLines) {
        for (const line of post.lines) {
            if (line == '') continue;
            if (!result[line]) result[line] = new Set();
            result[line].add(post.id);
        }
    }
    const resultList = Object.keys(result)
        .map(k => ({line: k, ids: result[k]}))
        .filter(a => a.ids.size > 2);

    resultList.sort((a, b) => b.ids.size - a.ids.size);
    const datalist = document.querySelector('#hints');
    datalist.innerHTML = resultList.map(i => `<option label="${i.ids.size}">${i.line}</option>`).join('\n')

    checkForNewPosts();
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
    const container = document.querySelector('section');
    container.innerHTML = '';
    for (const item of items) {
        const element = postToHtmlElement(item);
        item.element = element;
        container.appendChild(element);
    }
}

function postToHtmlElement(post) {
    const date = new Date(post.timestamp * 1000);
    const wrapper = document.createElement('div');
    const deleted = post.timestampDeletion ? 'deleted' : '';

    const extraImages = post.extraImageUrls ? post.extraImageUrls.map(img).join('') : '';

    wrapper.innerHTML = `
      <article id="post${post.postId}" class="source_${post.source} ${deleted}">
        ${
    span(post.counter, post.counter, {'class': 'counter'}) +
    referenceToHtmlString(post.reference)
        }
        <header>
          <time datetime="${date.toISOString()}">${formatDate(date)}</time>${
    span(post.subject, post.subject, {'class': 'subject', 'title': 'subject'}) +
    span(post.name, post.name, {'class': 'name', 'title': 'name'}) +
    span(post.trip, post.trip, {'class': 'trip', 'title': 'trip'}) +
    span(post.email, post.email, {'class': 'email', 'title': 'email'}) +
    a(post.postId, post.link, {href: post.link, target: '_blank'}) +
    button('answers', answers[post.postId], {onclick: `selectAnswers(${post.postId})`})
        }
        </header>
        ${
    span(post.fileName, post.fileName, {'class': 'filename', 'title': 'file name'}) +
    img(post.imageUrl) +
    extraImages
        }
        <div class="text">${addHighlights(post.text)}</div>
        </article>`;
    const element = wrapper.firstElementChild;
    return element;
}

function span(content, check, attributes) {
    if (!check) return '';
    attributes = attributes || {};
    const attributeString = Object.keys(attributes).map(key => `${key}="${attributes[key]}"`).join(' ');
    return `<span ${attributeString}>${content}</span>`;
}

function a(content, check, attributes) {
    if (!check) return '';
    attributes = attributes || {};
    const attributeString = Object.keys(attributes).map(key => `${key}="${attributes[key]}"`).join(' ');
    return `<a ${attributeString}>${content}</a>`;
}

function button(content, check, attributes) {
    if (!check) return '';
    attributes = attributes || {};
    const attributeString = Object.keys(attributes).map(key => `${key}="${attributes[key]}"`).join(' ');
    return `<button ${attributeString}>${content}</button>`;
}

function selectAnswers(postId) {
    const oldSelected = document.querySelector(`article.selected`);
    if (oldSelected) oldSelected.classList.remove('selected');
    const postElement = document.querySelector(`#post${postId}`);
    postElement.classList.add('selected');
    const aside = document.querySelector('aside');
    const answerList = answers['' + postId].map(l => `<dt>${l.line}</dt><dd>${addHighlights(l.answer)}</dd>`).join('\n');
    const extraAnswerList = answers['' + postId].map(l => `<dt>${l.line}</dt><dd>${addHighlights(l.extraAnswer)}</dd>`).join('\n');
    aside.innerHTML = `
      <h3>Answers for <a href="#post${postId}">${postId}</a></h3>
      <dl>${answerList}</dl>
      <h3>Extra answers</h3>
      <dl>${extraAnswerList}</dl>`;
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
    if (!src) return '';
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
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${xx(date.getHours())}:${xx(date.getMinutes())}:${xx(date.getSeconds())}`;
}

function xx(x) {
    return (x < 10 ? '0' : '') + x;
}

let emptyThreads;
function checkForNewPosts() {
    emptyThreads = [];
    statusElement.textContent = 'fetching new posts...';

    // skip threads that are already parsed in "cbtsTrip8chanPosts.js"
    const alreadyParsedIds = [
        86934,52438,106,59853,1,19041,84471,77824,70260,20,86074,83064,82175,56670,77001,79481,78661,80329,71064,55851,57446,71941,75329,65108,76158,68564,64254,66796,61621,30459,60804,58319,49045,43833,23621,21168,15991,21962,67649,65909,41913,42972,18636,53296,33185,47314,62562,31335,39232,40081,28665,24503,1716,48266,27795,29570,25363,26986,14277,26177,19432,20331,32244,41002,17741,15090,36554,22773,35673
    ];

    const catalogUrl = 'https://8ch.net/cbts/catalog.json';

    getJson(catalogUrl).then(threads => {

        const newThreadIds = threads
            .reduce((p, e) => p.concat(e['threads']), [])
            .filter((p) => p['sub'].includes('CBTS'))
            .map((p) => p['no'])
            .filter((id) => !alreadyParsedIds.includes(id));

        Promise.all(newThreadIds.map(getPostsByThread)).then(result => {
            const newPosts = result.reduce((p, e) => p.concat(e), []);

            console.log(`empty threads\n${emptyThreads}`);

            newPosts.sort((a, b) => a['timestamp'] - b['timestamp']);
            newPosts.forEach(p => p.counter = counter++);
            newPosts.reverse();
            posts.unshift(...newPosts);
            render(posts);
            statusElement.textContent = '';
        });
    });
}

function getPostsByThread(id) {
    const threadUrl = (id) => `https://8ch.net/cbts/res/${id}.json`;
    const referencePattern = />>(\d+)/g;

    return getJson(threadUrl(id)).then(result => {
        if (!result['posts'].some((p) => p.trip === '!ITPb.qbhqo')) {
            emptyThreads.push(id);
            return [];
        }
        const threadPosts = result['posts']
            .map(parse8chanPost);

        const newPosts = threadPosts
            .filter((p) => p.trip === '!ITPb.qbhqo');

        for (const newPost of newPosts) {
            newPost.threadId = ''+id;
            referencePattern.lastIndex = 0;
            if (referencePattern.test(newPost.text)) {
                referencePattern.lastIndex = 0;
                const referenceId = referencePattern.exec(newPost.text)[1];
                const referencePost = threadPosts.find((p) => p.postId == referenceId);
                newPost['reference'] = referencePost;
            }
            newPost.source = '8chan_cbts';
            newPost.link = `https://8ch.net/cbts/res/${newPost.threadId}.html#${newPost.postId}`;
        }
        console.log(`added ${newPosts.length} thread ${id}`);
        return newPosts;
    });
}

function getJson(url) {
    return fetch(url).then(response => response.json());
}

function parse8chanPost(post) {
    const keyMap = {
        'no': 'postId',
        'id': 'userId',
        'time': 'timestamp',
        'title': 'title',
        'name': 'name',
        'email': 'email',
        'trip': 'trip',
        'com': 'text',
        'sub': 'subject',
        'tim': 'imageUrl',
        'extra_files': 'extraImageUrls',
        'filename': 'fileName',
    };

    const newPost = {};
    for (const key of Object.keys(keyMap)) {
        if (post[key] == null) continue;

        if (key == 'tim')
            newPost[keyMap[key]] = `https://media.8ch.net/file_store/${post[key]}${post['ext']}`;
        else if (key == 'extra_files')
            newPost[keyMap[key]] = post[key].map((e) => `https://media.8ch.net/file_store/${e['tim']}${e['ext']}`);
        else if (key == 'no')
            newPost[keyMap[key]] = post[key].toString();
        else if (key == 'com')
            newPost[keyMap[key]] = cleanHtmlText(post[key]);
        else
            newPost[keyMap[key]] = post[key];
    }
    return newPost;
}

function cleanHtmlText(htmlText) {
    const emptyPattern = /<p class="body-line empty "><\/p>/g;
    const referencePattern = /<a [^>]+>&gt;&gt;(\d+)<\/a>/g;
    const linkPattern = /<a [^>]+>(.+?)<\/a>/g;
    const quotePattern = /<p class="body-line ltr quote">&gt;(.+?)<\/p>/g;
    const paragraphPattern = /<p class="body-line ltr ">(.+?)<\/p>/g;

    return htmlText
        .replace(emptyPattern, '\n')
        .replace(referencePattern, (m, p1) => `>>${p1}`)
        .replace(linkPattern, (m, p1) => `${p1}`)
        .replace(quotePattern, (m, p1) => `>${p1}\n`)
        .replace(paragraphPattern, (m, p1) => `${p1}\n`)
        ;
}

Object.filter = (obj, predicate) =>
    Object.keys(obj)
        .filter(key => predicate(obj[key]))
        .reduce((res, key) => {
            res[key] = obj[key];
            return res
        }, {});

document.addEventListener('DOMContentLoaded', () => {
    main();
}, false);
