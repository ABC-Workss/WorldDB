import { tableGuide } from './story-data';

type Cell = string | number | null;
type QueryResult = { columns: string[]; values: Cell[][] };
type SceneArt = (type: string, label: string) => string;
type Discovery = { rows: Cell[][] };
type SavedStory = { phase: number; discoveries: (Discovery | null)[] };

const moments = [
  {
    skill: 'SELECT', scene: 'garden-missing', title: 'O livro de convidados',
    speaker: 'Adão', line: '“A festa começa logo e a fruta sumiu. Até meu chapéu está nervoso.”',
    task: 'Mostre id e nome de todos os personagens.',
    lesson: 'SELECT escolhe as colunas; FROM indica de qual tabela elas vêm.',
    hints: ['Comece pela tabela personagens. Procure as colunas id e nome.', 'Uma forma é SELECT id, nome FROM personagens;'],
    after: '“Cinco nomes no livro. Agora vamos ver quem andou pela árvore.”'
  },
  {
    skill: 'WHERE', scene: 'garden-trail', title: 'Rastros na árvore',
    speaker: 'Eva', line: '“Há pegadas por todo lado. As da cozinha são minhas, prometo!”',
    task: 'Mostre personagem_id e horario das visitas à Árvore (local_id 1).',
    lesson: 'WHERE guarda só as linhas que atendem à condição. No mapa, Árvore tem id 1.',
    hints: ['A tabela visitas guarda personagem_id, local_id e horario.', 'Filtre com WHERE local_id = 1 depois de FROM visitas.'],
    after: '“Quatro passagens pela árvore. A ordem dos horários pode contar mais.”'
  },
  {
    skill: 'WHERE + AND', scene: 'garden-trail', title: 'Cobra, cedo demais?',
    speaker: 'Cobra', line: '“Eu estava lá, sim. Mas fui buscar meu chapéu, não sobremesa!”',
    task: 'Encontre id e horário de quem passou pela Árvore entre 08:40 e 08:45.',
    lesson: 'AND combina condições. BETWEEN inclui os dois horários nas pontas.',
    hints: ['Use visitas e combine local_id = 1 com um intervalo em horario.', "Depois de WHERE local_id = 1, acrescente AND horario BETWEEN '08:40' AND '08:45'."],
    after: '“Passei cedo, mas isso só prova que estive por ali. Continuem investigando.”'
  },
  {
    skill: 'ORDER BY', scene: 'garden-trail', title: 'O último rastro',
    speaker: 'Pardal', line: '“Piu! Fui o último por ali? Isso parece ruim fora de contexto.”',
    task: 'Mostre personagem_id e horario da visita mais recente à Árvore.',
    lesson: 'ORDER BY horario DESC põe o mais recente primeiro; LIMIT 1 mostra só uma linha.',
    hints: ['Filtre as visitas pela Árvore antes de ordenar.', 'Use WHERE local_id = 1 ORDER BY horario DESC LIMIT 1.'],
    after: '“Fui o último a passar. Eu levava uma coisa azul. Podemos conferir?”'
  },
  {
    skill: 'JOIN', scene: 'garden-missing', title: 'Penas, fita e suspeitas',
    speaker: 'Pardal', line: '“Todo mundo olha para minhas asas. Era decoração, piu.”',
    task: 'Junte movimentacoes a objetos e descubra o nome do objeto que #5 levou às 09:05. Mostre nome e horario.',
    lesson: 'JOIN liga movimentacoes.objeto_id a objetos.id. Assim um número vira o nome do objeto.',
    hints: ['Selecione objetos.nome e movimentacoes.horario. Filtre personagem_id = \'#5\' e horario = \'09:05\'.', 'Ligue com JOIN objetos ON movimentacoes.objeto_id = objetos.id.'],
    after: '“Era uma fita azul. Isso explica meu voo, mas ainda precisamos seguir a fruta.”'
  },
  {
    skill: 'JOIN + pistas', scene: 'garden-missing', title: 'O caminho da fruta',
    speaker: 'Adão', line: '“Se acharmos quem moveu a fruta, para onde e por quê, o caso fecha.”',
    task: 'Cruze movimentacoes, personagens, objetos e locais. Mostre nome da pessoa, objeto, destino, horario e observacao da fruta dourada.',
    lesson: 'Cada JOIN traduz um ID: personagem_id → personagens.id, objeto_id → objetos.id, destino_id → locais.id.',
    hints: ['Comece em movimentacoes. Junte personagens, objetos e locais usando os pares de IDs do mapa.', "Selecione p.nome, o.nome, l.nome, m.horario, m.observacao; filtre WHERE o.nome = 'fruta dourada'."],
    after: '“Então era uma surpresa para a festa! Corram: ainda dá tempo de pôr a mesa.”'
  }
] as const;

// A validação olha as células de cada linha, aceitando aliases, colunas extras e outra ordem.
const expectedRows: string[][][] = [
  [['#1', 'Deus'], ['#2', 'Cobra'], ['#3', 'Adão'], ['#4', 'Eva'], ['#5', 'Pardal']],
  [['#3', '08:35'], ['#2', '08:42'], ['#4', '08:56'], ['#5', '08:58']],
  [['#2', '08:42']],
  [['#5', '08:58']],
  [['fita azul', '09:05']],
  [['Eva', 'fruta dourada', 'Clareira', '08:57', 'Guardou a fruta para a torta surpresa da festa.']]
];

const storyKey = 'worlddb-garden-story-v2';
const soundKey = 'worlddb-sound-v1';
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let state = readStory();
let hintIndex = 0;
let worker: Worker | undefined;
let sequence = 0;
let soundEnabled = readSound();
let audioContext: AudioContext | undefined;

function readStory(): SavedStory {
  try {
    const saved = JSON.parse(localStorage.getItem(storyKey) || 'null') as SavedStory | null;
    if (saved && Number.isInteger(saved.phase) && saved.phase >= 0 && saved.phase <= 6 && Array.isArray(saved.discoveries)) {
      return { phase: saved.phase, discoveries: Array.from({ length: 6 }, (_, i) => saved.discoveries[i]?.rows ? saved.discoveries[i] : null) };
    }
  } catch { /* Armazenamento opcional. */ }
  return { phase: 0, discoveries: Array(6).fill(null) };
}

function saveStory(): void {
  try { localStorage.setItem(storyKey, JSON.stringify(state)); } catch { /* O jogo funciona sem armazenamento. */ }
}

function readSound(): boolean {
  try {
    const saved = localStorage.getItem(soundKey);
    return saved === null ? !reducedMotion.matches : saved === 'on';
  } catch { return !reducedMotion.matches; }
}

function saveSound(): void {
  try { localStorage.setItem(soundKey, soundEnabled ? 'on' : 'off'); } catch { /* Preferência opcional. */ }
}

function playSound(kind: 'click' | 'clue' | 'finish'): void {
  if (!soundEnabled) return;
  try {
    audioContext ??= new AudioContext();
    if (audioContext.state === 'suspended') void audioContext.resume();
    const notes = kind === 'click' ? [520] : kind === 'clue' ? [580, 780] : [520, 660, 880];
    notes.forEach((frequency, index) => {
      const oscillator = audioContext!.createOscillator();
      const gain = audioContext!.createGain();
      const start = audioContext!.currentTime + index * .075;
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(.0001, start);
      gain.gain.exponentialRampToValueAtTime(.025, start + .012);
      gain.gain.exponentialRampToValueAtTime(.0001, start + .115);
      oscillator.connect(gain).connect(audioContext!.destination);
      oscillator.start(start);
      oscillator.stop(start + .12);
    });
  } catch { /* Áudio pode estar indisponível sem afetar o jogo. */ }
}

function escapeHtml(value: unknown): string {
  return String(value ?? 'NULL').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
}

function rowValue(row: Cell[], wanted: string): string {
  return String(row.find(cell => String(cell) === wanted) ?? '');
}

function characterName(id: string): string {
  const row = state.discoveries[0]?.rows.find(candidate => candidate.some(cell => String(cell) === id));
  const name = row?.find(cell => expectedRows[0].some(([_id, expectedName]) => expectedName === String(cell)));
  return name ? String(name) : id;
}

function gapMarkup(index: number, discovery: Discovery | null): string {
  if (!discovery) {
    return [
      'Convidados no livro: <span class="story-blank">_____</span>',
      'Passagens pela árvore: <span class="story-blank">_____</span>',
      'Às <span class="story-blank">__:__</span>, o suspeito <span class="story-blank">__</span> esteve lá.',
      'Último rastro: <span class="story-blank">__</span> às <span class="story-blank">__:__</span>.',
      'Pardal carregou <span class="story-blank">_____</span>.',
      'Às <span class="story-blank">__:__</span>, <span class="story-blank">_____</span> levou a fruta para <span class="story-blank">_____</span>.'
    ][index];
  }
  const rows = discovery.rows;
  if (index === 0) return `Convidados: ${rows.map(row => `<b>${escapeHtml(row.find(cell => String(cell).startsWith('#')))} ${escapeHtml(row.find(cell => expectedRows[0].some(([_id, name]) => name === String(cell))))}</b>`).join(' · ')}`;
  if (index === 1) return `Passagens: ${rows.map(row => `<b>${escapeHtml(row.find(cell => String(cell).startsWith('#')))} às ${escapeHtml(row.find(cell => /^\d\d:\d\d$/.test(String(cell))))}</b>`).join(' · ')}`;
  if (index === 2 || index === 3) {
    const row = rows[0];
    const id = String(row.find(cell => String(cell).startsWith('#')));
    const time = String(row.find(cell => /^\d\d:\d\d$/.test(String(cell))));
    return index === 2
      ? `Às <b>${escapeHtml(time)}</b>, <b>${escapeHtml(id)} · ${escapeHtml(characterName(id))}</b> esteve na árvore.`
      : `Último rastro: <b>${escapeHtml(id)} · ${escapeHtml(characterName(id))}</b> às <b>${escapeHtml(time)}</b>.`;
  }
  if (index === 4) return `Pardal carregou <b>${escapeHtml(rowValue(rows[0], 'fita azul'))}</b> às <b>${escapeHtml(rowValue(rows[0], '09:05'))}</b>.`;
  const row = rows[0];
  return `Às <b>${escapeHtml(rowValue(row, '08:57'))}</b>, <b>${escapeHtml(rowValue(row, 'Eva'))}</b> levou a <b>${escapeHtml(rowValue(row, 'fruta dourada'))}</b> para a <b>${escapeHtml(rowValue(row, 'Clareira'))}</b>.`;
}

function sceneOverlay(index: number): string {
  const drawings = [
    '<circle cx="77" cy="48" r="9" fill="none" stroke="#ed8b69" stroke-width="3" stroke-dasharray="3 4"/><text x="72" y="52" fill="#a35e54" font-size="15" font-weight="900">?</text>',
    '<circle cx="150" cy="143" r="14" fill="#ffdf8b88"/><circle cx="191" cy="133" r="14" fill="#ffdf8b88"/><path d="M120 151q40-34 91-24" fill="none" stroke="#f4c35d" stroke-width="3" stroke-dasharray="5 5"/>',
    '<ellipse cx="249" cy="130" rx="35" ry="32" fill="#ffd67877"/><path d="M220 154q-19-9-9-27" fill="none" stroke="#e58e66" stroke-width="4" stroke-linecap="round"/><text x="257" y="102" fill="#a86153" font-size="22" font-weight="900">?</text>',
    '<path d="M217 58q24-18 47 0-20-7-32 7-10 11-15-7Z" fill="#7194b4" stroke="#34364a" stroke-width="2"/><circle cx="255" cy="57" r="2" fill="#34364a"/><path d="M225 84q-8 13-18 10" fill="none" stroke="#7194b4" stroke-width="5" stroke-linecap="round"/><circle cx="206" cy="98" r="5" fill="#f8c45e"/>',
    '<path d="M190 54q18-17 35 0 16 18 31 2" fill="none" stroke="#77a8db" stroke-width="10" stroke-linecap="round"/><path d="m208 45-4 19m15-18 4 22" stroke="#d7ebf5" stroke-width="4"/><circle cx="246" cy="83" r="7" fill="#f5c85f"/>',
    '<path class="clue-route" d="M77 110 C122 68 157 155 218 110 S260 103 278 117" fill="none" stroke="#f5ba58" stroke-width="8" stroke-dasharray="12 8" stroke-linecap="round"/><circle cx="77" cy="110" r="9" fill="#ed8b69"/><circle cx="278" cy="117" r="12" fill="#f5d482" stroke="#34364a" stroke-width="2"/><text x="273" y="123" fill="#34364a" font-size="17" font-weight="900">?</text>'
  ];
  return `<svg class="story-overlay" viewBox="0 0 300 180" aria-hidden="true">${drawings[index]}</svg>`;
}

function schemaMarkup(): string {
  return `<section class="paper-panel schema-panel" aria-labelledby="schema-title"><span class="section-eyebrow">Seu mapa dos dados</span><h2 id="schema-title">Cinco tabelas, muitas pistas</h2><p>IDs ligam registros. No prólogo, os IDs com # são uma brincadeira do WorldDB.</p><div class="schema-links"><span>personagens.id → visitas.personagem_id</span><span>locais.id → visitas.local_id</span><span>objetos.id → movimentacoes.objeto_id</span><span>personagens.id → movimentacoes.personagem_id</span><span>locais.id → movimentacoes.origem_id / destino_id</span></div><div class="schema-cards">${tableGuide.map(table => `<article class="schema-card"><strong>${table.name}</strong><span>${table.description}</span><code>${table.columns.join(' · ')}</code><small>Exemplo: ${table.sample.map(escapeHtml).join(' · ')}</small></article>`).join('')}</div><p class="sample-note">Estes são apenas exemplos sem a resposta. As outras linhas aparecem quando você consulta o banco.</p></section>`;
}

function soundButton(): string {
  return `<button id="sound-toggle" type="button" class="sound-toggle" aria-pressed="${soundEnabled}">${soundEnabled ? '♪ Som ligado' : '♪ Som desligado'}</button>`;
}

export function gameMarkup(baseArt: SceneArt): string {
  if (state.phase === 6) {
    const final = state.discoveries[5];
    return `<main class="game-main"><div class="game-toolbar"><span class="section-eyebrow">História 01 · O grande sumiço da fruta</span>${soundButton()}</div><section class="final-scene paper-panel"><div class="final-art">${baseArt('garden-picnic', 'festa na clareira')}</div><div><span class="chapter-pill"><span class="chapter-dot"></span> MISTÉRIO RESOLVIDO</span><h1>A fruta virou festa!</h1><p class="final-proof">${final ? gapMarkup(5, final) : ''}</p><p>${final ? escapeHtml(rowValue(final.rows[0], 'Guardou a fruta para a torta surpresa da festa.')) : ''}</p><p>Adão trouxe a toalha, Pardal decorou a mesa com a fita e Cobra chegou com o chapéu. Faltaram só os guardanapos.</p><div class="fiction-note">✧ História inventada para o jogo, inspirada no relato bíblico — sem data histórica</div><div class="home-actions"><a class="game-button" href="/" data-nav>Voltar ao início</a><a class="outline-button" href="/explorar" data-nav>Explorar a linha do tempo</a></div><button class="text-button" id="restart-game" type="button">Jogar de novo</button></div></section></main>`;
  }
  const index = state.phase;
  const moment = moments[index];
  const discovery = state.discoveries[index];
  const journal = state.discoveries.slice(0, index).map((clue, i) => clue ? `<li><span>0${i + 1}</span> ${gapMarkup(i, clue)}</li>` : '').join('');
  return `<main class="game-main"><div class="game-toolbar"><span class="section-eyebrow">História 01 · O grande sumiço da fruta · 15–25 min</span>${soundButton()}</div><div class="game-topline"><span>Investigação em andamento</span><span class="game-step">Momento ${index + 1} de 6</span></div><div class="progress-track" aria-label="Progresso: momento ${index + 1} de 6"><span style="width:${(index + 1) * 100 / 6}%"></span></div><section class="game-intro"><div class="game-scene story-scene scene-${index} ${discovery ? 'is-discovered' : ''}">${baseArt(moment.scene, moment.title)}${sceneOverlay(index)}<div id="scene-gap" class="scene-gap ${discovery ? 'is-revealed' : ''}">${gapMarkup(index, discovery)}</div><span class="scene-badge">✦ ${moment.speaker} diz...</span></div><div class="game-narrative"><div class="chapter-pill"><span class="chapter-dot"></span> ${moment.skill} · PISTA 0${index + 1}</div><h1>${moment.title}</h1><p id="scene-dialogue" class="dialogue">${discovery ? moment.after : moment.line}</p><p class="game-fiction">História inventada para o jogo, inspirada no relato bíblico. Não é um acontecimento histórico datado.</p></div></section>${journal ? `<section class="clue-journal paper-panel" aria-label="Pistas encontradas"><span class="section-eyebrow">Seu caderno de pistas</span><ol>${journal}</ol></section>` : ''}<section class="game-workspace"><div class="game-reference">${schemaMarkup()}</div><div class="game-query"><div class="paper-panel"><span class="section-eyebrow">Sua missão · ${moment.skill}</span><h2>${moment.task}</h2><p class="lesson-tip">✦ ${moment.lesson}</p><label class="editor-label" for="sql-editor">Sua consulta SQL</label><textarea id="sql-editor" spellcheck="false" autocapitalize="off" autocomplete="off" placeholder="Escreva sua consulta aqui..."></textarea><div class="editor-actions"><button id="run-query" class="game-button" type="button">Executar consulta →</button><button id="hint-button" class="text-button" type="button">Preciso de uma dica</button><button id="restart-game" class="text-button" type="button">Reiniciar história</button></div><div id="query-feedback" class="query-feedback ${discovery ? 'is-success' : ''}" role="status" aria-live="polite">${discovery ? 'Pista guardada no caderno. Você pode explorar mais consultas ou avançar.' : 'O resultado da sua consulta aparecerá aqui.'}</div><div id="query-output"></div><button id="next-stage" class="outline-button next-stage" type="button" ${discovery ? '' : 'hidden'}>${index === 5 ? 'Ver a conclusão →' : 'Seguir a pista →'}</button></div></div></section></main>`;
}

function matchingDiscovery(result: QueryResult, index: number): Discovery | null {
  const rows = result.values.map(row => row.map(String));
  const expected = expectedRows[index];
  if (rows.length !== expected.length) return null;
  if (!expected.every(required => rows.filter(row => required.every(value => row.includes(value))).length === 1)) return null;
  return { rows: result.values };
}

function readableError(message: string): string {
  if (message.includes('no such table')) return `Não encontrei essa tabela. Confira o mapa dos dados. (${message})`;
  if (message.includes('no such column')) return `Não encontrei essa coluna. Confira os nomes no mapa dos dados. (${message})`;
  if (message.includes('syntax error') || message.includes('incomplete input')) return `Há um erro na escrita da consulta. Confira SELECT, FROM, JOIN, nomes e aspas. (${message})`;
  return message;
}

function execute(sql: string): Promise<QueryResult> {
  return new Promise((resolve, reject) => {
    if (!worker) worker = new Worker(new URL('./sql-worker.ts', import.meta.url), { type: 'module' });
    const current = worker;
    const id = ++sequence;
    const timer = window.setTimeout(() => {
      current.terminate();
      if (worker === current) worker = undefined;
      reject(new Error('A consulta demorou demais. Tente uma versão mais simples.'));
    }, 4000);
    current.onmessage = (event: MessageEvent<{ id: number; result?: QueryResult; error?: string }>) => {
      if (event.data.id !== id) return;
      clearTimeout(timer);
      if (event.data.error) reject(new Error(event.data.error));
      else resolve(event.data.result!);
    };
    current.onerror = () => {
      clearTimeout(timer);
      current.terminate();
      if (worker === current) worker = undefined;
      reject(new Error('O banco não abriu. Recarregue a página e tente novamente.'));
    };
    current.postMessage({ id, sql });
  });
}

function resultTable(result: QueryResult, found: boolean): string {
  if (!result.columns.length) return '<p>A consulta não retornou colunas.</p>';
  if (!result.values.length) return '<p>A consulta funcionou, mas não encontrou registros.</p>';
  return `<div class="result-scroll"><table><thead><tr>${result.columns.map(column => `<th>${escapeHtml(column)}</th>`).join('')}</tr></thead><tbody>${result.values.map(row => `<tr class="${found ? 'clue-row' : ''}">${row.map(value => `<td>${escapeHtml(value)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${result.values.length === 100 ? '<p>Mostrando as primeiras 100 linhas.</p>' : ''}`;
}

function feedbackProof(index: number, discovery: Discovery): string {
  return `<strong>✦ Pista descoberta!</strong><span class="inline-proof">${gapMarkup(index, discovery)}</span><small>${moments[index].after}</small>`;
}

export function bindGame(app: HTMLDivElement, sceneArt: SceneArt): void {
  const rerender = () => {
    app.querySelector('main')!.outerHTML = gameMarkup(sceneArt);
    bindGame(app, sceneArt);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  if (state.phase < 6 && state.discoveries[state.phase]) {
    app.querySelector<HTMLDivElement>('#query-feedback')!.innerHTML = feedbackProof(state.phase, state.discoveries[state.phase]!);
  }
  app.querySelector<HTMLButtonElement>('#sound-toggle')?.addEventListener('click', event => {
    soundEnabled = !soundEnabled;
    saveSound();
    const button = event.currentTarget as HTMLButtonElement;
    button.textContent = soundEnabled ? '♪ Som ligado' : '♪ Som desligado';
    button.setAttribute('aria-pressed', String(soundEnabled));
    if (soundEnabled) playSound('click');
  });
  app.querySelector<HTMLButtonElement>('#restart-game')?.addEventListener('click', () => {
    playSound('click');
    state = { phase: 0, discoveries: Array(6).fill(null) };
    hintIndex = 0;
    saveStory();
    worker?.terminate(); worker = undefined;
    rerender();
  });
  app.querySelector<HTMLButtonElement>('#next-stage')?.addEventListener('click', () => {
    if (!state.discoveries[state.phase]) return;
    playSound(state.phase === 5 ? 'finish' : 'click');
    state.phase++;
    hintIndex = 0;
    saveStory();
    rerender();
  });
  app.querySelector<HTMLButtonElement>('#hint-button')?.addEventListener('click', () => {
    playSound('click');
    const feedback = app.querySelector<HTMLDivElement>('#query-feedback')!;
    feedback.className = 'query-feedback is-hint';
    feedback.textContent = moments[state.phase].hints[Math.min(hintIndex++, moments[state.phase].hints.length - 1)];
  });
  const button = app.querySelector<HTMLButtonElement>('#run-query');
  const editor = app.querySelector<HTMLTextAreaElement>('#sql-editor');
  editor?.addEventListener('keydown', event => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      button?.click();
    }
  });
  button?.addEventListener('click', async () => {
    const feedback = app.querySelector<HTMLDivElement>('#query-feedback')!;
    const output = app.querySelector<HTMLDivElement>('#query-output')!;
    if (!editor?.value.trim()) { feedback.textContent = 'Digite uma consulta antes de executar.'; return; }
    playSound('click');
    const currentPhase = state.phase;
    button.disabled = true;
    button.textContent = 'Consultando...';
    feedback.className = 'query-feedback is-processing';
    feedback.innerHTML = '<span class="query-spinner" aria-hidden="true"></span> Procurando nos registros...';
    try {
      const result = await execute(editor.value);
      if (!button.isConnected || state.phase !== currentPhase) return;
      const discovery = matchingDiscovery(result, currentPhase);
      output.innerHTML = resultTable(result, !!discovery);
      if (discovery) {
        state.discoveries[currentPhase] = discovery;
        saveStory();
        playSound('clue');
        feedback.className = 'query-feedback is-success';
        feedback.innerHTML = feedbackProof(currentPhase, discovery);
        const gap = app.querySelector<HTMLDivElement>('#scene-gap')!;
        gap.innerHTML = gapMarkup(currentPhase, discovery);
        gap.classList.remove('is-revealed');
        void gap.offsetWidth;
        gap.classList.add('is-revealed');
        app.querySelector('.story-scene')?.classList.add('is-discovered');
        app.querySelector<HTMLElement>('#scene-dialogue')!.textContent = moments[currentPhase].after;
        app.querySelector<HTMLButtonElement>('#next-stage')!.hidden = false;
      } else {
        feedback.className = 'query-feedback is-hint';
        feedback.textContent = `Consulta válida, mas essa ainda não fecha a pista. ${moments[currentPhase].hints[Math.min(hintIndex++, moments[currentPhase].hints.length - 1)]}`;
      }
    } catch (error) {
      if (!button.isConnected || state.phase !== currentPhase) return;
      output.innerHTML = '';
      feedback.className = 'query-feedback is-error';
      feedback.textContent = readableError(error instanceof Error ? error.message : 'Erro desconhecido.');
    } finally {
      if (button.isConnected) { button.disabled = false; button.textContent = 'Executar consulta →'; }
    }
  });
}
