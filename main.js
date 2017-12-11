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
        .concat(cbtsTrip8chanPosts);

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
        span(post.counter, 'counter')+
        referenceToHtmlString(post.reference)+
        button(answers[post.postId], 'answers', 'button', `selectAnswers(${post.postId})`)  
    }
        <header>
          <time datetime="${date.toISOString()}">${formatDate(date)}</time>${
            span(post.subject, 'subject')+ 
            span(post.name, 'name')+ 
            span(post.trip, 'trip')+
            span(post.email, 'email')}
          <a href="${post.link}" target="_blank">${post.postId}</a>
        </header>
        ${img(post.imageUrl)}
        ${extraImages}
        <div class="text">${addHighlights(post.text)}</div>
        </article>`;
    const element = wrapper.firstElementChild;
    element.addEventListener('click', (event) => {
        if(event.target.classList.contains('text')) {
            if(answers[post.postId]) {
                console.log(answers[post.postId]);
            }
        }
    });
    return element;
}

function span(content, className) {
    const cls = className ? ` class="${className}"` : '';
    return content ? `<span${cls}>${content}</span>` : '';
}

function button(check, content, className, onclick) {
    className = className ? ` class="${className}"` : '';
    onclick = onclick ? ` onclick="${onclick}"` : '';
    return check ? `<button${className}${onclick}>${content}</button>` : '';
}

function selectAnswers(postId) {
    const oldSelected = document.querySelector(`article.selected`);
    if(oldSelected) oldSelected.classList.remove('selected');
    const postElement = document.querySelector(`#post${postId}`);
    postElement.classList.add('selected');
    const aside = document.querySelector('aside');
    const answerList = answers[''+postId].map(l => `<p>${l.answer}</p>`).join('\n');
    const extraAnswerList = answers[''+postId].map(l => `<p>${l.extraAnswer}</p>`).join('\n');
    aside.innerHTML = `
      <h3>Answers for <a href="#post${postId}">${postId}</a></h3>
      <div>${answerList}</div>
      <h3>Extra answers</h3>
      <div>${extraAnswerList}</div>`;
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
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${xx(date.getHours())}:${xx(date.getMinutes())}:${xx(date.getSeconds())}`;
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
