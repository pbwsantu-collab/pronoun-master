/* Pronoun Master PWA - Chapter XI */
(function () {
  'use strict';

  const STATE = {
    lessons: [],
    questions: [],
    glossary: [],
    screen: 'home',
    lessonIdx: 0,
    lang: localStorage.getItem('pm_lang') || 'mixed',
    xp: parseInt(localStorage.getItem('pm_xp') || '0', 10),
    completed: JSON.parse(localStorage.getItem('pm_completed') || '[]'),
    quiz: null
  };

  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

  async function loadData() {
    try {
      const [lessonsRes, questionsRes, glossaryRes] = await Promise.all([
        fetch('data/lessons.json'),
        fetch('data/questions.json'),
        fetch('data/glossary.json')
      ]);
      const lessonsData = await lessonsRes.json();
      const questionsData = await questionsRes.json();
      const glossaryData = await glossaryRes.json();
      STATE.lessons = lessonsData.lessons || [];
      STATE.questions = questionsData.questions || [];
      STATE.glossary = glossaryData.terms || [];
      render();
    } catch (err) {
      console.error(err);
      $('#app').innerHTML = `
        <div class="loading-screen">
          <p style="font-size:1.2rem;margin-bottom:1rem">Data failed to load</p>
          <p style="opacity:.85;max-width:280px;text-align:center">Check that data/lessons.json, questions.json and glossary.json exist.</p>
        </div>`;
    }
  }

  function saveProgress() {
    localStorage.setItem('pm_xp', String(STATE.xp));
    localStorage.setItem('pm_completed', JSON.stringify(STATE.completed));
    localStorage.setItem('pm_lang', STATE.lang);
  }

  function badge() {
    if (STATE.xp >= 500) return 'Pronoun Master';
    if (STATE.xp >= 200) return 'Pronoun Explorer';
    if (STATE.xp >= 50) return 'Pronoun Beginner';
    return 'Getting Started';
  }

  function progressPct() {
    if (!STATE.lessons.length) return 0;
    return Math.round((STATE.completed.length / STATE.lessons.length) * 100);
  }

  function speak(text, langHint) {
    if (!window.speechSynthesis) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voices = speechSynthesis.getVoices();
    if (langHint === 'bn') {
      const bn = voices.find(v => v.lang.startsWith('bn'));
      if (bn) u.voice = bn;
      u.lang = 'bn-IN';
    } else {
      const en = voices.find(v => v.lang.startsWith('en'));
      if (en) u.voice = en;
      u.lang = 'en-US';
    }
    speechSynthesis.speak(u);
  }

  function render() {
    const app = $('#app');
    app.innerHTML = `
      <header class="app-header">
        <div>
          <h1>PRONOUN MASTER</h1>
          <div class="sub">Chapter XI — Pronouns</div>
        </div>
        <div class="header-actions">
          <button class="icon-btn" id="btn-lang" title="Language" aria-label="Language">Lang</button>
          <button class="icon-btn" id="btn-search" title="Search" aria-label="Search">Search</button>
        </div>
      </header>
      <div id="screen" class="screen active"></div>
      <nav class="bottom-nav" aria-label="Main">
        <button class="nav-item ${STATE.screen==='home'?'active':''}" data-go="home"><span class="ni">Home</span></button>
        <button class="nav-item ${STATE.screen==='lessons'?'active':''}" data-go="lessons"><span class="ni">Learn</span></button>
        <button class="nav-item ${STATE.screen==='practice'?'active':''}" data-go="practice"><span class="ni">Practice</span></button>
        <button class="nav-item ${STATE.screen==='quiz'?'active':''}" data-go="quiz"><span class="ni">Quiz</span></button>
        <button class="nav-item ${STATE.screen==='progress'?'active':''}" data-go="progress"><span class="ni">Progress</span></button>
      </nav>
      <div class="modal" id="modal"></div>
    `;

    $$('.nav-item').forEach(b => b.addEventListener('click', () => {
      STATE.screen = b.dataset.go;
      renderScreen();
      $$('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.go === STATE.screen));
    }));

    $('#btn-lang').onclick = () => showLangModal();
    $('#btn-search').onclick = () => { STATE.screen = 'search'; renderScreen(); };

    renderScreen();
  }

  function renderScreen() {
    const box = $('#screen');
    if (!box) return;
    switch (STATE.screen) {
      case 'home': box.innerHTML = viewHome(); break;
      case 'lessons': box.innerHTML = viewLessonList(); break;
      case 'lesson': box.innerHTML = viewLesson(); break;
      case 'practice': box.innerHTML = viewPractice(); break;
      case 'quiz': box.innerHTML = viewQuiz(); break;
      case 'results': box.innerHTML = viewResults(); break;
      case 'progress': box.innerHTML = viewProgress(); break;
      case 'search': box.innerHTML = viewSearch(); break;
      default: box.innerHTML = viewHome();
    }
    bindScreenEvents();
  }

  function viewHome() {
    return `
      <div class="hero">
        <h2>PRONOUN MASTER</h2>
        <p>Chapter XI — Pronouns</p>
        <p style="font-size:.85rem;color:#94a3b8;margin-top:.4rem">Interactive grammar for Bengali-medium learners</p>
      </div>
      <div class="progress-card">
        <div class="progress-label"><span>Lesson Progress</span><span>${progressPct()}%</span></div>
        <div class="progress-track"><div class="progress-fill" style="width:${progressPct()}%"></div></div>
        <div class="xp-row">
          <span>XP: <strong>${STATE.xp}</strong></span>
          <span class="badge">${badge()}</span>
        </div>
      </div>
      <div class="menu-grid">
        <div class="menu-card" data-go="lessons"><div class="icon">Learn</div><div class="title">Learn</div><div class="desc">20 lessons with Bengali</div></div>
        <div class="menu-card" data-go="practice"><div class="icon">Practice</div><div class="title">Practice</div><div class="desc">Filter and drill</div></div>
        <div class="menu-card" data-go="quiz"><div class="icon">Quiz</div><div class="title">Quiz</div><div class="desc">Test yourself</div></div>
        <div class="menu-card" data-go="progress"><div class="icon">Stats</div><div class="title">Progress</div><div class="desc">XP and badges</div></div>
      </div>
      <div class="next-chapter">
        <h4>Next - Chapter XII</h4>
        <p>Verbs: Principal (independent) and Auxiliary (helping) — be, have, shall, will, may, do, can…</p>
      </div>
    `;
  }

  function viewLessonList() {
    return `
      <h2 style="margin-bottom:1rem;color:var(--primary)">All Lessons</h2>
      <div class="lesson-list">
        ${STATE.lessons.map((l, i) => `
          <div class="lesson-item" data-idx="${i}">
            <div class="lesson-num">${l.num}</div>
            <div class="lesson-info">
              <h3>${l.title}</h3>
              <p>Art. ${l.article} ${STATE.completed.includes(l.id) ? '[Done]' : ''}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function viewLesson() {
    const l = STATE.lessons[STATE.lessonIdx];
    if (!l) return '<p>Lesson not found</p>';
    const sections = (l.sections || []).map(s => {
      let html = `<div class="section-card"><h3>${s.heading}</h3>`;
      if (STATE.lang !== 'bn') {
        html += `<div class="rule-box"><p>${s.rule || ''}</p></div>`;
      }
      if (STATE.lang !== 'en' && s.bn) {
        html += `<div class="bn-box">${s.bn}</div>`;
      }
      if (s.examples && s.examples.length) {
        html += `<div class="example-box"><strong>Examples:</strong><br>${s.examples.map(e => '• ' + e).join('<br>')}</div>`;
      }
      if (s.caution) {
        html += `<div class="caution-box">Note: ${s.caution}</div>`;
      }
      if (s.table) {
        html += `<div class="table-wrap"><table><thead><tr>${s.table.headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>`;
        s.table.rows.forEach(r => { html += `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`; });
        html += `</tbody></table></div>`;
      }
      html += `</div>`;
      return html;
    }).join('');

    return `
      <div class="lesson-header-card">
        <h2>${l.title}</h2>
        <div class="art">Article ${l.article}</div>
        <button class="icon-btn" id="btn-listen" style="margin-top:.6rem;background:var(--primary);width:auto;padding:0 .9rem;border-radius:8px" title="Listen">Listen</button>
      </div>
      ${sections}
      <div class="nav-row">
        <button id="btn-prev" ${STATE.lessonIdx===0?'disabled':''}>Previous</button>
        <button class="btn-primary" id="btn-done">Mark Done</button>
        <button id="btn-next" ${STATE.lessonIdx>=STATE.lessons.length-1?'disabled':''}>Next</button>
      </div>
    `;
  }

  function viewPractice() {
    const topics = ['All','Personal','Demonstrative','Relative','Interrogative','Distributive','Reflexive','Indefinite','Reciprocal','Mixed'];
    const counts = [10,20,50,100,'All'];
    return `
      <div class="filter-card">
        <label>Topic</label>
        <div class="chip-row" id="topic-chips">
          ${topics.map((t,i) => `<button class="chip ${i===0?'active':''}" data-topic="${t}">${t}</button>`).join('')}
        </div>
        <label>Number of questions</label>
        <div class="count-row" id="count-chips">
          ${counts.map((c) => `<button class="chip ${c===20?'active':''}" data-count="${c}">${c}</button>`).join('')}
        </div>
        <button class="btn-primary" id="btn-start-practice" style="width:100%;margin-top:.5rem;padding:.9rem">Start Practice</button>
      </div>
      <p style="text-align:center;color:var(--muted);font-size:.9rem">${STATE.questions.length} questions available</p>
    `;
  }

  function viewQuiz() {
    if (!STATE.quiz) {
      return `
        <div class="filter-card">
          <label>Quick Quiz</label>
          <p style="color:var(--muted);margin-bottom:1rem;font-size:.9rem">10 random questions from all topics</p>
          <button class="btn-primary" id="btn-start-quiz" style="width:100%;padding:.9rem">Start Quiz</button>
        </div>
        <div class="filter-card" style="margin-top:1rem">
          <label>Or choose Practice mode for filters</label>
          <button class="chip" id="go-practice" style="margin-top:.5rem">Go to Practice</button>
        </div>
      `;
    }
    const q = STATE.quiz.list[STATE.quiz.idx];
    if (!q) return viewResults();
    const pct = Math.round((STATE.quiz.idx / STATE.quiz.list.length) * 100);
    return `
      <div class="quiz-top">
        <div class="q-progress">
          <span>Q ${STATE.quiz.idx + 1} / ${STATE.quiz.list.length}</span>
          <div class="q-bar"><div class="q-bar-fill" style="width:${pct}%"></div></div>
        </div>
        <span style="font-size:.8rem;color:var(--muted)">${q.topic}</span>
      </div>
      <div class="q-card">
        <div class="q-num">${(q.type || 'mcq').toUpperCase()} · ${q.difficulty || 'medium'}</div>
        <div class="q-text">${q.question}</div>
        <div class="options">
          ${(q.options || []).map((o,i) => `
            <button class="opt-btn" data-opt="${String(o).replace(/"/g,'&quot;')}">${String.fromCharCode(65+i)}. ${o}</button>
          `).join('')}
        </div>
        <div class="feedback" id="feedback"></div>
        <div class="action-row">
          <button class="btn-submit" id="btn-submit" disabled>Submit</button>
          <button class="btn-next" id="btn-qnext" disabled>Next</button>
        </div>
      </div>
    `;
  }

  function viewResults() {
    if (!STATE.quiz) return '<p>No results</p>';
    const { score, list, answers } = STATE.quiz;
    const total = list.length;
    const acc = total ? Math.round((score / total) * 100) : 0;
    const topicMap = {};
    list.forEach((q, i) => {
      if (!topicMap[q.topic]) topicMap[q.topic] = { c: 0, t: 0 };
      topicMap[q.topic].t++;
      if (answers[i]) topicMap[q.topic].c++;
    });
    let strong = '—', weak = '—';
    let best = -1, worst = 2;
    Object.entries(topicMap).forEach(([t, v]) => {
      const r = v.t ? v.c / v.t : 0;
      if (r >= best) { best = r; strong = t; }
      if (r <= worst) { worst = r; weak = t; }
    });
    return `
      <div class="results-card">
        <div class="score-circle">${score}</div>
        <div class="score-label">${score} / ${total}</div>
        <div class="accuracy">Accuracy ${acc}%</div>
        <div class="stats-grid">
          <div class="stat-box"><div class="label">Correct</div><div class="val" style="color:var(--success)">${score}</div></div>
          <div class="stat-box"><div class="label">Wrong</div><div class="val" style="color:var(--danger)">${total - score}</div></div>
          <div class="stat-box"><div class="label">Strongest</div><div class="val" style="font-size:.95rem">${strong}</div></div>
          <div class="stat-box"><div class="label">Needs Practice</div><div class="val" style="font-size:.95rem">${weak}</div></div>
        </div>
        <button class="btn-primary" id="btn-retry" style="width:100%;padding:.85rem;margin-bottom:.6rem">Try Again</button>
        <button class="chip" id="btn-home" style="width:100%">Back to Home</button>
      </div>
    `;
  }

  function viewProgress() {
    return `
      <div class="progress-card">
        <div class="progress-label"><span>Lessons completed</span><span>${STATE.completed.length} / ${STATE.lessons.length}</span></div>
        <div class="progress-track"><div class="progress-fill" style="width:${progressPct()}%"></div></div>
        <div class="xp-row" style="margin-top:1rem">
          <span>Total XP: <strong>${STATE.xp}</strong></span>
          <span class="badge">${badge()}</span>
        </div>
      </div>
      <div class="section-card">
        <h3>Achievements</h3>
        <p style="line-height:1.8">
          ${STATE.xp >= 50 ? '[x]' : '[ ]'} Pronoun Beginner (50 XP)<br>
          ${STATE.xp >= 200 ? '[x]' : '[ ]'} Pronoun Explorer (200 XP)<br>
          ${STATE.xp >= 500 ? '[x]' : '[ ]'} Pronoun Master (500 XP)
        </p>
      </div>
      <div class="section-card">
        <h3>Glossary (${STATE.glossary.length} terms)</h3>
        ${STATE.glossary.map(t => `
          <div style="margin-bottom:.85rem;padding-bottom:.85rem;border-bottom:1px solid var(--border)">
            <strong style="color:var(--primary)">${t.term}</strong><br>
            <span style="font-size:.88rem">${t.en}</span><br>
            <span style="font-size:.88rem;color:#6b21a8">${t.bn}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  function viewSearch() {
    return `
      <input class="search-box" id="search-input" placeholder="Search: whom, possessive, relative, it…" autofocus>
      <div class="search-results" id="search-results">
        <p style="color:var(--muted);text-align:center;padding:2rem 0">Type a keyword to find lessons and terms</p>
      </div>
    `;
  }

  function bindScreenEvents() {
    $$('.menu-card[data-go]').forEach(c => c.onclick = () => {
      STATE.screen = c.dataset.go;
      renderScreen();
      $$('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.go === STATE.screen));
    });

    $$('.lesson-item').forEach(item => item.onclick = () => {
      STATE.lessonIdx = parseInt(item.dataset.idx, 10);
      STATE.screen = 'lesson';
      renderScreen();
    });

    const prev = $('#btn-prev');
    const next = $('#btn-next');
    const done = $('#btn-done');
    if (prev) prev.onclick = () => { STATE.lessonIdx--; renderScreen(); };
    if (next) next.onclick = () => { STATE.lessonIdx++; renderScreen(); };
    if (done) done.onclick = () => {
      const id = STATE.lessons[STATE.lessonIdx].id;
      if (!STATE.completed.includes(id)) {
        STATE.completed.push(id);
        STATE.xp += 15;
        saveProgress();
      }
      done.textContent = 'Done';
      done.disabled = true;
    };
    const listen = $('#btn-listen');
    if (listen) listen.onclick = () => {
      const l = STATE.lessons[STATE.lessonIdx];
      const text = (l.sections || []).map(s => s.rule || '').join('. ');
      speak(text, 'en');
    };

    $$('#topic-chips .chip').forEach(c => c.onclick = () => {
      $$('#topic-chips .chip').forEach(x => x.classList.remove('active'));
      c.classList.add('active');
    });
    $$('#count-chips .chip').forEach(c => c.onclick = () => {
      $$('#count-chips .chip').forEach(x => x.classList.remove('active'));
      c.classList.add('active');
    });
    const startP = $('#btn-start-practice');
    if (startP) startP.onclick = () => {
      const topic = ($('#topic-chips .chip.active') || {}).dataset.topic || 'All';
      let count = ($('#count-chips .chip.active') || {}).dataset.count || '20';
      let pool = STATE.questions.slice();
      if (topic !== 'All') pool = pool.filter(q => q.topic === topic);
      shuffle(pool);
      if (count !== 'All') pool = pool.slice(0, parseInt(count, 10));
      STATE.quiz = { list: pool, idx: 0, score: 0, answers: [], selected: null, submitted: false };
      STATE.screen = 'quiz';
      renderScreen();
    };

    const startQ = $('#btn-start-quiz');
    if (startQ) startQ.onclick = () => {
      const pool = STATE.questions.slice();
      shuffle(pool);
      STATE.quiz = { list: pool.slice(0, 10), idx: 0, score: 0, answers: [], selected: null, submitted: false };
      renderScreen();
    };
    const goP = $('#go-practice');
    if (goP) goP.onclick = () => { STATE.screen = 'practice'; renderScreen(); };

    $$('.opt-btn').forEach(btn => {
      btn.onclick = () => {
        if (STATE.quiz.submitted) return;
        $$('.opt-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        STATE.quiz.selected = btn.dataset.opt;
        const sub = $('#btn-submit');
        if (sub) sub.disabled = false;
      };
    });
    const sub = $('#btn-submit');
    if (sub) sub.onclick = () => {
      if (STATE.quiz.submitted || !STATE.quiz.selected) return;
      STATE.quiz.submitted = true;
      const q = STATE.quiz.list[STATE.quiz.idx];
      const ok = STATE.quiz.selected === q.answer;
      if (ok) {
        STATE.quiz.score++;
        STATE.xp += 5;
        saveProgress();
      }
      STATE.quiz.answers[STATE.quiz.idx] = ok;
      $$('.opt-btn').forEach(b => {
        b.disabled = true;
        if (b.dataset.opt === q.answer) b.classList.add('correct');
        else if (b.dataset.opt === STATE.quiz.selected && !ok) b.classList.add('wrong');
      });
      const fb = $('#feedback');
      if (fb) {
        fb.className = 'feedback show ' + (ok ? 'ok' : 'bad');
        fb.innerHTML = (ok ? 'Correct!' : 'Incorrect. Answer: <strong>' + q.answer + '</strong>') +
          '<br>' + (q.explanation || '') +
          (q.bn ? '<div class="bn">' + q.bn + '</div>' : '');
      }
      sub.disabled = true;
      const n = $('#btn-qnext');
      if (n) n.disabled = false;
    };
    const qnext = $('#btn-qnext');
    if (qnext) qnext.onclick = () => {
      STATE.quiz.idx++;
      STATE.quiz.selected = null;
      STATE.quiz.submitted = false;
      if (STATE.quiz.idx >= STATE.quiz.list.length) {
        STATE.screen = 'results';
      }
      renderScreen();
    };

    const retry = $('#btn-retry');
    if (retry) retry.onclick = () => {
      STATE.quiz = null;
      STATE.screen = 'quiz';
      renderScreen();
    };
    const home = $('#btn-home');
    if (home) home.onclick = () => { STATE.screen = 'home'; STATE.quiz = null; renderScreen(); };

    const si = $('#search-input');
    if (si) {
      si.oninput = () => {
        const q = si.value.trim().toLowerCase();
        const res = $('#search-results');
        if (!q) { res.innerHTML = '<p style="color:var(--muted);text-align:center;padding:2rem 0">Type a keyword…</p>'; return; }
        const lessonHits = STATE.lessons.filter(l =>
          l.title.toLowerCase().includes(q) ||
          (l.sections || []).some(s => (s.rule || '').toLowerCase().includes(q) || (s.heading || '').toLowerCase().includes(q))
        );
        const glossHits = STATE.glossary.filter(t =>
          t.term.toLowerCase().includes(q) || t.en.toLowerCase().includes(q) || (t.bn || '').includes(q)
        );
        let html = '';
        if (lessonHits.length) {
          html += '<h3 style="margin:.5rem 0;color:var(--primary)">Lessons</h3>';
          lessonHits.forEach(l => {
            const idx = STATE.lessons.indexOf(l);
            html += `<div class="lesson-item" data-idx="${idx}"><div class="lesson-num">${l.num}</div><div class="lesson-info"><h3>${l.title}</h3><p>Art. ${l.article}</p></div></div>`;
          });
        }
        if (glossHits.length) {
          html += '<h3 style="margin:1rem 0 .5rem;color:var(--primary)">Glossary</h3>';
          glossHits.forEach(t => {
            html += `<div class="section-card" style="padding:1rem"><strong>${t.term}</strong><br><span style="font-size:.88rem">${t.en}</span><br><span style="font-size:.88rem;color:#6b21a8">${t.bn}</span></div>`;
          });
        }
        if (!html) html = '<p style="color:var(--muted);text-align:center;padding:2rem 0">No matches</p>';
        res.innerHTML = html;
        $$('.lesson-item').forEach(item => item.onclick = () => {
          STATE.lessonIdx = parseInt(item.dataset.idx, 10);
          STATE.screen = 'lesson';
          renderScreen();
        });
      };
    }
  }

  function showLangModal() {
    const modal = $('#modal');
    modal.className = 'modal show';
    modal.innerHTML = `
      <div class="modal-sheet">
        <h3>Language / ভাষা</h3>
        <div class="lang-toggle">
          <button data-lang="en" class="${STATE.lang==='en'?'active':''}">English</button>
          <button data-lang="bn" class="${STATE.lang==='bn'?'active':''}">বাংলা</button>
          <button data-lang="mixed" class="${STATE.lang==='mixed'?'active':''}">Mixed</button>
        </div>
        <p style="font-size:.85rem;color:var(--muted);margin-bottom:1rem">Mixed shows English rule + Bengali explanation together.</p>
        <button class="btn-primary" style="width:100%;padding:.8rem" id="close-modal">Done</button>
      </div>
    `;
    $$('[data-lang]').forEach(b => b.onclick = () => {
      STATE.lang = b.dataset.lang;
      saveProgress();
      $$('[data-lang]').forEach(x => x.classList.toggle('active', x.dataset.lang === STATE.lang));
    });
    $('#close-modal').onclick = () => { modal.className = 'modal'; renderScreen(); };
    modal.onclick = e => { if (e.target === modal) modal.className = 'modal'; };
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadData);
  } else {
    loadData();
  }
})();
