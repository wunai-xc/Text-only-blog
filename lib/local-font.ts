/**
 * lib/local-font.ts —— 读者自带的字体（第 8 项「自定义」那一档）
 *
 * 读者在设置中心挑一份**自己机器上的字体文件**（woff2 / woff / ttf / otf），
 * 浏览器读它的字节、注册成一个 FontFace，正文字体立刻换成它。整件事**不出浏览器**：
 * 文件存进 IndexedDB（localStorage 只有几 MB，装不下一份 CJK 字体），
 * 不上传任何服务器，换设备 / 换浏览器不会跟着走 —— 与设置中心里其余偏好同一个承诺。
 *
 * 与 lib/prefs.ts 的「自定义」档怎么接上：
 *   prefs 那一档写的字体栈是 `"Text Local Upload", var(--font-sans)`。
 *   这里注册的族名就是 **"Text Local Upload"**（写死在下面），所以：
 *     有上传过 → 用它；没上传（或那份载入失败）→ 掉到系统黑体。
 *   两处名字是一对，改要一起改。
 *
 * 为什么存 Blob 不存 base64：IDB 直接支持结构化克隆，Blob 存进去就是二进制，
 * 不用把几 MB 的字体再转成 base64（转一趟体积涨三成、还要额外解码）。
 *
 * 服务端 import 也安全：模块顶层没有任何副作用，浏览器 API 只在函数里碰，
 * `initLocalFont()` 在没有 indexedDB 的环境下返回 null。
 */

/** 注册给上传字体用的族名。app/globals.css 与 lib/prefs.ts 里是同一串，改要一起改 */
export const LOCAL_FONT_FAMILY = "Text Local Upload";

/** 单份字体文件的上限。CJK 字体动辄十几 MB，留够；它挡住的是误选的大文件（如整个字体包） */
export const LOCAL_FONT_MAX_BYTES = 30 * 1024 * 1024;

const DB_NAME = "tob-local-font";
const DB_VERSION = 1;
const STORE_NAME = "font";
const RECORD_KEY = "custom";

/** 只认这几种字体扩展名 */
const FONT_EXT_RE = /\.(woff2|woff|ttf|otf|ttc)$/i;

/** 偏好变了才派发，供设置中心（与首页那一栏）同步「当前是哪一份字体」 */
export const LOCAL_FONT_EVENT = "tob:localfontchange";

export type LocalFontErrorCode = "type" | "size" | "read" | "store";

/** 界面拿它决定提示哪一句（文案在 lib/site.ts，不在这里拼中文） */
export class LocalFontError extends Error {
  code: LocalFontErrorCode;

  constructor(code: LocalFontErrorCode) {
    super(code);
    this.name = "LocalFontError";
    this.code = code;
  }
}

/** 给界面看的元信息（不含字节） */
export interface LocalFontMeta {
  /** 原始文件名，如 "LXGWWenKai.woff2" */
  name: string;
  /** 字节数 */
  size: number;
  /** 上传时间戳 */
  at: number;
}

interface LocalFontRecord extends LocalFontMeta {
  /** 字体字节（File 本身就是 Blob，直接存） */
  data: Blob;
}

/* ------------------------------ IndexedDB ------------------------------ */

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") return Promise.reject(new LocalFontError("store"));
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      dbPromise = null; // 打不开就别把失败的 Promise 缓存住
      reject(new LocalFontError("store"));
    };
  });
  return dbPromise;
}

function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, mode);
        const request = run(transaction.objectStore(STORE_NAME));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(new LocalFontError("store"));
        transaction.onabort = () => reject(new LocalFontError("store"));
      }),
  );
}

/** 读已存的字体；没存过、隐私模式禁用 IDB、记录损坏 —— 一律当作「没有」 */
async function readRecord(): Promise<LocalFontRecord | null> {
  try {
    const record = await withStore<LocalFontRecord | undefined>(
      "readonly",
      (store) => store.get(RECORD_KEY) as IDBRequest<LocalFontRecord | undefined>,
    );
    return record && record.data ? record : null;
  } catch {
    return null;
  }
}

/* ------------------------------ FontFace ------------------------------ */

let currentFace: FontFace | null = null;

function unregisterFace(): void {
  if (currentFace && typeof document !== "undefined" && document.fonts) {
    document.fonts.delete(currentFace);
  }
  currentFace = null;
}

async function registerFace(record: LocalFontRecord): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return;
  unregisterFace(); // 换字体时先把上一份摘掉，免得两份同族一起留着
  // 取 ArrayBuffer 而不是把 Blob 直接交给 FontFace：Blob 依规范也能收，
  // 但 TS 这一版的 lib.dom 把入参写成了 string | BufferSource，转一手两下都通
  const buffer = await record.data.arrayBuffer();
  const face = new FontFace(LOCAL_FONT_FAMILY, buffer);
  await face.load();
  document.fonts.add(face);
  currentFace = face;
}

/* ------------------------------ 对外 API ------------------------------ */

export function toLocalFontMeta(record: LocalFontRecord | null): LocalFontMeta | null {
  return record ? { name: record.name, size: record.size, at: record.at } : null;
}

function dispatchLocalFont(meta: LocalFontMeta | null): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<LocalFontMeta | null>(LOCAL_FONT_EVENT, { detail: meta }));
}

/** 只读一份元信息（不注册 FontFace）—— 给界面初始渲染用，注册的活归 initLocalFont */
export async function readLocalFontMeta(): Promise<LocalFontMeta | null> {
  return toLocalFontMeta(await readRecord());
}

/**
 * 全站启动时调用一次（components/LocalFontSync.tsx，挂在 app/layout.tsx）：
 * 把读者存过的字体注册回 FontFace。没有就返回 null。
 * **首帧来不及** —— IDB 是异步的，正文先按字体栈的兜底渲染，
 * 这里注册完浏览器自己重排（与 @font-face 的 font-display: swap 同一种观感）。
 */
export async function initLocalFont(): Promise<LocalFontMeta | null> {
  const record = await readRecord();
  if (!record) return null;
  try {
    await registerFace(record);
  } catch {
    // 存进去的字节解不开（记录损坏 / 浏览器不再支持那个格式）。留着它只会让设置中心
    // 显示「已上传」而正文其实没换字体 —— 清掉，当没有过，让读者重传
    try {
      await withStore("readwrite", (store) => store.delete(RECORD_KEY));
    } catch {
      /* 删不掉就算了，至少这次不把它算数 */
    }
    dispatchLocalFont(null);
    return null;
  }
  const meta = toLocalFontMeta(record);
  dispatchLocalFont(meta); // 让设置中心那类订阅者拿到「到底有没有可用的字体」
  return meta;
}

/** 读者挑了一份字体文件：校验 → 存进 IndexedDB → 立刻注册；返回元信息 */
export async function saveLocalFont(file: File): Promise<LocalFontMeta> {
  const name = file.name || "font";
  if (!FONT_EXT_RE.test(name)) throw new LocalFontError("type");
  if (file.size > LOCAL_FONT_MAX_BYTES) throw new LocalFontError("size");

  const record: LocalFontRecord = { name, size: file.size, at: Date.now(), data: file };

  try {
    await withStore("readwrite", (store) => store.put(record, RECORD_KEY));
  } catch {
    throw new LocalFontError("store");
  }

  try {
    await registerFace(record);
  } catch {
    throw new LocalFontError("read"); // 字节不是有效字体（扩展名对、内容坏）
  }

  const meta = toLocalFontMeta(record);
  dispatchLocalFont(meta);
  return meta as LocalFontMeta;
}

/** 移除：删存储 + 注销 FontFace */
export async function deleteLocalFont(): Promise<void> {
  try {
    await withStore("readwrite", (store) => store.delete(RECORD_KEY));
  } catch {
    /* 删不掉也继续把这一份从页面上摘掉（本次会话内生效） */
  }
  unregisterFace();
  dispatchLocalFont(null);
}

/** 订阅「当前是哪一份字体」；返回解绑函数 */
export function subscribeLocalFont(listener: (meta: LocalFontMeta | null) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (event: Event) => {
    listener((event as CustomEvent<LocalFontMeta | null>).detail ?? null);
  };
  window.addEventListener(LOCAL_FONT_EVENT, handler);
  return () => window.removeEventListener(LOCAL_FONT_EVENT, handler);
}

/** 字节数 → 人看的大小（设置中心显示文件名旁边那一行） */
export function formatFontSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}