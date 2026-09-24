// Peças de interface compartilhadas pelo jogo e pela documentação: o editor com cores e utilidades de texto.

export function escapeHtml(value: unknown): string {
  return String(value ?? 'NULL').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
}

const keywords = /^(SELECT|FROM|WHERE|AND|OR|NOT|JOIN|INNER|LEFT|RIGHT|OUTER|ON|AS|ORDER|GROUP|BY|ASC|DESC|LIMIT|OFFSET|BETWEEN|HAVING|COUNT|DISTINCT|IS|NULL|IN|LIKE|WITH|UNION|CASE|WHEN|THEN|ELSE|END)$/i;

export function highlightSql(sql: string): string {
  return sql.replace(/(--[^\n]*)|('(?:[^']|'')*'?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][\w.]*)|([&<>"])/g, (all, comment, text, number, word) => {
    if (comment) return `<span class="sql-comment">${escapeHtml(comment)}</span>`;
    if (text) return `<span class="sql-string">${escapeHtml(text)}</span>`;
    if (number) return `<span class="sql-number">${number}</span>`;
    if (word) return keywords.test(word) ? `<span class="sql-keyword">${word}</span>` : word;
    return escapeHtml(all);
  });
}

type EditorOptions = { id: string; label: string; status: string; statusId?: string; tokens: string[]; describedBy?: string; placeholder?: string };

/** Textarea transparente sobre um <pre> colorido; a numeração e as cores acompanham o texto. */
export function editorMarkup(options: EditorOptions): string {
  return `<div class="play-editor">
      <div class="play-editor-bar"><label for="${options.id}">${options.label}</label><span ${options.statusId ? `id="${options.statusId}"` : ''} class="play-editor-status">${options.status}</span></div>
      <div class="play-editor-body">
        <div class="play-gutter" aria-hidden="true"></div>
        <div class="play-code">
          <pre class="play-highlight" aria-hidden="true"><code></code></pre>
          <textarea id="${options.id}" class="play-textarea" spellcheck="false" autocapitalize="off" autocomplete="off" wrap="off" ${options.describedBy ? `aria-describedby="${options.describedBy}"` : ''} placeholder="${options.placeholder ?? 'Escreva sua consulta aqui...'}"></textarea>
        </div>
      </div>
      <div class="play-tokens" role="group" aria-label="Atalhos de SQL">${options.tokens.map(token => `<button type="button" data-act="token" data-token="${escapeHtml(token)}">${escapeHtml(token)}</button>`).join('')}</div>
    </div>`;
}

export function syncEditor(editor: HTMLTextAreaElement | null | undefined): void {
  const box = editor?.closest('.play-editor');
  if (!editor || !box) return;
  box.querySelector('.play-highlight code')!.innerHTML = `${highlightSql(editor.value)}\n`;
  box.querySelector('.play-gutter')!.innerHTML = editor.value.split('\n').map((_, i) => i + 1).join('<br>');
  editor.style.height = 'auto';
  editor.style.height = `${editor.scrollHeight}px`;
  syncEditorScroll(editor);
}

export function syncEditorScroll(editor: HTMLTextAreaElement): void {
  const pre = editor.closest('.play-editor')?.querySelector<HTMLElement>('.play-highlight');
  if (pre) pre.scrollLeft = editor.scrollLeft;
}

/** Botões de atalho: inserem o trecho no cursor, com espaço antes quando precisa. */
export function insertToken(button: HTMLElement): void {
  const editor = button.closest('.play-editor')?.querySelector<HTMLTextAreaElement>('textarea');
  const token = button.dataset.token;
  if (!editor || !token) return;
  const start = editor.selectionStart, end = editor.selectionEnd;
  const before = editor.value.slice(0, start);
  const glue = before && !/\s$/.test(before) && token !== ',' && token !== ';' ? ' ' : '';
  editor.setRangeText(`${glue}${token}`, start, end, 'end');
  editor.focus();
  syncEditor(editor);
}

export function setEditorStatus(editor: HTMLTextAreaElement | null | undefined, text: string, tone = ''): void {
  const status = editor?.closest('.play-editor')?.querySelector<HTMLElement>('.play-editor-status');
  if (!status) return;
  status.textContent = text;
  status.className = `play-editor-status ${tone}`;
}
