import initSqlJs from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import { storySql } from './story-data';

type QueryMessage = { id: number; sql: string };
type Result = { columns: string[]; values: (string | number | null)[][] };

const ready = initSqlJs({ locateFile: () => wasmUrl }).then(SQL => {
  const db = new SQL.Database();
  db.run(storySql);
  return db;
});

self.onmessage = async (event: MessageEvent<QueryMessage>) => {
  const { id, sql } = event.data;
  try {
    const db = await ready;
    const trimmed = sql.trim().replace(/;\s*$/, '');
    if (trimmed.length > 2500) throw new Error('Consulta muito longa. Tente uma pergunta mais curta.');
    if (!/^(SELECT|WITH)\b/i.test(trimmed) || trimmed.includes(';')) {
      throw new Error('Use uma única consulta de leitura começando com SELECT ou WITH.');
    }
    const statement = db.prepare(trimmed);
    const result: Result = { columns: statement.getColumnNames(), values: [] };
    try {
      while (result.values.length < 100 && statement.step()) {
        result.values.push(statement.get().map(value => value instanceof Uint8Array ? '[dados binários]' : value));
      }
    } finally {
      statement.free();
    }
    self.postMessage({ id, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Não foi possível executar a consulta.';
    self.postMessage({ id, error: message });
  }
};
