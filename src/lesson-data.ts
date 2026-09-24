// Base de treino da Documentação 01. É separada do mistério do Jardim de propósito:
// aqui se aprende a mecânica; lá, quem aparece nas tabelas é descoberta do jogador.
export const practiceSql = `
  CREATE TABLE robos (
    id INTEGER PRIMARY KEY,
    nome TEXT NOT NULL,
    tarefa TEXT NOT NULL,
    bateria INTEGER NOT NULL,
    cor TEXT NOT NULL
  );

  INSERT INTO robos VALUES
    (1, 'Bip', 'varre bits caídos', 72, 'azul'),
    (2, 'Zuca', 'conta estrelas', 15, 'amarelo'),
    (3, 'Tico', 'serve café quente', 98, 'verde'),
    (4, 'Nina', 'dobra mapas', 40, 'azul'),
    (5, 'Dudu', 'canta no backup', 63, 'laranja');

  PRAGMA query_only = ON;
`;

export type Expected = { columns: string[]; rows: (string | number)[][] };
/** unordered: sem ORDER BY a ordem não é promessa, então a checagem compara só o conjunto de linhas. */
export type LessonQuery = { sql: string; expected: Expected; unordered?: boolean };

// Cada exemplo mostrado na aula, com o resultado que o SQLite precisa devolver.
// scripts/check-lesson.mjs roda todos no mesmo sql.js do site e compara com isto.
export const lessonExamples = {
  table: {
    sql: 'SELECT * FROM robos;',
    expected: {
      columns: ['id', 'nome', 'tarefa', 'bateria', 'cor'],
      rows: [[1, 'Bip', 'varre bits caídos', 72, 'azul'], [2, 'Zuca', 'conta estrelas', 15, 'amarelo'], [3, 'Tico', 'serve café quente', 98, 'verde'], [4, 'Nina', 'dobra mapas', 40, 'azul'], [5, 'Dudu', 'canta no backup', 63, 'laranja']]
    }
  },
  columns: {
    sql: 'SELECT nome, tarefa FROM robos;',
    expected: { columns: ['nome', 'tarefa'], rows: [['Bip', 'varre bits caídos'], ['Zuca', 'conta estrelas'], ['Tico', 'serve café quente'], ['Nina', 'dobra mapas'], ['Dudu', 'canta no backup']] }
  },
  whereText: {
    sql: "SELECT nome, cor FROM robos WHERE cor = 'azul';",
    expected: { columns: ['nome', 'cor'], rows: [['Bip', 'azul'], ['Nina', 'azul']] }
  },
  whereNumber: {
    sql: 'SELECT nome, bateria FROM robos WHERE id = 3;',
    expected: { columns: ['nome', 'bateria'], rows: [['Tico', 98]] }
  },
  orderNone: {
    sql: 'SELECT nome, bateria FROM robos;',
    expected: { columns: ['nome', 'bateria'], rows: [['Bip', 72], ['Zuca', 15], ['Tico', 98], ['Nina', 40], ['Dudu', 63]] },
    unordered: true
  },
  orderAsc: {
    sql: 'SELECT nome, bateria FROM robos ORDER BY bateria ASC;',
    expected: { columns: ['nome', 'bateria'], rows: [['Zuca', 15], ['Nina', 40], ['Dudu', 63], ['Bip', 72], ['Tico', 98]] }
  },
  orderDesc: {
    sql: 'SELECT nome, bateria FROM robos ORDER BY bateria DESC;',
    expected: { columns: ['nome', 'bateria'], rows: [['Tico', 98], ['Bip', 72], ['Dudu', 63], ['Nina', 40], ['Zuca', 15]] }
  },
  comment: {
    sql: '-- bilhete para você: o banco ignora esta linha\nSELECT nome FROM robos;',
    expected: { columns: ['nome'], rows: [['Bip'], ['Zuca'], ['Tico'], ['Nina'], ['Dudu']] }
  }
} satisfies Record<string, LessonQuery>;

export type Exercise = LessonQuery & {
  id: string;
  task: string;
  starter: string;
  ordered: boolean;
  hints: [string, string];
  success: string;
  tokens: string[];
};

export const lessonExercises: Exercise[] = [
  {
    id: 'colunas',
    task: 'Mostre só o <b>nome</b> e a <b>cor</b> de cada robô.',
    starter: 'SELECT \nFROM robos;',
    sql: 'SELECT nome, cor FROM robos;',
    expected: { columns: ['nome', 'cor'], rows: [['Bip', 'azul'], ['Zuca', 'amarelo'], ['Tico', 'verde'], ['Nina', 'azul'], ['Dudu', 'laranja']] },
    ordered: false,
    hints: ['Escreva os nomes das colunas logo depois de SELECT, no lugar do espaço vazio.', 'Separe as colunas com vírgula: SELECT nome, cor FROM robos;'],
    success: 'Duas colunas, cinco robôs, nenhuma bateria à vista.',
    tokens: ['nome', ',', 'cor']
  },
  {
    id: 'filtro',
    task: 'Encontre o robô de cor <b>verde</b> e mostre o <b>nome</b> e a <b>tarefa</b> dele.',
    starter: 'SELECT nome, tarefa\nFROM robos\nWHERE ',
    sql: "SELECT nome, tarefa FROM robos WHERE cor = 'verde';",
    expected: { columns: ['nome', 'tarefa'], rows: [['Tico', 'serve café quente']] },
    ordered: false,
    hints: ['A condição compara a coluna cor com um texto. Textos vão entre aspas simples.', "Complete assim: WHERE cor = 'verde';"],
    success: 'Achou! Só uma linha passou pelo filtro.',
    tokens: ['cor', '=', "'verde'", ';']
  },
  {
    id: 'ordem',
    task: 'Liste <b>nome</b> e <b>bateria</b>, da bateria mais vazia para a mais cheia.',
    starter: 'SELECT nome, bateria\nFROM robos\n',
    sql: 'SELECT nome, bateria FROM robos ORDER BY bateria;',
    expected: { columns: ['nome', 'bateria'], rows: [['Zuca', 15], ['Nina', 40], ['Dudu', 63], ['Bip', 72], ['Tico', 98]] },
    ordered: true,
    hints: ['Use ORDER BY com a coluna bateria. Do menor para o maior é a ordem crescente.', 'ORDER BY bateria ASC; (o ASC é opcional: crescente já é o padrão).'],
    success: 'Fila organizada: quem precisa de tomada primeiro aparece no topo.',
    tokens: ['ORDER BY', 'bateria', 'ASC', 'DESC', ';']
  }
];

/** Coluna da tabela da primeira missão, sem nenhum registro: só o que o jogador vai encontrar. */
export const missionColumns: { name: string; type: string; meaning: string }[] = [
  { name: 'id', type: 'texto', meaning: 'o crachá de cada personagem' },
  { name: 'nome', type: 'texto', meaning: 'como o personagem se chama' },
  { name: 'papel', type: 'texto', meaning: 'o que ele faz na festa' },
  { name: 'apelido', type: 'texto', meaning: 'como os amigos chamam' }
];
