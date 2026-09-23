export type Entity = { id: string; type: string; name: string; attrs: string[]; icon: string };
export type Relation = { from: string; to: string; label: string; cardinality: string };
export type Era = {
  slug: string; number: string; year: string; title: string; kicker: string; summary: string;
  accent: string; pale: string; land: string; sea: string; icon: string; scene: string;
  note?: string; entities: Entity[]; relations: Relation[]; sql: string; result: string[]; log: string;
};

export const eras: Era[] = [
  {
    slug: 'eden', number: '00', year: 'sem data histórica', title: 'O jardim começa aqui',
    kicker: 'Prólogo · Jardim do Éden',
    summary: 'Na narrativa bíblica, um jardim, duas pessoas, uma cobra e uma fruta inauguram esta versão brincalhona do “banco do mundo”.',
    accent: '#eb835e', pale: '#ffe4cb', land: '#83b86a', sea: '#83d9ca', icon: 'tree', scene: 'garden',
    note: 'Narrativa religiosa / prólogo fictício',
    entities: [
      { id: '#1', type: 'Entidade', name: 'Deus', attrs: ['papel: criador', 'contexto: narrativa bíblica'], icon: 'spark' },
      { id: '#2', type: 'Animal', name: 'Cobra', attrs: ['habitat: jardim', 'papel: tentação'], icon: 'snake' },
      { id: '#3', type: 'Pessoa', name: 'Adão', attrs: ['local: Éden', 'acesso: revogado'], icon: 'person' },
      { id: '#4', type: 'Pessoa', name: 'Eva', attrs: ['local: Éden', 'acesso: revogado'], icon: 'person' }
    ],
    relations: [
      { from: 'Entidade', to: 'Pessoa', label: 'cria', cardinality: '1 → N' },
      { from: 'Animal', to: 'Pessoa', label: 'conversa com', cardinality: '1 → N' }
    ],
    sql: "INSERT INTO pessoa (nome, local)\nVALUES ('Adão', 'Éden'), ('Eva', 'Éden');",
    result: ['Pessoa #3 · Adão', 'Pessoa #4 · Eva'],
    log: 'Permissão para fruta revogada 🍎'
  },
  {
    slug: 'agriculture', number: '01', year: 'c. 10.000 a.C.', title: 'Uma ideia que criou raízes',
    kicker: 'Agricultura',
    summary: 'Sementes passam a ser cultivadas, animais são domesticados e comunidades se estabelecem. A comida ganha um endereço.',
    accent: '#6aa85a', pale: '#e4f3c4', land: '#96c66b', sea: '#78cfbf', icon: 'sprout', scene: 'farm',
    entities: [
      { id: '#101', type: 'PlantaCultivada', name: 'Trigo', attrs: ['uso: alimento', 'ciclo: sazonal'], icon: 'sprout' },
      { id: '#102', type: 'AnimalDomesticado', name: 'Cabra', attrs: ['uso: leite e alimento', 'status: domesticada'], icon: 'goat' },
      { id: '#103', type: 'Assentamento', name: 'Aldeia', attrs: ['tipo: comunidade', 'entorno: campos'], icon: 'house' },
      { id: '#104', type: 'Pessoa', name: 'Agricultora', attrs: ['cultiva: trigo', 'vive em: aldeia'], icon: 'person' }
    ],
    relations: [
      { from: 'Pessoa', to: 'PlantaCultivada', label: 'cultiva', cardinality: 'N ↔ N' },
      { from: 'Pessoa', to: 'Assentamento', label: 'vive em', cardinality: 'N → 1' },
      { from: 'Assentamento', to: 'AnimalDomesticado', label: 'abriga', cardinality: '1 → N' }
    ],
    sql: "SELECT planta, assentamento\nFROM cultivo WHERE pessoa = 'Agricultora';",
    result: ['Trigo → Aldeia'],
    log: 'Feature desbloqueada: produzir comida 🌾'
  },
  {
    slug: 'writing', number: '02', year: 'c. 3.200 a.C.', title: 'A memória saiu da cabeça',
    kicker: 'Escrita na Mesopotâmia',
    summary: 'Marcas pressionadas na argila registram coisas como estoques e trocas. Agora uma informação pode sobreviver a quem a contou.',
    accent: '#ce8e54', pale: '#f8dfba', land: '#c9a06b', sea: '#85c9c9', icon: 'tablet', scene: 'writing',
    entities: [
      { id: '#201', type: 'Registro', name: 'Contagem de grãos', attrs: ['assunto: estoque', 'formato: sinais'], icon: 'tablet' },
      { id: '#202', type: 'Autor', name: 'Escriba', attrs: ['ação: registrar', 'local: Mesopotâmia'], icon: 'person' },
      { id: '#203', type: 'Suporte', name: 'Tabuinha de argila', attrs: ['material: argila', 'estado: seco'], icon: 'tablet' },
      { id: '#204', type: 'Transacao', name: 'Entrega de grãos', attrs: ['item: cevada', 'status: anotada'], icon: 'seed' }
    ],
    relations: [
      { from: 'Autor', to: 'Registro', label: 'escreve', cardinality: '1 → N' },
      { from: 'Registro', to: 'Suporte', label: 'fica em', cardinality: 'N → 1' },
      { from: 'Registro', to: 'Transacao', label: 'documenta', cardinality: 'N → 1' }
    ],
    sql: "SELECT autor, suporte, assunto\nFROM registro WHERE assunto = 'estoque';",
    result: ['Escriba · Argila · Estoque'],
    log: 'Persistência de dados habilitada ✍️'
  },
  {
    slug: 'printing', number: '03', year: 'década de 1450', title: 'Copiar, colar, multiplicar',
    kicker: 'Impressão de Gutenberg',
    summary: 'Na Europa, tipos móveis de metal e prensa aceleram a reprodução de livros. Uma obra pode viajar em muitos exemplares.',
    accent: '#e0a843', pale: '#fff0c2', land: '#c3b268', sea: '#8bc3db', icon: 'book', scene: 'printing',
    entities: [
      { id: '#301', type: 'Obra', name: 'Bíblia de Gutenberg', attrs: ['gênero: livro', 'idioma: latim'], icon: 'book' },
      { id: '#302', type: 'Edicao', name: 'Edição de Mainz', attrs: ['época: c. 1455', 'processo: tipos móveis'], icon: 'print' },
      { id: '#303', type: 'Exemplar', name: 'Cópia em papel', attrs: ['material: papel', 'origem: edição'], icon: 'book' },
      { id: '#304', type: 'Exemplar', name: 'Cópia em pergaminho', attrs: ['material: velino', 'origem: edição'], icon: 'book' }
    ],
    relations: [
      { from: 'Obra', to: 'Edicao', label: 'tem', cardinality: '1 → N' },
      { from: 'Edicao', to: 'Exemplar', label: 'gera', cardinality: '1 → N' }
    ],
    sql: "SELECT obra, COUNT(exemplar)\nFROM edicao GROUP BY obra;",
    result: ['Bíblia de Gutenberg · muitos exemplares'],
    log: 'Deploy em massa de conhecimento 📚'
  },
  {
    slug: 'apollo', number: '04', year: '1969', title: 'Um pequeno passo, outro endereço',
    kicker: 'Apollo 11',
    summary: 'A missão Apollo 11 pousa na Lua em 20 de julho de 1969. Armstrong e Aldrin caminham na superfície; Collins permanece em órbita.',
    accent: '#7386c7', pale: '#e2e9ff', land: '#b7b5a1', sea: '#8ca8dc', icon: 'rocket', scene: 'moon',
    entities: [
      { id: '#401', type: 'Missao', name: 'Apollo 11', attrs: ['objetivo: pouso lunar', 'ano: 1969'], icon: 'rocket' },
      { id: '#402', type: 'Tripulante', name: 'Neil Armstrong', attrs: ['papel: comandante', 'ação: caminhou na Lua'], icon: 'person' },
      { id: '#403', type: 'Tripulante', name: 'Buzz Aldrin', attrs: ['papel: piloto lunar', 'ação: caminhou na Lua'], icon: 'person' },
      { id: '#404', type: 'Tripulante', name: 'Michael Collins', attrs: ['papel: piloto de comando', 'ação: orbitou a Lua'], icon: 'person' },
      { id: '#405', type: 'CorpoCeleste', name: 'Lua', attrs: ['tipo: satélite natural', 'destino: pouso'], icon: 'moon' },
      { id: '#406', type: 'Pouso', name: 'Eagle', attrs: ['data: 20 jul 1969', 'local: Mar da Tranquilidade'], icon: 'flag' }
    ],
    relations: [
      { from: 'Missao', to: 'Tripulante', label: 'leva', cardinality: '1 → 3' },
      { from: 'Missao', to: 'Pouso', label: 'realiza', cardinality: '1 → 1' },
      { from: 'Pouso', to: 'CorpoCeleste', label: 'acontece em', cardinality: 'N → 1' }
    ],
    sql: "SELECT destino, data\nFROM pouso WHERE missao = 'Apollo 11';",
    result: ['Lua · 20 de julho de 1969'],
    log: 'Novo ambiente acessado: Lua 🌙'
  },
  {
    slug: 'web', number: '05', year: '1989 → hoje', title: 'O mundo ganhou links',
    kicker: 'Web e mundo conectado',
    summary: 'Tim Berners-Lee cria a World Wide Web no CERN em 1989. Páginas ligadas por links ajudam a transformar a troca global de informação.',
    accent: '#6b91e1', pale: '#dfebff', land: '#77c1a3', sea: '#70b8d8', icon: 'web', scene: 'connected',
    entities: [
      { id: '#501', type: 'Pagina', name: 'Página inicial', attrs: ['formato: hipertexto', 'acesso: web'], icon: 'web' },
      { id: '#502', type: 'Link', name: 'Próxima página', attrs: ['origem: página inicial', 'destino: outra página'], icon: 'link' },
      { id: '#503', type: 'Usuario', name: 'Visitante', attrs: ['ação: navegar', 'alcance: global'], icon: 'person' },
      { id: '#504', type: 'Dispositivo', name: 'Computador', attrs: ['função: acessar páginas', 'conexão: rede'], icon: 'computer' }
    ],
    relations: [
      { from: 'Pagina', to: 'Link', label: 'contém', cardinality: '1 → N' },
      { from: 'Link', to: 'Pagina', label: 'aponta para', cardinality: 'N → 1' },
      { from: 'Usuario', to: 'Dispositivo', label: 'usa', cardinality: 'N ↔ N' }
    ],
    sql: "SELECT destino FROM link\nWHERE origem = 'Página inicial';",
    result: ['Outra página → mais caminhos'],
    log: 'Entidades agora podem se conectar globalmente 🌐'
  }
];
