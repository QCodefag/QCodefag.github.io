let posts = [];
let statusElement;
let editor;
let answers = {};
let editedAnswers = {};
let postOrder = [];

function main() {
    editor = new SimpleMDE({element: document.getElementById('answers'), spellChecker: false});
    if (!editor.isPreviewActive()) {
        editor.togglePreview();
    }

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
    posts = []
        .concat(polNonTrip4chanPosts)
        .concat(polTrip4chanPosts)
        .concat(polTrip8chanPosts)
        .concat(cbtsTrip8chanPosts);

    posts.sort((a, b) => b.timestamp - a.timestamp);
    postOrder.push(...(posts.map(p => p.postId).reverse()));

    loadLocalAnswers();
    fetch('data/answers.json', {credentials: 'same-origin'})
        .then(result => result.text()).then(json => {
        answers = JSON.parse(json);
        render(posts);
    });
    checkForNewPosts();
}

function initSearch() {
    const searchElement = document.querySelector('input[type=search]');
    searchElement.oninput = () => {
        const value = searchElement.value;

        const keywordInText = value === value.toLowerCase()
            ? text => text.toLowerCase().includes(value)
            : text => text.includes(value);

        const ids = posts
            .filter(p => p.text && keywordInText(p.text))
            .map(p => p.postId);

        applyFilter(ids);
        if(value == '')
            setParams({});
        else
            setParams({q: value});
    };

    const postLines = posts
        .filter(p => p.text)
        .map(p => ({
            id: p.postId,
            lines: p.text
                .split('\n')
                .map(t => t.trim().replace(/[.?]/g, ''))
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
    datalist.innerHTML = resultList.map(i => `<option label="${i.ids.size}">${i.line}</option>`).join('\n');

    const query = getParams(location.search);
    if('q' in query) {
        searchElement.value = query.q;
        searchElement.oninput();
    }
}

function applyFilter(ids) {
    let count = 0;
    for (const element of Array.from(document.querySelectorAll('article'))) {
        if (ids.includes(element.item.postId)) {
            element.hidden = false;
            count++;
        } else {
            element.hidden = true;
        }
    }
    document.querySelector('#count').textContent = `${count}`;
}

function toggleAnswers() {
    document.body.classList.toggle('answers-disabled')
}

function toggleDialog() {
    const dialog = document.querySelector('.dialog');
    dialog.classList.toggle('open');
}

////////////////////
// rendering
////////////////////

function render(posts) {
    const container = document.querySelector('section');
    container.innerHTML = '';
    for (const post of posts) {
        container.appendChild(postToHtmlElement(post));
    }
    initSearch();
    selectAnswers(null);
}

const html = {
    post: (post) => {
        if (!post) return '';
        const date = new Date(post.timestamp * 1000);
        return `
        <header>
          <time datetime="${date.toISOString()}">${formatDate(date)}, ${formatTime(date)}</time>
          
          ${ifExists(post.subject, x => `
          <span class="subject" title="subject">${x}</span>`)}
          
          <span class="name" title="name">${post.name}</span>
          
          ${ifExists(post.trip, x => `
          <span class="trip" title="trip">${x}</span>`)}
              
          ${ifExists(post.email, x => `
          <span class="email" title="email">${x}</span>`)}
              
          <a href="${post.link}" target="_blank">${post.postId}</a>
        </header>
        
        ${ifExists(post.fileName, x => `
        <span class="filename" title="file name">${x}</span>`)}
        
        ${ifExists(post.imageUrl, post.isNew ? html.img : pipe(localImgSrc, html.img))}
        ${forAll(post.extraImageUrls, post.isNew ? html.img : pipe(localImgSrc, html.img))}
        
        <div class="text">${addHighlights(post.text)}</div>`;
    },
    img: (src) => {
        if (!src) return '';
        return `<a href="${src}" target="_blank"><img src="${src}" class="contain" width="300" height="300"></a>`;
    },
};

function dateToHtmlElement(date) {
    return tag.fromString(`
    <div><time datetime="${date.toISOString()}">${formatDate(date)}</time></div>
    `);
}

function postToHtmlElement(post) {
    const element = tag.fromString(`
      <article id="post${post.postId}" class="source_${post.source} ${ifExists(post.timestampDeletion, () => 'deleted')}">
        <button onclick="selectAnswers(${post.postId})" class="answers ${answerButtonClass(post.postId)}">answers</button>
        <span class="counter">${postOrder.indexOf(post.postId) + 1}</span>
        ${ifExists(post.reference, x => `
        <blockquote id="post${post.postId}">${html.post(x)}</blockquote>`)}
        ${html.post(post)}
      </article>`);
    element.item = post;
    return element;
}

const answerButtonClass = (postId) =>
    editedAnswers[postId]
        ? 'edited'
        : answers[postId] && answers[postId].length
        ? ''
        : 'empty';

// 1,10925,12916,13092,13215,59684,93287,93312,14795558,14797863,147023341,148029633,148029962,148031295,148032210,148032910,148033178,148033932,148136656,1476689362

const localImgSrc = src => 'data/images/' + src.split('/').slice(-1)[0];


const legendPattern = new RegExp(`([^a-zA-Z])(${Object.keys(legend).join('|')})([^a-zA-Z])`, 'g');

const addHighlights = text => !text
    ? ''
    : text
        .replace(/(^>[^>].*\n?)+/g,
            (match) => `<q>${match}</q>`)
        .replace(/(https?:\/\/[.\w\/?\-=&]+)/g,
            (match) => match.endsWith('.jpg') ? `<img src="${match}" alt="image">` : `<a href="${match}" target="_blank">${match}</a>`)
        .replace(/(\[[^[]+])/g,
            (match) => `<strong>${match}</strong>`)
        .replace(legendPattern,
            (match, p1, p2, p3, o, s) => `${p1}<abbr title="${legend[p2]}">${p2}</abbr>${p3}`);

////////////////////
// parse 8chan posts
////////////////////

let emptyThreads;

function checkForNewPosts() {
    emptyThreads = [];
    statusElement.textContent = 'fetching new posts...';

    const alreadyParsedIds = [
        // empty threads on cbts
        132230, 107604, 4485, 62050, 131416, 2, 61078, 61918, 133015, 131736, 15577, 2422, 130309, 2078, 132899, 120430, 117841, 117776, 132229, 26613, 110901, 2300, 131837, 1411, 106, 111180, 131800, 1327, 127080, 131488, 130524, 55606, 80370, 125940, 59035, 108027, 3952, 130219, 40157, 129902, 50043, 129379, 126728, 127436, 123576, 127679, 115185, 106323, 125574, 4249, 114171, 125725, 65635, 44375, 124958, 1346, 125046, 1362, 124167, 108000, 116764, 123887, 123275, 74186, 122424, 4992, 120048, 1391, 94829, 4136, 12832, 119253, 118462, 117654, 91987, 3163, 116784, 1342, 100323, 115972, 2219, 23518, 115178, 66888, 94250, 1398, 114324, 44295, 108272, 113439, 108873, 112573, 36791, 111656, 110385, 110721, 109881, 41855, 1367, 109005, 15139, 102142, 108024, 104552, 17818, 107138, 61534, 33405, 106285, 5984, 59512, 290, 101124, 105464, 29994, 104641, 103753, 74559, 7705, 102804, 101840, 56328, 65503, 101287, 100321, 28157, 99590, 98535, 97899, 97068, 23344, 80960, 96273, 56075, 77040, 95429, 94465, 93785, 4409, 10, 91369, 8629, 90491, 89588, 88704, 87855, 86934, 86074, 3418, 84471, 62673, 83064, 82175, 45109, 15984, 2198, 59853, 423, 37441, 52820, 80329, 79481, 78661, 77824, 77001, 16027, 49883, 170, 76158, 75329, 6535, 69526, 69603, 33706, 10556, 62689, 20714, 71941, 71064, 64707, 8515, 70260, 42055, 62353, 68564, 28513, 67649, 41581, 848, 66796, 3102, 65909, 49767, 65108, 64254, 33454, 1401, 62562, 61105, 61621, 60804, 1, 58319, 50429, 1816, 56876,

        // threads already in cbtsTrip8chanPosts.js
        13366, 16943, 33992, 59130, 59969, 63405, 69407, 72735, 73615, 74470, 81218, 82147, 85308, 92197, 93014, 120902, 121693, 126564, 128199, 128973, 129812,
    ];

    const catalogUrl = 'https://8ch.net/cbts/catalog.json';

    getJson(catalogUrl).then(threads => {

        const newThreadIds = threads
            .reduce((p, e) => p.concat(e.threads), [])
            .filter((p) => p.sub.includes('CBTS'))
            .map((p) => p.no)
            .filter((id) => !alreadyParsedIds.includes(id));

        Promise.all(newThreadIds.map(getPostsByThread)).then(result => {
            const newPosts = result.reduce((p, e) => p.concat(e), []);

            console.log(`empty threads\n${emptyThreads}`);

            newPosts.sort((a, b) => b['timestamp'] - a['timestamp']);
            posts.unshift(...newPosts);
            postOrder.push(...(newPosts.map(p => p.postId).reverse()));
            render(posts);
            statusElement.textContent = '';
        });
    });
}

function getPostsByThread(id) {
    const threadUrl = (id) => `https://8ch.net/cbts/res/${id}.json`;
    const referencePattern = />>(\d+)/g;

    return getJson(threadUrl(id)).then(result => {
        if (!result.posts.some((p) => p.trip === '!UW.yye1fxo')) {
            emptyThreads.push(id);
            return [];
        }
        const threadPosts = result.posts
            .map(p => parse8chanPost(p, id));

        const newPosts = threadPosts
            .filter((p) => p.trip === '!UW.yye1fxo');

        for (const newPost of newPosts) {
            referencePattern.lastIndex = 0;
            if (referencePattern.test(newPost.text)) {
                referencePattern.lastIndex = 0;
                const referenceId = referencePattern.exec(newPost.text)[1];
                newPost.reference = threadPosts.find((p) => p.postId == referenceId);
            }
        }
        console.log(`added ${newPosts.length} thread ${id}`);
        return newPosts;
    });
}

// NEWS


function parse8chanPost(post, threadId) {
    const getImgUrl = (chanPost) => `https://media.8ch.net/file_store/${chanPost.tim}${chanPost.ext}`;

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
            newPost[keyMap[key]] = getImgUrl(post);
        else if (key == 'extra_files')
            newPost[keyMap[key]] = post[key].map(getImgUrl);
        else if (key == 'no')
            newPost[keyMap[key]] = post[key].toString();
        else if (key == 'com')
            newPost[keyMap[key]] = cleanHtmlText(post[key]);
        else
            newPost[keyMap[key]] = post[key];
    }
    newPost.source = '8chan_cbts';
    newPost.link = `https://8ch.net/cbts/res/${threadId}.html#${newPost.postId}`;
    newPost.threadId = '' + threadId;
    newPost.isNew = true;
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

////////////////////
// html functions
////////////////////

const ifElement = (selector, callback) => {
    const element = document.querySelector(selector);
    if (element) return callback(element);
};

function copyAnswers() {
    ifElement('article.selected', selectedArticle => {
        const postId = selectedArticle.item.postId;
        editedAnswers[postId] = editor.value();
    });

    const copyTextarea = document.querySelector('#Copy');
    copyTextarea.value = JSON.stringify(editedAnswers, null, 2);

    copyTextarea.select();
    try {
        document.execCommand('copy');
        copyTextarea.value = '';
    } catch (err) {
        alert('browser doesn\'t support copy');
    }
}

function resetAnswer() {
    ifElement('article.selected', selectedArticle => {
        const postId = selectedArticle.item.postId;
        delete editedAnswers[postId];
        const value = answers[postId] || '';
        editor.value(value);
        if (editor.isPreviewActive()) {
            setPreview(editor);
        }
        selectedArticle.querySelector('article button').className = `answers ${value ? '' : 'empty'}`;
    });
}

const answerIsEdited = postId => (!answers[postId] && editor.value().length) || (answers[postId] && answers[postId] !== editor.value());

function selectAnswers(selectedPostId) {
    ifElement('article.selected', selectedArticle => {
        const postId = selectedArticle.item.postId;
        if (answerIsEdited(postId)) {
            editedAnswers[postId] = editor.value();
            selectedArticle.querySelector('article button').className = `answers edited`
        }
        selectedArticle.classList.remove('selected');
    });
    if (!selectedPostId) {
        document.querySelector('aside h1').innerHTML = `Answers`;
        editor.value('');
        if (editor.isPreviewActive()) {
            setPreview(editor);
        }
        document.querySelector('#editor-wrapper').style.display = 'none';
    } else {
        document.querySelector('#editor-wrapper').style.display = 'block';

        const article = document.querySelector(`#post${selectedPostId}`);
        article.classList.add('selected');

        document.querySelector('aside h1').innerHTML = `Answers for <a href="#post${selectedPostId}">${selectedPostId}</a>`;

        const answer = editedAnswers[selectedPostId] !== undefined ? editedAnswers[selectedPostId] : answers[selectedPostId] || '';
        editor.value(answer);
        // refresh hack
        if (editor.isPreviewActive()) {
            setPreview(editor);
        }
    }
}

function storeLocalAnswers() {
    ifElement('article.selected', selectedArticle => {
        const postId = selectedArticle.item.postId;
        editedAnswers[postId] = editor.value();
    });
    localStorage.setItem('answers', JSON.stringify(editedAnswers));
}


function loadLocalAnswers() {
    const newAnswers = localStorage.getItem('answers');
    if (newAnswers) {
        editedAnswers = JSON.parse(newAnswers);
    }
}

function setPreview(editor) {
    const wrapper = editor.codemirror.getWrapperElement();
    const toolbar = editor.options.toolbar ? editor.toolbarElements.preview : null;
    const preview = wrapper.lastChild;

    preview.classList.add("editor-preview-active");

    if (toolbar) {
        toolbar.classList.add("active");

        const toolbarDiv = wrapper.previousSibling;
        toolbarDiv.classList.add("disabled-for-preview");
    }
    preview.innerHTML = editor.options.previewRender(editor.value(), preview);
}

function getAllAnswersUpdate() {
    return JSON.stringify(Object.assign({}, answers, editedAnswers), null, 2);
}

window.addEventListener('beforeunload', storeLocalAnswers);

document.addEventListener('DOMContentLoaded', main, false);