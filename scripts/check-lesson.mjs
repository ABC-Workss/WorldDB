// Confere a Documentação 01 no mesmo mecanismo do site (sql.js/SQLite), com a mesma regra de leitura do worker.
// Uso: npm run check:lesson
import initSqlJs from 'sql.js';
import { practiceSql, lessonExamples, lessonExercises, missionColumns } from '../src/lesson-data.ts';
import { storySql, tableGuide } from '../src/story-data.ts';
import { prepareReadOnlyQuery } from '../src/sql-guard.ts';

const SQL = await initSqlJs();
let failures = 0;
const ok = message => console.log(`  ✓ ${message}`);
const fail = message => { failures++; console.error(`  ✗ ${message}`); };

function run(db, sql) {
  const statement = db.prepare(prepareReadOnlyQuery(sql));
  const columns = statement.getColumnNames();
  const rows = [];
  while (statement.step()) rows.push(statement.get());
  statement.free();
  return { columns, rows };
}

const sameRows = (a, b, ordered) => {
  const key = rows => rows.map(row => JSON.stringify(row));
  const left = key(a), right = key(b);
  if (!ordered) { left.sort(); right.sort(); }
  return left.length === right.length && left.every((row, i) => row === right[i]);
};

function check(db, label, query, ordered) {
  try {
    const result = run(db, query.sql);
    const columnsMatch = JSON.stringify(result.columns) === JSON.stringify(query.expected.columns);
    if (columnsMatch && sameRows(result.rows, query.expected.rows, ordered)) ok(`${label}: ${query.sql.replace(/\n/g, ' ')}  → ${result.rows.length} linha(s)`);
    else fail(`${label}: resultado diferente do esperado\n      obtido:   ${JSON.stringify(result)}\n      esperado: ${JSON.stringify(query.expected)}`);
  } catch (error) {
    fail(`${label}: ${error.message}`);
  }
}

const practice = new SQL.Database();
practice.run(practiceSql);

console.log('Exemplos da aula (base de treino):');
for (const [name, query] of Object.entries(lessonExamples)) check(practice, name, query, !query.unordered);

console.log('Respostas dos exercícios "Tente você":');
for (const exercise of lessonExercises) {
  check(practice, exercise.id, exercise, exercise.ordered);
  try {
    const starter = run(practice, exercise.starter);
    if (sameRows(starter.rows, exercise.expected.rows, exercise.ordered) && JSON.stringify(starter.columns) === JSON.stringify(exercise.expected.columns)) fail(`${exercise.id}: o modelo inicial já é a resposta`);
    else ok(`${exercise.id}: o modelo inicial não entrega a resposta`);
  } catch {
    ok(`${exercise.id}: o modelo inicial precisa ser completado`);
  }
}

console.log('Isolamento da base de treino:');
for (const statement of ["INSERT INTO robos VALUES (6, 'Intruso', 'x', 1, 'rosa')", 'DELETE FROM robos', 'DROP TABLE robos']) {
  try { run(practice, statement); fail(`aceitou escrita: ${statement}`); } catch { ok(`recusa escrita: ${statement.split(' ').slice(0, 2).join(' ')}`); }
}
try { practice.run("INSERT INTO robos VALUES (6, 'Intruso', 'x', 1, 'rosa')"); fail('a base de treino aceitou INSERT direto'); } catch { ok('PRAGMA query_only bloqueia escrita mesmo fora da regra do worker'); }
const spoilers = ['personagens', 'visitas', 'movimentacoes', 'Adão', 'Eva', 'Cobra', 'Pardal', 'fruta'];
const leaked = spoilers.filter(word => practiceSql.includes(word));
if (leaked.length) fail(`a base de treino menciona o mistério: ${leaked.join(', ')}`);
else ok('a base de treino não contém tabelas nem nomes do Jardim');

console.log('Preparação para a missão (base do Jardim):');
const story = new SQL.Database();
story.run(storySql);
const real = story.exec('PRAGMA table_info(personagens)')[0].values.map(row => row[1]);
const shown = missionColumns.map(column => column.name);
if (JSON.stringify(real) === JSON.stringify(shown)) ok(`colunas de personagens na aula batem com o esquema real: ${real.join(', ')}`);
else fail(`colunas mostradas (${shown.join(', ')}) diferem do esquema real (${real.join(', ')})`);
const guide = tableGuide.find(table => table.name === 'personagens').columns;
if (JSON.stringify(guide) === JSON.stringify(real)) ok('o guia de tabelas do jogo também bate');
else fail(`tableGuide de personagens (${guide.join(', ')}) difere do esquema real`);

if (failures) {
  console.error(`\n${failures} problema(s) encontrado(s).`);
  process.exit(1);
}
console.log('\nTudo certo: a aula ensina exatamente o que o SQLite do WorldDB responde.');
