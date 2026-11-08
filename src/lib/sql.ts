/* =============================================================================
   SQL — a small but honest query engine.

   The Query Lab on this page runs real SQL against real project data, in the
   browser, with no server. It supports the subset that matters for analysis:

     SELECT * | col, COUNT(*), AVG(col), SUM(col), MIN(col), MAX(col) [AS alias]
     FROM table
     [WHERE col op value [AND|OR …]]
     [GROUP BY col]
     [ORDER BY col [ASC|DESC]]
     [LIMIT n]

   Pure module: no DOM, no clock, no randomness. Same query, same rows, always.
   ========================================================================== */

export type Value = string | number | null;
export type Row = Record<string, Value>;
export type Table = { name: string; columns: string[]; rows: Row[] };

export type ResultSet = {
  columns: string[];
  rows: Value[][];
  /** Milliseconds the engine spent — measured by the caller, not invented here. */
  ms?: number;
};

export class SqlError extends Error {}

/* ------------------------------------------------------------------ lexer */
type Token =
  | { t: 'kw'; v: string }
  | { t: 'ident'; v: string }
  | { t: 'num'; v: number }
  | { t: 'str'; v: string }
  | { t: 'op'; v: string }
  | { t: 'punct'; v: string }
  | { t: 'star' };

const KEYWORDS = new Set([
  'select', 'from', 'where', 'group', 'by', 'order', 'limit', 'and', 'or',
  'as', 'asc', 'desc', 'count', 'avg', 'sum', 'min', 'max', 'like', 'not',
]);

export function lex(input: string): Token[] {
  const out: Token[] = [];
  let i = 0;

  while (i < input.length) {
    const c = input[i];

    if (/\s/.test(c)) {
      i++;
      continue;
    }

    if (c === '-' && input[i + 1] === '-') {
      while (i < input.length && input[i] !== '\n') i++;
      continue;
    }

    if (c === '*') {
      out.push({ t: 'star' });
      i++;
      continue;
    }

    if (c === "'" || c === '"') {
      const quote = c;
      let buf = '';
      i++;
      while (i < input.length && input[i] !== quote) {
        if (input[i] === '\\' && i + 1 < input.length) {
          buf += input[i + 1];
          i += 2;
          continue;
        }
        buf += input[i];
        i++;
      }
      if (i >= input.length) throw new SqlError(`Unclosed string starting at ${input.indexOf(quote)}`);
      i++;
      out.push({ t: 'str', v: buf });
      continue;
    }

    if (/[0-9]/.test(c)) {
      let buf = '';
      while (i < input.length && /[0-9.]/.test(input[i])) buf += input[i++];
      const n = Number(buf);
      if (!Number.isFinite(n)) throw new SqlError(`Bad number: ${buf}`);
      out.push({ t: 'num', v: n });
      continue;
    }

    if (/[a-zA-Z_]/.test(c)) {
      let buf = '';
      while (i < input.length && /[a-zA-Z0-9_]/.test(input[i])) buf += input[i++];
      const lower = buf.toLowerCase();
      out.push(KEYWORDS.has(lower) ? { t: 'kw', v: lower } : { t: 'ident', v: buf });
      continue;
    }

    const two = input.slice(i, i + 2);
    if (['>=', '<=', '!=', '<>'].includes(two)) {
      out.push({ t: 'op', v: two === '<>' ? '!=' : two });
      i += 2;
      continue;
    }
    if ('=<>'.includes(c)) {
      out.push({ t: 'op', v: c });
      i++;
      continue;
    }
    if (',()'.includes(c)) {
      out.push({ t: 'punct', v: c });
      i++;
      continue;
    }

    throw new SqlError(`Unexpected character "${c}"`);
  }

  return out;
}

/* ----------------------------------------------------------------- parser */
type SelectItem = { kind: 'col' | 'agg' | 'star'; name: string; arg?: string; alias: string };
type Cond = { col: string; op: string; value: Value };
type Where = { and: boolean; cond: Cond };

type Query = {
  select: SelectItem[];
  table: string;
  where: Where[];
  groupBy?: string;
  orderBy?: { col: string; dir: 'asc' | 'desc' };
  limit?: number;
};

class Parser {
  private i = 0;
  constructor(private tokens: Token[]) {}

  private peek(): Token | undefined {
    return this.tokens[this.i];
  }
  private next(): Token {
    const t = this.tokens[this.i++];
    if (!t) throw new SqlError('Query ended early');
    return t;
  }
  private isKw(v: string): boolean {
    const t = this.peek();
    return !!t && t.t === 'kw' && t.v === v;
  }
  private eatKw(v: string): boolean {
    if (this.isKw(v)) {
      this.i++;
      return true;
    }
    return false;
  }
  private expectKw(v: string) {
    if (!this.eatKw(v)) throw new SqlError(`Expected "${v.toUpperCase()}"`);
  }
  private expectPunct(v: string) {
    const t = this.peek();
    if (!t || t.t !== 'punct' || t.v !== v) throw new SqlError(`Expected "${v}"`);
    this.i++;
  }
  private ident(what = 'column'): string {
    const t = this.next();
    if (t.t === 'ident') return t.v;
    if (t.t === 'kw') return t.v; // allow words that double as keywords in names
    throw new SqlError(`Expected ${what}`);
  }

  parse(): Query {
    this.expectKw('select');
    const select = this.parseSelect();
    this.expectKw('from');
    const table = this.ident('table name');

    const q: Query = { select, table, where: [] };

    if (this.eatKw('where')) q.where = this.parseWhere();

    if (this.isKw('group')) {
      this.i++;
      this.expectKw('by');
      q.groupBy = this.ident();
    }

    if (this.isKw('order')) {
      this.i++;
      this.expectKw('by');
      const col = this.ident();
      let dir: 'asc' | 'desc' = 'asc';
      if (this.eatKw('desc')) dir = 'desc';
      else this.eatKw('asc');
      q.orderBy = { col, dir };
    }

    if (this.eatKw('limit')) {
      const t = this.next();
      if (t.t !== 'num') throw new SqlError('LIMIT needs a number');
      q.limit = t.v;
    }

    if (this.i < this.tokens.length) {
      throw new SqlError('Unexpected text after the query');
    }
    return q;
  }

  private parseSelect(): SelectItem[] {
    const items: SelectItem[] = [];

    for (;;) {
      const t = this.peek();
      if (!t) throw new SqlError('Nothing to select');

      if (t.t === 'star') {
        this.i++;
        items.push({ kind: 'star', name: '*', alias: '*' });
      } else if (t.t === 'kw' && ['count', 'avg', 'sum', 'min', 'max'].includes(t.v)) {
        this.i++;
        this.expectPunct('(');
        let arg = '*';
        const inner = this.peek();
        if (inner?.t === 'star') {
          this.i++;
        } else {
          arg = this.ident();
        }
        this.expectPunct(')');
        let alias = `${t.v.toUpperCase()}(${arg})`;
        if (this.eatKw('as')) alias = this.ident('alias');
        items.push({ kind: 'agg', name: t.v, arg, alias });
      } else {
        const col = this.ident();
        let alias = col;
        if (this.eatKw('as')) alias = this.ident('alias');
        items.push({ kind: 'col', name: col, alias });
      }

      if (this.peek()?.t === 'punct' && (this.peek() as { v: string }).v === ',') {
        this.i++;
        continue;
      }
      break;
    }
    return items;
  }

  private parseWhere(): Where[] {
    const parts: Where[] = [];
    let and = true;

    for (;;) {
      const col = this.ident();
      const t = this.next();

      let op: string;
      if (t.t === 'op') op = t.v;
      else if (t.t === 'kw' && t.v === 'like') op = 'like';
      else if (t.t === 'kw' && t.v === 'not') {
        this.expectKw('like');
        op = 'notlike';
      } else throw new SqlError('Expected a comparison (=, !=, >, <, LIKE)');

      const v = this.next();
      let value: Value;
      if (v.t === 'num') value = v.v;
      else if (v.t === 'str') value = v.v;
      else if (v.t === 'ident') value = v.v;
      else throw new SqlError('Expected a value');

      parts.push({ and, cond: { col, op, value } });

      if (this.eatKw('and')) {
        and = true;
        continue;
      }
      if (this.eatKw('or')) {
        and = false;
        continue;
      }
      break;
    }
    return parts;
  }
}

/* --------------------------------------------------------------- execution */
const num = (v: Value): number | null => {
  if (typeof v === 'number') return v;
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return Number(v);
  return null;
};

const likeToRe = (pattern: string): RegExp => {
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped.replace(/%/g, '.*').replace(/_/g, '.')}$`, 'i');
};

function matches(row: Row, where: Where[]): boolean {
  if (!where.length) return true;

  let result = true;
  let acc: boolean | null = null;

  for (const { and, cond } of where) {
    const cell = row[cond.col];
    if (cell === undefined) throw new SqlError(`No column "${cond.col}" here`);

    let ok = false;
    switch (cond.op) {
      case '=':
        ok = String(cell).toLowerCase() === String(cond.value).toLowerCase();
        break;
      case '!=':
        ok = String(cell).toLowerCase() !== String(cond.value).toLowerCase();
        break;
      case '>':
      case '<':
      case '>=':
      case '<=': {
        const a = num(cell);
        const b = num(cond.value);
        if (a === null || b === null) ok = false;
        else if (cond.op === '>') ok = a > b;
        else if (cond.op === '<') ok = a < b;
        else if (cond.op === '>=') ok = a >= b;
        else ok = a <= b;
        break;
      }
      case 'like':
        ok = likeToRe(String(cond.value)).test(String(cell));
        break;
      case 'notlike':
        ok = !likeToRe(String(cond.value)).test(String(cell));
        break;
      default:
        throw new SqlError(`Unknown operator ${cond.op}`);
    }

    if (acc === null) {
      acc = ok;
      result = ok;
    } else {
      acc = and ? acc && ok : acc || ok;
      result = acc;
    }
  }
  return result;
}

function compare(a: Value, b: Value): number {
  const na = num(a);
  const nb = num(b);
  if (na !== null && nb !== null) return na - nb;
  return String(a).localeCompare(String(b));
}

function aggregate(fn: string, rows: Row[], arg: string): Value {
  if (fn === 'count') {
    if (arg === '*') return rows.length;
    return rows.filter((r) => r[arg] !== null && r[arg] !== undefined && r[arg] !== '').length;
  }

  const nums = rows.map((r) => num(r[arg])).filter((n): n is number => n !== null);
  if (!nums.length) return fn === 'sum' ? 0 : null;

  switch (fn) {
    case 'sum':
      return nums.reduce((a, b) => a + b, 0);
    case 'avg':
      return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 100) / 100;
    case 'min':
      return Math.min(...nums);
    case 'max':
      return Math.max(...nums);
    default:
      throw new SqlError(`Unknown function ${fn}`);
  }
}

const fmt = (v: Value): Value => (typeof v === 'number' ? Math.round(v * 100) / 100 : v);

export function run(sql: string, tables: Table[]): ResultSet {
  const trimmed = sql.trim();
  if (!trimmed) throw new SqlError('Empty query');
  if (!/^select\b/i.test(trimmed)) throw new SqlError('Only SELECT queries are allowed here');

  const q = new Parser(lex(trimmed)).parse();
  const table = tables.find((t) => t.name.toLowerCase() === q.table.toLowerCase());
  if (!table) throw new SqlError(`No table "${q.table}". Try ${tables.map((t) => t.name).join(', ')}.`);

  /* Validate columns up front so the error names the culprit. */
  const known = new Set(table.columns);
  for (const item of q.select) {
    const needs = item.kind === 'col' ? item.name : item.arg && item.arg !== '*' ? item.arg : null;
    if (needs && !known.has(needs)) throw new SqlError(`No column "${needs}" in ${table.name}`);
  }
  for (const w of q.where) {
    if (!known.has(w.cond.col)) throw new SqlError(`No column "${w.cond.col}" in ${table.name}`);
  }
  if (q.groupBy && !known.has(q.groupBy)) throw new SqlError(`No column "${q.groupBy}" in ${table.name}`);

  const filtered = table.rows.filter((r) => matches(r, q.where));

  let columns: string[];
  let rows: Value[][];

  if (q.groupBy) {
    const groups = new Map<string, Row[]>();
    for (const row of filtered) {
      const k = String(row[q.groupBy] ?? '');
      const list = groups.get(k) ?? [];
      list.push(row);
      groups.set(k, list);
    }

    columns = q.select.map((s) => s.alias);
    rows = [...groups.entries()].map(([key, group]) =>
      q.select.map((item) => {
        if (item.kind === 'col') {
          if (item.name !== q.groupBy && item.name !== '*') {
            throw new SqlError(`${item.name} must appear in GROUP BY or be aggregated`);
          }
          return key;
        }
        if (item.kind === 'agg') return fmt(aggregate(item.name, group, item.arg ?? '*'));
        return key;
      }),
    );
  } else if (q.select.some((s) => s.kind === 'agg')) {
    columns = q.select.map((s) => s.alias);
    rows = [
      q.select.map((item) =>
        item.kind === 'agg' ? fmt(aggregate(item.name, filtered, item.arg ?? '*')) : null,
      ),
    ];
  } else {
    const cols =
      q.select[0]?.kind === 'star'
        ? table.columns
        : q.select.map((s) => s.name);
    columns = q.select[0]?.kind === 'star' ? table.columns : q.select.map((s) => s.alias);
    rows = filtered.map((r) => cols.map((c) => r[c] ?? null));
  }

  /* ORDER BY applies to the projected result where possible. */
  if (q.orderBy) {
    const idx = columns.findIndex((c) => c.toLowerCase() === q.orderBy!.col.toLowerCase());
    const source = idx >= 0 ? idx : -1;

    if (idx >= 0) {
      rows.sort((a, b) => {
        const r = compare(a[source], b[source]);
        return q.orderBy!.dir === 'desc' ? -r : r;
      });
    } else if (!q.groupBy && q.select[0]?.kind === 'star' && known.has(q.orderBy.col)) {
      const raw = table.columns.indexOf(q.orderBy.col);
      rows.sort((a, b) => {
        const r = compare(a[raw], b[raw]);
        return q.orderBy!.dir === 'desc' ? -r : r;
      });
    } else {
      throw new SqlError(`Cannot order by "${q.orderBy.col}" — it is not in the results`);
    }
  }

  if (q.limit !== undefined) rows = rows.slice(0, Math.max(0, q.limit));

  return { columns, rows };
}
