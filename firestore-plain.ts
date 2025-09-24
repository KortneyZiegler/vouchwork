import { Timestamp, DocumentSnapshot, QuerySnapshot } from 'firebase/firestore';

const FB_CLASSES = new Set([
  'Query','QueryImpl','DocumentReference','CollectionReference',
  'QuerySnapshot','DocumentSnapshot','User','Y','Ka'
]);

export function toPlainValue(v: any) {
  if (v instanceof Timestamp) return v.toDate().toISOString();
  // Handle standard JS Date objects that might come from optimistic updates
  if (v instanceof Date) return v.toISOString();
  if (typeof v === 'function') return undefined;
  return v;
}

export function deepPlain(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(deepPlain);
  if (typeof obj === 'object') {
    const ctor = (obj as any)?.constructor?.name;
    if (ctor && FB_CLASSES.has(ctor)) return `[${ctor}]`;
    const out: any = {};
    for (const [k, v] of Object.entries(obj)) out[k] = deepPlain(v);
    return out;
  }
  return toPlainValue(obj);
}

export function docToPlain<T = any>(snap: DocumentSnapshot): T & { id: string } {
  // This is the definitive fix. By using { serverTimestamps: 'estimate' },
  // we tell Firestore to immediately convert any serverTimestamp() placeholders
  // into a client-side Timestamp object with an estimated time. This estimated
  // Timestamp is a normal, serializable object that our existing `deepPlain` and
  // `toPlainValue` helpers can handle correctly, preventing the circular JSON error.
  const data = snap.data({ serverTimestamps: 'estimate' }) || {};
  const plain: any = { id: snap.id };
  for (const [k, v] of Object.entries(data)) {
    plain[k] = deepPlain(v);
  }
  return plain as T & { id: string };
}

export function queryToPlain<T = any>(snap: QuerySnapshot): (T & { id: string })[] {
  return snap.docs.map(d => docToPlain<T>(d));
}