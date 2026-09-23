# WorldDB

Uma aventura ilustrada para aprender SQL. A página inicial abre um mistério fictício no jardim; a linha do tempo original permanece disponível para exploração. O prólogo do Jardim do Éden é identificado como narrativa religiosa, sem data histórica.

## Iniciar localmente

```bash
npm install
npm run dev
```

Abra o endereço `Local` exibido pelo Vite no terminal.

## Compilar

```bash
npm run build
npm run preview
```

## Percursos

- `/`: abertura do jogo, com globo 3D e prévia da primeira história.
- `/jogar`: seis momentos de investigação com `SELECT`, `WHERE`, filtros combinados, `ORDER BY` e `JOIN`. O progresso e a preferência de som ficam apenas no `localStorage` do navegador.
- `/explorar`: os seis capítulos da linha do tempo, com entidades, relações e fontes.

As consultas do jogo rodam em SQLite via WebAssembly dentro de um Web Worker. Cada sessão usa uma base isolada em memória; apenas consultas de leitura são aceitas e consultas demoradas são interrompidas. Os 39 registros fictícios e o guia de cinco tabelas da história estão em `src/story-data.ts`; a execução está em `src/sql-worker.ts`. Os capítulos históricos ficam em `src/data.ts`. IDs, entidades, relações e consultas da linha do tempo são metáforas criadas para o site; as fontes históricas aparecem no rodapé da exploração.
