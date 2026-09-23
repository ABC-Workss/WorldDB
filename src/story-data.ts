// O prólogo é ficção para o jogo; estes registros não representam fatos históricos.
export const storySql = `
  PRAGMA foreign_keys = ON;
  CREATE TABLE personagens (
    id TEXT PRIMARY KEY, nome TEXT NOT NULL, papel TEXT NOT NULL
  );
  CREATE TABLE locais (
    id INTEGER PRIMARY KEY, nome TEXT NOT NULL, detalhe TEXT NOT NULL
  );
  CREATE TABLE objetos (
    id INTEGER PRIMARY KEY, nome TEXT NOT NULL, detalhe TEXT NOT NULL
  );
  CREATE TABLE visitas (
    id INTEGER PRIMARY KEY,
    personagem_id TEXT NOT NULL REFERENCES personagens(id),
    local_id INTEGER NOT NULL REFERENCES locais(id),
    horario TEXT NOT NULL
  );
  CREATE TABLE movimentacoes (
    id INTEGER PRIMARY KEY,
    objeto_id INTEGER NOT NULL REFERENCES objetos(id),
    personagem_id TEXT NOT NULL REFERENCES personagens(id),
    origem_id INTEGER NOT NULL REFERENCES locais(id),
    destino_id INTEGER NOT NULL REFERENCES locais(id),
    horario TEXT NOT NULL,
    observacao TEXT NOT NULL
  );

  INSERT INTO personagens VALUES
    ('#1', 'Deus', 'anfitrião da narrativa'),
    ('#2', 'Cobra', 'convidada curiosa'),
    ('#3', 'Adão', 'organizador da festa'),
    ('#4', 'Eva', 'cozinheira da festa'),
    ('#5', 'Pardal', 'mensageiro de penas');

  INSERT INTO locais VALUES
    (1, 'Árvore', 'onde a fruta estava'),
    (2, 'Lago', 'parada para refrescar'),
    (3, 'Portão', 'entrada do jardim'),
    (4, 'Clareira', 'lugar da festa'),
    (5, 'Cozinha', 'onde se preparam as comidas');

  INSERT INTO objetos VALUES
    (1, 'fruta dourada', 'fruta reservada para a festa'),
    (2, 'cesta listrada', 'cesta de levar ingredientes'),
    (3, 'chapéu verde', 'chapéu grande da Cobra'),
    (4, 'fita azul', 'enfeite da festa'),
    (5, 'regador', 'para as flores do jardim'),
    (6, 'bilhete dobrado', 'convite para abrir na festa'),
    (7, 'toalha xadrez', 'para cobrir a mesa');

  INSERT INTO visitas VALUES
    (1, '#1', 3, '08:30'),
    (2, '#3', 1, '08:35'),
    (3, '#2', 1, '08:42'),
    (4, '#4', 5, '08:45'),
    (5, '#5', 2, '08:47'),
    (6, '#2', 3, '08:50'),
    (7, '#3', 2, '08:52'),
    (8, '#4', 1, '08:56'),
    (9, '#5', 1, '08:58'),
    (10, '#4', 4, '09:03'),
    (11, '#5', 4, '09:07'),
    (12, '#3', 4, '09:16');

  INSERT INTO movimentacoes VALUES
    (1, 5, '#1', 3, 5, '08:31', 'Regou as flores perto da cozinha.'),
    (2, 3, '#2', 1, 3, '08:44', 'Saiu da árvore com o próprio chapéu.'),
    (3, 4, '#5', 2, 1, '08:49', 'Levou um enfeite até a árvore.'),
    (4, 7, '#3', 1, 2, '08:51', 'Procurou um lugar para a toalha.'),
    (5, 6, '#4', 5, 1, '08:54', 'Levou um convite dobrado.'),
    (6, 1, '#4', 1, 4, '08:57', 'Guardou a fruta para a torta surpresa da festa.'),
    (7, 2, '#4', 1, 4, '08:57', 'Levou a cesta junto para a clareira.'),
    (8, 4, '#5', 1, 4, '09:05', 'Prendeu a fita azul na mesa da festa.'),
    (9, 6, '#4', 1, 4, '09:06', 'Deixou o convite perto da mesa.'),
    (10, 7, '#3', 2, 4, '09:14', 'Cobriu a mesa com a toalha.');

  PRAGMA query_only = ON;
`;

export type TableGuide = {
  name: string;
  description: string;
  columns: string[];
  sample: string[];
};

export const tableGuide: TableGuide[] = [
  { name: 'personagens', description: 'quem participa', columns: ['id', 'nome', 'papel'], sample: ['#1', 'Deus', 'anfitrião da narrativa'] },
  { name: 'locais', description: 'os cantos do jardim', columns: ['id', 'nome', 'detalhe'], sample: ['2', 'Lago', 'parada para refrescar'] },
  { name: 'visitas', description: 'quem esteve onde e quando', columns: ['id', 'personagem_id', 'local_id', 'horario'], sample: ['1', '#1', '3', '08:30'] },
  { name: 'objetos', description: 'coisas que aparecem', columns: ['id', 'nome', 'detalhe'], sample: ['5', 'regador', 'para as flores do jardim'] },
  { name: 'movimentacoes', description: 'objeto levado entre lugares', columns: ['id', 'objeto_id', 'personagem_id', 'origem_id', 'destino_id', 'horario', 'observacao'], sample: ['1', '5', '#1', '3', '5', '08:31', 'Regou as flores perto da cozinha.'] }
];
