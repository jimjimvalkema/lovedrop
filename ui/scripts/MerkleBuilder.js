import { ethers, utils } from "./ethers-5.2.esm.min.js"
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __toCommonJS = (from) => {
  const moduleCache = __toCommonJS.moduleCache ??= new WeakMap;
  var cached = moduleCache.get(from);
  if (cached)
    return cached;
  var to = __defProp({}, "__esModule", { value: true });
  var desc = { enumerable: false };
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key))
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
  }
  moduleCache.set(from, to);
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: (newValue) => all[name] = () => newValue
    });
};
var __esm = (fn, res) => () => (fn && (res = fn(fn = 0)), res);

// node_modules/ethereum-cryptography/node_modules/@noble/hashes/_assert.js
var require__assert = __commonJS((exports) => {
  var number = function(n) {
    if (!Number.isSafeInteger(n) || n < 0)
      throw new Error(`Wrong positive integer: ${n}`);
  };
  var bool = function(b) {
    if (typeof b !== "boolean")
      throw new Error(`Expected boolean, not ${b}`);
  };
  var bytes = function(b, ...lengths) {
    if (!(b instanceof Uint8Array))
      throw new TypeError("Expected Uint8Array");
    if (lengths.length > 0 && !lengths.includes(b.length))
      throw new TypeError(`Expected Uint8Array of length ${lengths}, not of length=${b.length}`);
  };
  var hash = function(hash2) {
    if (typeof hash2 !== "function" || typeof hash2.create !== "function")
      throw new Error("Hash should be wrapped by utils.wrapConstructor");
    number(hash2.outputLen);
    number(hash2.blockLen);
  };
  var exists = function(instance, checkFinished = true) {
    if (instance.destroyed)
      throw new Error("Hash instance has been destroyed");
    if (checkFinished && instance.finished)
      throw new Error("Hash#digest() has already been called");
  };
  var output = function(out, instance) {
    bytes(out);
    const min = instance.outputLen;
    if (out.length < min) {
      throw new Error(`digestInto() expects output buffer of length at least ${min}`);
    }
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.output = exports.exists = exports.hash = exports.bytes = exports.bool = exports.number = undefined;
  exports.number = number;
  exports.bool = bool;
  exports.bytes = bytes;
  exports.hash = hash;
  exports.exists = exists;
  exports.output = output;
  var assert = {
    number,
    bool,
    bytes,
    hash,
    exists,
    output
  };
  exports.default = assert;
});

// node_modules/ethereum-cryptography/node_modules/@noble/hashes/_u64.js
var require__u64 = __commonJS((exports) => {
  var fromBig = function(n, le = false) {
    if (le)
      return { h: Number(n & U32_MASK64), l: Number(n >> _32n & U32_MASK64) };
    return { h: Number(n >> _32n & U32_MASK64) | 0, l: Number(n & U32_MASK64) | 0 };
  };
  var split = function(lst, le = false) {
    let Ah = new Uint32Array(lst.length);
    let Al = new Uint32Array(lst.length);
    for (let i = 0;i < lst.length; i++) {
      const { h, l } = fromBig(lst[i], le);
      [Ah[i], Al[i]] = [h, l];
    }
    return [Ah, Al];
  };
  var add = function(Ah, Al, Bh, Bl) {
    const l = (Al >>> 0) + (Bl >>> 0);
    return { h: Ah + Bh + (l / 2 ** 32 | 0) | 0, l: l | 0 };
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.add = exports.toBig = exports.split = exports.fromBig = undefined;
  var U32_MASK64 = BigInt(2 ** 32 - 1);
  var _32n = BigInt(32);
  exports.fromBig = fromBig;
  exports.split = split;
  var toBig = (h, l) => BigInt(h >>> 0) << _32n | BigInt(l >>> 0);
  exports.toBig = toBig;
  var shrSH = (h, l, s) => h >>> s;
  var shrSL = (h, l, s) => h << 32 - s | l >>> s;
  var rotrSH = (h, l, s) => h >>> s | l << 32 - s;
  var rotrSL = (h, l, s) => h << 32 - s | l >>> s;
  var rotrBH = (h, l, s) => h << 64 - s | l >>> s - 32;
  var rotrBL = (h, l, s) => h >>> s - 32 | l << 64 - s;
  var rotr32H = (h, l) => l;
  var rotr32L = (h, l) => h;
  var rotlSH = (h, l, s) => h << s | l >>> 32 - s;
  var rotlSL = (h, l, s) => l << s | h >>> 32 - s;
  var rotlBH = (h, l, s) => l << s - 32 | h >>> 64 - s;
  var rotlBL = (h, l, s) => h << s - 32 | l >>> 64 - s;
  exports.add = add;
  var add3L = (Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);
  var add3H = (low, Ah, Bh, Ch) => Ah + Bh + Ch + (low / 2 ** 32 | 0) | 0;
  var add4L = (Al, Bl, Cl, Dl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);
  var add4H = (low, Ah, Bh, Ch, Dh) => Ah + Bh + Ch + Dh + (low / 2 ** 32 | 0) | 0;
  var add5L = (Al, Bl, Cl, Dl, El) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);
  var add5H = (low, Ah, Bh, Ch, Dh, Eh) => Ah + Bh + Ch + Dh + Eh + (low / 2 ** 32 | 0) | 0;
  var u64 = {
    fromBig,
    split,
    toBig: exports.toBig,
    shrSH,
    shrSL,
    rotrSH,
    rotrSL,
    rotrBH,
    rotrBL,
    rotr32H,
    rotr32L,
    rotlSH,
    rotlSL,
    rotlBH,
    rotlBL,
    add,
    add3L,
    add3H,
    add4L,
    add4H,
    add5H,
    add5L
  };
  exports.default = u64;
});

// node_modules/ethereum-cryptography/node_modules/@noble/hashes/cryptoBrowser.js
var require_cryptoBrowser = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.crypto = undefined;
  exports.crypto = {
    node: undefined,
    web: typeof self === "object" && ("crypto" in self) ? self.crypto : undefined
  };
});

// node_modules/ethereum-cryptography/node_modules/@noble/hashes/utils.js
var require_utils = __commonJS((exports) => {
  var bytesToHex = function(uint8a) {
    if (!(uint8a instanceof Uint8Array))
      throw new Error("Uint8Array expected");
    let hex = "";
    for (let i = 0;i < uint8a.length; i++) {
      hex += hexes[uint8a[i]];
    }
    return hex;
  };
  var hexToBytes = function(hex) {
    if (typeof hex !== "string") {
      throw new TypeError("hexToBytes: expected string, got " + typeof hex);
    }
    if (hex.length % 2)
      throw new Error("hexToBytes: received invalid unpadded hex");
    const array = new Uint8Array(hex.length / 2);
    for (let i = 0;i < array.length; i++) {
      const j = i * 2;
      const hexByte = hex.slice(j, j + 2);
      const byte = Number.parseInt(hexByte, 16);
      if (Number.isNaN(byte) || byte < 0)
        throw new Error("Invalid byte sequence");
      array[i] = byte;
    }
    return array;
  };
  async function asyncLoop(iters, tick, cb) {
    let ts = Date.now();
    for (let i = 0;i < iters; i++) {
      cb(i);
      const diff = Date.now() - ts;
      if (diff >= 0 && diff < tick)
        continue;
      await (0, exports.nextTick)();
      ts += diff;
    }
  }
  var utf8ToBytes = function(str) {
    if (typeof str !== "string") {
      throw new TypeError(`utf8ToBytes expected string, got ${typeof str}`);
    }
    return new TextEncoder().encode(str);
  };
  var toBytes = function(data) {
    if (typeof data === "string")
      data = utf8ToBytes(data);
    if (!(data instanceof Uint8Array))
      throw new TypeError(`Expected input type is Uint8Array (got ${typeof data})`);
    return data;
  };
  var concatBytes = function(...arrays) {
    if (!arrays.every((a) => a instanceof Uint8Array))
      throw new Error("Uint8Array list expected");
    if (arrays.length === 1)
      return arrays[0];
    const length = arrays.reduce((a, arr) => a + arr.length, 0);
    const result = new Uint8Array(length);
    for (let i = 0, pad = 0;i < arrays.length; i++) {
      const arr = arrays[i];
      result.set(arr, pad);
      pad += arr.length;
    }
    return result;
  };
  var checkOpts = function(defaults, opts) {
    if (opts !== undefined && (typeof opts !== "object" || !isPlainObject(opts)))
      throw new TypeError("Options should be object or undefined");
    const merged = Object.assign(defaults, opts);
    return merged;
  };
  var wrapConstructor = function(hashConstructor) {
    const hashC = (message) => hashConstructor().update(toBytes(message)).digest();
    const tmp = hashConstructor();
    hashC.outputLen = tmp.outputLen;
    hashC.blockLen = tmp.blockLen;
    hashC.create = () => hashConstructor();
    return hashC;
  };
  var wrapConstructorWithOpts = function(hashCons) {
    const hashC = (msg, opts) => hashCons(opts).update(toBytes(msg)).digest();
    const tmp = hashCons({});
    hashC.outputLen = tmp.outputLen;
    hashC.blockLen = tmp.blockLen;
    hashC.create = (opts) => hashCons(opts);
    return hashC;
  };
  var randomBytes = function(bytesLength = 32) {
    if (crypto_1.crypto.web) {
      return crypto_1.crypto.web.getRandomValues(new Uint8Array(bytesLength));
    } else if (crypto_1.crypto.node) {
      return new Uint8Array(crypto_1.crypto.node.randomBytes(bytesLength).buffer);
    } else {
      throw new Error("The environment doesn't have randomBytes function");
    }
  };
  /*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.randomBytes = exports.wrapConstructorWithOpts = exports.wrapConstructor = exports.checkOpts = exports.Hash = exports.concatBytes = exports.toBytes = exports.utf8ToBytes = exports.asyncLoop = exports.nextTick = exports.hexToBytes = exports.bytesToHex = exports.isLE = exports.rotr = exports.createView = exports.u32 = exports.u8 = undefined;
  var crypto_1 = require_cryptoBrowser();
  var u8 = (arr) => new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
  exports.u8 = u8;
  var u32 = (arr) => new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
  exports.u32 = u32;
  var createView = (arr) => new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
  exports.createView = createView;
  var rotr = (word, shift) => word << 32 - shift | word >>> shift;
  exports.rotr = rotr;
  exports.isLE = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68;
  if (!exports.isLE)
    throw new Error("Non little-endian hardware is not supported");
  var hexes = Array.from({ length: 256 }, (v, i) => i.toString(16).padStart(2, "0"));
  exports.bytesToHex = bytesToHex;
  exports.hexToBytes = hexToBytes;
  var nextTick = async () => {
  };
  exports.nextTick = nextTick;
  exports.asyncLoop = asyncLoop;
  exports.utf8ToBytes = utf8ToBytes;
  exports.toBytes = toBytes;
  exports.concatBytes = concatBytes;

  class Hash {
    clone() {
      return this._cloneInto();
    }
  }
  exports.Hash = Hash;
  var isPlainObject = (obj) => Object.prototype.toString.call(obj) === "[object Object]" && obj.constructor === Object;
  exports.checkOpts = checkOpts;
  exports.wrapConstructor = wrapConstructor;
  exports.wrapConstructorWithOpts = wrapConstructorWithOpts;
  exports.randomBytes = randomBytes;
});

// node_modules/ethereum-cryptography/node_modules/@noble/hashes/sha3.js
var require_sha3 = __commonJS((exports) => {
  var keccakP = function(s, rounds = 24) {
    const B = new Uint32Array(5 * 2);
    for (let round = 24 - rounds;round < 24; round++) {
      for (let x = 0;x < 10; x++)
        B[x] = s[x] ^ s[x + 10] ^ s[x + 20] ^ s[x + 30] ^ s[x + 40];
      for (let x = 0;x < 10; x += 2) {
        const idx1 = (x + 8) % 10;
        const idx0 = (x + 2) % 10;
        const B0 = B[idx0];
        const B1 = B[idx0 + 1];
        const Th = rotlH(B0, B1, 1) ^ B[idx1];
        const Tl = rotlL(B0, B1, 1) ^ B[idx1 + 1];
        for (let y = 0;y < 50; y += 10) {
          s[x + y] ^= Th;
          s[x + y + 1] ^= Tl;
        }
      }
      let curH = s[2];
      let curL = s[3];
      for (let t = 0;t < 24; t++) {
        const shift = SHA3_ROTL[t];
        const Th = rotlH(curH, curL, shift);
        const Tl = rotlL(curH, curL, shift);
        const PI = SHA3_PI[t];
        curH = s[PI];
        curL = s[PI + 1];
        s[PI] = Th;
        s[PI + 1] = Tl;
      }
      for (let y = 0;y < 50; y += 10) {
        for (let x = 0;x < 10; x++)
          B[x] = s[y + x];
        for (let x = 0;x < 10; x++)
          s[y + x] ^= ~B[(x + 2) % 10] & B[(x + 4) % 10];
      }
      s[0] ^= SHA3_IOTA_H[round];
      s[1] ^= SHA3_IOTA_L[round];
    }
    B.fill(0);
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.shake256 = exports.shake128 = exports.keccak_512 = exports.keccak_384 = exports.keccak_256 = exports.keccak_224 = exports.sha3_512 = exports.sha3_384 = exports.sha3_256 = exports.sha3_224 = exports.Keccak = exports.keccakP = undefined;
  var _assert_js_1 = require__assert();
  var _u64_js_1 = require__u64();
  var utils_js_1 = require_utils();
  var [SHA3_PI, SHA3_ROTL, _SHA3_IOTA] = [[], [], []];
  var _0n = BigInt(0);
  var _1n = BigInt(1);
  var _2n = BigInt(2);
  var _7n = BigInt(7);
  var _256n = BigInt(256);
  var _0x71n = BigInt(113);
  for (let round = 0, R = _1n, x = 1, y = 0;round < 24; round++) {
    [x, y] = [y, (2 * x + 3 * y) % 5];
    SHA3_PI.push(2 * (5 * y + x));
    SHA3_ROTL.push((round + 1) * (round + 2) / 2 % 64);
    let t = _0n;
    for (let j = 0;j < 7; j++) {
      R = (R << _1n ^ (R >> _7n) * _0x71n) % _256n;
      if (R & _2n)
        t ^= _1n << (_1n << BigInt(j)) - _1n;
    }
    _SHA3_IOTA.push(t);
  }
  var [SHA3_IOTA_H, SHA3_IOTA_L] = _u64_js_1.default.split(_SHA3_IOTA, true);
  var rotlH = (h, l, s) => s > 32 ? _u64_js_1.default.rotlBH(h, l, s) : _u64_js_1.default.rotlSH(h, l, s);
  var rotlL = (h, l, s) => s > 32 ? _u64_js_1.default.rotlBL(h, l, s) : _u64_js_1.default.rotlSL(h, l, s);
  exports.keccakP = keccakP;

  class Keccak extends utils_js_1.Hash {
    constructor(blockLen, suffix, outputLen, enableXOF = false, rounds = 24) {
      super();
      this.blockLen = blockLen;
      this.suffix = suffix;
      this.outputLen = outputLen;
      this.enableXOF = enableXOF;
      this.rounds = rounds;
      this.pos = 0;
      this.posOut = 0;
      this.finished = false;
      this.destroyed = false;
      _assert_js_1.default.number(outputLen);
      if (0 >= this.blockLen || this.blockLen >= 200)
        throw new Error("Sha3 supports only keccak-f1600 function");
      this.state = new Uint8Array(200);
      this.state32 = (0, utils_js_1.u32)(this.state);
    }
    keccak() {
      keccakP(this.state32, this.rounds);
      this.posOut = 0;
      this.pos = 0;
    }
    update(data) {
      _assert_js_1.default.exists(this);
      const { blockLen, state } = this;
      data = (0, utils_js_1.toBytes)(data);
      const len = data.length;
      for (let pos = 0;pos < len; ) {
        const take = Math.min(blockLen - this.pos, len - pos);
        for (let i = 0;i < take; i++)
          state[this.pos++] ^= data[pos++];
        if (this.pos === blockLen)
          this.keccak();
      }
      return this;
    }
    finish() {
      if (this.finished)
        return;
      this.finished = true;
      const { state, suffix, pos, blockLen } = this;
      state[pos] ^= suffix;
      if ((suffix & 128) !== 0 && pos === blockLen - 1)
        this.keccak();
      state[blockLen - 1] ^= 128;
      this.keccak();
    }
    writeInto(out) {
      _assert_js_1.default.exists(this, false);
      _assert_js_1.default.bytes(out);
      this.finish();
      const bufferOut = this.state;
      const { blockLen } = this;
      for (let pos = 0, len = out.length;pos < len; ) {
        if (this.posOut >= blockLen)
          this.keccak();
        const take = Math.min(blockLen - this.posOut, len - pos);
        out.set(bufferOut.subarray(this.posOut, this.posOut + take), pos);
        this.posOut += take;
        pos += take;
      }
      return out;
    }
    xofInto(out) {
      if (!this.enableXOF)
        throw new Error("XOF is not possible for this instance");
      return this.writeInto(out);
    }
    xof(bytes) {
      _assert_js_1.default.number(bytes);
      return this.xofInto(new Uint8Array(bytes));
    }
    digestInto(out) {
      _assert_js_1.default.output(out, this);
      if (this.finished)
        throw new Error("digest() was already called");
      this.writeInto(out);
      this.destroy();
      return out;
    }
    digest() {
      return this.digestInto(new Uint8Array(this.outputLen));
    }
    destroy() {
      this.destroyed = true;
      this.state.fill(0);
    }
    _cloneInto(to) {
      const { blockLen, suffix, outputLen, rounds, enableXOF } = this;
      to || (to = new Keccak(blockLen, suffix, outputLen, enableXOF, rounds));
      to.state32.set(this.state32);
      to.pos = this.pos;
      to.posOut = this.posOut;
      to.finished = this.finished;
      to.rounds = rounds;
      to.suffix = suffix;
      to.outputLen = outputLen;
      to.enableXOF = enableXOF;
      to.destroyed = this.destroyed;
      return to;
    }
  }
  exports.Keccak = Keccak;
  var gen = (suffix, blockLen, outputLen) => (0, utils_js_1.wrapConstructor)(() => new Keccak(blockLen, suffix, outputLen));
  exports.sha3_224 = gen(6, 144, 224 / 8);
  exports.sha3_256 = gen(6, 136, 256 / 8);
  exports.sha3_384 = gen(6, 104, 384 / 8);
  exports.sha3_512 = gen(6, 72, 512 / 8);
  exports.keccak_224 = gen(1, 144, 224 / 8);
  exports.keccak_256 = gen(1, 136, 256 / 8);
  exports.keccak_384 = gen(1, 104, 384 / 8);
  exports.keccak_512 = gen(1, 72, 512 / 8);
  var genShake = (suffix, blockLen, outputLen) => (0, utils_js_1.wrapConstructorWithOpts)((opts = {}) => new Keccak(blockLen, suffix, opts.dkLen === undefined ? outputLen : opts.dkLen, true));
  exports.shake128 = genShake(31, 168, 128 / 8);
  exports.shake256 = genShake(31, 136, 256 / 8);
});

// node_modules/ethereum-cryptography/utils.js
var require_utils2 = __commonJS((exports, module) => {
  var bytesToUtf8 = function(data) {
    if (!(data instanceof Uint8Array)) {
      throw new TypeError(`bytesToUtf8 expected Uint8Array, got ${typeof data}`);
    }
    return new TextDecoder().decode(data);
  };
  var hexToBytes = function(data) {
    const sliced = data.startsWith("0x") ? data.substring(2) : data;
    return (0, utils_1.hexToBytes)(sliced);
  };
  var equalsBytes = function(a, b) {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0;i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  };
  var wrapHash = function(hash) {
    return (msg) => {
      _assert_1.default.bytes(msg);
      return hash(msg);
    };
  };
  var __importDefault = exports && exports.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.crypto = exports.wrapHash = exports.equalsBytes = exports.hexToBytes = exports.bytesToUtf8 = exports.utf8ToBytes = exports.createView = exports.concatBytes = exports.toHex = exports.bytesToHex = exports.assertBytes = exports.assertBool = undefined;
  var _assert_1 = __importDefault(require__assert());
  var utils_1 = require_utils();
  var assertBool = _assert_1.default.bool;
  exports.assertBool = assertBool;
  var assertBytes = _assert_1.default.bytes;
  exports.assertBytes = assertBytes;
  var utils_2 = require_utils();
  Object.defineProperty(exports, "bytesToHex", { enumerable: true, get: function() {
    return utils_2.bytesToHex;
  } });
  Object.defineProperty(exports, "toHex", { enumerable: true, get: function() {
    return utils_2.bytesToHex;
  } });
  Object.defineProperty(exports, "concatBytes", { enumerable: true, get: function() {
    return utils_2.concatBytes;
  } });
  Object.defineProperty(exports, "createView", { enumerable: true, get: function() {
    return utils_2.createView;
  } });
  Object.defineProperty(exports, "utf8ToBytes", { enumerable: true, get: function() {
    return utils_2.utf8ToBytes;
  } });
  exports.bytesToUtf8 = bytesToUtf8;
  exports.hexToBytes = hexToBytes;
  exports.equalsBytes = equalsBytes;
  exports.wrapHash = wrapHash;
  exports.crypto = (() => {
    const webCrypto = typeof self === "object" && ("crypto" in self) ? self.crypto : undefined;
    const nodeRequire = typeof module !== "undefined" && typeof module.require === "function" && module.require.bind(module);
    return {
      node: nodeRequire && !webCrypto ? nodeRequire("crypto") : undefined,
      web: webCrypto
    };
  })();
});

// node_modules/ethereum-cryptography/keccak.js
var require_keccak = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.keccak512 = exports.keccak384 = exports.keccak256 = exports.keccak224 = undefined;
  var sha3_1 = require_sha3();
  var utils_1 = require_utils2();
  exports.keccak224 = (0, utils_1.wrapHash)(sha3_1.keccak_224);
  exports.keccak256 = (() => {
    const k = (0, utils_1.wrapHash)(sha3_1.keccak_256);
    k.create = sha3_1.keccak_256.create;
    return k;
  })();
  exports.keccak384 = (0, utils_1.wrapHash)(sha3_1.keccak_384);
  exports.keccak512 = (0, utils_1.wrapHash)(sha3_1.keccak_512);
});

// node:buffer
var exports_buffer = {};
__export(exports_buffer, {
  default: () => {
    {
      return export_default;
    }
  }
});
var Er, $, dr, gr, mr, Ir, b, Fr, D, _, J, Q, v, z, S, xr, export_default;
var init_buffer = __esm(() => {
  Er = Object.create;
  $ = Object.defineProperty;
  dr = Object.getOwnPropertyDescriptor;
  gr = Object.getOwnPropertyNames;
  mr = Object.getPrototypeOf;
  Ir = Object.prototype.hasOwnProperty;
  b = (i, r) => () => (r || i((r = { exports: {} }).exports, r), r.exports);
  Fr = (i, r) => {
    for (var t in r)
      $(i, t, { get: r[t], enumerable: true });
  };
  D = (i, r, t, n) => {
    if (r && typeof r == "object" || typeof r == "function")
      for (let e of gr(r))
        !Ir.call(i, e) && e !== t && $(i, e, { get: () => r[e], enumerable: !(n = dr(r, e)) || n.enumerable });
    return i;
  };
  _ = (i, r, t) => (D(i, r, "default"), t && D(t, r, "default"));
  J = (i, r, t) => (t = i != null ? Er(mr(i)) : {}, D(r || !i || !i.__esModule ? $(t, "default", { value: i, enumerable: true }) : t, i));
  Q = b((L) => {
    L.byteLength = Ur;
    L.toByteArray = Tr;
    L.fromByteArray = _r;
    var B = [], w = [], Ar = typeof Uint8Array < "u" ? Uint8Array : Array, P = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for (m = 0, K = P.length;m < K; ++m)
      B[m] = P[m], w[P.charCodeAt(m)] = m;
    var m, K;
    w["-".charCodeAt(0)] = 62;
    w["_".charCodeAt(0)] = 63;
    function Z(i) {
      var r = i.length;
      if (r % 4 > 0)
        throw new Error("Invalid string. Length must be a multiple of 4");
      var t = i.indexOf("=");
      t === -1 && (t = r);
      var n = t === r ? 0 : 4 - t % 4;
      return [t, n];
    }
    function Ur(i) {
      var r = Z(i), t = r[0], n = r[1];
      return (t + n) * 3 / 4 - n;
    }
    function Rr(i, r, t) {
      return (r + t) * 3 / 4 - t;
    }
    function Tr(i) {
      var r, t = Z(i), n = t[0], e = t[1], o = new Ar(Rr(i, n, e)), u = 0, f = e > 0 ? n - 4 : n, c;
      for (c = 0;c < f; c += 4)
        r = w[i.charCodeAt(c)] << 18 | w[i.charCodeAt(c + 1)] << 12 | w[i.charCodeAt(c + 2)] << 6 | w[i.charCodeAt(c + 3)], o[u++] = r >> 16 & 255, o[u++] = r >> 8 & 255, o[u++] = r & 255;
      return e === 2 && (r = w[i.charCodeAt(c)] << 2 | w[i.charCodeAt(c + 1)] >> 4, o[u++] = r & 255), e === 1 && (r = w[i.charCodeAt(c)] << 10 | w[i.charCodeAt(c + 1)] << 4 | w[i.charCodeAt(c + 2)] >> 2, o[u++] = r >> 8 & 255, o[u++] = r & 255), o;
    }
    function Cr(i) {
      return B[i >> 18 & 63] + B[i >> 12 & 63] + B[i >> 6 & 63] + B[i & 63];
    }
    function Sr(i, r, t) {
      for (var n, e = [], o = r;o < t; o += 3)
        n = (i[o] << 16 & 16711680) + (i[o + 1] << 8 & 65280) + (i[o + 2] & 255), e.push(Cr(n));
      return e.join("");
    }
    function _r(i) {
      for (var r, t = i.length, n = t % 3, e = [], o = 16383, u = 0, f = t - n;u < f; u += o)
        e.push(Sr(i, u, u + o > f ? f : u + o));
      return n === 1 ? (r = i[t - 1], e.push(B[r >> 2] + B[r << 4 & 63] + "==")) : n === 2 && (r = (i[t - 2] << 8) + i[t - 1], e.push(B[r >> 10] + B[r >> 4 & 63] + B[r << 2 & 63] + "=")), e.join("");
    }
  });
  v = b((O) => {
    O.read = function(i, r, t, n, e) {
      var o, u, f = e * 8 - n - 1, c = (1 << f) - 1, l = c >> 1, s = -7, p = t ? e - 1 : 0, F = t ? -1 : 1, x = i[r + p];
      for (p += F, o = x & (1 << -s) - 1, x >>= -s, s += f;s > 0; o = o * 256 + i[r + p], p += F, s -= 8)
        ;
      for (u = o & (1 << -s) - 1, o >>= -s, s += n;s > 0; u = u * 256 + i[r + p], p += F, s -= 8)
        ;
      if (o === 0)
        o = 1 - l;
      else {
        if (o === c)
          return u ? NaN : (x ? -1 : 1) * (1 / 0);
        u = u + Math.pow(2, n), o = o - l;
      }
      return (x ? -1 : 1) * u * Math.pow(2, o - n);
    };
    O.write = function(i, r, t, n, e, o) {
      var u, f, c, l = o * 8 - e - 1, s = (1 << l) - 1, p = s >> 1, F = e === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0, x = n ? 0 : o - 1, k = n ? 1 : -1, Br = r < 0 || r === 0 && 1 / r < 0 ? 1 : 0;
      for (r = Math.abs(r), isNaN(r) || r === 1 / 0 ? (f = isNaN(r) ? 1 : 0, u = s) : (u = Math.floor(Math.log(r) / Math.LN2), r * (c = Math.pow(2, -u)) < 1 && (u--, c *= 2), u + p >= 1 ? r += F / c : r += F * Math.pow(2, 1 - p), r * c >= 2 && (u++, c /= 2), u + p >= s ? (f = 0, u = s) : u + p >= 1 ? (f = (r * c - 1) * Math.pow(2, e), u = u + p) : (f = r * Math.pow(2, p - 1) * Math.pow(2, e), u = 0));e >= 8; i[t + x] = f & 255, x += k, f /= 256, e -= 8)
        ;
      for (u = u << e | f, l += e;l > 0; i[t + x] = u & 255, x += k, u /= 256, l -= 8)
        ;
      i[t + x - k] |= Br * 128;
    };
  });
  z = b((T) => {
    var G = Q(), U = v(), rr = typeof Symbol == "function" && typeof Symbol.for == "function" ? Symbol.for("nodejs.util.inspect.custom") : null;
    T.Buffer = h;
    T.SlowBuffer = $r;
    T.INSPECT_MAX_BYTES = 50;
    var N = 2147483647;
    T.kMaxLength = N;
    h.TYPED_ARRAY_SUPPORT = Lr();
    !h.TYPED_ARRAY_SUPPORT && typeof console < "u" && typeof console.error == "function" && console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");
    function Lr() {
      try {
        let i = new Uint8Array(1), r = { foo: function() {
          return 42;
        } };
        return Object.setPrototypeOf(r, Uint8Array.prototype), Object.setPrototypeOf(i, r), i.foo() === 42;
      } catch {
        return false;
      }
    }
    Object.defineProperty(h.prototype, "parent", { enumerable: true, get: function() {
      if (!!h.isBuffer(this))
        return this.buffer;
    } });
    Object.defineProperty(h.prototype, "offset", { enumerable: true, get: function() {
      if (!!h.isBuffer(this))
        return this.byteOffset;
    } });
    function d(i) {
      if (i > N)
        throw new RangeError('The value "' + i + '" is invalid for option "size"');
      let r = new Uint8Array(i);
      return Object.setPrototypeOf(r, h.prototype), r;
    }
    function h(i, r, t) {
      if (typeof i == "number") {
        if (typeof r == "string")
          throw new TypeError('The "string" argument must be of type string. Received type number');
        return j(i);
      }
      return er(i, r, t);
    }
    h.poolSize = 8192;
    function er(i, r, t) {
      if (typeof i == "string")
        return Mr(i, r);
      if (ArrayBuffer.isView(i))
        return kr(i);
      if (i == null)
        throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof i);
      if (E(i, ArrayBuffer) || i && E(i.buffer, ArrayBuffer) || typeof SharedArrayBuffer < "u" && (E(i, SharedArrayBuffer) || i && E(i.buffer, SharedArrayBuffer)))
        return q(i, r, t);
      if (typeof i == "number")
        throw new TypeError('The "value" argument must not be of type number. Received type number');
      let n = i.valueOf && i.valueOf();
      if (n != null && n !== i)
        return h.from(n, r, t);
      let e = Dr(i);
      if (e)
        return e;
      if (typeof Symbol < "u" && Symbol.toPrimitive != null && typeof i[Symbol.toPrimitive] == "function")
        return h.from(i[Symbol.toPrimitive]("string"), r, t);
      throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof i);
    }
    h.from = function(i, r, t) {
      return er(i, r, t);
    };
    Object.setPrototypeOf(h.prototype, Uint8Array.prototype);
    Object.setPrototypeOf(h, Uint8Array);
    function or(i) {
      if (typeof i != "number")
        throw new TypeError('"size" argument must be of type number');
      if (i < 0)
        throw new RangeError('The value "' + i + '" is invalid for option "size"');
    }
    function Nr(i, r, t) {
      return or(i), i <= 0 ? d(i) : r !== undefined ? typeof t == "string" ? d(i).fill(r, t) : d(i).fill(r) : d(i);
    }
    h.alloc = function(i, r, t) {
      return Nr(i, r, t);
    };
    function j(i) {
      return or(i), d(i < 0 ? 0 : H(i) | 0);
    }
    h.allocUnsafe = function(i) {
      return j(i);
    };
    h.allocUnsafeSlow = function(i) {
      return j(i);
    };
    function Mr(i, r) {
      if ((typeof r != "string" || r === "") && (r = "utf8"), !h.isEncoding(r))
        throw new TypeError("Unknown encoding: " + r);
      let t = ur(i, r) | 0, n = d(t), e = n.write(i, r);
      return e !== t && (n = n.slice(0, e)), n;
    }
    function Y(i) {
      let r = i.length < 0 ? 0 : H(i.length) | 0, t = d(r);
      for (let n = 0;n < r; n += 1)
        t[n] = i[n] & 255;
      return t;
    }
    function kr(i) {
      if (E(i, Uint8Array)) {
        let r = new Uint8Array(i);
        return q(r.buffer, r.byteOffset, r.byteLength);
      }
      return Y(i);
    }
    function q(i, r, t) {
      if (r < 0 || i.byteLength < r)
        throw new RangeError('"offset" is outside of buffer bounds');
      if (i.byteLength < r + (t || 0))
        throw new RangeError('"length" is outside of buffer bounds');
      let n;
      return r === undefined && t === undefined ? n = new Uint8Array(i) : t === undefined ? n = new Uint8Array(i, r) : n = new Uint8Array(i, r, t), Object.setPrototypeOf(n, h.prototype), n;
    }
    function Dr(i) {
      if (h.isBuffer(i)) {
        let r = H(i.length) | 0, t = d(r);
        return t.length === 0 || i.copy(t, 0, 0, r), t;
      }
      if (i.length !== undefined)
        return typeof i.length != "number" || X(i.length) ? d(0) : Y(i);
      if (i.type === "Buffer" && Array.isArray(i.data))
        return Y(i.data);
    }
    function H(i) {
      if (i >= N)
        throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + N.toString(16) + " bytes");
      return i | 0;
    }
    function $r(i) {
      return +i != i && (i = 0), h.alloc(+i);
    }
    h.isBuffer = function(r) {
      return r != null && r._isBuffer === true && r !== h.prototype;
    };
    h.compare = function(r, t) {
      if (E(r, Uint8Array) && (r = h.from(r, r.offset, r.byteLength)), E(t, Uint8Array) && (t = h.from(t, t.offset, t.byteLength)), !h.isBuffer(r) || !h.isBuffer(t))
        throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');
      if (r === t)
        return 0;
      let n = r.length, e = t.length;
      for (let o = 0, u = Math.min(n, e);o < u; ++o)
        if (r[o] !== t[o]) {
          n = r[o], e = t[o];
          break;
        }
      return n < e ? -1 : e < n ? 1 : 0;
    };
    h.isEncoding = function(r) {
      switch (String(r).toLowerCase()) {
        case "hex":
        case "utf8":
        case "utf-8":
        case "ascii":
        case "latin1":
        case "binary":
        case "base64":
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return true;
        default:
          return false;
      }
    };
    h.concat = function(r, t) {
      if (!Array.isArray(r))
        throw new TypeError('"list" argument must be an Array of Buffers');
      if (r.length === 0)
        return h.alloc(0);
      let n;
      if (t === undefined)
        for (t = 0, n = 0;n < r.length; ++n)
          t += r[n].length;
      let e = h.allocUnsafe(t), o = 0;
      for (n = 0;n < r.length; ++n) {
        let u = r[n];
        if (E(u, Uint8Array))
          o + u.length > e.length ? (h.isBuffer(u) || (u = h.from(u)), u.copy(e, o)) : Uint8Array.prototype.set.call(e, u, o);
        else if (h.isBuffer(u))
          u.copy(e, o);
        else
          throw new TypeError('"list" argument must be an Array of Buffers');
        o += u.length;
      }
      return e;
    };
    function ur(i, r) {
      if (h.isBuffer(i))
        return i.length;
      if (ArrayBuffer.isView(i) || E(i, ArrayBuffer))
        return i.byteLength;
      if (typeof i != "string")
        throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof i);
      let t = i.length, n = arguments.length > 2 && arguments[2] === true;
      if (!n && t === 0)
        return 0;
      let e = false;
      for (;; )
        switch (r) {
          case "ascii":
          case "latin1":
          case "binary":
            return t;
          case "utf8":
          case "utf-8":
            return W(i).length;
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return t * 2;
          case "hex":
            return t >>> 1;
          case "base64":
            return wr(i).length;
          default:
            if (e)
              return n ? -1 : W(i).length;
            r = ("" + r).toLowerCase(), e = true;
        }
    }
    h.byteLength = ur;
    function br(i, r, t) {
      let n = false;
      if ((r === undefined || r < 0) && (r = 0), r > this.length || ((t === undefined || t > this.length) && (t = this.length), t <= 0) || (t >>>= 0, r >>>= 0, t <= r))
        return "";
      for (i || (i = "utf8");; )
        switch (i) {
          case "hex":
            return Xr(this, r, t);
          case "utf8":
          case "utf-8":
            return fr(this, r, t);
          case "ascii":
            return Hr(this, r, t);
          case "latin1":
          case "binary":
            return Vr(this, r, t);
          case "base64":
            return Wr(this, r, t);
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return zr(this, r, t);
          default:
            if (n)
              throw new TypeError("Unknown encoding: " + i);
            i = (i + "").toLowerCase(), n = true;
        }
    }
    h.prototype._isBuffer = true;
    function I(i, r, t) {
      let n = i[r];
      i[r] = i[t], i[t] = n;
    }
    h.prototype.swap16 = function() {
      let r = this.length;
      if (r % 2 !== 0)
        throw new RangeError("Buffer size must be a multiple of 16-bits");
      for (let t = 0;t < r; t += 2)
        I(this, t, t + 1);
      return this;
    };
    h.prototype.swap32 = function() {
      let r = this.length;
      if (r % 4 !== 0)
        throw new RangeError("Buffer size must be a multiple of 32-bits");
      for (let t = 0;t < r; t += 4)
        I(this, t, t + 3), I(this, t + 1, t + 2);
      return this;
    };
    h.prototype.swap64 = function() {
      let r = this.length;
      if (r % 8 !== 0)
        throw new RangeError("Buffer size must be a multiple of 64-bits");
      for (let t = 0;t < r; t += 8)
        I(this, t, t + 7), I(this, t + 1, t + 6), I(this, t + 2, t + 5), I(this, t + 3, t + 4);
      return this;
    };
    h.prototype.toString = function() {
      let r = this.length;
      return r === 0 ? "" : arguments.length === 0 ? fr(this, 0, r) : br.apply(this, arguments);
    };
    h.prototype.toLocaleString = h.prototype.toString;
    h.prototype.equals = function(r) {
      if (!h.isBuffer(r))
        throw new TypeError("Argument must be a Buffer");
      return this === r ? true : h.compare(this, r) === 0;
    };
    h.prototype.inspect = function() {
      let r = "", t = T.INSPECT_MAX_BYTES;
      return r = this.toString("hex", 0, t).replace(/(.{2})/g, "$1 ").trim(), this.length > t && (r += " ... "), "<Buffer " + r + ">";
    };
    rr && (h.prototype[rr] = h.prototype.inspect);
    h.prototype.compare = function(r, t, n, e, o) {
      if (E(r, Uint8Array) && (r = h.from(r, r.offset, r.byteLength)), !h.isBuffer(r))
        throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof r);
      if (t === undefined && (t = 0), n === undefined && (n = r ? r.length : 0), e === undefined && (e = 0), o === undefined && (o = this.length), t < 0 || n > r.length || e < 0 || o > this.length)
        throw new RangeError("out of range index");
      if (e >= o && t >= n)
        return 0;
      if (e >= o)
        return -1;
      if (t >= n)
        return 1;
      if (t >>>= 0, n >>>= 0, e >>>= 0, o >>>= 0, this === r)
        return 0;
      let u = o - e, f = n - t, c = Math.min(u, f), l = this.slice(e, o), s = r.slice(t, n);
      for (let p = 0;p < c; ++p)
        if (l[p] !== s[p]) {
          u = l[p], f = s[p];
          break;
        }
      return u < f ? -1 : f < u ? 1 : 0;
    };
    function hr(i, r, t, n, e) {
      if (i.length === 0)
        return -1;
      if (typeof t == "string" ? (n = t, t = 0) : t > 2147483647 ? t = 2147483647 : t < -2147483648 && (t = -2147483648), t = +t, X(t) && (t = e ? 0 : i.length - 1), t < 0 && (t = i.length + t), t >= i.length) {
        if (e)
          return -1;
        t = i.length - 1;
      } else if (t < 0)
        if (e)
          t = 0;
        else
          return -1;
      if (typeof r == "string" && (r = h.from(r, n)), h.isBuffer(r))
        return r.length === 0 ? -1 : tr(i, r, t, n, e);
      if (typeof r == "number")
        return r = r & 255, typeof Uint8Array.prototype.indexOf == "function" ? e ? Uint8Array.prototype.indexOf.call(i, r, t) : Uint8Array.prototype.lastIndexOf.call(i, r, t) : tr(i, [r], t, n, e);
      throw new TypeError("val must be string, number or Buffer");
    }
    function tr(i, r, t, n, e) {
      let o = 1, u = i.length, f = r.length;
      if (n !== undefined && (n = String(n).toLowerCase(), n === "ucs2" || n === "ucs-2" || n === "utf16le" || n === "utf-16le")) {
        if (i.length < 2 || r.length < 2)
          return -1;
        o = 2, u /= 2, f /= 2, t /= 2;
      }
      function c(s, p) {
        return o === 1 ? s[p] : s.readUInt16BE(p * o);
      }
      let l;
      if (e) {
        let s = -1;
        for (l = t;l < u; l++)
          if (c(i, l) === c(r, s === -1 ? 0 : l - s)) {
            if (s === -1 && (s = l), l - s + 1 === f)
              return s * o;
          } else
            s !== -1 && (l -= l - s), s = -1;
      } else
        for (t + f > u && (t = u - f), l = t;l >= 0; l--) {
          let s = true;
          for (let p = 0;p < f; p++)
            if (c(i, l + p) !== c(r, p)) {
              s = false;
              break;
            }
          if (s)
            return l;
        }
      return -1;
    }
    h.prototype.includes = function(r, t, n) {
      return this.indexOf(r, t, n) !== -1;
    };
    h.prototype.indexOf = function(r, t, n) {
      return hr(this, r, t, n, true);
    };
    h.prototype.lastIndexOf = function(r, t, n) {
      return hr(this, r, t, n, false);
    };
    function Pr(i, r, t, n) {
      t = Number(t) || 0;
      let e = i.length - t;
      n ? (n = Number(n), n > e && (n = e)) : n = e;
      let o = r.length;
      n > o / 2 && (n = o / 2);
      let u;
      for (u = 0;u < n; ++u) {
        let f = parseInt(r.substr(u * 2, 2), 16);
        if (X(f))
          return u;
        i[t + u] = f;
      }
      return u;
    }
    function Or(i, r, t, n) {
      return M(W(r, i.length - t), i, t, n);
    }
    function Gr(i, r, t, n) {
      return M(Qr(r), i, t, n);
    }
    function Yr(i, r, t, n) {
      return M(wr(r), i, t, n);
    }
    function qr(i, r, t, n) {
      return M(vr(r, i.length - t), i, t, n);
    }
    h.prototype.write = function(r, t, n, e) {
      if (t === undefined)
        e = "utf8", n = this.length, t = 0;
      else if (n === undefined && typeof t == "string")
        e = t, n = this.length, t = 0;
      else if (isFinite(t))
        t = t >>> 0, isFinite(n) ? (n = n >>> 0, e === undefined && (e = "utf8")) : (e = n, n = undefined);
      else
        throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
      let o = this.length - t;
      if ((n === undefined || n > o) && (n = o), r.length > 0 && (n < 0 || t < 0) || t > this.length)
        throw new RangeError("Attempt to write outside buffer bounds");
      e || (e = "utf8");
      let u = false;
      for (;; )
        switch (e) {
          case "hex":
            return Pr(this, r, t, n);
          case "utf8":
          case "utf-8":
            return Or(this, r, t, n);
          case "ascii":
          case "latin1":
          case "binary":
            return Gr(this, r, t, n);
          case "base64":
            return Yr(this, r, t, n);
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return qr(this, r, t, n);
          default:
            if (u)
              throw new TypeError("Unknown encoding: " + e);
            e = ("" + e).toLowerCase(), u = true;
        }
    };
    h.prototype.toJSON = function() {
      return { type: "Buffer", data: Array.prototype.slice.call(this._arr || this, 0) };
    };
    function Wr(i, r, t) {
      return r === 0 && t === i.length ? G.fromByteArray(i) : G.fromByteArray(i.slice(r, t));
    }
    function fr(i, r, t) {
      t = Math.min(i.length, t);
      let n = [], e = r;
      for (;e < t; ) {
        let o = i[e], u = null, f = o > 239 ? 4 : o > 223 ? 3 : o > 191 ? 2 : 1;
        if (e + f <= t) {
          let c, l, s, p;
          switch (f) {
            case 1:
              o < 128 && (u = o);
              break;
            case 2:
              c = i[e + 1], (c & 192) === 128 && (p = (o & 31) << 6 | c & 63, p > 127 && (u = p));
              break;
            case 3:
              c = i[e + 1], l = i[e + 2], (c & 192) === 128 && (l & 192) === 128 && (p = (o & 15) << 12 | (c & 63) << 6 | l & 63, p > 2047 && (p < 55296 || p > 57343) && (u = p));
              break;
            case 4:
              c = i[e + 1], l = i[e + 2], s = i[e + 3], (c & 192) === 128 && (l & 192) === 128 && (s & 192) === 128 && (p = (o & 15) << 18 | (c & 63) << 12 | (l & 63) << 6 | s & 63, p > 65535 && p < 1114112 && (u = p));
          }
        }
        u === null ? (u = 65533, f = 1) : u > 65535 && (u -= 65536, n.push(u >>> 10 & 1023 | 55296), u = 56320 | u & 1023), n.push(u), e += f;
      }
      return jr(n);
    }
    var ir = 4096;
    function jr(i) {
      let r = i.length;
      if (r <= ir)
        return String.fromCharCode.apply(String, i);
      let t = "", n = 0;
      for (;n < r; )
        t += String.fromCharCode.apply(String, i.slice(n, n += ir));
      return t;
    }
    function Hr(i, r, t) {
      let n = "";
      t = Math.min(i.length, t);
      for (let e = r;e < t; ++e)
        n += String.fromCharCode(i[e] & 127);
      return n;
    }
    function Vr(i, r, t) {
      let n = "";
      t = Math.min(i.length, t);
      for (let e = r;e < t; ++e)
        n += String.fromCharCode(i[e]);
      return n;
    }
    function Xr(i, r, t) {
      let n = i.length;
      (!r || r < 0) && (r = 0), (!t || t < 0 || t > n) && (t = n);
      let e = "";
      for (let o = r;o < t; ++o)
        e += rt[i[o]];
      return e;
    }
    function zr(i, r, t) {
      let n = i.slice(r, t), e = "";
      for (let o = 0;o < n.length - 1; o += 2)
        e += String.fromCharCode(n[o] + n[o + 1] * 256);
      return e;
    }
    h.prototype.slice = function(r, t) {
      let n = this.length;
      r = ~~r, t = t === undefined ? n : ~~t, r < 0 ? (r += n, r < 0 && (r = 0)) : r > n && (r = n), t < 0 ? (t += n, t < 0 && (t = 0)) : t > n && (t = n), t < r && (t = r);
      let e = this.subarray(r, t);
      return Object.setPrototypeOf(e, h.prototype), e;
    };
    function a(i, r, t) {
      if (i % 1 !== 0 || i < 0)
        throw new RangeError("offset is not uint");
      if (i + r > t)
        throw new RangeError("Trying to access beyond buffer length");
    }
    h.prototype.readUintLE = h.prototype.readUIntLE = function(r, t, n) {
      r = r >>> 0, t = t >>> 0, n || a(r, t, this.length);
      let e = this[r], o = 1, u = 0;
      for (;++u < t && (o *= 256); )
        e += this[r + u] * o;
      return e;
    };
    h.prototype.readUintBE = h.prototype.readUIntBE = function(r, t, n) {
      r = r >>> 0, t = t >>> 0, n || a(r, t, this.length);
      let e = this[r + --t], o = 1;
      for (;t > 0 && (o *= 256); )
        e += this[r + --t] * o;
      return e;
    };
    h.prototype.readUint8 = h.prototype.readUInt8 = function(r, t) {
      return r = r >>> 0, t || a(r, 1, this.length), this[r];
    };
    h.prototype.readUint16LE = h.prototype.readUInt16LE = function(r, t) {
      return r = r >>> 0, t || a(r, 2, this.length), this[r] | this[r + 1] << 8;
    };
    h.prototype.readUint16BE = h.prototype.readUInt16BE = function(r, t) {
      return r = r >>> 0, t || a(r, 2, this.length), this[r] << 8 | this[r + 1];
    };
    h.prototype.readUint32LE = h.prototype.readUInt32LE = function(r, t) {
      return r = r >>> 0, t || a(r, 4, this.length), (this[r] | this[r + 1] << 8 | this[r + 2] << 16) + this[r + 3] * 16777216;
    };
    h.prototype.readUint32BE = h.prototype.readUInt32BE = function(r, t) {
      return r = r >>> 0, t || a(r, 4, this.length), this[r] * 16777216 + (this[r + 1] << 16 | this[r + 2] << 8 | this[r + 3]);
    };
    h.prototype.readBigUInt64LE = g(function(r) {
      r = r >>> 0, R(r, "offset");
      let t = this[r], n = this[r + 7];
      (t === undefined || n === undefined) && C(r, this.length - 8);
      let e = t + this[++r] * 2 ** 8 + this[++r] * 2 ** 16 + this[++r] * 2 ** 24, o = this[++r] + this[++r] * 2 ** 8 + this[++r] * 2 ** 16 + n * 2 ** 24;
      return BigInt(e) + (BigInt(o) << BigInt(32));
    });
    h.prototype.readBigUInt64BE = g(function(r) {
      r = r >>> 0, R(r, "offset");
      let t = this[r], n = this[r + 7];
      (t === undefined || n === undefined) && C(r, this.length - 8);
      let e = t * 2 ** 24 + this[++r] * 2 ** 16 + this[++r] * 2 ** 8 + this[++r], o = this[++r] * 2 ** 24 + this[++r] * 2 ** 16 + this[++r] * 2 ** 8 + n;
      return (BigInt(e) << BigInt(32)) + BigInt(o);
    });
    h.prototype.readIntLE = function(r, t, n) {
      r = r >>> 0, t = t >>> 0, n || a(r, t, this.length);
      let e = this[r], o = 1, u = 0;
      for (;++u < t && (o *= 256); )
        e += this[r + u] * o;
      return o *= 128, e >= o && (e -= Math.pow(2, 8 * t)), e;
    };
    h.prototype.readIntBE = function(r, t, n) {
      r = r >>> 0, t = t >>> 0, n || a(r, t, this.length);
      let e = t, o = 1, u = this[r + --e];
      for (;e > 0 && (o *= 256); )
        u += this[r + --e] * o;
      return o *= 128, u >= o && (u -= Math.pow(2, 8 * t)), u;
    };
    h.prototype.readInt8 = function(r, t) {
      return r = r >>> 0, t || a(r, 1, this.length), this[r] & 128 ? (255 - this[r] + 1) * -1 : this[r];
    };
    h.prototype.readInt16LE = function(r, t) {
      r = r >>> 0, t || a(r, 2, this.length);
      let n = this[r] | this[r + 1] << 8;
      return n & 32768 ? n | 4294901760 : n;
    };
    h.prototype.readInt16BE = function(r, t) {
      r = r >>> 0, t || a(r, 2, this.length);
      let n = this[r + 1] | this[r] << 8;
      return n & 32768 ? n | 4294901760 : n;
    };
    h.prototype.readInt32LE = function(r, t) {
      return r = r >>> 0, t || a(r, 4, this.length), this[r] | this[r + 1] << 8 | this[r + 2] << 16 | this[r + 3] << 24;
    };
    h.prototype.readInt32BE = function(r, t) {
      return r = r >>> 0, t || a(r, 4, this.length), this[r] << 24 | this[r + 1] << 16 | this[r + 2] << 8 | this[r + 3];
    };
    h.prototype.readBigInt64LE = g(function(r) {
      r = r >>> 0, R(r, "offset");
      let t = this[r], n = this[r + 7];
      (t === undefined || n === undefined) && C(r, this.length - 8);
      let e = this[r + 4] + this[r + 5] * 2 ** 8 + this[r + 6] * 2 ** 16 + (n << 24);
      return (BigInt(e) << BigInt(32)) + BigInt(t + this[++r] * 2 ** 8 + this[++r] * 2 ** 16 + this[++r] * 2 ** 24);
    });
    h.prototype.readBigInt64BE = g(function(r) {
      r = r >>> 0, R(r, "offset");
      let t = this[r], n = this[r + 7];
      (t === undefined || n === undefined) && C(r, this.length - 8);
      let e = (t << 24) + this[++r] * 2 ** 16 + this[++r] * 2 ** 8 + this[++r];
      return (BigInt(e) << BigInt(32)) + BigInt(this[++r] * 2 ** 24 + this[++r] * 2 ** 16 + this[++r] * 2 ** 8 + n);
    });
    h.prototype.readFloatLE = function(r, t) {
      return r = r >>> 0, t || a(r, 4, this.length), U.read(this, r, true, 23, 4);
    };
    h.prototype.readFloatBE = function(r, t) {
      return r = r >>> 0, t || a(r, 4, this.length), U.read(this, r, false, 23, 4);
    };
    h.prototype.readDoubleLE = function(r, t) {
      return r = r >>> 0, t || a(r, 8, this.length), U.read(this, r, true, 52, 8);
    };
    h.prototype.readDoubleBE = function(r, t) {
      return r = r >>> 0, t || a(r, 8, this.length), U.read(this, r, false, 52, 8);
    };
    function y(i, r, t, n, e, o) {
      if (!h.isBuffer(i))
        throw new TypeError('"buffer" argument must be a Buffer instance');
      if (r > e || r < o)
        throw new RangeError('"value" argument is out of bounds');
      if (t + n > i.length)
        throw new RangeError("Index out of range");
    }
    h.prototype.writeUintLE = h.prototype.writeUIntLE = function(r, t, n, e) {
      if (r = +r, t = t >>> 0, n = n >>> 0, !e) {
        let f = Math.pow(2, 8 * n) - 1;
        y(this, r, t, n, f, 0);
      }
      let o = 1, u = 0;
      for (this[t] = r & 255;++u < n && (o *= 256); )
        this[t + u] = r / o & 255;
      return t + n;
    };
    h.prototype.writeUintBE = h.prototype.writeUIntBE = function(r, t, n, e) {
      if (r = +r, t = t >>> 0, n = n >>> 0, !e) {
        let f = Math.pow(2, 8 * n) - 1;
        y(this, r, t, n, f, 0);
      }
      let o = n - 1, u = 1;
      for (this[t + o] = r & 255;--o >= 0 && (u *= 256); )
        this[t + o] = r / u & 255;
      return t + n;
    };
    h.prototype.writeUint8 = h.prototype.writeUInt8 = function(r, t, n) {
      return r = +r, t = t >>> 0, n || y(this, r, t, 1, 255, 0), this[t] = r & 255, t + 1;
    };
    h.prototype.writeUint16LE = h.prototype.writeUInt16LE = function(r, t, n) {
      return r = +r, t = t >>> 0, n || y(this, r, t, 2, 65535, 0), this[t] = r & 255, this[t + 1] = r >>> 8, t + 2;
    };
    h.prototype.writeUint16BE = h.prototype.writeUInt16BE = function(r, t, n) {
      return r = +r, t = t >>> 0, n || y(this, r, t, 2, 65535, 0), this[t] = r >>> 8, this[t + 1] = r & 255, t + 2;
    };
    h.prototype.writeUint32LE = h.prototype.writeUInt32LE = function(r, t, n) {
      return r = +r, t = t >>> 0, n || y(this, r, t, 4, 4294967295, 0), this[t + 3] = r >>> 24, this[t + 2] = r >>> 16, this[t + 1] = r >>> 8, this[t] = r & 255, t + 4;
    };
    h.prototype.writeUint32BE = h.prototype.writeUInt32BE = function(r, t, n) {
      return r = +r, t = t >>> 0, n || y(this, r, t, 4, 4294967295, 0), this[t] = r >>> 24, this[t + 1] = r >>> 16, this[t + 2] = r >>> 8, this[t + 3] = r & 255, t + 4;
    };
    function cr(i, r, t, n, e) {
      yr(r, n, e, i, t, 7);
      let o = Number(r & BigInt(4294967295));
      i[t++] = o, o = o >> 8, i[t++] = o, o = o >> 8, i[t++] = o, o = o >> 8, i[t++] = o;
      let u = Number(r >> BigInt(32) & BigInt(4294967295));
      return i[t++] = u, u = u >> 8, i[t++] = u, u = u >> 8, i[t++] = u, u = u >> 8, i[t++] = u, t;
    }
    function pr(i, r, t, n, e) {
      yr(r, n, e, i, t, 7);
      let o = Number(r & BigInt(4294967295));
      i[t + 7] = o, o = o >> 8, i[t + 6] = o, o = o >> 8, i[t + 5] = o, o = o >> 8, i[t + 4] = o;
      let u = Number(r >> BigInt(32) & BigInt(4294967295));
      return i[t + 3] = u, u = u >> 8, i[t + 2] = u, u = u >> 8, i[t + 1] = u, u = u >> 8, i[t] = u, t + 8;
    }
    h.prototype.writeBigUInt64LE = g(function(r, t = 0) {
      return cr(this, r, t, BigInt(0), BigInt("0xffffffffffffffff"));
    });
    h.prototype.writeBigUInt64BE = g(function(r, t = 0) {
      return pr(this, r, t, BigInt(0), BigInt("0xffffffffffffffff"));
    });
    h.prototype.writeIntLE = function(r, t, n, e) {
      if (r = +r, t = t >>> 0, !e) {
        let c = Math.pow(2, 8 * n - 1);
        y(this, r, t, n, c - 1, -c);
      }
      let o = 0, u = 1, f = 0;
      for (this[t] = r & 255;++o < n && (u *= 256); )
        r < 0 && f === 0 && this[t + o - 1] !== 0 && (f = 1), this[t + o] = (r / u >> 0) - f & 255;
      return t + n;
    };
    h.prototype.writeIntBE = function(r, t, n, e) {
      if (r = +r, t = t >>> 0, !e) {
        let c = Math.pow(2, 8 * n - 1);
        y(this, r, t, n, c - 1, -c);
      }
      let o = n - 1, u = 1, f = 0;
      for (this[t + o] = r & 255;--o >= 0 && (u *= 256); )
        r < 0 && f === 0 && this[t + o + 1] !== 0 && (f = 1), this[t + o] = (r / u >> 0) - f & 255;
      return t + n;
    };
    h.prototype.writeInt8 = function(r, t, n) {
      return r = +r, t = t >>> 0, n || y(this, r, t, 1, 127, -128), r < 0 && (r = 255 + r + 1), this[t] = r & 255, t + 1;
    };
    h.prototype.writeInt16LE = function(r, t, n) {
      return r = +r, t = t >>> 0, n || y(this, r, t, 2, 32767, -32768), this[t] = r & 255, this[t + 1] = r >>> 8, t + 2;
    };
    h.prototype.writeInt16BE = function(r, t, n) {
      return r = +r, t = t >>> 0, n || y(this, r, t, 2, 32767, -32768), this[t] = r >>> 8, this[t + 1] = r & 255, t + 2;
    };
    h.prototype.writeInt32LE = function(r, t, n) {
      return r = +r, t = t >>> 0, n || y(this, r, t, 4, 2147483647, -2147483648), this[t] = r & 255, this[t + 1] = r >>> 8, this[t + 2] = r >>> 16, this[t + 3] = r >>> 24, t + 4;
    };
    h.prototype.writeInt32BE = function(r, t, n) {
      return r = +r, t = t >>> 0, n || y(this, r, t, 4, 2147483647, -2147483648), r < 0 && (r = 4294967295 + r + 1), this[t] = r >>> 24, this[t + 1] = r >>> 16, this[t + 2] = r >>> 8, this[t + 3] = r & 255, t + 4;
    };
    h.prototype.writeBigInt64LE = g(function(r, t = 0) {
      return cr(this, r, t, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
    });
    h.prototype.writeBigInt64BE = g(function(r, t = 0) {
      return pr(this, r, t, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
    });
    function sr(i, r, t, n, e, o) {
      if (t + n > i.length)
        throw new RangeError("Index out of range");
      if (t < 0)
        throw new RangeError("Index out of range");
    }
    function lr(i, r, t, n, e) {
      return r = +r, t = t >>> 0, e || sr(i, r, t, 4, 340282346638528860000000000000000000000, -340282346638528860000000000000000000000), U.write(i, r, t, n, 23, 4), t + 4;
    }
    h.prototype.writeFloatLE = function(r, t, n) {
      return lr(this, r, t, true, n);
    };
    h.prototype.writeFloatBE = function(r, t, n) {
      return lr(this, r, t, false, n);
    };
    function ar(i, r, t, n, e) {
      return r = +r, t = t >>> 0, e || sr(i, r, t, 8, 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000, -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000), U.write(i, r, t, n, 52, 8), t + 8;
    }
    h.prototype.writeDoubleLE = function(r, t, n) {
      return ar(this, r, t, true, n);
    };
    h.prototype.writeDoubleBE = function(r, t, n) {
      return ar(this, r, t, false, n);
    };
    h.prototype.copy = function(r, t, n, e) {
      if (!h.isBuffer(r))
        throw new TypeError("argument should be a Buffer");
      if (n || (n = 0), !e && e !== 0 && (e = this.length), t >= r.length && (t = r.length), t || (t = 0), e > 0 && e < n && (e = n), e === n || r.length === 0 || this.length === 0)
        return 0;
      if (t < 0)
        throw new RangeError("targetStart out of bounds");
      if (n < 0 || n >= this.length)
        throw new RangeError("Index out of range");
      if (e < 0)
        throw new RangeError("sourceEnd out of bounds");
      e > this.length && (e = this.length), r.length - t < e - n && (e = r.length - t + n);
      let o = e - n;
      return this === r && typeof Uint8Array.prototype.copyWithin == "function" ? this.copyWithin(t, n, e) : Uint8Array.prototype.set.call(r, this.subarray(n, e), t), o;
    };
    h.prototype.fill = function(r, t, n, e) {
      if (typeof r == "string") {
        if (typeof t == "string" ? (e = t, t = 0, n = this.length) : typeof n == "string" && (e = n, n = this.length), e !== undefined && typeof e != "string")
          throw new TypeError("encoding must be a string");
        if (typeof e == "string" && !h.isEncoding(e))
          throw new TypeError("Unknown encoding: " + e);
        if (r.length === 1) {
          let u = r.charCodeAt(0);
          (e === "utf8" && u < 128 || e === "latin1") && (r = u);
        }
      } else
        typeof r == "number" ? r = r & 255 : typeof r == "boolean" && (r = Number(r));
      if (t < 0 || this.length < t || this.length < n)
        throw new RangeError("Out of range index");
      if (n <= t)
        return this;
      t = t >>> 0, n = n === undefined ? this.length : n >>> 0, r || (r = 0);
      let o;
      if (typeof r == "number")
        for (o = t;o < n; ++o)
          this[o] = r;
      else {
        let u = h.isBuffer(r) ? r : h.from(r, e), f = u.length;
        if (f === 0)
          throw new TypeError('The value "' + r + '" is invalid for argument "value"');
        for (o = 0;o < n - t; ++o)
          this[o + t] = u[o % f];
      }
      return this;
    };
    var A = {};
    function V(i, r, t) {
      A[i] = class extends t {
        constructor() {
          super(), Object.defineProperty(this, "message", { value: r.apply(this, arguments), writable: true, configurable: true }), this.name = `${this.name} [${i}]`, this.stack, delete this.name;
        }
        get code() {
          return i;
        }
        set code(e) {
          Object.defineProperty(this, "code", { configurable: true, enumerable: true, value: e, writable: true });
        }
        toString() {
          return `${this.name} [${i}]: ${this.message}`;
        }
      };
    }
    V("ERR_BUFFER_OUT_OF_BOUNDS", function(i) {
      return i ? `${i} is outside of buffer bounds` : "Attempt to access memory outside buffer bounds";
    }, RangeError);
    V("ERR_INVALID_ARG_TYPE", function(i, r) {
      return `The "${i}" argument must be of type number. Received type ${typeof r}`;
    }, TypeError);
    V("ERR_OUT_OF_RANGE", function(i, r, t) {
      let n = `The value of "${i}" is out of range.`, e = t;
      return Number.isInteger(t) && Math.abs(t) > 2 ** 32 ? e = nr(String(t)) : typeof t == "bigint" && (e = String(t), (t > BigInt(2) ** BigInt(32) || t < -(BigInt(2) ** BigInt(32))) && (e = nr(e)), e += "n"), n += ` It must be ${r}. Received ${e}`, n;
    }, RangeError);
    function nr(i) {
      let r = "", t = i.length, n = i[0] === "-" ? 1 : 0;
      for (;t >= n + 4; t -= 3)
        r = `_${i.slice(t - 3, t)}${r}`;
      return `${i.slice(0, t)}${r}`;
    }
    function Jr(i, r, t) {
      R(r, "offset"), (i[r] === undefined || i[r + t] === undefined) && C(r, i.length - (t + 1));
    }
    function yr(i, r, t, n, e, o) {
      if (i > t || i < r) {
        let u = typeof r == "bigint" ? "n" : "", f;
        throw o > 3 ? r === 0 || r === BigInt(0) ? f = `>= 0${u} and < 2${u} ** ${(o + 1) * 8}${u}` : f = `>= -(2${u} ** ${(o + 1) * 8 - 1}${u}) and < 2 ** ${(o + 1) * 8 - 1}${u}` : f = `>= ${r}${u} and <= ${t}${u}`, new A.ERR_OUT_OF_RANGE("value", f, i);
      }
      Jr(n, e, o);
    }
    function R(i, r) {
      if (typeof i != "number")
        throw new A.ERR_INVALID_ARG_TYPE(r, "number", i);
    }
    function C(i, r, t) {
      throw Math.floor(i) !== i ? (R(i, t), new A.ERR_OUT_OF_RANGE(t || "offset", "an integer", i)) : r < 0 ? new A.ERR_BUFFER_OUT_OF_BOUNDS : new A.ERR_OUT_OF_RANGE(t || "offset", `>= ${t ? 1 : 0} and <= ${r}`, i);
    }
    var Kr = /[^+/0-9A-Za-z-_]/g;
    function Zr(i) {
      if (i = i.split("=")[0], i = i.trim().replace(Kr, ""), i.length < 2)
        return "";
      for (;i.length % 4 !== 0; )
        i = i + "=";
      return i;
    }
    function W(i, r) {
      r = r || 1 / 0;
      let t, n = i.length, e = null, o = [];
      for (let u = 0;u < n; ++u) {
        if (t = i.charCodeAt(u), t > 55295 && t < 57344) {
          if (!e) {
            if (t > 56319) {
              (r -= 3) > -1 && o.push(239, 191, 189);
              continue;
            } else if (u + 1 === n) {
              (r -= 3) > -1 && o.push(239, 191, 189);
              continue;
            }
            e = t;
            continue;
          }
          if (t < 56320) {
            (r -= 3) > -1 && o.push(239, 191, 189), e = t;
            continue;
          }
          t = (e - 55296 << 10 | t - 56320) + 65536;
        } else
          e && (r -= 3) > -1 && o.push(239, 191, 189);
        if (e = null, t < 128) {
          if ((r -= 1) < 0)
            break;
          o.push(t);
        } else if (t < 2048) {
          if ((r -= 2) < 0)
            break;
          o.push(t >> 6 | 192, t & 63 | 128);
        } else if (t < 65536) {
          if ((r -= 3) < 0)
            break;
          o.push(t >> 12 | 224, t >> 6 & 63 | 128, t & 63 | 128);
        } else if (t < 1114112) {
          if ((r -= 4) < 0)
            break;
          o.push(t >> 18 | 240, t >> 12 & 63 | 128, t >> 6 & 63 | 128, t & 63 | 128);
        } else
          throw new Error("Invalid code point");
      }
      return o;
    }
    function Qr(i) {
      let r = [];
      for (let t = 0;t < i.length; ++t)
        r.push(i.charCodeAt(t) & 255);
      return r;
    }
    function vr(i, r) {
      let t, n, e, o = [];
      for (let u = 0;u < i.length && !((r -= 2) < 0); ++u)
        t = i.charCodeAt(u), n = t >> 8, e = t % 256, o.push(e), o.push(n);
      return o;
    }
    function wr(i) {
      return G.toByteArray(Zr(i));
    }
    function M(i, r, t, n) {
      let e;
      for (e = 0;e < n && !(e + t >= r.length || e >= i.length); ++e)
        r[e + t] = i[e];
      return e;
    }
    function E(i, r) {
      return i instanceof r || i != null && i.constructor != null && i.constructor.name != null && i.constructor.name === r.name;
    }
    function X(i) {
      return i !== i;
    }
    var rt = function() {
      let i = "0123456789abcdef", r = new Array(256);
      for (let t = 0;t < 16; ++t) {
        let n = t * 16;
        for (let e = 0;e < 16; ++e)
          r[n + e] = i[t] + i[e];
      }
      return r;
    }();
    function g(i) {
      return typeof BigInt > "u" ? tt : i;
    }
    function tt() {
      throw new Error("BigInt not supported");
    }
  });
  S = {};
  Fr(S, { default: () => xr.Buffer });
  _(S, J(z()));
  xr = J(z());
  export_default = xr.Buffer;
  /*!
   * The buffer module from node.js, for the browser.
   *
   * @author   Feross Aboukhadijeh <https://feross.org>
   * @license  MIT
   */
  /*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
});

// node_modules/bn.js/lib/bn.js
var require_bn = __commonJS((exports, module) => {
  (function(module2, exports2) {
    function assert(val, msg) {
      if (!val)
        throw new Error(msg || "Assertion failed");
    }
    function inherits(ctor, superCtor) {
      ctor.super_ = superCtor;
      var TempCtor = function() {
      };
      TempCtor.prototype = superCtor.prototype;
      ctor.prototype = new TempCtor;
      ctor.prototype.constructor = ctor;
    }
    function BN(number, base, endian) {
      if (BN.isBN(number)) {
        return number;
      }
      this.negative = 0;
      this.words = null;
      this.length = 0;
      this.red = null;
      if (number !== null) {
        if (base === "le" || base === "be") {
          endian = base;
          base = 10;
        }
        this._init(number || 0, base || 10, endian || "be");
      }
    }
    if (typeof module2 === "object") {
      module2.exports = BN;
    } else {
      exports2.BN = BN;
    }
    BN.BN = BN;
    BN.wordSize = 26;
    var Buffer;
    try {
      if (typeof window !== "undefined" && typeof window.Buffer !== "undefined") {
        Buffer = window.Buffer;
      } else {
        Buffer = (init_buffer(), __toCommonJS(exports_buffer)).Buffer;
      }
    } catch (e) {
    }
    BN.isBN = function isBN(num) {
      if (num instanceof BN) {
        return true;
      }
      return num !== null && typeof num === "object" && num.constructor.wordSize === BN.wordSize && Array.isArray(num.words);
    };
    BN.max = function max(left, right) {
      if (left.cmp(right) > 0)
        return left;
      return right;
    };
    BN.min = function min(left, right) {
      if (left.cmp(right) < 0)
        return left;
      return right;
    };
    BN.prototype._init = function init(number, base, endian) {
      if (typeof number === "number") {
        return this._initNumber(number, base, endian);
      }
      if (typeof number === "object") {
        return this._initArray(number, base, endian);
      }
      if (base === "hex") {
        base = 16;
      }
      assert(base === (base | 0) && base >= 2 && base <= 36);
      number = number.toString().replace(/\s+/g, "");
      var start = 0;
      if (number[0] === "-") {
        start++;
        this.negative = 1;
      }
      if (start < number.length) {
        if (base === 16) {
          this._parseHex(number, start, endian);
        } else {
          this._parseBase(number, base, start);
          if (endian === "le") {
            this._initArray(this.toArray(), base, endian);
          }
        }
      }
    };
    BN.prototype._initNumber = function _initNumber(number, base, endian) {
      if (number < 0) {
        this.negative = 1;
        number = -number;
      }
      if (number < 67108864) {
        this.words = [number & 67108863];
        this.length = 1;
      } else if (number < 4503599627370496) {
        this.words = [
          number & 67108863,
          number / 67108864 & 67108863
        ];
        this.length = 2;
      } else {
        assert(number < 9007199254740992);
        this.words = [
          number & 67108863,
          number / 67108864 & 67108863,
          1
        ];
        this.length = 3;
      }
      if (endian !== "le")
        return;
      this._initArray(this.toArray(), base, endian);
    };
    BN.prototype._initArray = function _initArray(number, base, endian) {
      assert(typeof number.length === "number");
      if (number.length <= 0) {
        this.words = [0];
        this.length = 1;
        return this;
      }
      this.length = Math.ceil(number.length / 3);
      this.words = new Array(this.length);
      for (var i = 0;i < this.length; i++) {
        this.words[i] = 0;
      }
      var j, w;
      var off = 0;
      if (endian === "be") {
        for (i = number.length - 1, j = 0;i >= 0; i -= 3) {
          w = number[i] | number[i - 1] << 8 | number[i - 2] << 16;
          this.words[j] |= w << off & 67108863;
          this.words[j + 1] = w >>> 26 - off & 67108863;
          off += 24;
          if (off >= 26) {
            off -= 26;
            j++;
          }
        }
      } else if (endian === "le") {
        for (i = 0, j = 0;i < number.length; i += 3) {
          w = number[i] | number[i + 1] << 8 | number[i + 2] << 16;
          this.words[j] |= w << off & 67108863;
          this.words[j + 1] = w >>> 26 - off & 67108863;
          off += 24;
          if (off >= 26) {
            off -= 26;
            j++;
          }
        }
      }
      return this._strip();
    };
    function parseHex4Bits(string, index) {
      var c = string.charCodeAt(index);
      if (c >= 48 && c <= 57) {
        return c - 48;
      } else if (c >= 65 && c <= 70) {
        return c - 55;
      } else if (c >= 97 && c <= 102) {
        return c - 87;
      } else {
        assert(false, "Invalid character in " + string);
      }
    }
    function parseHexByte(string, lowerBound, index) {
      var r = parseHex4Bits(string, index);
      if (index - 1 >= lowerBound) {
        r |= parseHex4Bits(string, index - 1) << 4;
      }
      return r;
    }
    BN.prototype._parseHex = function _parseHex(number, start, endian) {
      this.length = Math.ceil((number.length - start) / 6);
      this.words = new Array(this.length);
      for (var i = 0;i < this.length; i++) {
        this.words[i] = 0;
      }
      var off = 0;
      var j = 0;
      var w;
      if (endian === "be") {
        for (i = number.length - 1;i >= start; i -= 2) {
          w = parseHexByte(number, start, i) << off;
          this.words[j] |= w & 67108863;
          if (off >= 18) {
            off -= 18;
            j += 1;
            this.words[j] |= w >>> 26;
          } else {
            off += 8;
          }
        }
      } else {
        var parseLength = number.length - start;
        for (i = parseLength % 2 === 0 ? start + 1 : start;i < number.length; i += 2) {
          w = parseHexByte(number, start, i) << off;
          this.words[j] |= w & 67108863;
          if (off >= 18) {
            off -= 18;
            j += 1;
            this.words[j] |= w >>> 26;
          } else {
            off += 8;
          }
        }
      }
      this._strip();
    };
    function parseBase(str, start, end, mul) {
      var r = 0;
      var b2 = 0;
      var len = Math.min(str.length, end);
      for (var i = start;i < len; i++) {
        var c = str.charCodeAt(i) - 48;
        r *= mul;
        if (c >= 49) {
          b2 = c - 49 + 10;
        } else if (c >= 17) {
          b2 = c - 17 + 10;
        } else {
          b2 = c;
        }
        assert(c >= 0 && b2 < mul, "Invalid character");
        r += b2;
      }
      return r;
    }
    BN.prototype._parseBase = function _parseBase(number, base, start) {
      this.words = [0];
      this.length = 1;
      for (var limbLen = 0, limbPow = 1;limbPow <= 67108863; limbPow *= base) {
        limbLen++;
      }
      limbLen--;
      limbPow = limbPow / base | 0;
      var total = number.length - start;
      var mod = total % limbLen;
      var end = Math.min(total, total - mod) + start;
      var word = 0;
      for (var i = start;i < end; i += limbLen) {
        word = parseBase(number, i, i + limbLen, base);
        this.imuln(limbPow);
        if (this.words[0] + word < 67108864) {
          this.words[0] += word;
        } else {
          this._iaddn(word);
        }
      }
      if (mod !== 0) {
        var pow = 1;
        word = parseBase(number, i, number.length, base);
        for (i = 0;i < mod; i++) {
          pow *= base;
        }
        this.imuln(pow);
        if (this.words[0] + word < 67108864) {
          this.words[0] += word;
        } else {
          this._iaddn(word);
        }
      }
      this._strip();
    };
    BN.prototype.copy = function copy(dest) {
      dest.words = new Array(this.length);
      for (var i = 0;i < this.length; i++) {
        dest.words[i] = this.words[i];
      }
      dest.length = this.length;
      dest.negative = this.negative;
      dest.red = this.red;
    };
    function move(dest, src) {
      dest.words = src.words;
      dest.length = src.length;
      dest.negative = src.negative;
      dest.red = src.red;
    }
    BN.prototype._move = function _move(dest) {
      move(dest, this);
    };
    BN.prototype.clone = function clone() {
      var r = new BN(null);
      this.copy(r);
      return r;
    };
    BN.prototype._expand = function _expand(size) {
      while (this.length < size) {
        this.words[this.length++] = 0;
      }
      return this;
    };
    BN.prototype._strip = function strip() {
      while (this.length > 1 && this.words[this.length - 1] === 0) {
        this.length--;
      }
      return this._normSign();
    };
    BN.prototype._normSign = function _normSign() {
      if (this.length === 1 && this.words[0] === 0) {
        this.negative = 0;
      }
      return this;
    };
    if (typeof Symbol !== "undefined" && typeof Symbol.for === "function") {
      try {
        BN.prototype[Symbol.for("nodejs.util.inspect.custom")] = inspect;
      } catch (e) {
        BN.prototype.inspect = inspect;
      }
    } else {
      BN.prototype.inspect = inspect;
    }
    function inspect() {
      return (this.red ? "<BN-R: " : "<BN: ") + this.toString(16) + ">";
    }
    var zeros = [
      "",
      "0",
      "00",
      "000",
      "0000",
      "00000",
      "000000",
      "0000000",
      "00000000",
      "000000000",
      "0000000000",
      "00000000000",
      "000000000000",
      "0000000000000",
      "00000000000000",
      "000000000000000",
      "0000000000000000",
      "00000000000000000",
      "000000000000000000",
      "0000000000000000000",
      "00000000000000000000",
      "000000000000000000000",
      "0000000000000000000000",
      "00000000000000000000000",
      "000000000000000000000000",
      "0000000000000000000000000"
    ];
    var groupSizes = [
      0,
      0,
      25,
      16,
      12,
      11,
      10,
      9,
      8,
      8,
      7,
      7,
      7,
      7,
      6,
      6,
      6,
      6,
      6,
      6,
      6,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5
    ];
    var groupBases = [
      0,
      0,
      33554432,
      43046721,
      16777216,
      48828125,
      60466176,
      40353607,
      16777216,
      43046721,
      1e7,
      19487171,
      35831808,
      62748517,
      7529536,
      11390625,
      16777216,
      24137569,
      34012224,
      47045881,
      64000000,
      4084101,
      5153632,
      6436343,
      7962624,
      9765625,
      11881376,
      14348907,
      17210368,
      20511149,
      24300000,
      28629151,
      33554432,
      39135393,
      45435424,
      52521875,
      60466176
    ];
    BN.prototype.toString = function toString(base, padding) {
      base = base || 10;
      padding = padding | 0 || 1;
      var out;
      if (base === 16 || base === "hex") {
        out = "";
        var off = 0;
        var carry = 0;
        for (var i = 0;i < this.length; i++) {
          var w = this.words[i];
          var word = ((w << off | carry) & 16777215).toString(16);
          carry = w >>> 24 - off & 16777215;
          off += 2;
          if (off >= 26) {
            off -= 26;
            i--;
          }
          if (carry !== 0 || i !== this.length - 1) {
            out = zeros[6 - word.length] + word + out;
          } else {
            out = word + out;
          }
        }
        if (carry !== 0) {
          out = carry.toString(16) + out;
        }
        while (out.length % padding !== 0) {
          out = "0" + out;
        }
        if (this.negative !== 0) {
          out = "-" + out;
        }
        return out;
      }
      if (base === (base | 0) && base >= 2 && base <= 36) {
        var groupSize = groupSizes[base];
        var groupBase = groupBases[base];
        out = "";
        var c = this.clone();
        c.negative = 0;
        while (!c.isZero()) {
          var r = c.modrn(groupBase).toString(base);
          c = c.idivn(groupBase);
          if (!c.isZero()) {
            out = zeros[groupSize - r.length] + r + out;
          } else {
            out = r + out;
          }
        }
        if (this.isZero()) {
          out = "0" + out;
        }
        while (out.length % padding !== 0) {
          out = "0" + out;
        }
        if (this.negative !== 0) {
          out = "-" + out;
        }
        return out;
      }
      assert(false, "Base should be between 2 and 36");
    };
    BN.prototype.toNumber = function toNumber() {
      var ret = this.words[0];
      if (this.length === 2) {
        ret += this.words[1] * 67108864;
      } else if (this.length === 3 && this.words[2] === 1) {
        ret += 4503599627370496 + this.words[1] * 67108864;
      } else if (this.length > 2) {
        assert(false, "Number can only safely store up to 53 bits");
      }
      return this.negative !== 0 ? -ret : ret;
    };
    BN.prototype.toJSON = function toJSON() {
      return this.toString(16, 2);
    };
    if (Buffer) {
      BN.prototype.toBuffer = function toBuffer(endian, length) {
        return this.toArrayLike(Buffer, endian, length);
      };
    }
    BN.prototype.toArray = function toArray(endian, length) {
      return this.toArrayLike(Array, endian, length);
    };
    var allocate = function allocate(ArrayType, size) {
      if (ArrayType.allocUnsafe) {
        return ArrayType.allocUnsafe(size);
      }
      return new ArrayType(size);
    };
    BN.prototype.toArrayLike = function toArrayLike(ArrayType, endian, length) {
      this._strip();
      var byteLength = this.byteLength();
      var reqLength = length || Math.max(1, byteLength);
      assert(byteLength <= reqLength, "byte array longer than desired length");
      assert(reqLength > 0, "Requested array length <= 0");
      var res = allocate(ArrayType, reqLength);
      var postfix = endian === "le" ? "LE" : "BE";
      this["_toArrayLike" + postfix](res, byteLength);
      return res;
    };
    BN.prototype._toArrayLikeLE = function _toArrayLikeLE(res, byteLength) {
      var position = 0;
      var carry = 0;
      for (var i = 0, shift = 0;i < this.length; i++) {
        var word = this.words[i] << shift | carry;
        res[position++] = word & 255;
        if (position < res.length) {
          res[position++] = word >> 8 & 255;
        }
        if (position < res.length) {
          res[position++] = word >> 16 & 255;
        }
        if (shift === 6) {
          if (position < res.length) {
            res[position++] = word >> 24 & 255;
          }
          carry = 0;
          shift = 0;
        } else {
          carry = word >>> 24;
          shift += 2;
        }
      }
      if (position < res.length) {
        res[position++] = carry;
        while (position < res.length) {
          res[position++] = 0;
        }
      }
    };
    BN.prototype._toArrayLikeBE = function _toArrayLikeBE(res, byteLength) {
      var position = res.length - 1;
      var carry = 0;
      for (var i = 0, shift = 0;i < this.length; i++) {
        var word = this.words[i] << shift | carry;
        res[position--] = word & 255;
        if (position >= 0) {
          res[position--] = word >> 8 & 255;
        }
        if (position >= 0) {
          res[position--] = word >> 16 & 255;
        }
        if (shift === 6) {
          if (position >= 0) {
            res[position--] = word >> 24 & 255;
          }
          carry = 0;
          shift = 0;
        } else {
          carry = word >>> 24;
          shift += 2;
        }
      }
      if (position >= 0) {
        res[position--] = carry;
        while (position >= 0) {
          res[position--] = 0;
        }
      }
    };
    if (Math.clz32) {
      BN.prototype._countBits = function _countBits(w) {
        return 32 - Math.clz32(w);
      };
    } else {
      BN.prototype._countBits = function _countBits(w) {
        var t = w;
        var r = 0;
        if (t >= 4096) {
          r += 13;
          t >>>= 13;
        }
        if (t >= 64) {
          r += 7;
          t >>>= 7;
        }
        if (t >= 8) {
          r += 4;
          t >>>= 4;
        }
        if (t >= 2) {
          r += 2;
          t >>>= 2;
        }
        return r + t;
      };
    }
    BN.prototype._zeroBits = function _zeroBits(w) {
      if (w === 0)
        return 26;
      var t = w;
      var r = 0;
      if ((t & 8191) === 0) {
        r += 13;
        t >>>= 13;
      }
      if ((t & 127) === 0) {
        r += 7;
        t >>>= 7;
      }
      if ((t & 15) === 0) {
        r += 4;
        t >>>= 4;
      }
      if ((t & 3) === 0) {
        r += 2;
        t >>>= 2;
      }
      if ((t & 1) === 0) {
        r++;
      }
      return r;
    };
    BN.prototype.bitLength = function bitLength() {
      var w = this.words[this.length - 1];
      var hi = this._countBits(w);
      return (this.length - 1) * 26 + hi;
    };
    function toBitArray(num) {
      var w = new Array(num.bitLength());
      for (var bit = 0;bit < w.length; bit++) {
        var off = bit / 26 | 0;
        var wbit = bit % 26;
        w[bit] = num.words[off] >>> wbit & 1;
      }
      return w;
    }
    BN.prototype.zeroBits = function zeroBits() {
      if (this.isZero())
        return 0;
      var r = 0;
      for (var i = 0;i < this.length; i++) {
        var b2 = this._zeroBits(this.words[i]);
        r += b2;
        if (b2 !== 26)
          break;
      }
      return r;
    };
    BN.prototype.byteLength = function byteLength() {
      return Math.ceil(this.bitLength() / 8);
    };
    BN.prototype.toTwos = function toTwos(width) {
      if (this.negative !== 0) {
        return this.abs().inotn(width).iaddn(1);
      }
      return this.clone();
    };
    BN.prototype.fromTwos = function fromTwos(width) {
      if (this.testn(width - 1)) {
        return this.notn(width).iaddn(1).ineg();
      }
      return this.clone();
    };
    BN.prototype.isNeg = function isNeg() {
      return this.negative !== 0;
    };
    BN.prototype.neg = function neg() {
      return this.clone().ineg();
    };
    BN.prototype.ineg = function ineg() {
      if (!this.isZero()) {
        this.negative ^= 1;
      }
      return this;
    };
    BN.prototype.iuor = function iuor(num) {
      while (this.length < num.length) {
        this.words[this.length++] = 0;
      }
      for (var i = 0;i < num.length; i++) {
        this.words[i] = this.words[i] | num.words[i];
      }
      return this._strip();
    };
    BN.prototype.ior = function ior(num) {
      assert((this.negative | num.negative) === 0);
      return this.iuor(num);
    };
    BN.prototype.or = function or(num) {
      if (this.length > num.length)
        return this.clone().ior(num);
      return num.clone().ior(this);
    };
    BN.prototype.uor = function uor(num) {
      if (this.length > num.length)
        return this.clone().iuor(num);
      return num.clone().iuor(this);
    };
    BN.prototype.iuand = function iuand(num) {
      var b2;
      if (this.length > num.length) {
        b2 = num;
      } else {
        b2 = this;
      }
      for (var i = 0;i < b2.length; i++) {
        this.words[i] = this.words[i] & num.words[i];
      }
      this.length = b2.length;
      return this._strip();
    };
    BN.prototype.iand = function iand(num) {
      assert((this.negative | num.negative) === 0);
      return this.iuand(num);
    };
    BN.prototype.and = function and(num) {
      if (this.length > num.length)
        return this.clone().iand(num);
      return num.clone().iand(this);
    };
    BN.prototype.uand = function uand(num) {
      if (this.length > num.length)
        return this.clone().iuand(num);
      return num.clone().iuand(this);
    };
    BN.prototype.iuxor = function iuxor(num) {
      var a;
      var b2;
      if (this.length > num.length) {
        a = this;
        b2 = num;
      } else {
        a = num;
        b2 = this;
      }
      for (var i = 0;i < b2.length; i++) {
        this.words[i] = a.words[i] ^ b2.words[i];
      }
      if (this !== a) {
        for (;i < a.length; i++) {
          this.words[i] = a.words[i];
        }
      }
      this.length = a.length;
      return this._strip();
    };
    BN.prototype.ixor = function ixor(num) {
      assert((this.negative | num.negative) === 0);
      return this.iuxor(num);
    };
    BN.prototype.xor = function xor(num) {
      if (this.length > num.length)
        return this.clone().ixor(num);
      return num.clone().ixor(this);
    };
    BN.prototype.uxor = function uxor(num) {
      if (this.length > num.length)
        return this.clone().iuxor(num);
      return num.clone().iuxor(this);
    };
    BN.prototype.inotn = function inotn(width) {
      assert(typeof width === "number" && width >= 0);
      var bytesNeeded = Math.ceil(width / 26) | 0;
      var bitsLeft = width % 26;
      this._expand(bytesNeeded);
      if (bitsLeft > 0) {
        bytesNeeded--;
      }
      for (var i = 0;i < bytesNeeded; i++) {
        this.words[i] = ~this.words[i] & 67108863;
      }
      if (bitsLeft > 0) {
        this.words[i] = ~this.words[i] & 67108863 >> 26 - bitsLeft;
      }
      return this._strip();
    };
    BN.prototype.notn = function notn(width) {
      return this.clone().inotn(width);
    };
    BN.prototype.setn = function setn(bit, val) {
      assert(typeof bit === "number" && bit >= 0);
      var off = bit / 26 | 0;
      var wbit = bit % 26;
      this._expand(off + 1);
      if (val) {
        this.words[off] = this.words[off] | 1 << wbit;
      } else {
        this.words[off] = this.words[off] & ~(1 << wbit);
      }
      return this._strip();
    };
    BN.prototype.iadd = function iadd(num) {
      var r;
      if (this.negative !== 0 && num.negative === 0) {
        this.negative = 0;
        r = this.isub(num);
        this.negative ^= 1;
        return this._normSign();
      } else if (this.negative === 0 && num.negative !== 0) {
        num.negative = 0;
        r = this.isub(num);
        num.negative = 1;
        return r._normSign();
      }
      var a, b2;
      if (this.length > num.length) {
        a = this;
        b2 = num;
      } else {
        a = num;
        b2 = this;
      }
      var carry = 0;
      for (var i = 0;i < b2.length; i++) {
        r = (a.words[i] | 0) + (b2.words[i] | 0) + carry;
        this.words[i] = r & 67108863;
        carry = r >>> 26;
      }
      for (;carry !== 0 && i < a.length; i++) {
        r = (a.words[i] | 0) + carry;
        this.words[i] = r & 67108863;
        carry = r >>> 26;
      }
      this.length = a.length;
      if (carry !== 0) {
        this.words[this.length] = carry;
        this.length++;
      } else if (a !== this) {
        for (;i < a.length; i++) {
          this.words[i] = a.words[i];
        }
      }
      return this;
    };
    BN.prototype.add = function add(num) {
      var res;
      if (num.negative !== 0 && this.negative === 0) {
        num.negative = 0;
        res = this.sub(num);
        num.negative ^= 1;
        return res;
      } else if (num.negative === 0 && this.negative !== 0) {
        this.negative = 0;
        res = num.sub(this);
        this.negative = 1;
        return res;
      }
      if (this.length > num.length)
        return this.clone().iadd(num);
      return num.clone().iadd(this);
    };
    BN.prototype.isub = function isub(num) {
      if (num.negative !== 0) {
        num.negative = 0;
        var r = this.iadd(num);
        num.negative = 1;
        return r._normSign();
      } else if (this.negative !== 0) {
        this.negative = 0;
        this.iadd(num);
        this.negative = 1;
        return this._normSign();
      }
      var cmp = this.cmp(num);
      if (cmp === 0) {
        this.negative = 0;
        this.length = 1;
        this.words[0] = 0;
        return this;
      }
      var a, b2;
      if (cmp > 0) {
        a = this;
        b2 = num;
      } else {
        a = num;
        b2 = this;
      }
      var carry = 0;
      for (var i = 0;i < b2.length; i++) {
        r = (a.words[i] | 0) - (b2.words[i] | 0) + carry;
        carry = r >> 26;
        this.words[i] = r & 67108863;
      }
      for (;carry !== 0 && i < a.length; i++) {
        r = (a.words[i] | 0) + carry;
        carry = r >> 26;
        this.words[i] = r & 67108863;
      }
      if (carry === 0 && i < a.length && a !== this) {
        for (;i < a.length; i++) {
          this.words[i] = a.words[i];
        }
      }
      this.length = Math.max(this.length, i);
      if (a !== this) {
        this.negative = 1;
      }
      return this._strip();
    };
    BN.prototype.sub = function sub(num) {
      return this.clone().isub(num);
    };
    function smallMulTo(self2, num, out) {
      out.negative = num.negative ^ self2.negative;
      var len = self2.length + num.length | 0;
      out.length = len;
      len = len - 1 | 0;
      var a = self2.words[0] | 0;
      var b2 = num.words[0] | 0;
      var r = a * b2;
      var lo = r & 67108863;
      var carry = r / 67108864 | 0;
      out.words[0] = lo;
      for (var k = 1;k < len; k++) {
        var ncarry = carry >>> 26;
        var rword = carry & 67108863;
        var maxJ = Math.min(k, num.length - 1);
        for (var j = Math.max(0, k - self2.length + 1);j <= maxJ; j++) {
          var i = k - j | 0;
          a = self2.words[i] | 0;
          b2 = num.words[j] | 0;
          r = a * b2 + rword;
          ncarry += r / 67108864 | 0;
          rword = r & 67108863;
        }
        out.words[k] = rword | 0;
        carry = ncarry | 0;
      }
      if (carry !== 0) {
        out.words[k] = carry | 0;
      } else {
        out.length--;
      }
      return out._strip();
    }
    var comb10MulTo = function comb10MulTo(self2, num, out) {
      var a = self2.words;
      var b2 = num.words;
      var o = out.words;
      var c = 0;
      var lo;
      var mid;
      var hi;
      var a0 = a[0] | 0;
      var al0 = a0 & 8191;
      var ah0 = a0 >>> 13;
      var a1 = a[1] | 0;
      var al1 = a1 & 8191;
      var ah1 = a1 >>> 13;
      var a2 = a[2] | 0;
      var al2 = a2 & 8191;
      var ah2 = a2 >>> 13;
      var a3 = a[3] | 0;
      var al3 = a3 & 8191;
      var ah3 = a3 >>> 13;
      var a4 = a[4] | 0;
      var al4 = a4 & 8191;
      var ah4 = a4 >>> 13;
      var a5 = a[5] | 0;
      var al5 = a5 & 8191;
      var ah5 = a5 >>> 13;
      var a6 = a[6] | 0;
      var al6 = a6 & 8191;
      var ah6 = a6 >>> 13;
      var a7 = a[7] | 0;
      var al7 = a7 & 8191;
      var ah7 = a7 >>> 13;
      var a8 = a[8] | 0;
      var al8 = a8 & 8191;
      var ah8 = a8 >>> 13;
      var a9 = a[9] | 0;
      var al9 = a9 & 8191;
      var ah9 = a9 >>> 13;
      var b0 = b2[0] | 0;
      var bl0 = b0 & 8191;
      var bh0 = b0 >>> 13;
      var b1 = b2[1] | 0;
      var bl1 = b1 & 8191;
      var bh1 = b1 >>> 13;
      var b22 = b2[2] | 0;
      var bl2 = b22 & 8191;
      var bh2 = b22 >>> 13;
      var b3 = b2[3] | 0;
      var bl3 = b3 & 8191;
      var bh3 = b3 >>> 13;
      var b4 = b2[4] | 0;
      var bl4 = b4 & 8191;
      var bh4 = b4 >>> 13;
      var b5 = b2[5] | 0;
      var bl5 = b5 & 8191;
      var bh5 = b5 >>> 13;
      var b6 = b2[6] | 0;
      var bl6 = b6 & 8191;
      var bh6 = b6 >>> 13;
      var b7 = b2[7] | 0;
      var bl7 = b7 & 8191;
      var bh7 = b7 >>> 13;
      var b8 = b2[8] | 0;
      var bl8 = b8 & 8191;
      var bh8 = b8 >>> 13;
      var b9 = b2[9] | 0;
      var bl9 = b9 & 8191;
      var bh9 = b9 >>> 13;
      out.negative = self2.negative ^ num.negative;
      out.length = 19;
      lo = Math.imul(al0, bl0);
      mid = Math.imul(al0, bh0);
      mid = mid + Math.imul(ah0, bl0) | 0;
      hi = Math.imul(ah0, bh0);
      var w0 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
      c = (hi + (mid >>> 13) | 0) + (w0 >>> 26) | 0;
      w0 &= 67108863;
      lo = Math.imul(al1, bl0);
      mid = Math.imul(al1, bh0);
      mid = mid + Math.imul(ah1, bl0) | 0;
      hi = Math.imul(ah1, bh0);
      lo = lo + Math.imul(al0, bl1) | 0;
      mid = mid + Math.imul(al0, bh1) | 0;
      mid = mid + Math.imul(ah0, bl1) | 0;
      hi = hi + Math.imul(ah0, bh1) | 0;
      var w1 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
      c = (hi + (mid >>> 13) | 0) + (w1 >>> 26) | 0;
      w1 &= 67108863;
      lo = Math.imul(al2, bl0);
      mid = Math.imul(al2, bh0);
      mid = mid + Math.imul(ah2, bl0) | 0;
      hi = Math.imul(ah2, bh0);
      lo = lo + Math.imul(al1, bl1) | 0;
      mid = mid + Math.imul(al1, bh1) | 0;
      mid = mid + Math.imul(ah1, bl1) | 0;
      hi = hi + Math.imul(ah1, bh1) | 0;
      lo = lo + Math.imul(al0, bl2) | 0;
      mid = mid + Math.imul(al0, bh2) | 0;
      mid = mid + Math.imul(ah0, bl2) | 0;
      hi = hi + Math.imul(ah0, bh2) | 0;
      var w2 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
      c = (hi + (mid >>> 13) | 0) + (w2 >>> 26) | 0;
      w2 &= 67108863;
      lo = Math.imul(al3, bl0);
      mid = Math.imul(al3, bh0);
      mid = mid + Math.imul(ah3, bl0) | 0;
      hi = Math.imul(ah3, bh0);
      lo = lo + Math.imul(al2, bl1) | 0;
      mid = mid + Math.imul(al2, bh1) | 0;
      mid = mid + Math.imul(ah2, bl1) | 0;
      hi = hi + Math.imul(ah2, bh1) | 0;
      lo = lo + Math.imul(al1, bl2) | 0;
      mid = mid + Math.imul(al1, bh2) | 0;
      mid = mid + Math.imul(ah1, bl2) | 0;
      hi = hi + Math.imul(ah1, bh2) | 0;
      lo = lo + Math.imul(al0, bl3) | 0;
      mid = mid + Math.imul(al0, bh3) | 0;
      mid = mid + Math.imul(ah0, bl3) | 0;
      hi = hi + Math.imul(ah0, bh3) | 0;
      var w3 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
      c = (hi + (mid >>> 13) | 0) + (w3 >>> 26) | 0;
      w3 &= 67108863;
      lo = Math.imul(al4, bl0);
      mid = Math.imul(al4, bh0);
      mid = mid + Math.imul(ah4, bl0) | 0;
      hi = Math.imul(ah4, bh0);
      lo = lo + Math.imul(al3, bl1) | 0;
      mid = mid + Math.imul(al3, bh1) | 0;
      mid = mid + Math.imul(ah3, bl1) | 0;
      hi = hi + Math.imul(ah3, bh1) | 0;
      lo = lo + Math.imul(al2, bl2) | 0;
      mid = mid + Math.imul(al2, bh2) | 0;
      mid = mid + Math.imul(ah2, bl2) | 0;
      hi = hi + Math.imul(ah2, bh2) | 0;
      lo = lo + Math.imul(al1, bl3) | 0;
      mid = mid + Math.imul(al1, bh3) | 0;
      mid = mid + Math.imul(ah1, bl3) | 0;
      hi = hi + Math.imul(ah1, bh3) | 0;
      lo = lo + Math.imul(al0, bl4) | 0;
      mid = mid + Math.imul(al0, bh4) | 0;
      mid = mid + Math.imul(ah0, bl4) | 0;
      hi = hi + Math.imul(ah0, bh4) | 0;
      var w4 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
      c = (hi + (mid >>> 13) | 0) + (w4 >>> 26) | 0;
      w4 &= 67108863;
      lo = Math.imul(al5, bl0);
      mid = Math.imul(al5, bh0);
      mid = mid + Math.imul(ah5, bl0) | 0;
      hi = Math.imul(ah5, bh0);
      lo = lo + Math.imul(al4, bl1) | 0;
      mid = mid + Math.imul(al4, bh1) | 0;
      mid = mid + Math.imul(ah4, bl1) | 0;
      hi = hi + Math.imul(ah4, bh1) | 0;
      lo = lo + Math.imul(al3, bl2) | 0;
      mid = mid + Math.imul(al3, bh2) | 0;
      mid = mid + Math.imul(ah3, bl2) | 0;
      hi = hi + Math.imul(ah3, bh2) | 0;
      lo = lo + Math.imul(al2, bl3) | 0;
      mid = mid + Math.imul(al2, bh3) | 0;
      mid = mid + Math.imul(ah2, bl3) | 0;
      hi = hi + Math.imul(ah2, bh3) | 0;
      lo = lo + Math.imul(al1, bl4) | 0;
      mid = mid + Math.imul(al1, bh4) | 0;
      mid = mid + Math.imul(ah1, bl4) | 0;
      hi = hi + Math.imul(ah1, bh4) | 0;
      lo = lo + Math.imul(al0, bl5) | 0;
      mid = mid + Math.imul(al0, bh5) | 0;
      mid = mid + Math.imul(ah0, bl5) | 0;
      hi = hi + Math.imul(ah0, bh5) | 0;
      var w5 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
      c = (hi + (mid >>> 13) | 0) + (w5 >>> 26) | 0;
      w5 &= 67108863;
      lo = Math.imul(al6, bl0);
      mid = Math.imul(al6, bh0);
      mid = mid + Math.imul(ah6, bl0) | 0;
      hi = Math.imul(ah6, bh0);
      lo = lo + Math.imul(al5, bl1) | 0;
      mid = mid + Math.imul(al5, bh1) | 0;
      mid = mid + Math.imul(ah5, bl1) | 0;
      hi = hi + Math.imul(ah5, bh1) | 0;
      lo = lo + Math.imul(al4, bl2) | 0;
      mid = mid + Math.imul(al4, bh2) | 0;
      mid = mid + Math.imul(ah4, bl2) | 0;
      hi = hi + Math.imul(ah4, bh2) | 0;
      lo = lo + Math.imul(al3, bl3) | 0;
      mid = mid + Math.imul(al3, bh3) | 0;
      mid = mid + Math.imul(ah3, bl3) | 0;
      hi = hi + Math.imul(ah3, bh3) | 0;
      lo = lo + Math.imul(al2, bl4) | 0;
      mid = mid + Math.imul(al2, bh4) | 0;
      mid = mid + Math.imul(ah2, bl4) | 0;
      hi = hi + Math.imul(ah2, bh4) | 0;
      lo = lo + Math.imul(al1, bl5) | 0;
      mid = mid + Math.imul(al1, bh5) | 0;
      mid = mid + Math.imul(ah1, bl5) | 0;
      hi = hi + Math.imul(ah1, bh5) | 0;
      lo = lo + Math.imul(al0, bl6) | 0;
      mid = mid + Math.imul(al0, bh6) | 0;
      mid = mid + Math.imul(ah0, bl6) | 0;
      hi = hi + Math.imul(ah0, bh6) | 0;
      var w6 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
      c = (hi + (mid >>> 13) | 0) + (w6 >>> 26) | 0;
      w6 &= 67108863;
      lo = Math.imul(al7, bl0);
      mid = Math.imul(al7, bh0);
      mid = mid + Math.imul(ah7, bl0) | 0;
      hi = Math.imul(ah7, bh0);
      lo = lo + Math.imul(al6, bl1) | 0;
      mid = mid + Math.imul(al6, bh1) | 0;
      mid = mid + Math.imul(ah6, bl1) | 0;
      hi = hi + Math.imul(ah6, bh1) | 0;
      lo = lo + Math.imul(al5, bl2) | 0;
      mid = mid + Math.imul(al5, bh2) | 0;
      mid = mid + Math.imul(ah5, bl2) | 0;
      hi = hi + Math.imul(ah5, bh2) | 0;
      lo = lo + Math.imul(al4, bl3) | 0;
      mid = mid + Math.imul(al4, bh3) | 0;
      mid = mid + Math.imul(ah4, bl3) | 0;
      hi = hi + Math.imul(ah4, bh3) | 0;
      lo = lo + Math.imul(al3, bl4) | 0;
      mid = mid + Math.imul(al3, bh4) | 0;
      mid = mid + Math.imul(ah3, bl4) | 0;
      hi = hi + Math.imul(ah3, bh4) | 0;
      lo = lo + Math.imul(al2, bl5) | 0;
      mid = mid + Math.imul(al2, bh5) | 0;
      mid = mid + Math.imul(ah2, bl5) | 0;
      hi = hi + Math.imul(ah2, bh5) | 0;
      lo = lo + Math.imul(al1, bl6) | 0;
      mid = mid + Math.imul(al1, bh6) | 0;
      mid = mid + Math.imul(ah1, bl6) | 0;
      hi = hi + Math.imul(ah1, bh6) | 0;
      lo = lo + Math.imul(al0, bl7) | 0;
      mid = mid + Math.imul(al0, bh7) | 0;
      mid = mid + Math.imul(ah0, bl7) | 0;
      hi = hi + Math.imul(ah0, bh7) | 0;
      var w7 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
      c = (hi + (mid >>> 13) | 0) + (w7 >>> 26) | 0;
      w7 &= 67108863;
      lo = Math.imul(al8, bl0);
      mid = Math.imul(al8, bh0);
      mid = mid + Math.imul(ah8, bl0) | 0;
      hi = Math.imul(ah8, bh0);
      lo = lo + Math.imul(al7, bl1) | 0;
      mid = mid + Math.imul(al7, bh1) | 0;
      mid = mid + Math.imul(ah7, bl1) | 0;
      hi = hi + Math.imul(ah7, bh1) | 0;
      lo = lo + Math.imul(al6, bl2) | 0;
      mid = mid + Math.imul(al6, bh2) | 0;
      mid = mid + Math.imul(ah6, bl2) | 0;
      hi = hi + Math.imul(ah6, bh2) | 0;
      lo = lo + Math.imul(al5, bl3) | 0;
      mid = mid + Math.imul(al5, bh3) | 0;
      mid = mid + Math.imul(ah5, bl3) | 0;
      hi = hi + Math.imul(ah5, bh3) | 0;
      lo = lo + Math.imul(al4, bl4) | 0;
      mid = mid + Math.imul(al4, bh4) | 0;
      mid = mid + Math.imul(ah4, bl4) | 0;
      hi = hi + Math.imul(ah4, bh4) | 0;
      lo = lo + Math.imul(al3, bl5) | 0;
      mid = mid + Math.imul(al3, bh5) | 0;
      mid = mid + Math.imul(ah3, bl5) | 0;
      hi = hi + Math.imul(ah3, bh5) | 0;
      lo = lo + Math.imul(al2, bl6) | 0;
      mid = mid + Math.imul(al2, bh6) | 0;
      mid = mid + Math.imul(ah2, bl6) | 0;
      hi = hi + Math.imul(ah2, bh6) | 0;
      lo = lo + Math.imul(al1, bl7) | 0;
      mid = mid + Math.imul(al1, bh7) | 0;
      mid = mid + Math.imul(ah1, bl7) | 0;
      hi = hi + Math.imul(ah1, bh7) | 0;
      lo = lo + Math.imul(al0, bl8) | 0;
      mid = mid + Math.imul(al0, bh8) | 0;
      mid = mid + Math.imul(ah0, bl8) | 0;
      hi = hi + Math.imul(ah0, bh8) | 0;
      var w8 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
      c = (hi + (mid >>> 13) | 0) + (w8 >>> 26) | 0;
      w8 &= 67108863;
      lo = Math.imul(al9, bl0);
      mid = Math.imul(al9, bh0);
      mid = mid + Math.imul(ah9, bl0) | 0;
      hi = Math.imul(ah9, bh0);
      lo = lo + Math.imul(al8, bl1) | 0;
      mid = mid + Math.imul(al8, bh1) | 0;
      mid = mid + Math.imul(ah8, bl1) | 0;
      hi = hi + Math.imul(ah8, bh1) | 0;
      lo = lo + Math.imul(al7, bl2) | 0;
      mid = mid + Math.imul(al7, bh2) | 0;
      mid = mid + Math.imul(ah7, bl2) | 0;
      hi = hi + Math.imul(ah7, bh2) | 0;
      lo = lo + Math.imul(al6, bl3) | 0;
      mid = mid + Math.imul(al6, bh3) | 0;
      mid = mid + Math.imul(ah6, bl3) | 0;
      hi = hi + Math.imul(ah6, bh3) | 0;
      lo = lo + Math.imul(al5, bl4) | 0;
      mid = mid + Math.imul(al5, bh4) | 0;
      mid = mid + Math.imul(ah5, bl4) | 0;
      hi = hi + Math.imul(ah5, bh4) | 0;
      lo = lo + Math.imul(al4, bl5) | 0;
      mid = mid + Math.imul(al4, bh5) | 0;
      mid = mid + Math.imul(ah4, bl5) | 0;
      hi = hi + Math.imul(ah4, bh5) | 0;
      lo = lo + Math.imul(al3, bl6) | 0;
      mid = mid + Math.imul(al3, bh6) | 0;
      mid = mid + Math.imul(ah3, bl6) | 0;
      hi = hi + Math.imul(ah3, bh6) | 0;
      lo = lo + Math.imul(al2, bl7) | 0;
      mid = mid + Math.imul(al2, bh7) | 0;
      mid = mid + Math.imul(ah2, bl7) | 0;
      hi = hi + Math.imul(ah2, bh7) | 0;
      lo = lo + Math.imul(al1, bl8) | 0;
      mid = mid + Math.imul(al1, bh8) | 0;
      mid = mid + Math.imul(ah1, bl8) | 0;
      hi = hi + Math.imul(ah1, bh8) | 0;
      lo = lo + Math.imul(al0, bl9) | 0;
      mid = mid + Math.imul(al0, bh9) | 0;
      mid = mid + Math.imul(ah0, bl9) | 0;
      hi = hi + Math.imul(ah0, bh9) | 0;
      var w9 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
      c = (hi + (mid >>> 13) | 0) + (w9 >>> 26) | 0;
      w9 &= 67108863;
      lo = Math.imul(al9, bl1);
      mid = Math.imul(al9, bh1);
      mid = mid + Math.imul(ah9, bl1) | 0;
      hi = Math.imul(ah9, bh1);
      lo = lo + Math.imul(al8, bl2) | 0;
      mid = mid + Math.imul(al8, bh2) | 0;
      mid = mid + Math.imul(ah8, bl2) | 0;
      hi = hi + Math.imul(ah8, bh2) | 0;
      lo = lo + Math.imul(al7, bl3) | 0;
      mid = mid + Math.imul(al7, bh3) | 0;
      mid = mid + Math.imul(ah7, bl3) | 0;
      hi = hi + Math.imul(ah7, bh3) | 0;
      lo = lo + Math.imul(al6, bl4) | 0;
      mid = mid + Math.imul(al6, bh4) | 0;
      mid = mid + Math.imul(ah6, bl4) | 0;
      hi = hi + Math.imul(ah6, bh4) | 0;
      lo = lo + Math.imul(al5, bl5) | 0;
      mid = mid + Math.imul(al5, bh5) | 0;
      mid = mid + Math.imul(ah5, bl5) | 0;
      hi = hi + Math.imul(ah5, bh5) | 0;
      lo = lo + Math.imul(al4, bl6) | 0;
      mid = mid + Math.imul(al4, bh6) | 0;
      mid = mid + Math.imul(ah4, bl6) | 0;
      hi = hi + Math.imul(ah4, bh6) | 0;
      lo = lo + Math.imul(al3, bl7) | 0;
      mid = mid + Math.imul(al3, bh7) | 0;
      mid = mid + Math.imul(ah3, bl7) | 0;
      hi = hi + Math.imul(ah3, bh7) | 0;
      lo = lo + Math.imul(al2, bl8) | 0;
      mid = mid + Math.imul(al2, bh8) | 0;
      mid = mid + Math.imul(ah2, bl8) | 0;
      hi = hi + Math.imul(ah2, bh8) | 0;
      lo = lo + Math.imul(al1, bl9) | 0;
      mid = mid + Math.imul(al1, bh9) | 0;
      mid = mid + Math.imul(ah1, bl9) | 0;
      hi = hi + Math.imul(ah1, bh9) | 0;
      var w10 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
      c = (hi + (mid >>> 13) | 0) + (w10 >>> 26) | 0;
      w10 &= 67108863;
      lo = Math.imul(al9, bl2);
      mid = Math.imul(al9, bh2);
      mid = mid + Math.imul(ah9, bl2) | 0;
      hi = Math.imul(ah9, bh2);
      lo = lo + Math.imul(al8, bl3) | 0;
      mid = mid + Math.imul(al8, bh3) | 0;
      mid = mid + Math.imul(ah8, bl3) | 0;
      hi = hi + Math.imul(ah8, bh3) | 0;
      lo = lo + Math.imul(al7, bl4) | 0;
      mid = mid + Math.imul(al7, bh4) | 0;
      mid = mid + Math.imul(ah7, bl4) | 0;
      hi = hi + Math.imul(ah7, bh4) | 0;
      lo = lo + Math.imul(al6, bl5) | 0;
      mid = mid + Math.imul(al6, bh5) | 0;
      mid = mid + Math.imul(ah6, bl5) | 0;
      hi = hi + Math.imul(ah6, bh5) | 0;
      lo = lo + Math.imul(al5, bl6) | 0;
      mid = mid + Math.imul(al5, bh6) | 0;
      mid = mid + Math.imul(ah5, bl6) | 0;
      hi = hi + Math.imul(ah5, bh6) | 0;
      lo = lo + Math.imul(al4, bl7) | 0;
      mid = mid + Math.imul(al4, bh7) | 0;
      mid = mid + Math.imul(ah4, bl7) | 0;
      hi = hi + Math.imul(ah4, bh7) | 0;
      lo = lo + Math.imul(al3, bl8) | 0;
      mid = mid + Math.imul(al3, bh8) | 0;
      mid = mid + Math.imul(ah3, bl8) | 0;
      hi = hi + Math.imul(ah3, bh8) | 0;
      lo = lo + Math.imul(al2, bl9) | 0;
      mid = mid + Math.imul(al2, bh9) | 0;
      mid = mid + Math.imul(ah2, bl9) | 0;
      hi = hi + Math.imul(ah2, bh9) | 0;
      var w11 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
      c = (hi + (mid >>> 13) | 0) + (w11 >>> 26) | 0;
      w11 &= 67108863;
      lo = Math.imul(al9, bl3);
      mid = Math.imul(al9, bh3);
      mid = mid + Math.imul(ah9, bl3) | 0;
      hi = Math.imul(ah9, bh3);
      lo = lo + Math.imul(al8, bl4) | 0;
      mid = mid + Math.imul(al8, bh4) | 0;
      mid = mid + Math.imul(ah8, bl4) | 0;
      hi = hi + Math.imul(ah8, bh4) | 0;
      lo = lo + Math.imul(al7, bl5) | 0;
      mid = mid + Math.imul(al7, bh5) | 0;
      mid = mid + Math.imul(ah7, bl5) | 0;
      hi = hi + Math.imul(ah7, bh5) | 0;
      lo = lo + Math.imul(al6, bl6) | 0;
      mid = mid + Math.imul(al6, bh6) | 0;
      mid = mid + Math.imul(ah6, bl6) | 0;
      hi = hi + Math.imul(ah6, bh6) | 0;
      lo = lo + Math.imul(al5, bl7) | 0;
      mid = mid + Math.imul(al5, bh7) | 0;
      mid = mid + Math.imul(ah5, bl7) | 0;
      hi = hi + Math.imul(ah5, bh7) | 0;
      lo = lo + Math.imul(al4, bl8) | 0;
      mid = mid + Math.imul(al4, bh8) | 0;
      mid = mid + Math.imul(ah4, bl8) | 0;
      hi = hi + Math.imul(ah4, bh8) | 0;
      lo = lo + Math.imul(al3, bl9) | 0;
      mid = mid + Math.imul(al3, bh9) | 0;
      mid = mid + Math.imul(ah3, bl9) | 0;
      hi = hi + Math.imul(ah3, bh9) | 0;
      var w12 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
      c = (hi + (mid >>> 13) | 0) + (w12 >>> 26) | 0;
      w12 &= 67108863;
      lo = Math.imul(al9, bl4);
      mid = Math.imul(al9, bh4);
      mid = mid + Math.imul(ah9, bl4) | 0;
      hi = Math.imul(ah9, bh4);
      lo = lo + Math.imul(al8, bl5) | 0;
      mid = mid + Math.imul(al8, bh5) | 0;
      mid = mid + Math.imul(ah8, bl5) | 0;
      hi = hi + Math.imul(ah8, bh5) | 0;
      lo = lo + Math.imul(al7, bl6) | 0;
      mid = mid + Math.imul(al7, bh6) | 0;
      mid = mid + Math.imul(ah7, bl6) | 0;
      hi = hi + Math.imul(ah7, bh6) | 0;
      lo = lo + Math.imul(al6, bl7) | 0;
      mid = mid + Math.imul(al6, bh7) | 0;
      mid = mid + Math.imul(ah6, bl7) | 0;
      hi = hi + Math.imul(ah6, bh7) | 0;
      lo = lo + Math.imul(al5, bl8) | 0;
      mid = mid + Math.imul(al5, bh8) | 0;
      mid = mid + Math.imul(ah5, bl8) | 0;
      hi = hi + Math.imul(ah5, bh8) | 0;
      lo = lo + Math.imul(al4, bl9) | 0;
      mid = mid + Math.imul(al4, bh9) | 0;
      mid = mid + Math.imul(ah4, bl9) | 0;
      hi = hi + Math.imul(ah4, bh9) | 0;
      var w13 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
      c = (hi + (mid >>> 13) | 0) + (w13 >>> 26) | 0;
      w13 &= 67108863;
      lo = Math.imul(al9, bl5);
      mid = Math.imul(al9, bh5);
      mid = mid + Math.imul(ah9, bl5) | 0;
      hi = Math.imul(ah9, bh5);
      lo = lo + Math.imul(al8, bl6) | 0;
      mid = mid + Math.imul(al8, bh6) | 0;
      mid = mid + Math.imul(ah8, bl6) | 0;
      hi = hi + Math.imul(ah8, bh6) | 0;
      lo = lo + Math.imul(al7, bl7) | 0;
      mid = mid + Math.imul(al7, bh7) | 0;
      mid = mid + Math.imul(ah7, bl7) | 0;
      hi = hi + Math.imul(ah7, bh7) | 0;
      lo = lo + Math.imul(al6, bl8) | 0;
      mid = mid + Math.imul(al6, bh8) | 0;
      mid = mid + Math.imul(ah6, bl8) | 0;
      hi = hi + Math.imul(ah6, bh8) | 0;
      lo = lo + Math.imul(al5, bl9) | 0;
      mid = mid + Math.imul(al5, bh9) | 0;
      mid = mid + Math.imul(ah5, bl9) | 0;
      hi = hi + Math.imul(ah5, bh9) | 0;
      var w14 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
      c = (hi + (mid >>> 13) | 0) + (w14 >>> 26) | 0;
      w14 &= 67108863;
      lo = Math.imul(al9, bl6);
      mid = Math.imul(al9, bh6);
      mid = mid + Math.imul(ah9, bl6) | 0;
      hi = Math.imul(ah9, bh6);
      lo = lo + Math.imul(al8, bl7) | 0;
      mid = mid + Math.imul(al8, bh7) | 0;
      mid = mid + Math.imul(ah8, bl7) | 0;
      hi = hi + Math.imul(ah8, bh7) | 0;
      lo = lo + Math.imul(al7, bl8) | 0;
      mid = mid + Math.imul(al7, bh8) | 0;
      mid = mid + Math.imul(ah7, bl8) | 0;
      hi = hi + Math.imul(ah7, bh8) | 0;
      lo = lo + Math.imul(al6, bl9) | 0;
      mid = mid + Math.imul(al6, bh9) | 0;
      mid = mid + Math.imul(ah6, bl9) | 0;
      hi = hi + Math.imul(ah6, bh9) | 0;
      var w15 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
      c = (hi + (mid >>> 13) | 0) + (w15 >>> 26) | 0;
      w15 &= 67108863;
      lo = Math.imul(al9, bl7);
      mid = Math.imul(al9, bh7);
      mid = mid + Math.imul(ah9, bl7) | 0;
      hi = Math.imul(ah9, bh7);
      lo = lo + Math.imul(al8, bl8) | 0;
      mid = mid + Math.imul(al8, bh8) | 0;
      mid = mid + Math.imul(ah8, bl8) | 0;
      hi = hi + Math.imul(ah8, bh8) | 0;
      lo = lo + Math.imul(al7, bl9) | 0;
      mid = mid + Math.imul(al7, bh9) | 0;
      mid = mid + Math.imul(ah7, bl9) | 0;
      hi = hi + Math.imul(ah7, bh9) | 0;
      var w16 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
      c = (hi + (mid >>> 13) | 0) + (w16 >>> 26) | 0;
      w16 &= 67108863;
      lo = Math.imul(al9, bl8);
      mid = Math.imul(al9, bh8);
      mid = mid + Math.imul(ah9, bl8) | 0;
      hi = Math.imul(ah9, bh8);
      lo = lo + Math.imul(al8, bl9) | 0;
      mid = mid + Math.imul(al8, bh9) | 0;
      mid = mid + Math.imul(ah8, bl9) | 0;
      hi = hi + Math.imul(ah8, bh9) | 0;
      var w17 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
      c = (hi + (mid >>> 13) | 0) + (w17 >>> 26) | 0;
      w17 &= 67108863;
      lo = Math.imul(al9, bl9);
      mid = Math.imul(al9, bh9);
      mid = mid + Math.imul(ah9, bl9) | 0;
      hi = Math.imul(ah9, bh9);
      var w18 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
      c = (hi + (mid >>> 13) | 0) + (w18 >>> 26) | 0;
      w18 &= 67108863;
      o[0] = w0;
      o[1] = w1;
      o[2] = w2;
      o[3] = w3;
      o[4] = w4;
      o[5] = w5;
      o[6] = w6;
      o[7] = w7;
      o[8] = w8;
      o[9] = w9;
      o[10] = w10;
      o[11] = w11;
      o[12] = w12;
      o[13] = w13;
      o[14] = w14;
      o[15] = w15;
      o[16] = w16;
      o[17] = w17;
      o[18] = w18;
      if (c !== 0) {
        o[19] = c;
        out.length++;
      }
      return out;
    };
    if (!Math.imul) {
      comb10MulTo = smallMulTo;
    }
    function bigMulTo(self2, num, out) {
      out.negative = num.negative ^ self2.negative;
      out.length = self2.length + num.length;
      var carry = 0;
      var hncarry = 0;
      for (var k = 0;k < out.length - 1; k++) {
        var ncarry = hncarry;
        hncarry = 0;
        var rword = carry & 67108863;
        var maxJ = Math.min(k, num.length - 1);
        for (var j = Math.max(0, k - self2.length + 1);j <= maxJ; j++) {
          var i = k - j;
          var a = self2.words[i] | 0;
          var b2 = num.words[j] | 0;
          var r = a * b2;
          var lo = r & 67108863;
          ncarry = ncarry + (r / 67108864 | 0) | 0;
          lo = lo + rword | 0;
          rword = lo & 67108863;
          ncarry = ncarry + (lo >>> 26) | 0;
          hncarry += ncarry >>> 26;
          ncarry &= 67108863;
        }
        out.words[k] = rword;
        carry = ncarry;
        ncarry = hncarry;
      }
      if (carry !== 0) {
        out.words[k] = carry;
      } else {
        out.length--;
      }
      return out._strip();
    }
    function jumboMulTo(self2, num, out) {
      return bigMulTo(self2, num, out);
    }
    BN.prototype.mulTo = function mulTo(num, out) {
      var res;
      var len = this.length + num.length;
      if (this.length === 10 && num.length === 10) {
        res = comb10MulTo(this, num, out);
      } else if (len < 63) {
        res = smallMulTo(this, num, out);
      } else if (len < 1024) {
        res = bigMulTo(this, num, out);
      } else {
        res = jumboMulTo(this, num, out);
      }
      return res;
    };
    function FFTM(x, y) {
      this.x = x;
      this.y = y;
    }
    FFTM.prototype.makeRBT = function makeRBT(N) {
      var t = new Array(N);
      var l = BN.prototype._countBits(N) - 1;
      for (var i = 0;i < N; i++) {
        t[i] = this.revBin(i, l, N);
      }
      return t;
    };
    FFTM.prototype.revBin = function revBin(x, l, N) {
      if (x === 0 || x === N - 1)
        return x;
      var rb = 0;
      for (var i = 0;i < l; i++) {
        rb |= (x & 1) << l - i - 1;
        x >>= 1;
      }
      return rb;
    };
    FFTM.prototype.permute = function permute(rbt, rws, iws, rtws, itws, N) {
      for (var i = 0;i < N; i++) {
        rtws[i] = rws[rbt[i]];
        itws[i] = iws[rbt[i]];
      }
    };
    FFTM.prototype.transform = function transform(rws, iws, rtws, itws, N, rbt) {
      this.permute(rbt, rws, iws, rtws, itws, N);
      for (var s = 1;s < N; s <<= 1) {
        var l = s << 1;
        var rtwdf = Math.cos(2 * Math.PI / l);
        var itwdf = Math.sin(2 * Math.PI / l);
        for (var p = 0;p < N; p += l) {
          var rtwdf_ = rtwdf;
          var itwdf_ = itwdf;
          for (var j = 0;j < s; j++) {
            var re = rtws[p + j];
            var ie = itws[p + j];
            var ro = rtws[p + j + s];
            var io = itws[p + j + s];
            var rx = rtwdf_ * ro - itwdf_ * io;
            io = rtwdf_ * io + itwdf_ * ro;
            ro = rx;
            rtws[p + j] = re + ro;
            itws[p + j] = ie + io;
            rtws[p + j + s] = re - ro;
            itws[p + j + s] = ie - io;
            if (j !== l) {
              rx = rtwdf * rtwdf_ - itwdf * itwdf_;
              itwdf_ = rtwdf * itwdf_ + itwdf * rtwdf_;
              rtwdf_ = rx;
            }
          }
        }
      }
    };
    FFTM.prototype.guessLen13b = function guessLen13b(n, m) {
      var N = Math.max(m, n) | 1;
      var odd = N & 1;
      var i = 0;
      for (N = N / 2 | 0;N; N = N >>> 1) {
        i++;
      }
      return 1 << i + 1 + odd;
    };
    FFTM.prototype.conjugate = function conjugate(rws, iws, N) {
      if (N <= 1)
        return;
      for (var i = 0;i < N / 2; i++) {
        var t = rws[i];
        rws[i] = rws[N - i - 1];
        rws[N - i - 1] = t;
        t = iws[i];
        iws[i] = -iws[N - i - 1];
        iws[N - i - 1] = -t;
      }
    };
    FFTM.prototype.normalize13b = function normalize13b(ws, N) {
      var carry = 0;
      for (var i = 0;i < N / 2; i++) {
        var w = Math.round(ws[2 * i + 1] / N) * 8192 + Math.round(ws[2 * i] / N) + carry;
        ws[i] = w & 67108863;
        if (w < 67108864) {
          carry = 0;
        } else {
          carry = w / 67108864 | 0;
        }
      }
      return ws;
    };
    FFTM.prototype.convert13b = function convert13b(ws, len, rws, N) {
      var carry = 0;
      for (var i = 0;i < len; i++) {
        carry = carry + (ws[i] | 0);
        rws[2 * i] = carry & 8191;
        carry = carry >>> 13;
        rws[2 * i + 1] = carry & 8191;
        carry = carry >>> 13;
      }
      for (i = 2 * len;i < N; ++i) {
        rws[i] = 0;
      }
      assert(carry === 0);
      assert((carry & ~8191) === 0);
    };
    FFTM.prototype.stub = function stub(N) {
      var ph = new Array(N);
      for (var i = 0;i < N; i++) {
        ph[i] = 0;
      }
      return ph;
    };
    FFTM.prototype.mulp = function mulp(x, y, out) {
      var N = 2 * this.guessLen13b(x.length, y.length);
      var rbt = this.makeRBT(N);
      var _2 = this.stub(N);
      var rws = new Array(N);
      var rwst = new Array(N);
      var iwst = new Array(N);
      var nrws = new Array(N);
      var nrwst = new Array(N);
      var niwst = new Array(N);
      var rmws = out.words;
      rmws.length = N;
      this.convert13b(x.words, x.length, rws, N);
      this.convert13b(y.words, y.length, nrws, N);
      this.transform(rws, _2, rwst, iwst, N, rbt);
      this.transform(nrws, _2, nrwst, niwst, N, rbt);
      for (var i = 0;i < N; i++) {
        var rx = rwst[i] * nrwst[i] - iwst[i] * niwst[i];
        iwst[i] = rwst[i] * niwst[i] + iwst[i] * nrwst[i];
        rwst[i] = rx;
      }
      this.conjugate(rwst, iwst, N);
      this.transform(rwst, iwst, rmws, _2, N, rbt);
      this.conjugate(rmws, _2, N);
      this.normalize13b(rmws, N);
      out.negative = x.negative ^ y.negative;
      out.length = x.length + y.length;
      return out._strip();
    };
    BN.prototype.mul = function mul(num) {
      var out = new BN(null);
      out.words = new Array(this.length + num.length);
      return this.mulTo(num, out);
    };
    BN.prototype.mulf = function mulf(num) {
      var out = new BN(null);
      out.words = new Array(this.length + num.length);
      return jumboMulTo(this, num, out);
    };
    BN.prototype.imul = function imul(num) {
      return this.clone().mulTo(num, this);
    };
    BN.prototype.imuln = function imuln(num) {
      var isNegNum = num < 0;
      if (isNegNum)
        num = -num;
      assert(typeof num === "number");
      assert(num < 67108864);
      var carry = 0;
      for (var i = 0;i < this.length; i++) {
        var w = (this.words[i] | 0) * num;
        var lo = (w & 67108863) + (carry & 67108863);
        carry >>= 26;
        carry += w / 67108864 | 0;
        carry += lo >>> 26;
        this.words[i] = lo & 67108863;
      }
      if (carry !== 0) {
        this.words[i] = carry;
        this.length++;
      }
      return isNegNum ? this.ineg() : this;
    };
    BN.prototype.muln = function muln(num) {
      return this.clone().imuln(num);
    };
    BN.prototype.sqr = function sqr() {
      return this.mul(this);
    };
    BN.prototype.isqr = function isqr() {
      return this.imul(this.clone());
    };
    BN.prototype.pow = function pow(num) {
      var w = toBitArray(num);
      if (w.length === 0)
        return new BN(1);
      var res = this;
      for (var i = 0;i < w.length; i++, res = res.sqr()) {
        if (w[i] !== 0)
          break;
      }
      if (++i < w.length) {
        for (var q = res.sqr();i < w.length; i++, q = q.sqr()) {
          if (w[i] === 0)
            continue;
          res = res.mul(q);
        }
      }
      return res;
    };
    BN.prototype.iushln = function iushln(bits) {
      assert(typeof bits === "number" && bits >= 0);
      var r = bits % 26;
      var s = (bits - r) / 26;
      var carryMask = 67108863 >>> 26 - r << 26 - r;
      var i;
      if (r !== 0) {
        var carry = 0;
        for (i = 0;i < this.length; i++) {
          var newCarry = this.words[i] & carryMask;
          var c = (this.words[i] | 0) - newCarry << r;
          this.words[i] = c | carry;
          carry = newCarry >>> 26 - r;
        }
        if (carry) {
          this.words[i] = carry;
          this.length++;
        }
      }
      if (s !== 0) {
        for (i = this.length - 1;i >= 0; i--) {
          this.words[i + s] = this.words[i];
        }
        for (i = 0;i < s; i++) {
          this.words[i] = 0;
        }
        this.length += s;
      }
      return this._strip();
    };
    BN.prototype.ishln = function ishln(bits) {
      assert(this.negative === 0);
      return this.iushln(bits);
    };
    BN.prototype.iushrn = function iushrn(bits, hint, extended) {
      assert(typeof bits === "number" && bits >= 0);
      var h;
      if (hint) {
        h = (hint - hint % 26) / 26;
      } else {
        h = 0;
      }
      var r = bits % 26;
      var s = Math.min((bits - r) / 26, this.length);
      var mask = 67108863 ^ 67108863 >>> r << r;
      var maskedWords = extended;
      h -= s;
      h = Math.max(0, h);
      if (maskedWords) {
        for (var i = 0;i < s; i++) {
          maskedWords.words[i] = this.words[i];
        }
        maskedWords.length = s;
      }
      if (s === 0) {
      } else if (this.length > s) {
        this.length -= s;
        for (i = 0;i < this.length; i++) {
          this.words[i] = this.words[i + s];
        }
      } else {
        this.words[0] = 0;
        this.length = 1;
      }
      var carry = 0;
      for (i = this.length - 1;i >= 0 && (carry !== 0 || i >= h); i--) {
        var word = this.words[i] | 0;
        this.words[i] = carry << 26 - r | word >>> r;
        carry = word & mask;
      }
      if (maskedWords && carry !== 0) {
        maskedWords.words[maskedWords.length++] = carry;
      }
      if (this.length === 0) {
        this.words[0] = 0;
        this.length = 1;
      }
      return this._strip();
    };
    BN.prototype.ishrn = function ishrn(bits, hint, extended) {
      assert(this.negative === 0);
      return this.iushrn(bits, hint, extended);
    };
    BN.prototype.shln = function shln(bits) {
      return this.clone().ishln(bits);
    };
    BN.prototype.ushln = function ushln(bits) {
      return this.clone().iushln(bits);
    };
    BN.prototype.shrn = function shrn(bits) {
      return this.clone().ishrn(bits);
    };
    BN.prototype.ushrn = function ushrn(bits) {
      return this.clone().iushrn(bits);
    };
    BN.prototype.testn = function testn(bit) {
      assert(typeof bit === "number" && bit >= 0);
      var r = bit % 26;
      var s = (bit - r) / 26;
      var q = 1 << r;
      if (this.length <= s)
        return false;
      var w = this.words[s];
      return !!(w & q);
    };
    BN.prototype.imaskn = function imaskn(bits) {
      assert(typeof bits === "number" && bits >= 0);
      var r = bits % 26;
      var s = (bits - r) / 26;
      assert(this.negative === 0, "imaskn works only with positive numbers");
      if (this.length <= s) {
        return this;
      }
      if (r !== 0) {
        s++;
      }
      this.length = Math.min(s, this.length);
      if (r !== 0) {
        var mask = 67108863 ^ 67108863 >>> r << r;
        this.words[this.length - 1] &= mask;
      }
      return this._strip();
    };
    BN.prototype.maskn = function maskn(bits) {
      return this.clone().imaskn(bits);
    };
    BN.prototype.iaddn = function iaddn(num) {
      assert(typeof num === "number");
      assert(num < 67108864);
      if (num < 0)
        return this.isubn(-num);
      if (this.negative !== 0) {
        if (this.length === 1 && (this.words[0] | 0) <= num) {
          this.words[0] = num - (this.words[0] | 0);
          this.negative = 0;
          return this;
        }
        this.negative = 0;
        this.isubn(num);
        this.negative = 1;
        return this;
      }
      return this._iaddn(num);
    };
    BN.prototype._iaddn = function _iaddn(num) {
      this.words[0] += num;
      for (var i = 0;i < this.length && this.words[i] >= 67108864; i++) {
        this.words[i] -= 67108864;
        if (i === this.length - 1) {
          this.words[i + 1] = 1;
        } else {
          this.words[i + 1]++;
        }
      }
      this.length = Math.max(this.length, i + 1);
      return this;
    };
    BN.prototype.isubn = function isubn(num) {
      assert(typeof num === "number");
      assert(num < 67108864);
      if (num < 0)
        return this.iaddn(-num);
      if (this.negative !== 0) {
        this.negative = 0;
        this.iaddn(num);
        this.negative = 1;
        return this;
      }
      this.words[0] -= num;
      if (this.length === 1 && this.words[0] < 0) {
        this.words[0] = -this.words[0];
        this.negative = 1;
      } else {
        for (var i = 0;i < this.length && this.words[i] < 0; i++) {
          this.words[i] += 67108864;
          this.words[i + 1] -= 1;
        }
      }
      return this._strip();
    };
    BN.prototype.addn = function addn(num) {
      return this.clone().iaddn(num);
    };
    BN.prototype.subn = function subn(num) {
      return this.clone().isubn(num);
    };
    BN.prototype.iabs = function iabs() {
      this.negative = 0;
      return this;
    };
    BN.prototype.abs = function abs() {
      return this.clone().iabs();
    };
    BN.prototype._ishlnsubmul = function _ishlnsubmul(num, mul, shift) {
      var len = num.length + shift;
      var i;
      this._expand(len);
      var w;
      var carry = 0;
      for (i = 0;i < num.length; i++) {
        w = (this.words[i + shift] | 0) + carry;
        var right = (num.words[i] | 0) * mul;
        w -= right & 67108863;
        carry = (w >> 26) - (right / 67108864 | 0);
        this.words[i + shift] = w & 67108863;
      }
      for (;i < this.length - shift; i++) {
        w = (this.words[i + shift] | 0) + carry;
        carry = w >> 26;
        this.words[i + shift] = w & 67108863;
      }
      if (carry === 0)
        return this._strip();
      assert(carry === -1);
      carry = 0;
      for (i = 0;i < this.length; i++) {
        w = -(this.words[i] | 0) + carry;
        carry = w >> 26;
        this.words[i] = w & 67108863;
      }
      this.negative = 1;
      return this._strip();
    };
    BN.prototype._wordDiv = function _wordDiv(num, mode) {
      var shift = this.length - num.length;
      var a = this.clone();
      var b2 = num;
      var bhi = b2.words[b2.length - 1] | 0;
      var bhiBits = this._countBits(bhi);
      shift = 26 - bhiBits;
      if (shift !== 0) {
        b2 = b2.ushln(shift);
        a.iushln(shift);
        bhi = b2.words[b2.length - 1] | 0;
      }
      var m = a.length - b2.length;
      var q;
      if (mode !== "mod") {
        q = new BN(null);
        q.length = m + 1;
        q.words = new Array(q.length);
        for (var i = 0;i < q.length; i++) {
          q.words[i] = 0;
        }
      }
      var diff = a.clone()._ishlnsubmul(b2, 1, m);
      if (diff.negative === 0) {
        a = diff;
        if (q) {
          q.words[m] = 1;
        }
      }
      for (var j = m - 1;j >= 0; j--) {
        var qj = (a.words[b2.length + j] | 0) * 67108864 + (a.words[b2.length + j - 1] | 0);
        qj = Math.min(qj / bhi | 0, 67108863);
        a._ishlnsubmul(b2, qj, j);
        while (a.negative !== 0) {
          qj--;
          a.negative = 0;
          a._ishlnsubmul(b2, 1, j);
          if (!a.isZero()) {
            a.negative ^= 1;
          }
        }
        if (q) {
          q.words[j] = qj;
        }
      }
      if (q) {
        q._strip();
      }
      a._strip();
      if (mode !== "div" && shift !== 0) {
        a.iushrn(shift);
      }
      return {
        div: q || null,
        mod: a
      };
    };
    BN.prototype.divmod = function divmod(num, mode, positive) {
      assert(!num.isZero());
      if (this.isZero()) {
        return {
          div: new BN(0),
          mod: new BN(0)
        };
      }
      var div, mod, res;
      if (this.negative !== 0 && num.negative === 0) {
        res = this.neg().divmod(num, mode);
        if (mode !== "mod") {
          div = res.div.neg();
        }
        if (mode !== "div") {
          mod = res.mod.neg();
          if (positive && mod.negative !== 0) {
            mod.iadd(num);
          }
        }
        return {
          div,
          mod
        };
      }
      if (this.negative === 0 && num.negative !== 0) {
        res = this.divmod(num.neg(), mode);
        if (mode !== "mod") {
          div = res.div.neg();
        }
        return {
          div,
          mod: res.mod
        };
      }
      if ((this.negative & num.negative) !== 0) {
        res = this.neg().divmod(num.neg(), mode);
        if (mode !== "div") {
          mod = res.mod.neg();
          if (positive && mod.negative !== 0) {
            mod.isub(num);
          }
        }
        return {
          div: res.div,
          mod
        };
      }
      if (num.length > this.length || this.cmp(num) < 0) {
        return {
          div: new BN(0),
          mod: this
        };
      }
      if (num.length === 1) {
        if (mode === "div") {
          return {
            div: this.divn(num.words[0]),
            mod: null
          };
        }
        if (mode === "mod") {
          return {
            div: null,
            mod: new BN(this.modrn(num.words[0]))
          };
        }
        return {
          div: this.divn(num.words[0]),
          mod: new BN(this.modrn(num.words[0]))
        };
      }
      return this._wordDiv(num, mode);
    };
    BN.prototype.div = function div(num) {
      return this.divmod(num, "div", false).div;
    };
    BN.prototype.mod = function mod(num) {
      return this.divmod(num, "mod", false).mod;
    };
    BN.prototype.umod = function umod(num) {
      return this.divmod(num, "mod", true).mod;
    };
    BN.prototype.divRound = function divRound(num) {
      var dm = this.divmod(num);
      if (dm.mod.isZero())
        return dm.div;
      var mod = dm.div.negative !== 0 ? dm.mod.isub(num) : dm.mod;
      var half = num.ushrn(1);
      var r2 = num.andln(1);
      var cmp = mod.cmp(half);
      if (cmp < 0 || r2 === 1 && cmp === 0)
        return dm.div;
      return dm.div.negative !== 0 ? dm.div.isubn(1) : dm.div.iaddn(1);
    };
    BN.prototype.modrn = function modrn(num) {
      var isNegNum = num < 0;
      if (isNegNum)
        num = -num;
      assert(num <= 67108863);
      var p = (1 << 26) % num;
      var acc = 0;
      for (var i = this.length - 1;i >= 0; i--) {
        acc = (p * acc + (this.words[i] | 0)) % num;
      }
      return isNegNum ? -acc : acc;
    };
    BN.prototype.modn = function modn(num) {
      return this.modrn(num);
    };
    BN.prototype.idivn = function idivn(num) {
      var isNegNum = num < 0;
      if (isNegNum)
        num = -num;
      assert(num <= 67108863);
      var carry = 0;
      for (var i = this.length - 1;i >= 0; i--) {
        var w = (this.words[i] | 0) + carry * 67108864;
        this.words[i] = w / num | 0;
        carry = w % num;
      }
      this._strip();
      return isNegNum ? this.ineg() : this;
    };
    BN.prototype.divn = function divn(num) {
      return this.clone().idivn(num);
    };
    BN.prototype.egcd = function egcd(p) {
      assert(p.negative === 0);
      assert(!p.isZero());
      var x = this;
      var y = p.clone();
      if (x.negative !== 0) {
        x = x.umod(p);
      } else {
        x = x.clone();
      }
      var A = new BN(1);
      var B = new BN(0);
      var C = new BN(0);
      var D2 = new BN(1);
      var g = 0;
      while (x.isEven() && y.isEven()) {
        x.iushrn(1);
        y.iushrn(1);
        ++g;
      }
      var yp = y.clone();
      var xp = x.clone();
      while (!x.isZero()) {
        for (var i = 0, im = 1;(x.words[0] & im) === 0 && i < 26; ++i, im <<= 1)
          ;
        if (i > 0) {
          x.iushrn(i);
          while (i-- > 0) {
            if (A.isOdd() || B.isOdd()) {
              A.iadd(yp);
              B.isub(xp);
            }
            A.iushrn(1);
            B.iushrn(1);
          }
        }
        for (var j = 0, jm = 1;(y.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1)
          ;
        if (j > 0) {
          y.iushrn(j);
          while (j-- > 0) {
            if (C.isOdd() || D2.isOdd()) {
              C.iadd(yp);
              D2.isub(xp);
            }
            C.iushrn(1);
            D2.iushrn(1);
          }
        }
        if (x.cmp(y) >= 0) {
          x.isub(y);
          A.isub(C);
          B.isub(D2);
        } else {
          y.isub(x);
          C.isub(A);
          D2.isub(B);
        }
      }
      return {
        a: C,
        b: D2,
        gcd: y.iushln(g)
      };
    };
    BN.prototype._invmp = function _invmp(p) {
      assert(p.negative === 0);
      assert(!p.isZero());
      var a = this;
      var b2 = p.clone();
      if (a.negative !== 0) {
        a = a.umod(p);
      } else {
        a = a.clone();
      }
      var x1 = new BN(1);
      var x2 = new BN(0);
      var delta = b2.clone();
      while (a.cmpn(1) > 0 && b2.cmpn(1) > 0) {
        for (var i = 0, im = 1;(a.words[0] & im) === 0 && i < 26; ++i, im <<= 1)
          ;
        if (i > 0) {
          a.iushrn(i);
          while (i-- > 0) {
            if (x1.isOdd()) {
              x1.iadd(delta);
            }
            x1.iushrn(1);
          }
        }
        for (var j = 0, jm = 1;(b2.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1)
          ;
        if (j > 0) {
          b2.iushrn(j);
          while (j-- > 0) {
            if (x2.isOdd()) {
              x2.iadd(delta);
            }
            x2.iushrn(1);
          }
        }
        if (a.cmp(b2) >= 0) {
          a.isub(b2);
          x1.isub(x2);
        } else {
          b2.isub(a);
          x2.isub(x1);
        }
      }
      var res;
      if (a.cmpn(1) === 0) {
        res = x1;
      } else {
        res = x2;
      }
      if (res.cmpn(0) < 0) {
        res.iadd(p);
      }
      return res;
    };
    BN.prototype.gcd = function gcd(num) {
      if (this.isZero())
        return num.abs();
      if (num.isZero())
        return this.abs();
      var a = this.clone();
      var b2 = num.clone();
      a.negative = 0;
      b2.negative = 0;
      for (var shift = 0;a.isEven() && b2.isEven(); shift++) {
        a.iushrn(1);
        b2.iushrn(1);
      }
      do {
        while (a.isEven()) {
          a.iushrn(1);
        }
        while (b2.isEven()) {
          b2.iushrn(1);
        }
        var r = a.cmp(b2);
        if (r < 0) {
          var t = a;
          a = b2;
          b2 = t;
        } else if (r === 0 || b2.cmpn(1) === 0) {
          break;
        }
        a.isub(b2);
      } while (true);
      return b2.iushln(shift);
    };
    BN.prototype.invm = function invm(num) {
      return this.egcd(num).a.umod(num);
    };
    BN.prototype.isEven = function isEven() {
      return (this.words[0] & 1) === 0;
    };
    BN.prototype.isOdd = function isOdd() {
      return (this.words[0] & 1) === 1;
    };
    BN.prototype.andln = function andln(num) {
      return this.words[0] & num;
    };
    BN.prototype.bincn = function bincn(bit) {
      assert(typeof bit === "number");
      var r = bit % 26;
      var s = (bit - r) / 26;
      var q = 1 << r;
      if (this.length <= s) {
        this._expand(s + 1);
        this.words[s] |= q;
        return this;
      }
      var carry = q;
      for (var i = s;carry !== 0 && i < this.length; i++) {
        var w = this.words[i] | 0;
        w += carry;
        carry = w >>> 26;
        w &= 67108863;
        this.words[i] = w;
      }
      if (carry !== 0) {
        this.words[i] = carry;
        this.length++;
      }
      return this;
    };
    BN.prototype.isZero = function isZero() {
      return this.length === 1 && this.words[0] === 0;
    };
    BN.prototype.cmpn = function cmpn(num) {
      var negative = num < 0;
      if (this.negative !== 0 && !negative)
        return -1;
      if (this.negative === 0 && negative)
        return 1;
      this._strip();
      var res;
      if (this.length > 1) {
        res = 1;
      } else {
        if (negative) {
          num = -num;
        }
        assert(num <= 67108863, "Number is too big");
        var w = this.words[0] | 0;
        res = w === num ? 0 : w < num ? -1 : 1;
      }
      if (this.negative !== 0)
        return -res | 0;
      return res;
    };
    BN.prototype.cmp = function cmp(num) {
      if (this.negative !== 0 && num.negative === 0)
        return -1;
      if (this.negative === 0 && num.negative !== 0)
        return 1;
      var res = this.ucmp(num);
      if (this.negative !== 0)
        return -res | 0;
      return res;
    };
    BN.prototype.ucmp = function ucmp(num) {
      if (this.length > num.length)
        return 1;
      if (this.length < num.length)
        return -1;
      var res = 0;
      for (var i = this.length - 1;i >= 0; i--) {
        var a = this.words[i] | 0;
        var b2 = num.words[i] | 0;
        if (a === b2)
          continue;
        if (a < b2) {
          res = -1;
        } else if (a > b2) {
          res = 1;
        }
        break;
      }
      return res;
    };
    BN.prototype.gtn = function gtn(num) {
      return this.cmpn(num) === 1;
    };
    BN.prototype.gt = function gt(num) {
      return this.cmp(num) === 1;
    };
    BN.prototype.gten = function gten(num) {
      return this.cmpn(num) >= 0;
    };
    BN.prototype.gte = function gte(num) {
      return this.cmp(num) >= 0;
    };
    BN.prototype.ltn = function ltn(num) {
      return this.cmpn(num) === -1;
    };
    BN.prototype.lt = function lt(num) {
      return this.cmp(num) === -1;
    };
    BN.prototype.lten = function lten(num) {
      return this.cmpn(num) <= 0;
    };
    BN.prototype.lte = function lte(num) {
      return this.cmp(num) <= 0;
    };
    BN.prototype.eqn = function eqn(num) {
      return this.cmpn(num) === 0;
    };
    BN.prototype.eq = function eq(num) {
      return this.cmp(num) === 0;
    };
    BN.red = function red(num) {
      return new Red(num);
    };
    BN.prototype.toRed = function toRed(ctx) {
      assert(!this.red, "Already a number in reduction context");
      assert(this.negative === 0, "red works only with positives");
      return ctx.convertTo(this)._forceRed(ctx);
    };
    BN.prototype.fromRed = function fromRed() {
      assert(this.red, "fromRed works only with numbers in reduction context");
      return this.red.convertFrom(this);
    };
    BN.prototype._forceRed = function _forceRed(ctx) {
      this.red = ctx;
      return this;
    };
    BN.prototype.forceRed = function forceRed(ctx) {
      assert(!this.red, "Already a number in reduction context");
      return this._forceRed(ctx);
    };
    BN.prototype.redAdd = function redAdd(num) {
      assert(this.red, "redAdd works only with red numbers");
      return this.red.add(this, num);
    };
    BN.prototype.redIAdd = function redIAdd(num) {
      assert(this.red, "redIAdd works only with red numbers");
      return this.red.iadd(this, num);
    };
    BN.prototype.redSub = function redSub(num) {
      assert(this.red, "redSub works only with red numbers");
      return this.red.sub(this, num);
    };
    BN.prototype.redISub = function redISub(num) {
      assert(this.red, "redISub works only with red numbers");
      return this.red.isub(this, num);
    };
    BN.prototype.redShl = function redShl(num) {
      assert(this.red, "redShl works only with red numbers");
      return this.red.shl(this, num);
    };
    BN.prototype.redMul = function redMul(num) {
      assert(this.red, "redMul works only with red numbers");
      this.red._verify2(this, num);
      return this.red.mul(this, num);
    };
    BN.prototype.redIMul = function redIMul(num) {
      assert(this.red, "redMul works only with red numbers");
      this.red._verify2(this, num);
      return this.red.imul(this, num);
    };
    BN.prototype.redSqr = function redSqr() {
      assert(this.red, "redSqr works only with red numbers");
      this.red._verify1(this);
      return this.red.sqr(this);
    };
    BN.prototype.redISqr = function redISqr() {
      assert(this.red, "redISqr works only with red numbers");
      this.red._verify1(this);
      return this.red.isqr(this);
    };
    BN.prototype.redSqrt = function redSqrt() {
      assert(this.red, "redSqrt works only with red numbers");
      this.red._verify1(this);
      return this.red.sqrt(this);
    };
    BN.prototype.redInvm = function redInvm() {
      assert(this.red, "redInvm works only with red numbers");
      this.red._verify1(this);
      return this.red.invm(this);
    };
    BN.prototype.redNeg = function redNeg() {
      assert(this.red, "redNeg works only with red numbers");
      this.red._verify1(this);
      return this.red.neg(this);
    };
    BN.prototype.redPow = function redPow(num) {
      assert(this.red && !num.red, "redPow(normalNum)");
      this.red._verify1(this);
      return this.red.pow(this, num);
    };
    var primes = {
      k256: null,
      p224: null,
      p192: null,
      p25519: null
    };
    function MPrime(name, p) {
      this.name = name;
      this.p = new BN(p, 16);
      this.n = this.p.bitLength();
      this.k = new BN(1).iushln(this.n).isub(this.p);
      this.tmp = this._tmp();
    }
    MPrime.prototype._tmp = function _tmp() {
      var tmp = new BN(null);
      tmp.words = new Array(Math.ceil(this.n / 13));
      return tmp;
    };
    MPrime.prototype.ireduce = function ireduce(num) {
      var r = num;
      var rlen;
      do {
        this.split(r, this.tmp);
        r = this.imulK(r);
        r = r.iadd(this.tmp);
        rlen = r.bitLength();
      } while (rlen > this.n);
      var cmp = rlen < this.n ? -1 : r.ucmp(this.p);
      if (cmp === 0) {
        r.words[0] = 0;
        r.length = 1;
      } else if (cmp > 0) {
        r.isub(this.p);
      } else {
        if (r.strip !== undefined) {
          r.strip();
        } else {
          r._strip();
        }
      }
      return r;
    };
    MPrime.prototype.split = function split(input, out) {
      input.iushrn(this.n, 0, out);
    };
    MPrime.prototype.imulK = function imulK(num) {
      return num.imul(this.k);
    };
    function K256() {
      MPrime.call(this, "k256", "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f");
    }
    inherits(K256, MPrime);
    K256.prototype.split = function split(input, output) {
      var mask = 4194303;
      var outLen = Math.min(input.length, 9);
      for (var i = 0;i < outLen; i++) {
        output.words[i] = input.words[i];
      }
      output.length = outLen;
      if (input.length <= 9) {
        input.words[0] = 0;
        input.length = 1;
        return;
      }
      var prev = input.words[9];
      output.words[output.length++] = prev & mask;
      for (i = 10;i < input.length; i++) {
        var next = input.words[i] | 0;
        input.words[i - 10] = (next & mask) << 4 | prev >>> 22;
        prev = next;
      }
      prev >>>= 22;
      input.words[i - 10] = prev;
      if (prev === 0 && input.length > 10) {
        input.length -= 10;
      } else {
        input.length -= 9;
      }
    };
    K256.prototype.imulK = function imulK(num) {
      num.words[num.length] = 0;
      num.words[num.length + 1] = 0;
      num.length += 2;
      var lo = 0;
      for (var i = 0;i < num.length; i++) {
        var w = num.words[i] | 0;
        lo += w * 977;
        num.words[i] = lo & 67108863;
        lo = w * 64 + (lo / 67108864 | 0);
      }
      if (num.words[num.length - 1] === 0) {
        num.length--;
        if (num.words[num.length - 1] === 0) {
          num.length--;
        }
      }
      return num;
    };
    function P224() {
      MPrime.call(this, "p224", "ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001");
    }
    inherits(P224, MPrime);
    function P192() {
      MPrime.call(this, "p192", "ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff");
    }
    inherits(P192, MPrime);
    function P25519() {
      MPrime.call(this, "25519", "7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed");
    }
    inherits(P25519, MPrime);
    P25519.prototype.imulK = function imulK(num) {
      var carry = 0;
      for (var i = 0;i < num.length; i++) {
        var hi = (num.words[i] | 0) * 19 + carry;
        var lo = hi & 67108863;
        hi >>>= 26;
        num.words[i] = lo;
        carry = hi;
      }
      if (carry !== 0) {
        num.words[num.length++] = carry;
      }
      return num;
    };
    BN._prime = function prime(name) {
      if (primes[name])
        return primes[name];
      var prime;
      if (name === "k256") {
        prime = new K256;
      } else if (name === "p224") {
        prime = new P224;
      } else if (name === "p192") {
        prime = new P192;
      } else if (name === "p25519") {
        prime = new P25519;
      } else {
        throw new Error("Unknown prime " + name);
      }
      primes[name] = prime;
      return prime;
    };
    function Red(m) {
      if (typeof m === "string") {
        var prime = BN._prime(m);
        this.m = prime.p;
        this.prime = prime;
      } else {
        assert(m.gtn(1), "modulus must be greater than 1");
        this.m = m;
        this.prime = null;
      }
    }
    Red.prototype._verify1 = function _verify1(a) {
      assert(a.negative === 0, "red works only with positives");
      assert(a.red, "red works only with red numbers");
    };
    Red.prototype._verify2 = function _verify2(a, b2) {
      assert((a.negative | b2.negative) === 0, "red works only with positives");
      assert(a.red && a.red === b2.red, "red works only with red numbers");
    };
    Red.prototype.imod = function imod(a) {
      if (this.prime)
        return this.prime.ireduce(a)._forceRed(this);
      move(a, a.umod(this.m)._forceRed(this));
      return a;
    };
    Red.prototype.neg = function neg(a) {
      if (a.isZero()) {
        return a.clone();
      }
      return this.m.sub(a)._forceRed(this);
    };
    Red.prototype.add = function add(a, b2) {
      this._verify2(a, b2);
      var res = a.add(b2);
      if (res.cmp(this.m) >= 0) {
        res.isub(this.m);
      }
      return res._forceRed(this);
    };
    Red.prototype.iadd = function iadd(a, b2) {
      this._verify2(a, b2);
      var res = a.iadd(b2);
      if (res.cmp(this.m) >= 0) {
        res.isub(this.m);
      }
      return res;
    };
    Red.prototype.sub = function sub(a, b2) {
      this._verify2(a, b2);
      var res = a.sub(b2);
      if (res.cmpn(0) < 0) {
        res.iadd(this.m);
      }
      return res._forceRed(this);
    };
    Red.prototype.isub = function isub(a, b2) {
      this._verify2(a, b2);
      var res = a.isub(b2);
      if (res.cmpn(0) < 0) {
        res.iadd(this.m);
      }
      return res;
    };
    Red.prototype.shl = function shl(a, num) {
      this._verify1(a);
      return this.imod(a.ushln(num));
    };
    Red.prototype.imul = function imul(a, b2) {
      this._verify2(a, b2);
      return this.imod(a.imul(b2));
    };
    Red.prototype.mul = function mul(a, b2) {
      this._verify2(a, b2);
      return this.imod(a.mul(b2));
    };
    Red.prototype.isqr = function isqr(a) {
      return this.imul(a, a.clone());
    };
    Red.prototype.sqr = function sqr(a) {
      return this.mul(a, a);
    };
    Red.prototype.sqrt = function sqrt(a) {
      if (a.isZero())
        return a.clone();
      var mod3 = this.m.andln(3);
      assert(mod3 % 2 === 1);
      if (mod3 === 3) {
        var pow = this.m.add(new BN(1)).iushrn(2);
        return this.pow(a, pow);
      }
      var q = this.m.subn(1);
      var s = 0;
      while (!q.isZero() && q.andln(1) === 0) {
        s++;
        q.iushrn(1);
      }
      assert(!q.isZero());
      var one = new BN(1).toRed(this);
      var nOne = one.redNeg();
      var lpow = this.m.subn(1).iushrn(1);
      var z2 = this.m.bitLength();
      z2 = new BN(2 * z2 * z2).toRed(this);
      while (this.pow(z2, lpow).cmp(nOne) !== 0) {
        z2.redIAdd(nOne);
      }
      var c = this.pow(z2, q);
      var r = this.pow(a, q.addn(1).iushrn(1));
      var t = this.pow(a, q);
      var m = s;
      while (t.cmp(one) !== 0) {
        var tmp = t;
        for (var i = 0;tmp.cmp(one) !== 0; i++) {
          tmp = tmp.redSqr();
        }
        assert(i < m);
        var b2 = this.pow(c, new BN(1).iushln(m - i - 1));
        r = r.redMul(b2);
        c = b2.redSqr();
        t = t.redMul(c);
        m = i;
      }
      return r;
    };
    Red.prototype.invm = function invm(a) {
      var inv = a._invmp(this.m);
      if (inv.negative !== 0) {
        inv.negative = 0;
        return this.imod(inv).redNeg();
      } else {
        return this.imod(inv);
      }
    };
    Red.prototype.pow = function pow(a, num) {
      if (num.isZero())
        return new BN(1).toRed(this);
      if (num.cmpn(1) === 0)
        return a.clone();
      var windowSize = 4;
      var wnd = new Array(1 << windowSize);
      wnd[0] = new BN(1).toRed(this);
      wnd[1] = a;
      for (var i = 2;i < wnd.length; i++) {
        wnd[i] = this.mul(wnd[i - 1], a);
      }
      var res = wnd[0];
      var current = 0;
      var currentLen = 0;
      var start = num.bitLength() % 26;
      if (start === 0) {
        start = 26;
      }
      for (i = num.length - 1;i >= 0; i--) {
        var word = num.words[i];
        for (var j = start - 1;j >= 0; j--) {
          var bit = word >> j & 1;
          if (res !== wnd[0]) {
            res = this.sqr(res);
          }
          if (bit === 0 && current === 0) {
            currentLen = 0;
            continue;
          }
          current <<= 1;
          current |= bit;
          currentLen++;
          if (currentLen !== windowSize && (i !== 0 || j !== 0))
            continue;
          res = this.mul(res, wnd[current]);
          currentLen = 0;
          current = 0;
        }
        start = 26;
      }
      return res;
    };
    Red.prototype.convertTo = function convertTo(num) {
      var r = num.umod(this.m);
      return r === num ? r.clone() : r;
    };
    Red.prototype.convertFrom = function convertFrom(num) {
      var res = num.clone();
      res.red = null;
      return res;
    };
    BN.mont = function mont(num) {
      return new Mont(num);
    };
    function Mont(m) {
      Red.call(this, m);
      this.shift = this.m.bitLength();
      if (this.shift % 26 !== 0) {
        this.shift += 26 - this.shift % 26;
      }
      this.r = new BN(1).iushln(this.shift);
      this.r2 = this.imod(this.r.sqr());
      this.rinv = this.r._invmp(this.m);
      this.minv = this.rinv.mul(this.r).isubn(1).div(this.m);
      this.minv = this.minv.umod(this.r);
      this.minv = this.r.sub(this.minv);
    }
    inherits(Mont, Red);
    Mont.prototype.convertTo = function convertTo(num) {
      return this.imod(num.ushln(this.shift));
    };
    Mont.prototype.convertFrom = function convertFrom(num) {
      var r = this.imod(num.mul(this.rinv));
      r.red = null;
      return r;
    };
    Mont.prototype.imul = function imul(a, b2) {
      if (a.isZero() || b2.isZero()) {
        a.words[0] = 0;
        a.length = 1;
        return a;
      }
      var t = a.imul(b2);
      var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
      var u = t.isub(c).iushrn(this.shift);
      var res = u;
      if (u.cmp(this.m) >= 0) {
        res = u.isub(this.m);
      } else if (u.cmpn(0) < 0) {
        res = u.iadd(this.m);
      }
      return res._forceRed(this);
    };
    Mont.prototype.mul = function mul(a, b2) {
      if (a.isZero() || b2.isZero())
        return new BN(0)._forceRed(this);
      var t = a.mul(b2);
      var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
      var u = t.isub(c).iushrn(this.shift);
      var res = u;
      if (u.cmp(this.m) >= 0) {
        res = u.isub(this.m);
      } else if (u.cmpn(0) < 0) {
        res = u.iadd(this.m);
      }
      return res._forceRed(this);
    };
    Mont.prototype.invm = function invm(a) {
      var res = this.imod(a._invmp(this.m).mul(this.r2));
      return res._forceRed(this);
    };
  })(typeof module === "undefined" || module, exports);
});

// node_modules/@ethersproject/logger/lib/_version.js
var require__version = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.version = undefined;
  exports.version = "logger/5.7.0";
});

// node_modules/@ethersproject/logger/lib/index.js
var require_lib = __commonJS((exports) => {
  var _checkNormalize = function() {
    try {
      var missing_1 = [];
      ["NFD", "NFC", "NFKD", "NFKC"].forEach(function(form) {
        try {
          if ("test".normalize(form) !== "test") {
            throw new Error("bad normalize");
          }
        } catch (error) {
          missing_1.push(form);
        }
      });
      if (missing_1.length) {
        throw new Error("missing " + missing_1.join(", "));
      }
      if (String.fromCharCode(233).normalize("NFD") !== String.fromCharCode(101, 769)) {
        throw new Error("broken implementation");
      }
    } catch (error) {
      return error.message;
    }
    return null;
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.Logger = exports.ErrorCode = exports.LogLevel = undefined;
  var _permanentCensorErrors = false;
  var _censorErrors = false;
  var LogLevels = { debug: 1, default: 2, info: 2, warning: 3, error: 4, off: 5 };
  var _logLevel = LogLevels["default"];
  var _version_1 = require__version();
  var _globalLogger = null;
  var _normalizeError = _checkNormalize();
  var LogLevel;
  (function(LogLevel2) {
    LogLevel2["DEBUG"] = "DEBUG";
    LogLevel2["INFO"] = "INFO";
    LogLevel2["WARNING"] = "WARNING";
    LogLevel2["ERROR"] = "ERROR";
    LogLevel2["OFF"] = "OFF";
  })(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
  var ErrorCode;
  (function(ErrorCode2) {
    ErrorCode2["UNKNOWN_ERROR"] = "UNKNOWN_ERROR";
    ErrorCode2["NOT_IMPLEMENTED"] = "NOT_IMPLEMENTED";
    ErrorCode2["UNSUPPORTED_OPERATION"] = "UNSUPPORTED_OPERATION";
    ErrorCode2["NETWORK_ERROR"] = "NETWORK_ERROR";
    ErrorCode2["SERVER_ERROR"] = "SERVER_ERROR";
    ErrorCode2["TIMEOUT"] = "TIMEOUT";
    ErrorCode2["BUFFER_OVERRUN"] = "BUFFER_OVERRUN";
    ErrorCode2["NUMERIC_FAULT"] = "NUMERIC_FAULT";
    ErrorCode2["MISSING_NEW"] = "MISSING_NEW";
    ErrorCode2["INVALID_ARGUMENT"] = "INVALID_ARGUMENT";
    ErrorCode2["MISSING_ARGUMENT"] = "MISSING_ARGUMENT";
    ErrorCode2["UNEXPECTED_ARGUMENT"] = "UNEXPECTED_ARGUMENT";
    ErrorCode2["CALL_EXCEPTION"] = "CALL_EXCEPTION";
    ErrorCode2["INSUFFICIENT_FUNDS"] = "INSUFFICIENT_FUNDS";
    ErrorCode2["NONCE_EXPIRED"] = "NONCE_EXPIRED";
    ErrorCode2["REPLACEMENT_UNDERPRICED"] = "REPLACEMENT_UNDERPRICED";
    ErrorCode2["UNPREDICTABLE_GAS_LIMIT"] = "UNPREDICTABLE_GAS_LIMIT";
    ErrorCode2["TRANSACTION_REPLACED"] = "TRANSACTION_REPLACED";
    ErrorCode2["ACTION_REJECTED"] = "ACTION_REJECTED";
  })(ErrorCode = exports.ErrorCode || (exports.ErrorCode = {}));
  var HEX = "0123456789abcdef";
  var Logger = function() {
    function Logger2(version) {
      Object.defineProperty(this, "version", {
        enumerable: true,
        value: version,
        writable: false
      });
    }
    Logger2.prototype._log = function(logLevel, args) {
      var level = logLevel.toLowerCase();
      if (LogLevels[level] == null) {
        this.throwArgumentError("invalid log level name", "logLevel", logLevel);
      }
      if (_logLevel > LogLevels[level]) {
        return;
      }
      console.log.apply(console, args);
    };
    Logger2.prototype.debug = function() {
      var args = [];
      for (var _i = 0;_i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      this._log(Logger2.levels.DEBUG, args);
    };
    Logger2.prototype.info = function() {
      var args = [];
      for (var _i = 0;_i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      this._log(Logger2.levels.INFO, args);
    };
    Logger2.prototype.warn = function() {
      var args = [];
      for (var _i = 0;_i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      this._log(Logger2.levels.WARNING, args);
    };
    Logger2.prototype.makeError = function(message, code, params) {
      if (_censorErrors) {
        return this.makeError("censored error", code, {});
      }
      if (!code) {
        code = Logger2.errors.UNKNOWN_ERROR;
      }
      if (!params) {
        params = {};
      }
      var messageDetails = [];
      Object.keys(params).forEach(function(key) {
        var value = params[key];
        try {
          if (value instanceof Uint8Array) {
            var hex = "";
            for (var i = 0;i < value.length; i++) {
              hex += HEX[value[i] >> 4];
              hex += HEX[value[i] & 15];
            }
            messageDetails.push(key + "=Uint8Array(0x" + hex + ")");
          } else {
            messageDetails.push(key + "=" + JSON.stringify(value));
          }
        } catch (error2) {
          messageDetails.push(key + "=" + JSON.stringify(params[key].toString()));
        }
      });
      messageDetails.push("code=" + code);
      messageDetails.push("version=" + this.version);
      var reason = message;
      var url = "";
      switch (code) {
        case ErrorCode.NUMERIC_FAULT: {
          url = "NUMERIC_FAULT";
          var fault = message;
          switch (fault) {
            case "overflow":
            case "underflow":
            case "division-by-zero":
              url += "-" + fault;
              break;
            case "negative-power":
            case "negative-width":
              url += "-unsupported";
              break;
            case "unbound-bitwise-result":
              url += "-unbound-result";
              break;
          }
          break;
        }
        case ErrorCode.CALL_EXCEPTION:
        case ErrorCode.INSUFFICIENT_FUNDS:
        case ErrorCode.MISSING_NEW:
        case ErrorCode.NONCE_EXPIRED:
        case ErrorCode.REPLACEMENT_UNDERPRICED:
        case ErrorCode.TRANSACTION_REPLACED:
        case ErrorCode.UNPREDICTABLE_GAS_LIMIT:
          url = code;
          break;
      }
      if (url) {
        message += " [ See: https://links.ethers.org/v5-errors-" + url + " ]";
      }
      if (messageDetails.length) {
        message += " (" + messageDetails.join(", ") + ")";
      }
      var error = new Error(message);
      error.reason = reason;
      error.code = code;
      Object.keys(params).forEach(function(key) {
        error[key] = params[key];
      });
      return error;
    };
    Logger2.prototype.throwError = function(message, code, params) {
      throw this.makeError(message, code, params);
    };
    Logger2.prototype.throwArgumentError = function(message, name, value) {
      return this.throwError(message, Logger2.errors.INVALID_ARGUMENT, {
        argument: name,
        value
      });
    };
    Logger2.prototype.assert = function(condition, message, code, params) {
      if (!!condition) {
        return;
      }
      this.throwError(message, code, params);
    };
    Logger2.prototype.assertArgument = function(condition, message, name, value) {
      if (!!condition) {
        return;
      }
      this.throwArgumentError(message, name, value);
    };
    Logger2.prototype.checkNormalize = function(message) {
      if (message == null) {
        message = "platform missing String.prototype.normalize";
      }
      if (_normalizeError) {
        this.throwError("platform missing String.prototype.normalize", Logger2.errors.UNSUPPORTED_OPERATION, {
          operation: "String.prototype.normalize",
          form: _normalizeError
        });
      }
    };
    Logger2.prototype.checkSafeUint53 = function(value, message) {
      if (typeof value !== "number") {
        return;
      }
      if (message == null) {
        message = "value not safe";
      }
      if (value < 0 || value >= 9007199254740991) {
        this.throwError(message, Logger2.errors.NUMERIC_FAULT, {
          operation: "checkSafeInteger",
          fault: "out-of-safe-range",
          value
        });
      }
      if (value % 1) {
        this.throwError(message, Logger2.errors.NUMERIC_FAULT, {
          operation: "checkSafeInteger",
          fault: "non-integer",
          value
        });
      }
    };
    Logger2.prototype.checkArgumentCount = function(count, expectedCount, message) {
      if (message) {
        message = ": " + message;
      } else {
        message = "";
      }
      if (count < expectedCount) {
        this.throwError("missing argument" + message, Logger2.errors.MISSING_ARGUMENT, {
          count,
          expectedCount
        });
      }
      if (count > expectedCount) {
        this.throwError("too many arguments" + message, Logger2.errors.UNEXPECTED_ARGUMENT, {
          count,
          expectedCount
        });
      }
    };
    Logger2.prototype.checkNew = function(target, kind) {
      if (target === Object || target == null) {
        this.throwError("missing new", Logger2.errors.MISSING_NEW, { name: kind.name });
      }
    };
    Logger2.prototype.checkAbstract = function(target, kind) {
      if (target === kind) {
        this.throwError("cannot instantiate abstract class " + JSON.stringify(kind.name) + " directly; use a sub-class", Logger2.errors.UNSUPPORTED_OPERATION, { name: target.name, operation: "new" });
      } else if (target === Object || target == null) {
        this.throwError("missing new", Logger2.errors.MISSING_NEW, { name: kind.name });
      }
    };
    Logger2.globalLogger = function() {
      if (!_globalLogger) {
        _globalLogger = new Logger2(_version_1.version);
      }
      return _globalLogger;
    };
    Logger2.setCensorship = function(censorship, permanent) {
      if (!censorship && permanent) {
        this.globalLogger().throwError("cannot permanently disable censorship", Logger2.errors.UNSUPPORTED_OPERATION, {
          operation: "setCensorship"
        });
      }
      if (_permanentCensorErrors) {
        if (!censorship) {
          return;
        }
        this.globalLogger().throwError("error censorship permanent", Logger2.errors.UNSUPPORTED_OPERATION, {
          operation: "setCensorship"
        });
      }
      _censorErrors = !!censorship;
      _permanentCensorErrors = !!permanent;
    };
    Logger2.setLogLevel = function(logLevel) {
      var level = LogLevels[logLevel.toLowerCase()];
      if (level == null) {
        Logger2.globalLogger().warn("invalid log level - " + logLevel);
        return;
      }
      _logLevel = level;
    };
    Logger2.from = function(version) {
      return new Logger2(version);
    };
    Logger2.errors = ErrorCode;
    Logger2.levels = LogLevel;
    return Logger2;
  }();
  exports.Logger = Logger;
});

// node_modules/@ethersproject/bytes/lib/_version.js
var require__version2 = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.version = undefined;
  exports.version = "bytes/5.7.0";
});

// node_modules/@ethersproject/bytes/lib/index.js
var require_lib2 = __commonJS((exports) => {
  var isHexable = function(value) {
    return !!value.toHexString;
  };
  var addSlice = function(array) {
    if (array.slice) {
      return array;
    }
    array.slice = function() {
      var args = Array.prototype.slice.call(arguments);
      return addSlice(new Uint8Array(Array.prototype.slice.apply(array, args)));
    };
    return array;
  };
  var isBytesLike = function(value) {
    return isHexString(value) && !(value.length % 2) || isBytes(value);
  };
  var isInteger = function(value) {
    return typeof value === "number" && value == value && value % 1 === 0;
  };
  var isBytes = function(value) {
    if (value == null) {
      return false;
    }
    if (value.constructor === Uint8Array) {
      return true;
    }
    if (typeof value === "string") {
      return false;
    }
    if (!isInteger(value.length) || value.length < 0) {
      return false;
    }
    for (var i = 0;i < value.length; i++) {
      var v2 = value[i];
      if (!isInteger(v2) || v2 < 0 || v2 >= 256) {
        return false;
      }
    }
    return true;
  };
  var arrayify = function(value, options) {
    if (!options) {
      options = {};
    }
    if (typeof value === "number") {
      logger.checkSafeUint53(value, "invalid arrayify value");
      var result = [];
      while (value) {
        result.unshift(value & 255);
        value = parseInt(String(value / 256));
      }
      if (result.length === 0) {
        result.push(0);
      }
      return addSlice(new Uint8Array(result));
    }
    if (options.allowMissingPrefix && typeof value === "string" && value.substring(0, 2) !== "0x") {
      value = "0x" + value;
    }
    if (isHexable(value)) {
      value = value.toHexString();
    }
    if (isHexString(value)) {
      var hex = value.substring(2);
      if (hex.length % 2) {
        if (options.hexPad === "left") {
          hex = "0" + hex;
        } else if (options.hexPad === "right") {
          hex += "0";
        } else {
          logger.throwArgumentError("hex data is odd-length", "value", value);
        }
      }
      var result = [];
      for (var i = 0;i < hex.length; i += 2) {
        result.push(parseInt(hex.substring(i, i + 2), 16));
      }
      return addSlice(new Uint8Array(result));
    }
    if (isBytes(value)) {
      return addSlice(new Uint8Array(value));
    }
    return logger.throwArgumentError("invalid arrayify value", "value", value);
  };
  var concat = function(items) {
    var objects = items.map(function(item) {
      return arrayify(item);
    });
    var length = objects.reduce(function(accum, item) {
      return accum + item.length;
    }, 0);
    var result = new Uint8Array(length);
    objects.reduce(function(offset, object) {
      result.set(object, offset);
      return offset + object.length;
    }, 0);
    return addSlice(result);
  };
  var stripZeros = function(value) {
    var result = arrayify(value);
    if (result.length === 0) {
      return result;
    }
    var start = 0;
    while (start < result.length && result[start] === 0) {
      start++;
    }
    if (start) {
      result = result.slice(start);
    }
    return result;
  };
  var zeroPad = function(value, length) {
    value = arrayify(value);
    if (value.length > length) {
      logger.throwArgumentError("value out of range", "value", arguments[0]);
    }
    var result = new Uint8Array(length);
    result.set(value, length - value.length);
    return addSlice(result);
  };
  var isHexString = function(value, length) {
    if (typeof value !== "string" || !value.match(/^0x[0-9A-Fa-f]*$/)) {
      return false;
    }
    if (length && value.length !== 2 + 2 * length) {
      return false;
    }
    return true;
  };
  var hexlify = function(value, options) {
    if (!options) {
      options = {};
    }
    if (typeof value === "number") {
      logger.checkSafeUint53(value, "invalid hexlify value");
      var hex = "";
      while (value) {
        hex = HexCharacters[value & 15] + hex;
        value = Math.floor(value / 16);
      }
      if (hex.length) {
        if (hex.length % 2) {
          hex = "0" + hex;
        }
        return "0x" + hex;
      }
      return "0x00";
    }
    if (typeof value === "bigint") {
      value = value.toString(16);
      if (value.length % 2) {
        return "0x0" + value;
      }
      return "0x" + value;
    }
    if (options.allowMissingPrefix && typeof value === "string" && value.substring(0, 2) !== "0x") {
      value = "0x" + value;
    }
    if (isHexable(value)) {
      return value.toHexString();
    }
    if (isHexString(value)) {
      if (value.length % 2) {
        if (options.hexPad === "left") {
          value = "0x0" + value.substring(2);
        } else if (options.hexPad === "right") {
          value += "0";
        } else {
          logger.throwArgumentError("hex data is odd-length", "value", value);
        }
      }
      return value.toLowerCase();
    }
    if (isBytes(value)) {
      var result = "0x";
      for (var i = 0;i < value.length; i++) {
        var v2 = value[i];
        result += HexCharacters[(v2 & 240) >> 4] + HexCharacters[v2 & 15];
      }
      return result;
    }
    return logger.throwArgumentError("invalid hexlify value", "value", value);
  };
  var hexDataLength = function(data) {
    if (typeof data !== "string") {
      data = hexlify(data);
    } else if (!isHexString(data) || data.length % 2) {
      return null;
    }
    return (data.length - 2) / 2;
  };
  var hexDataSlice = function(data, offset, endOffset) {
    if (typeof data !== "string") {
      data = hexlify(data);
    } else if (!isHexString(data) || data.length % 2) {
      logger.throwArgumentError("invalid hexData", "value", data);
    }
    offset = 2 + 2 * offset;
    if (endOffset != null) {
      return "0x" + data.substring(offset, 2 + 2 * endOffset);
    }
    return "0x" + data.substring(offset);
  };
  var hexConcat = function(items) {
    var result = "0x";
    items.forEach(function(item) {
      result += hexlify(item).substring(2);
    });
    return result;
  };
  var hexValue = function(value) {
    var trimmed = hexStripZeros(hexlify(value, { hexPad: "left" }));
    if (trimmed === "0x") {
      return "0x0";
    }
    return trimmed;
  };
  var hexStripZeros = function(value) {
    if (typeof value !== "string") {
      value = hexlify(value);
    }
    if (!isHexString(value)) {
      logger.throwArgumentError("invalid hex string", "value", value);
    }
    value = value.substring(2);
    var offset = 0;
    while (offset < value.length && value[offset] === "0") {
      offset++;
    }
    return "0x" + value.substring(offset);
  };
  var hexZeroPad = function(value, length) {
    if (typeof value !== "string") {
      value = hexlify(value);
    } else if (!isHexString(value)) {
      logger.throwArgumentError("invalid hex string", "value", value);
    }
    if (value.length > 2 * length + 2) {
      logger.throwArgumentError("value out of range", "value", arguments[1]);
    }
    while (value.length < 2 * length + 2) {
      value = "0x0" + value.substring(2);
    }
    return value;
  };
  var splitSignature = function(signature) {
    var result = {
      r: "0x",
      s: "0x",
      _vs: "0x",
      recoveryParam: 0,
      v: 0,
      yParityAndS: "0x",
      compact: "0x"
    };
    if (isBytesLike(signature)) {
      var bytes = arrayify(signature);
      if (bytes.length === 64) {
        result.v = 27 + (bytes[32] >> 7);
        bytes[32] &= 127;
        result.r = hexlify(bytes.slice(0, 32));
        result.s = hexlify(bytes.slice(32, 64));
      } else if (bytes.length === 65) {
        result.r = hexlify(bytes.slice(0, 32));
        result.s = hexlify(bytes.slice(32, 64));
        result.v = bytes[64];
      } else {
        logger.throwArgumentError("invalid signature string", "signature", signature);
      }
      if (result.v < 27) {
        if (result.v === 0 || result.v === 1) {
          result.v += 27;
        } else {
          logger.throwArgumentError("signature invalid v byte", "signature", signature);
        }
      }
      result.recoveryParam = 1 - result.v % 2;
      if (result.recoveryParam) {
        bytes[32] |= 128;
      }
      result._vs = hexlify(bytes.slice(32, 64));
    } else {
      result.r = signature.r;
      result.s = signature.s;
      result.v = signature.v;
      result.recoveryParam = signature.recoveryParam;
      result._vs = signature._vs;
      if (result._vs != null) {
        var vs_1 = zeroPad(arrayify(result._vs), 32);
        result._vs = hexlify(vs_1);
        var recoveryParam = vs_1[0] >= 128 ? 1 : 0;
        if (result.recoveryParam == null) {
          result.recoveryParam = recoveryParam;
        } else if (result.recoveryParam !== recoveryParam) {
          logger.throwArgumentError("signature recoveryParam mismatch _vs", "signature", signature);
        }
        vs_1[0] &= 127;
        var s = hexlify(vs_1);
        if (result.s == null) {
          result.s = s;
        } else if (result.s !== s) {
          logger.throwArgumentError("signature v mismatch _vs", "signature", signature);
        }
      }
      if (result.recoveryParam == null) {
        if (result.v == null) {
          logger.throwArgumentError("signature missing v and recoveryParam", "signature", signature);
        } else if (result.v === 0 || result.v === 1) {
          result.recoveryParam = result.v;
        } else {
          result.recoveryParam = 1 - result.v % 2;
        }
      } else {
        if (result.v == null) {
          result.v = 27 + result.recoveryParam;
        } else {
          var recId = result.v === 0 || result.v === 1 ? result.v : 1 - result.v % 2;
          if (result.recoveryParam !== recId) {
            logger.throwArgumentError("signature recoveryParam mismatch v", "signature", signature);
          }
        }
      }
      if (result.r == null || !isHexString(result.r)) {
        logger.throwArgumentError("signature missing or invalid r", "signature", signature);
      } else {
        result.r = hexZeroPad(result.r, 32);
      }
      if (result.s == null || !isHexString(result.s)) {
        logger.throwArgumentError("signature missing or invalid s", "signature", signature);
      } else {
        result.s = hexZeroPad(result.s, 32);
      }
      var vs = arrayify(result.s);
      if (vs[0] >= 128) {
        logger.throwArgumentError("signature s out of range", "signature", signature);
      }
      if (result.recoveryParam) {
        vs[0] |= 128;
      }
      var _vs = hexlify(vs);
      if (result._vs) {
        if (!isHexString(result._vs)) {
          logger.throwArgumentError("signature invalid _vs", "signature", signature);
        }
        result._vs = hexZeroPad(result._vs, 32);
      }
      if (result._vs == null) {
        result._vs = _vs;
      } else if (result._vs !== _vs) {
        logger.throwArgumentError("signature _vs mismatch v and s", "signature", signature);
      }
    }
    result.yParityAndS = result._vs;
    result.compact = result.r + result.yParityAndS.substring(2);
    return result;
  };
  var joinSignature = function(signature) {
    signature = splitSignature(signature);
    return hexlify(concat([
      signature.r,
      signature.s,
      signature.recoveryParam ? "0x1c" : "0x1b"
    ]));
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.joinSignature = exports.splitSignature = exports.hexZeroPad = exports.hexStripZeros = exports.hexValue = exports.hexConcat = exports.hexDataSlice = exports.hexDataLength = exports.hexlify = exports.isHexString = exports.zeroPad = exports.stripZeros = exports.concat = exports.arrayify = exports.isBytes = exports.isBytesLike = undefined;
  var logger_1 = require_lib();
  var _version_1 = require__version2();
  var logger = new logger_1.Logger(_version_1.version);
  exports.isBytesLike = isBytesLike;
  exports.isBytes = isBytes;
  exports.arrayify = arrayify;
  exports.concat = concat;
  exports.stripZeros = stripZeros;
  exports.zeroPad = zeroPad;
  exports.isHexString = isHexString;
  var HexCharacters = "0123456789abcdef";
  exports.hexlify = hexlify;
  exports.hexDataLength = hexDataLength;
  exports.hexDataSlice = hexDataSlice;
  exports.hexConcat = hexConcat;
  exports.hexValue = hexValue;
  exports.hexStripZeros = hexStripZeros;
  exports.hexZeroPad = hexZeroPad;
  exports.splitSignature = splitSignature;
  exports.joinSignature = joinSignature;
});

// node_modules/@ethersproject/bignumber/lib/_version.js
var require__version3 = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.version = undefined;
  exports.version = "bignumber/5.7.0";
});

// node_modules/@ethersproject/bignumber/lib/bignumber.js
var require_bignumber = __commonJS((exports) => {
  var isBigNumberish = function(value) {
    return value != null && (BigNumber.isBigNumber(value) || typeof value === "number" && value % 1 === 0 || typeof value === "string" && !!value.match(/^-?[0-9]+$/) || (0, bytes_1.isHexString)(value) || typeof value === "bigint" || (0, bytes_1.isBytes)(value));
  };
  var toHex = function(value) {
    if (typeof value !== "string") {
      return toHex(value.toString(16));
    }
    if (value[0] === "-") {
      value = value.substring(1);
      if (value[0] === "-") {
        logger.throwArgumentError("invalid hex", "value", value);
      }
      value = toHex(value);
      if (value === "0x00") {
        return value;
      }
      return "-" + value;
    }
    if (value.substring(0, 2) !== "0x") {
      value = "0x" + value;
    }
    if (value === "0x") {
      return "0x00";
    }
    if (value.length % 2) {
      value = "0x0" + value.substring(2);
    }
    while (value.length > 4 && value.substring(0, 4) === "0x00") {
      value = "0x" + value.substring(4);
    }
    return value;
  };
  var toBigNumber = function(value) {
    return BigNumber.from(toHex(value));
  };
  var toBN = function(value) {
    var hex = BigNumber.from(value).toHexString();
    if (hex[0] === "-") {
      return new BN("-" + hex.substring(3), 16);
    }
    return new BN(hex.substring(2), 16);
  };
  var throwFault = function(fault, operation, value) {
    var params = { fault, operation };
    if (value != null) {
      params.value = value;
    }
    return logger.throwError(fault, logger_1.Logger.errors.NUMERIC_FAULT, params);
  };
  var _base36To16 = function(value) {
    return new BN(value, 36).toString(16);
  };
  var _base16To36 = function(value) {
    return new BN(value, 16).toString(36);
  };
  var __importDefault = exports && exports.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports._base16To36 = exports._base36To16 = exports.BigNumber = exports.isBigNumberish = undefined;
  var bn_js_1 = __importDefault(require_bn());
  var BN = bn_js_1.default.BN;
  var bytes_1 = require_lib2();
  var logger_1 = require_lib();
  var _version_1 = require__version3();
  var logger = new logger_1.Logger(_version_1.version);
  var _constructorGuard = {};
  var MAX_SAFE = 9007199254740991;
  exports.isBigNumberish = isBigNumberish;
  var _warnedToStringRadix = false;
  var BigNumber = function() {
    function BigNumber2(constructorGuard, hex) {
      if (constructorGuard !== _constructorGuard) {
        logger.throwError("cannot call constructor directly; use BigNumber.from", logger_1.Logger.errors.UNSUPPORTED_OPERATION, {
          operation: "new (BigNumber)"
        });
      }
      this._hex = hex;
      this._isBigNumber = true;
      Object.freeze(this);
    }
    BigNumber2.prototype.fromTwos = function(value) {
      return toBigNumber(toBN(this).fromTwos(value));
    };
    BigNumber2.prototype.toTwos = function(value) {
      return toBigNumber(toBN(this).toTwos(value));
    };
    BigNumber2.prototype.abs = function() {
      if (this._hex[0] === "-") {
        return BigNumber2.from(this._hex.substring(1));
      }
      return this;
    };
    BigNumber2.prototype.add = function(other) {
      return toBigNumber(toBN(this).add(toBN(other)));
    };
    BigNumber2.prototype.sub = function(other) {
      return toBigNumber(toBN(this).sub(toBN(other)));
    };
    BigNumber2.prototype.div = function(other) {
      var o = BigNumber2.from(other);
      if (o.isZero()) {
        throwFault("division-by-zero", "div");
      }
      return toBigNumber(toBN(this).div(toBN(other)));
    };
    BigNumber2.prototype.mul = function(other) {
      return toBigNumber(toBN(this).mul(toBN(other)));
    };
    BigNumber2.prototype.mod = function(other) {
      var value = toBN(other);
      if (value.isNeg()) {
        throwFault("division-by-zero", "mod");
      }
      return toBigNumber(toBN(this).umod(value));
    };
    BigNumber2.prototype.pow = function(other) {
      var value = toBN(other);
      if (value.isNeg()) {
        throwFault("negative-power", "pow");
      }
      return toBigNumber(toBN(this).pow(value));
    };
    BigNumber2.prototype.and = function(other) {
      var value = toBN(other);
      if (this.isNegative() || value.isNeg()) {
        throwFault("unbound-bitwise-result", "and");
      }
      return toBigNumber(toBN(this).and(value));
    };
    BigNumber2.prototype.or = function(other) {
      var value = toBN(other);
      if (this.isNegative() || value.isNeg()) {
        throwFault("unbound-bitwise-result", "or");
      }
      return toBigNumber(toBN(this).or(value));
    };
    BigNumber2.prototype.xor = function(other) {
      var value = toBN(other);
      if (this.isNegative() || value.isNeg()) {
        throwFault("unbound-bitwise-result", "xor");
      }
      return toBigNumber(toBN(this).xor(value));
    };
    BigNumber2.prototype.mask = function(value) {
      if (this.isNegative() || value < 0) {
        throwFault("negative-width", "mask");
      }
      return toBigNumber(toBN(this).maskn(value));
    };
    BigNumber2.prototype.shl = function(value) {
      if (this.isNegative() || value < 0) {
        throwFault("negative-width", "shl");
      }
      return toBigNumber(toBN(this).shln(value));
    };
    BigNumber2.prototype.shr = function(value) {
      if (this.isNegative() || value < 0) {
        throwFault("negative-width", "shr");
      }
      return toBigNumber(toBN(this).shrn(value));
    };
    BigNumber2.prototype.eq = function(other) {
      return toBN(this).eq(toBN(other));
    };
    BigNumber2.prototype.lt = function(other) {
      return toBN(this).lt(toBN(other));
    };
    BigNumber2.prototype.lte = function(other) {
      return toBN(this).lte(toBN(other));
    };
    BigNumber2.prototype.gt = function(other) {
      return toBN(this).gt(toBN(other));
    };
    BigNumber2.prototype.gte = function(other) {
      return toBN(this).gte(toBN(other));
    };
    BigNumber2.prototype.isNegative = function() {
      return this._hex[0] === "-";
    };
    BigNumber2.prototype.isZero = function() {
      return toBN(this).isZero();
    };
    BigNumber2.prototype.toNumber = function() {
      try {
        return toBN(this).toNumber();
      } catch (error) {
        throwFault("overflow", "toNumber", this.toString());
      }
      return null;
    };
    BigNumber2.prototype.toBigInt = function() {
      try {
        return BigInt(this.toString());
      } catch (e) {
      }
      return logger.throwError("this platform does not support BigInt", logger_1.Logger.errors.UNSUPPORTED_OPERATION, {
        value: this.toString()
      });
    };
    BigNumber2.prototype.toString = function() {
      if (arguments.length > 0) {
        if (arguments[0] === 10) {
          if (!_warnedToStringRadix) {
            _warnedToStringRadix = true;
            logger.warn("BigNumber.toString does not accept any parameters; base-10 is assumed");
          }
        } else if (arguments[0] === 16) {
          logger.throwError("BigNumber.toString does not accept any parameters; use bigNumber.toHexString()", logger_1.Logger.errors.UNEXPECTED_ARGUMENT, {});
        } else {
          logger.throwError("BigNumber.toString does not accept parameters", logger_1.Logger.errors.UNEXPECTED_ARGUMENT, {});
        }
      }
      return toBN(this).toString(10);
    };
    BigNumber2.prototype.toHexString = function() {
      return this._hex;
    };
    BigNumber2.prototype.toJSON = function(key) {
      return { type: "BigNumber", hex: this.toHexString() };
    };
    BigNumber2.from = function(value) {
      if (value instanceof BigNumber2) {
        return value;
      }
      if (typeof value === "string") {
        if (value.match(/^-?0x[0-9a-f]+$/i)) {
          return new BigNumber2(_constructorGuard, toHex(value));
        }
        if (value.match(/^-?[0-9]+$/)) {
          return new BigNumber2(_constructorGuard, toHex(new BN(value)));
        }
        return logger.throwArgumentError("invalid BigNumber string", "value", value);
      }
      if (typeof value === "number") {
        if (value % 1) {
          throwFault("underflow", "BigNumber.from", value);
        }
        if (value >= MAX_SAFE || value <= -MAX_SAFE) {
          throwFault("overflow", "BigNumber.from", value);
        }
        return BigNumber2.from(String(value));
      }
      var anyValue = value;
      if (typeof anyValue === "bigint") {
        return BigNumber2.from(anyValue.toString());
      }
      if ((0, bytes_1.isBytes)(anyValue)) {
        return BigNumber2.from((0, bytes_1.hexlify)(anyValue));
      }
      if (anyValue) {
        if (anyValue.toHexString) {
          var hex = anyValue.toHexString();
          if (typeof hex === "string") {
            return BigNumber2.from(hex);
          }
        } else {
          var hex = anyValue._hex;
          if (hex == null && anyValue.type === "BigNumber") {
            hex = anyValue.hex;
          }
          if (typeof hex === "string") {
            if ((0, bytes_1.isHexString)(hex) || hex[0] === "-" && (0, bytes_1.isHexString)(hex.substring(1))) {
              return BigNumber2.from(hex);
            }
          }
        }
      }
      return logger.throwArgumentError("invalid BigNumber value", "value", value);
    };
    BigNumber2.isBigNumber = function(value) {
      return !!(value && value._isBigNumber);
    };
    return BigNumber2;
  }();
  exports.BigNumber = BigNumber;
  exports._base36To16 = _base36To16;
  exports._base16To36 = _base16To36;
});

// node_modules/@ethersproject/bignumber/lib/fixednumber.js
var require_fixednumber = __commonJS((exports) => {
  var throwFault = function(message, fault, operation, value) {
    var params = { fault, operation };
    if (value !== undefined) {
      params.value = value;
    }
    return logger.throwError(message, logger_1.Logger.errors.NUMERIC_FAULT, params);
  };
  var getMultiplier = function(decimals) {
    if (typeof decimals !== "number") {
      try {
        decimals = bignumber_1.BigNumber.from(decimals).toNumber();
      } catch (e) {
      }
    }
    if (typeof decimals === "number" && decimals >= 0 && decimals <= 256 && !(decimals % 1)) {
      return "1" + zeros.substring(0, decimals);
    }
    return logger.throwArgumentError("invalid decimal size", "decimals", decimals);
  };
  var formatFixed = function(value, decimals) {
    if (decimals == null) {
      decimals = 0;
    }
    var multiplier = getMultiplier(decimals);
    value = bignumber_1.BigNumber.from(value);
    var negative = value.lt(Zero);
    if (negative) {
      value = value.mul(NegativeOne);
    }
    var fraction = value.mod(multiplier).toString();
    while (fraction.length < multiplier.length - 1) {
      fraction = "0" + fraction;
    }
    fraction = fraction.match(/^([0-9]*[1-9]|0)(0*)/)[1];
    var whole = value.div(multiplier).toString();
    if (multiplier.length === 1) {
      value = whole;
    } else {
      value = whole + "." + fraction;
    }
    if (negative) {
      value = "-" + value;
    }
    return value;
  };
  var parseFixed = function(value, decimals) {
    if (decimals == null) {
      decimals = 0;
    }
    var multiplier = getMultiplier(decimals);
    if (typeof value !== "string" || !value.match(/^-?[0-9.]+$/)) {
      logger.throwArgumentError("invalid decimal value", "value", value);
    }
    var negative = value.substring(0, 1) === "-";
    if (negative) {
      value = value.substring(1);
    }
    if (value === ".") {
      logger.throwArgumentError("missing value", "value", value);
    }
    var comps = value.split(".");
    if (comps.length > 2) {
      logger.throwArgumentError("too many decimal points", "value", value);
    }
    var whole = comps[0], fraction = comps[1];
    if (!whole) {
      whole = "0";
    }
    if (!fraction) {
      fraction = "0";
    }
    while (fraction[fraction.length - 1] === "0") {
      fraction = fraction.substring(0, fraction.length - 1);
    }
    if (fraction.length > multiplier.length - 1) {
      throwFault("fractional component exceeds decimals", "underflow", "parseFixed");
    }
    if (fraction === "") {
      fraction = "0";
    }
    while (fraction.length < multiplier.length - 1) {
      fraction += "0";
    }
    var wholeValue = bignumber_1.BigNumber.from(whole);
    var fractionValue = bignumber_1.BigNumber.from(fraction);
    var wei = wholeValue.mul(multiplier).add(fractionValue);
    if (negative) {
      wei = wei.mul(NegativeOne);
    }
    return wei;
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.FixedNumber = exports.FixedFormat = exports.parseFixed = exports.formatFixed = undefined;
  var bytes_1 = require_lib2();
  var logger_1 = require_lib();
  var _version_1 = require__version3();
  var logger = new logger_1.Logger(_version_1.version);
  var bignumber_1 = require_bignumber();
  var _constructorGuard = {};
  var Zero = bignumber_1.BigNumber.from(0);
  var NegativeOne = bignumber_1.BigNumber.from(-1);
  var zeros = "0";
  while (zeros.length < 256) {
    zeros += zeros;
  }
  exports.formatFixed = formatFixed;
  exports.parseFixed = parseFixed;
  var FixedFormat = function() {
    function FixedFormat2(constructorGuard, signed, width, decimals) {
      if (constructorGuard !== _constructorGuard) {
        logger.throwError("cannot use FixedFormat constructor; use FixedFormat.from", logger_1.Logger.errors.UNSUPPORTED_OPERATION, {
          operation: "new FixedFormat"
        });
      }
      this.signed = signed;
      this.width = width;
      this.decimals = decimals;
      this.name = (signed ? "" : "u") + "fixed" + String(width) + "x" + String(decimals);
      this._multiplier = getMultiplier(decimals);
      Object.freeze(this);
    }
    FixedFormat2.from = function(value) {
      if (value instanceof FixedFormat2) {
        return value;
      }
      if (typeof value === "number") {
        value = "fixed128x" + value;
      }
      var signed = true;
      var width = 128;
      var decimals = 18;
      if (typeof value === "string") {
        if (value === "fixed") {
        } else if (value === "ufixed") {
          signed = false;
        } else {
          var match = value.match(/^(u?)fixed([0-9]+)x([0-9]+)$/);
          if (!match) {
            logger.throwArgumentError("invalid fixed format", "format", value);
          }
          signed = match[1] !== "u";
          width = parseInt(match[2]);
          decimals = parseInt(match[3]);
        }
      } else if (value) {
        var check = function(key, type, defaultValue) {
          if (value[key] == null) {
            return defaultValue;
          }
          if (typeof value[key] !== type) {
            logger.throwArgumentError("invalid fixed format (" + key + " not " + type + ")", "format." + key, value[key]);
          }
          return value[key];
        };
        signed = check("signed", "boolean", signed);
        width = check("width", "number", width);
        decimals = check("decimals", "number", decimals);
      }
      if (width % 8) {
        logger.throwArgumentError("invalid fixed format width (not byte aligned)", "format.width", width);
      }
      if (decimals > 80) {
        logger.throwArgumentError("invalid fixed format (decimals too large)", "format.decimals", decimals);
      }
      return new FixedFormat2(_constructorGuard, signed, width, decimals);
    };
    return FixedFormat2;
  }();
  exports.FixedFormat = FixedFormat;
  var FixedNumber = function() {
    function FixedNumber2(constructorGuard, hex, value, format) {
      if (constructorGuard !== _constructorGuard) {
        logger.throwError("cannot use FixedNumber constructor; use FixedNumber.from", logger_1.Logger.errors.UNSUPPORTED_OPERATION, {
          operation: "new FixedFormat"
        });
      }
      this.format = format;
      this._hex = hex;
      this._value = value;
      this._isFixedNumber = true;
      Object.freeze(this);
    }
    FixedNumber2.prototype._checkFormat = function(other) {
      if (this.format.name !== other.format.name) {
        logger.throwArgumentError("incompatible format; use fixedNumber.toFormat", "other", other);
      }
    };
    FixedNumber2.prototype.addUnsafe = function(other) {
      this._checkFormat(other);
      var a = parseFixed(this._value, this.format.decimals);
      var b2 = parseFixed(other._value, other.format.decimals);
      return FixedNumber2.fromValue(a.add(b2), this.format.decimals, this.format);
    };
    FixedNumber2.prototype.subUnsafe = function(other) {
      this._checkFormat(other);
      var a = parseFixed(this._value, this.format.decimals);
      var b2 = parseFixed(other._value, other.format.decimals);
      return FixedNumber2.fromValue(a.sub(b2), this.format.decimals, this.format);
    };
    FixedNumber2.prototype.mulUnsafe = function(other) {
      this._checkFormat(other);
      var a = parseFixed(this._value, this.format.decimals);
      var b2 = parseFixed(other._value, other.format.decimals);
      return FixedNumber2.fromValue(a.mul(b2).div(this.format._multiplier), this.format.decimals, this.format);
    };
    FixedNumber2.prototype.divUnsafe = function(other) {
      this._checkFormat(other);
      var a = parseFixed(this._value, this.format.decimals);
      var b2 = parseFixed(other._value, other.format.decimals);
      return FixedNumber2.fromValue(a.mul(this.format._multiplier).div(b2), this.format.decimals, this.format);
    };
    FixedNumber2.prototype.floor = function() {
      var comps = this.toString().split(".");
      if (comps.length === 1) {
        comps.push("0");
      }
      var result = FixedNumber2.from(comps[0], this.format);
      var hasFraction = !comps[1].match(/^(0*)$/);
      if (this.isNegative() && hasFraction) {
        result = result.subUnsafe(ONE.toFormat(result.format));
      }
      return result;
    };
    FixedNumber2.prototype.ceiling = function() {
      var comps = this.toString().split(".");
      if (comps.length === 1) {
        comps.push("0");
      }
      var result = FixedNumber2.from(comps[0], this.format);
      var hasFraction = !comps[1].match(/^(0*)$/);
      if (!this.isNegative() && hasFraction) {
        result = result.addUnsafe(ONE.toFormat(result.format));
      }
      return result;
    };
    FixedNumber2.prototype.round = function(decimals) {
      if (decimals == null) {
        decimals = 0;
      }
      var comps = this.toString().split(".");
      if (comps.length === 1) {
        comps.push("0");
      }
      if (decimals < 0 || decimals > 80 || decimals % 1) {
        logger.throwArgumentError("invalid decimal count", "decimals", decimals);
      }
      if (comps[1].length <= decimals) {
        return this;
      }
      var factor = FixedNumber2.from("1" + zeros.substring(0, decimals), this.format);
      var bump = BUMP.toFormat(this.format);
      return this.mulUnsafe(factor).addUnsafe(bump).floor().divUnsafe(factor);
    };
    FixedNumber2.prototype.isZero = function() {
      return this._value === "0.0" || this._value === "0";
    };
    FixedNumber2.prototype.isNegative = function() {
      return this._value[0] === "-";
    };
    FixedNumber2.prototype.toString = function() {
      return this._value;
    };
    FixedNumber2.prototype.toHexString = function(width) {
      if (width == null) {
        return this._hex;
      }
      if (width % 8) {
        logger.throwArgumentError("invalid byte width", "width", width);
      }
      var hex = bignumber_1.BigNumber.from(this._hex).fromTwos(this.format.width).toTwos(width).toHexString();
      return (0, bytes_1.hexZeroPad)(hex, width / 8);
    };
    FixedNumber2.prototype.toUnsafeFloat = function() {
      return parseFloat(this.toString());
    };
    FixedNumber2.prototype.toFormat = function(format) {
      return FixedNumber2.fromString(this._value, format);
    };
    FixedNumber2.fromValue = function(value, decimals, format) {
      if (format == null && decimals != null && !(0, bignumber_1.isBigNumberish)(decimals)) {
        format = decimals;
        decimals = null;
      }
      if (decimals == null) {
        decimals = 0;
      }
      if (format == null) {
        format = "fixed";
      }
      return FixedNumber2.fromString(formatFixed(value, decimals), FixedFormat.from(format));
    };
    FixedNumber2.fromString = function(value, format) {
      if (format == null) {
        format = "fixed";
      }
      var fixedFormat = FixedFormat.from(format);
      var numeric = parseFixed(value, fixedFormat.decimals);
      if (!fixedFormat.signed && numeric.lt(Zero)) {
        throwFault("unsigned value cannot be negative", "overflow", "value", value);
      }
      var hex = null;
      if (fixedFormat.signed) {
        hex = numeric.toTwos(fixedFormat.width).toHexString();
      } else {
        hex = numeric.toHexString();
        hex = (0, bytes_1.hexZeroPad)(hex, fixedFormat.width / 8);
      }
      var decimal = formatFixed(numeric, fixedFormat.decimals);
      return new FixedNumber2(_constructorGuard, hex, decimal, fixedFormat);
    };
    FixedNumber2.fromBytes = function(value, format) {
      if (format == null) {
        format = "fixed";
      }
      var fixedFormat = FixedFormat.from(format);
      if ((0, bytes_1.arrayify)(value).length > fixedFormat.width / 8) {
        throw new Error("overflow");
      }
      var numeric = bignumber_1.BigNumber.from(value);
      if (fixedFormat.signed) {
        numeric = numeric.fromTwos(fixedFormat.width);
      }
      var hex = numeric.toTwos((fixedFormat.signed ? 0 : 1) + fixedFormat.width).toHexString();
      var decimal = formatFixed(numeric, fixedFormat.decimals);
      return new FixedNumber2(_constructorGuard, hex, decimal, fixedFormat);
    };
    FixedNumber2.from = function(value, format) {
      if (typeof value === "string") {
        return FixedNumber2.fromString(value, format);
      }
      if ((0, bytes_1.isBytes)(value)) {
        return FixedNumber2.fromBytes(value, format);
      }
      try {
        return FixedNumber2.fromValue(value, 0, format);
      } catch (error) {
        if (error.code !== logger_1.Logger.errors.INVALID_ARGUMENT) {
          throw error;
        }
      }
      return logger.throwArgumentError("invalid FixedNumber value", "value", value);
    };
    FixedNumber2.isFixedNumber = function(value) {
      return !!(value && value._isFixedNumber);
    };
    return FixedNumber2;
  }();
  exports.FixedNumber = FixedNumber;
  var ONE = FixedNumber.from(1);
  var BUMP = FixedNumber.from("0.5");
});

// node_modules/@ethersproject/bignumber/lib/index.js
var require_lib3 = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports._base36To16 = exports._base16To36 = exports.parseFixed = exports.FixedNumber = exports.FixedFormat = exports.formatFixed = exports.BigNumber = undefined;
  var bignumber_1 = require_bignumber();
  Object.defineProperty(exports, "BigNumber", { enumerable: true, get: function() {
    return bignumber_1.BigNumber;
  } });
  var fixednumber_1 = require_fixednumber();
  Object.defineProperty(exports, "formatFixed", { enumerable: true, get: function() {
    return fixednumber_1.formatFixed;
  } });
  Object.defineProperty(exports, "FixedFormat", { enumerable: true, get: function() {
    return fixednumber_1.FixedFormat;
  } });
  Object.defineProperty(exports, "FixedNumber", { enumerable: true, get: function() {
    return fixednumber_1.FixedNumber;
  } });
  Object.defineProperty(exports, "parseFixed", { enumerable: true, get: function() {
    return fixednumber_1.parseFixed;
  } });
  var bignumber_2 = require_bignumber();
  Object.defineProperty(exports, "_base16To36", { enumerable: true, get: function() {
    return bignumber_2._base16To36;
  } });
  Object.defineProperty(exports, "_base36To16", { enumerable: true, get: function() {
    return bignumber_2._base36To16;
  } });
});

// node_modules/@ethersproject/properties/lib/_version.js
var require__version4 = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.version = undefined;
  exports.version = "properties/5.7.0";
});

// node_modules/@ethersproject/properties/lib/index.js
var require_lib4 = __commonJS((exports) => {
  var defineReadOnly = function(object, name, value) {
    Object.defineProperty(object, name, {
      enumerable: true,
      value,
      writable: false
    });
  };
  var getStatic = function(ctor, key) {
    for (var i = 0;i < 32; i++) {
      if (ctor[key]) {
        return ctor[key];
      }
      if (!ctor.prototype || typeof ctor.prototype !== "object") {
        break;
      }
      ctor = Object.getPrototypeOf(ctor.prototype).constructor;
    }
    return null;
  };
  var resolveProperties = function(object) {
    return __awaiter(this, undefined, undefined, function() {
      var promises, results;
      return __generator(this, function(_a) {
        switch (_a.label) {
          case 0:
            promises = Object.keys(object).map(function(key) {
              var value = object[key];
              return Promise.resolve(value).then(function(v2) {
                return { key, value: v2 };
              });
            });
            return [4, Promise.all(promises)];
          case 1:
            results = _a.sent();
            return [2, results.reduce(function(accum, result) {
              accum[result.key] = result.value;
              return accum;
            }, {})];
        }
      });
    });
  };
  var checkProperties = function(object, properties) {
    if (!object || typeof object !== "object") {
      logger.throwArgumentError("invalid object", "object", object);
    }
    Object.keys(object).forEach(function(key) {
      if (!properties[key]) {
        logger.throwArgumentError("invalid object key - " + key, "transaction:" + key, object);
      }
    });
  };
  var shallowCopy = function(object) {
    var result = {};
    for (var key in object) {
      result[key] = object[key];
    }
    return result;
  };
  var _isFrozen = function(object) {
    if (object === undefined || object === null || opaque[typeof object]) {
      return true;
    }
    if (Array.isArray(object) || typeof object === "object") {
      if (!Object.isFrozen(object)) {
        return false;
      }
      var keys = Object.keys(object);
      for (var i = 0;i < keys.length; i++) {
        var value = null;
        try {
          value = object[keys[i]];
        } catch (error) {
          continue;
        }
        if (!_isFrozen(value)) {
          return false;
        }
      }
      return true;
    }
    return logger.throwArgumentError("Cannot deepCopy " + typeof object, "object", object);
  };
  var _deepCopy = function(object) {
    if (_isFrozen(object)) {
      return object;
    }
    if (Array.isArray(object)) {
      return Object.freeze(object.map(function(item) {
        return deepCopy(item);
      }));
    }
    if (typeof object === "object") {
      var result = {};
      for (var key in object) {
        var value = object[key];
        if (value === undefined) {
          continue;
        }
        defineReadOnly(result, key, deepCopy(value));
      }
      return result;
    }
    return logger.throwArgumentError("Cannot deepCopy " + typeof object, "object", object);
  };
  var deepCopy = function(object) {
    return _deepCopy(object);
  };
  var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  var __generator = exports && exports.__generator || function(thisArg, body) {
    var _2 = { label: 0, sent: function() {
      if (t[0] & 1)
        throw t[1];
      return t[1];
    }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), throw: verb(1), return: verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
      return this;
    }), g;
    function verb(n) {
      return function(v2) {
        return step([n, v2]);
      };
    }
    function step(op) {
      if (f)
        throw new TypeError("Generator is already executing.");
      while (_2)
        try {
          if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
            return t;
          if (y = 0, t)
            op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _2.label++;
              return { value: op[1], done: false };
            case 5:
              _2.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _2.ops.pop();
              _2.trys.pop();
              continue;
            default:
              if (!(t = _2.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                _2 = 0;
                continue;
              }
              if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                _2.label = op[1];
                break;
              }
              if (op[0] === 6 && _2.label < t[1]) {
                _2.label = t[1];
                t = op;
                break;
              }
              if (t && _2.label < t[2]) {
                _2.label = t[2];
                _2.ops.push(op);
                break;
              }
              if (t[2])
                _2.ops.pop();
              _2.trys.pop();
              continue;
          }
          op = body.call(thisArg, _2);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5)
        throw op[1];
      return { value: op[0] ? op[1] : undefined, done: true };
    }
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.Description = exports.deepCopy = exports.shallowCopy = exports.checkProperties = exports.resolveProperties = exports.getStatic = exports.defineReadOnly = undefined;
  var logger_1 = require_lib();
  var _version_1 = require__version4();
  var logger = new logger_1.Logger(_version_1.version);
  exports.defineReadOnly = defineReadOnly;
  exports.getStatic = getStatic;
  exports.resolveProperties = resolveProperties;
  exports.checkProperties = checkProperties;
  exports.shallowCopy = shallowCopy;
  var opaque = { bigint: true, boolean: true, function: true, number: true, string: true };
  exports.deepCopy = deepCopy;
  var Description = function() {
    function Description2(info) {
      for (var key in info) {
        this[key] = deepCopy(info[key]);
      }
    }
    return Description2;
  }();
  exports.Description = Description;
});

// node_modules/@ethersproject/abi/lib/_version.js
var require__version5 = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.version = undefined;
  exports.version = "abi/5.7.0";
});

// node_modules/@ethersproject/abi/lib/fragments.js
var require_fragments = __commonJS((exports) => {
  var checkModifier = function(type, name) {
    if (type === "bytes" || type === "string") {
      if (ModifiersBytes[name]) {
        return true;
      }
    } else if (type === "address") {
      if (name === "payable") {
        return true;
      }
    } else if (type.indexOf("[") >= 0 || type === "tuple") {
      if (ModifiersNest[name]) {
        return true;
      }
    }
    if (ModifiersBytes[name] || name === "payable") {
      logger.throwArgumentError("invalid modifier", "name", name);
    }
    return false;
  };
  var parseParamType = function(param, allowIndexed) {
    var originalParam = param;
    function throwError(i2) {
      logger.throwArgumentError("unexpected character at position " + i2, "param", param);
    }
    param = param.replace(/\s/g, " ");
    function newNode(parent2) {
      var node2 = { type: "", name: "", parent: parent2, state: { allowType: true } };
      if (allowIndexed) {
        node2.indexed = false;
      }
      return node2;
    }
    var parent = { type: "", name: "", state: { allowType: true } };
    var node = parent;
    for (var i = 0;i < param.length; i++) {
      var c = param[i];
      switch (c) {
        case "(":
          if (node.state.allowType && node.type === "") {
            node.type = "tuple";
          } else if (!node.state.allowParams) {
            throwError(i);
          }
          node.state.allowType = false;
          node.type = verifyType(node.type);
          node.components = [newNode(node)];
          node = node.components[0];
          break;
        case ")":
          delete node.state;
          if (node.name === "indexed") {
            if (!allowIndexed) {
              throwError(i);
            }
            node.indexed = true;
            node.name = "";
          }
          if (checkModifier(node.type, node.name)) {
            node.name = "";
          }
          node.type = verifyType(node.type);
          var child = node;
          node = node.parent;
          if (!node) {
            throwError(i);
          }
          delete child.parent;
          node.state.allowParams = false;
          node.state.allowName = true;
          node.state.allowArray = true;
          break;
        case ",":
          delete node.state;
          if (node.name === "indexed") {
            if (!allowIndexed) {
              throwError(i);
            }
            node.indexed = true;
            node.name = "";
          }
          if (checkModifier(node.type, node.name)) {
            node.name = "";
          }
          node.type = verifyType(node.type);
          var sibling = newNode(node.parent);
          node.parent.components.push(sibling);
          delete node.parent;
          node = sibling;
          break;
        case " ":
          if (node.state.allowType) {
            if (node.type !== "") {
              node.type = verifyType(node.type);
              delete node.state.allowType;
              node.state.allowName = true;
              node.state.allowParams = true;
            }
          }
          if (node.state.allowName) {
            if (node.name !== "") {
              if (node.name === "indexed") {
                if (!allowIndexed) {
                  throwError(i);
                }
                if (node.indexed) {
                  throwError(i);
                }
                node.indexed = true;
                node.name = "";
              } else if (checkModifier(node.type, node.name)) {
                node.name = "";
              } else {
                node.state.allowName = false;
              }
            }
          }
          break;
        case "[":
          if (!node.state.allowArray) {
            throwError(i);
          }
          node.type += c;
          node.state.allowArray = false;
          node.state.allowName = false;
          node.state.readArray = true;
          break;
        case "]":
          if (!node.state.readArray) {
            throwError(i);
          }
          node.type += c;
          node.state.readArray = false;
          node.state.allowArray = true;
          node.state.allowName = true;
          break;
        default:
          if (node.state.allowType) {
            node.type += c;
            node.state.allowParams = true;
            node.state.allowArray = true;
          } else if (node.state.allowName) {
            node.name += c;
            delete node.state.allowArray;
          } else if (node.state.readArray) {
            node.type += c;
          } else {
            throwError(i);
          }
      }
    }
    if (node.parent) {
      logger.throwArgumentError("unexpected eof", "param", param);
    }
    delete parent.state;
    if (node.name === "indexed") {
      if (!allowIndexed) {
        throwError(originalParam.length - 7);
      }
      if (node.indexed) {
        throwError(originalParam.length - 7);
      }
      node.indexed = true;
      node.name = "";
    } else if (checkModifier(node.type, node.name)) {
      node.name = "";
    }
    parent.type = verifyType(parent.type);
    return parent;
  };
  var populate = function(object, params) {
    for (var key in params) {
      (0, properties_1.defineReadOnly)(object, key, params[key]);
    }
  };
  var parseParams = function(value, allowIndex) {
    return splitNesting(value).map(function(param) {
      return ParamType.fromString(param, allowIndex);
    });
  };
  var parseGas = function(value, params) {
    params.gas = null;
    var comps = value.split("@");
    if (comps.length !== 1) {
      if (comps.length > 2) {
        logger.throwArgumentError("invalid human-readable ABI signature", "value", value);
      }
      if (!comps[1].match(/^[0-9]+$/)) {
        logger.throwArgumentError("invalid human-readable ABI signature gas", "value", value);
      }
      params.gas = bignumber_1.BigNumber.from(comps[1]);
      return comps[0];
    }
    return value;
  };
  var parseModifiers = function(value, params) {
    params.constant = false;
    params.payable = false;
    params.stateMutability = "nonpayable";
    value.split(" ").forEach(function(modifier) {
      switch (modifier.trim()) {
        case "constant":
          params.constant = true;
          break;
        case "payable":
          params.payable = true;
          params.stateMutability = "payable";
          break;
        case "nonpayable":
          params.payable = false;
          params.stateMutability = "nonpayable";
          break;
        case "pure":
          params.constant = true;
          params.stateMutability = "pure";
          break;
        case "view":
          params.constant = true;
          params.stateMutability = "view";
          break;
        case "external":
        case "public":
        case "":
          break;
        default:
          console.log("unknown modifier: " + modifier);
      }
    });
  };
  var verifyState = function(value) {
    var result = {
      constant: false,
      payable: true,
      stateMutability: "payable"
    };
    if (value.stateMutability != null) {
      result.stateMutability = value.stateMutability;
      result.constant = result.stateMutability === "view" || result.stateMutability === "pure";
      if (value.constant != null) {
        if (!!value.constant !== result.constant) {
          logger.throwArgumentError("cannot have constant function with mutability " + result.stateMutability, "value", value);
        }
      }
      result.payable = result.stateMutability === "payable";
      if (value.payable != null) {
        if (!!value.payable !== result.payable) {
          logger.throwArgumentError("cannot have payable function with mutability " + result.stateMutability, "value", value);
        }
      }
    } else if (value.payable != null) {
      result.payable = !!value.payable;
      if (value.constant == null && !result.payable && value.type !== "constructor") {
        logger.throwArgumentError("unable to determine stateMutability", "value", value);
      }
      result.constant = !!value.constant;
      if (result.constant) {
        result.stateMutability = "view";
      } else {
        result.stateMutability = result.payable ? "payable" : "nonpayable";
      }
      if (result.payable && result.constant) {
        logger.throwArgumentError("cannot have constant payable function", "value", value);
      }
    } else if (value.constant != null) {
      result.constant = !!value.constant;
      result.payable = !result.constant;
      result.stateMutability = result.constant ? "view" : "payable";
    } else if (value.type !== "constructor") {
      logger.throwArgumentError("unable to determine stateMutability", "value", value);
    }
    return result;
  };
  var checkForbidden = function(fragment) {
    var sig = fragment.format();
    if (sig === "Error(string)" || sig === "Panic(uint256)") {
      logger.throwArgumentError("cannot specify user defined " + sig + " error", "fragment", fragment);
    }
    return fragment;
  };
  var verifyType = function(type) {
    if (type.match(/^uint($|[^1-9])/)) {
      type = "uint256" + type.substring(4);
    } else if (type.match(/^int($|[^1-9])/)) {
      type = "int256" + type.substring(3);
    }
    return type;
  };
  var verifyIdentifier = function(value) {
    if (!value || !value.match(regexIdentifier)) {
      logger.throwArgumentError("invalid identifier \"" + value + "\"", "value", value);
    }
    return value;
  };
  var splitNesting = function(value) {
    value = value.trim();
    var result = [];
    var accum = "";
    var depth = 0;
    for (var offset = 0;offset < value.length; offset++) {
      var c = value[offset];
      if (c === "," && depth === 0) {
        result.push(accum);
        accum = "";
      } else {
        accum += c;
        if (c === "(") {
          depth++;
        } else if (c === ")") {
          depth--;
          if (depth === -1) {
            logger.throwArgumentError("unbalanced parenthesis", "value", value);
          }
        }
      }
    }
    if (accum) {
      result.push(accum);
    }
    return result;
  };
  var __extends = exports && exports.__extends || function() {
    var extendStatics = function(d, b2) {
      extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b3) {
        d2.__proto__ = b3;
      } || function(d2, b3) {
        for (var p in b3)
          if (Object.prototype.hasOwnProperty.call(b3, p))
            d2[p] = b3[p];
      };
      return extendStatics(d, b2);
    };
    return function(d, b2) {
      if (typeof b2 !== "function" && b2 !== null)
        throw new TypeError("Class extends value " + String(b2) + " is not a constructor or null");
      extendStatics(d, b2);
      function __() {
        this.constructor = d;
      }
      d.prototype = b2 === null ? Object.create(b2) : (__.prototype = b2.prototype, new __);
    };
  }();
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.ErrorFragment = exports.FunctionFragment = exports.ConstructorFragment = exports.EventFragment = exports.Fragment = exports.ParamType = exports.FormatTypes = undefined;
  var bignumber_1 = require_lib3();
  var properties_1 = require_lib4();
  var logger_1 = require_lib();
  var _version_1 = require__version5();
  var logger = new logger_1.Logger(_version_1.version);
  var _constructorGuard = {};
  var ModifiersBytes = { calldata: true, memory: true, storage: true };
  var ModifiersNest = { calldata: true, memory: true };
  exports.FormatTypes = Object.freeze({
    sighash: "sighash",
    minimal: "minimal",
    full: "full",
    json: "json"
  });
  var paramTypeArray = new RegExp(/^(.*)\[([0-9]*)\]$/);
  var ParamType = function() {
    function ParamType2(constructorGuard, params) {
      if (constructorGuard !== _constructorGuard) {
        logger.throwError("use fromString", logger_1.Logger.errors.UNSUPPORTED_OPERATION, {
          operation: "new ParamType()"
        });
      }
      populate(this, params);
      var match = this.type.match(paramTypeArray);
      if (match) {
        populate(this, {
          arrayLength: parseInt(match[2] || "-1"),
          arrayChildren: ParamType2.fromObject({
            type: match[1],
            components: this.components
          }),
          baseType: "array"
        });
      } else {
        populate(this, {
          arrayLength: null,
          arrayChildren: null,
          baseType: this.components != null ? "tuple" : this.type
        });
      }
      this._isParamType = true;
      Object.freeze(this);
    }
    ParamType2.prototype.format = function(format) {
      if (!format) {
        format = exports.FormatTypes.sighash;
      }
      if (!exports.FormatTypes[format]) {
        logger.throwArgumentError("invalid format type", "format", format);
      }
      if (format === exports.FormatTypes.json) {
        var result_1 = {
          type: this.baseType === "tuple" ? "tuple" : this.type,
          name: this.name || undefined
        };
        if (typeof this.indexed === "boolean") {
          result_1.indexed = this.indexed;
        }
        if (this.components) {
          result_1.components = this.components.map(function(comp) {
            return JSON.parse(comp.format(format));
          });
        }
        return JSON.stringify(result_1);
      }
      var result = "";
      if (this.baseType === "array") {
        result += this.arrayChildren.format(format);
        result += "[" + (this.arrayLength < 0 ? "" : String(this.arrayLength)) + "]";
      } else {
        if (this.baseType === "tuple") {
          if (format !== exports.FormatTypes.sighash) {
            result += this.type;
          }
          result += "(" + this.components.map(function(comp) {
            return comp.format(format);
          }).join(format === exports.FormatTypes.full ? ", " : ",") + ")";
        } else {
          result += this.type;
        }
      }
      if (format !== exports.FormatTypes.sighash) {
        if (this.indexed === true) {
          result += " indexed";
        }
        if (format === exports.FormatTypes.full && this.name) {
          result += " " + this.name;
        }
      }
      return result;
    };
    ParamType2.from = function(value, allowIndexed) {
      if (typeof value === "string") {
        return ParamType2.fromString(value, allowIndexed);
      }
      return ParamType2.fromObject(value);
    };
    ParamType2.fromObject = function(value) {
      if (ParamType2.isParamType(value)) {
        return value;
      }
      return new ParamType2(_constructorGuard, {
        name: value.name || null,
        type: verifyType(value.type),
        indexed: value.indexed == null ? null : !!value.indexed,
        components: value.components ? value.components.map(ParamType2.fromObject) : null
      });
    };
    ParamType2.fromString = function(value, allowIndexed) {
      function ParamTypify(node) {
        return ParamType2.fromObject({
          name: node.name,
          type: node.type,
          indexed: node.indexed,
          components: node.components
        });
      }
      return ParamTypify(parseParamType(value, !!allowIndexed));
    };
    ParamType2.isParamType = function(value) {
      return !!(value != null && value._isParamType);
    };
    return ParamType2;
  }();
  exports.ParamType = ParamType;
  var Fragment = function() {
    function Fragment2(constructorGuard, params) {
      if (constructorGuard !== _constructorGuard) {
        logger.throwError("use a static from method", logger_1.Logger.errors.UNSUPPORTED_OPERATION, {
          operation: "new Fragment()"
        });
      }
      populate(this, params);
      this._isFragment = true;
      Object.freeze(this);
    }
    Fragment2.from = function(value) {
      if (Fragment2.isFragment(value)) {
        return value;
      }
      if (typeof value === "string") {
        return Fragment2.fromString(value);
      }
      return Fragment2.fromObject(value);
    };
    Fragment2.fromObject = function(value) {
      if (Fragment2.isFragment(value)) {
        return value;
      }
      switch (value.type) {
        case "function":
          return FunctionFragment.fromObject(value);
        case "event":
          return EventFragment.fromObject(value);
        case "constructor":
          return ConstructorFragment.fromObject(value);
        case "error":
          return ErrorFragment.fromObject(value);
        case "fallback":
        case "receive":
          return null;
      }
      return logger.throwArgumentError("invalid fragment object", "value", value);
    };
    Fragment2.fromString = function(value) {
      value = value.replace(/\s/g, " ");
      value = value.replace(/\(/g, " (").replace(/\)/g, ") ").replace(/\s+/g, " ");
      value = value.trim();
      if (value.split(" ")[0] === "event") {
        return EventFragment.fromString(value.substring(5).trim());
      } else if (value.split(" ")[0] === "function") {
        return FunctionFragment.fromString(value.substring(8).trim());
      } else if (value.split("(")[0].trim() === "constructor") {
        return ConstructorFragment.fromString(value.trim());
      } else if (value.split(" ")[0] === "error") {
        return ErrorFragment.fromString(value.substring(5).trim());
      }
      return logger.throwArgumentError("unsupported fragment", "value", value);
    };
    Fragment2.isFragment = function(value) {
      return !!(value && value._isFragment);
    };
    return Fragment2;
  }();
  exports.Fragment = Fragment;
  var EventFragment = function(_super) {
    __extends(EventFragment2, _super);
    function EventFragment2() {
      return _super !== null && _super.apply(this, arguments) || this;
    }
    EventFragment2.prototype.format = function(format) {
      if (!format) {
        format = exports.FormatTypes.sighash;
      }
      if (!exports.FormatTypes[format]) {
        logger.throwArgumentError("invalid format type", "format", format);
      }
      if (format === exports.FormatTypes.json) {
        return JSON.stringify({
          type: "event",
          anonymous: this.anonymous,
          name: this.name,
          inputs: this.inputs.map(function(input) {
            return JSON.parse(input.format(format));
          })
        });
      }
      var result = "";
      if (format !== exports.FormatTypes.sighash) {
        result += "event ";
      }
      result += this.name + "(" + this.inputs.map(function(input) {
        return input.format(format);
      }).join(format === exports.FormatTypes.full ? ", " : ",") + ") ";
      if (format !== exports.FormatTypes.sighash) {
        if (this.anonymous) {
          result += "anonymous ";
        }
      }
      return result.trim();
    };
    EventFragment2.from = function(value) {
      if (typeof value === "string") {
        return EventFragment2.fromString(value);
      }
      return EventFragment2.fromObject(value);
    };
    EventFragment2.fromObject = function(value) {
      if (EventFragment2.isEventFragment(value)) {
        return value;
      }
      if (value.type !== "event") {
        logger.throwArgumentError("invalid event object", "value", value);
      }
      var params = {
        name: verifyIdentifier(value.name),
        anonymous: value.anonymous,
        inputs: value.inputs ? value.inputs.map(ParamType.fromObject) : [],
        type: "event"
      };
      return new EventFragment2(_constructorGuard, params);
    };
    EventFragment2.fromString = function(value) {
      var match = value.match(regexParen);
      if (!match) {
        logger.throwArgumentError("invalid event string", "value", value);
      }
      var anonymous = false;
      match[3].split(" ").forEach(function(modifier) {
        switch (modifier.trim()) {
          case "anonymous":
            anonymous = true;
            break;
          case "":
            break;
          default:
            logger.warn("unknown modifier: " + modifier);
        }
      });
      return EventFragment2.fromObject({
        name: match[1].trim(),
        anonymous,
        inputs: parseParams(match[2], true),
        type: "event"
      });
    };
    EventFragment2.isEventFragment = function(value) {
      return value && value._isFragment && value.type === "event";
    };
    return EventFragment2;
  }(Fragment);
  exports.EventFragment = EventFragment;
  var ConstructorFragment = function(_super) {
    __extends(ConstructorFragment2, _super);
    function ConstructorFragment2() {
      return _super !== null && _super.apply(this, arguments) || this;
    }
    ConstructorFragment2.prototype.format = function(format) {
      if (!format) {
        format = exports.FormatTypes.sighash;
      }
      if (!exports.FormatTypes[format]) {
        logger.throwArgumentError("invalid format type", "format", format);
      }
      if (format === exports.FormatTypes.json) {
        return JSON.stringify({
          type: "constructor",
          stateMutability: this.stateMutability !== "nonpayable" ? this.stateMutability : undefined,
          payable: this.payable,
          gas: this.gas ? this.gas.toNumber() : undefined,
          inputs: this.inputs.map(function(input) {
            return JSON.parse(input.format(format));
          })
        });
      }
      if (format === exports.FormatTypes.sighash) {
        logger.throwError("cannot format a constructor for sighash", logger_1.Logger.errors.UNSUPPORTED_OPERATION, {
          operation: "format(sighash)"
        });
      }
      var result = "constructor(" + this.inputs.map(function(input) {
        return input.format(format);
      }).join(format === exports.FormatTypes.full ? ", " : ",") + ") ";
      if (this.stateMutability && this.stateMutability !== "nonpayable") {
        result += this.stateMutability + " ";
      }
      return result.trim();
    };
    ConstructorFragment2.from = function(value) {
      if (typeof value === "string") {
        return ConstructorFragment2.fromString(value);
      }
      return ConstructorFragment2.fromObject(value);
    };
    ConstructorFragment2.fromObject = function(value) {
      if (ConstructorFragment2.isConstructorFragment(value)) {
        return value;
      }
      if (value.type !== "constructor") {
        logger.throwArgumentError("invalid constructor object", "value", value);
      }
      var state = verifyState(value);
      if (state.constant) {
        logger.throwArgumentError("constructor cannot be constant", "value", value);
      }
      var params = {
        name: null,
        type: value.type,
        inputs: value.inputs ? value.inputs.map(ParamType.fromObject) : [],
        payable: state.payable,
        stateMutability: state.stateMutability,
        gas: value.gas ? bignumber_1.BigNumber.from(value.gas) : null
      };
      return new ConstructorFragment2(_constructorGuard, params);
    };
    ConstructorFragment2.fromString = function(value) {
      var params = { type: "constructor" };
      value = parseGas(value, params);
      var parens = value.match(regexParen);
      if (!parens || parens[1].trim() !== "constructor") {
        logger.throwArgumentError("invalid constructor string", "value", value);
      }
      params.inputs = parseParams(parens[2].trim(), false);
      parseModifiers(parens[3].trim(), params);
      return ConstructorFragment2.fromObject(params);
    };
    ConstructorFragment2.isConstructorFragment = function(value) {
      return value && value._isFragment && value.type === "constructor";
    };
    return ConstructorFragment2;
  }(Fragment);
  exports.ConstructorFragment = ConstructorFragment;
  var FunctionFragment = function(_super) {
    __extends(FunctionFragment2, _super);
    function FunctionFragment2() {
      return _super !== null && _super.apply(this, arguments) || this;
    }
    FunctionFragment2.prototype.format = function(format) {
      if (!format) {
        format = exports.FormatTypes.sighash;
      }
      if (!exports.FormatTypes[format]) {
        logger.throwArgumentError("invalid format type", "format", format);
      }
      if (format === exports.FormatTypes.json) {
        return JSON.stringify({
          type: "function",
          name: this.name,
          constant: this.constant,
          stateMutability: this.stateMutability !== "nonpayable" ? this.stateMutability : undefined,
          payable: this.payable,
          gas: this.gas ? this.gas.toNumber() : undefined,
          inputs: this.inputs.map(function(input) {
            return JSON.parse(input.format(format));
          }),
          outputs: this.outputs.map(function(output) {
            return JSON.parse(output.format(format));
          })
        });
      }
      var result = "";
      if (format !== exports.FormatTypes.sighash) {
        result += "function ";
      }
      result += this.name + "(" + this.inputs.map(function(input) {
        return input.format(format);
      }).join(format === exports.FormatTypes.full ? ", " : ",") + ") ";
      if (format !== exports.FormatTypes.sighash) {
        if (this.stateMutability) {
          if (this.stateMutability !== "nonpayable") {
            result += this.stateMutability + " ";
          }
        } else if (this.constant) {
          result += "view ";
        }
        if (this.outputs && this.outputs.length) {
          result += "returns (" + this.outputs.map(function(output) {
            return output.format(format);
          }).join(", ") + ") ";
        }
        if (this.gas != null) {
          result += "@" + this.gas.toString() + " ";
        }
      }
      return result.trim();
    };
    FunctionFragment2.from = function(value) {
      if (typeof value === "string") {
        return FunctionFragment2.fromString(value);
      }
      return FunctionFragment2.fromObject(value);
    };
    FunctionFragment2.fromObject = function(value) {
      if (FunctionFragment2.isFunctionFragment(value)) {
        return value;
      }
      if (value.type !== "function") {
        logger.throwArgumentError("invalid function object", "value", value);
      }
      var state = verifyState(value);
      var params = {
        type: value.type,
        name: verifyIdentifier(value.name),
        constant: state.constant,
        inputs: value.inputs ? value.inputs.map(ParamType.fromObject) : [],
        outputs: value.outputs ? value.outputs.map(ParamType.fromObject) : [],
        payable: state.payable,
        stateMutability: state.stateMutability,
        gas: value.gas ? bignumber_1.BigNumber.from(value.gas) : null
      };
      return new FunctionFragment2(_constructorGuard, params);
    };
    FunctionFragment2.fromString = function(value) {
      var params = { type: "function" };
      value = parseGas(value, params);
      var comps = value.split(" returns ");
      if (comps.length > 2) {
        logger.throwArgumentError("invalid function string", "value", value);
      }
      var parens = comps[0].match(regexParen);
      if (!parens) {
        logger.throwArgumentError("invalid function signature", "value", value);
      }
      params.name = parens[1].trim();
      if (params.name) {
        verifyIdentifier(params.name);
      }
      params.inputs = parseParams(parens[2], false);
      parseModifiers(parens[3].trim(), params);
      if (comps.length > 1) {
        var returns = comps[1].match(regexParen);
        if (returns[1].trim() != "" || returns[3].trim() != "") {
          logger.throwArgumentError("unexpected tokens", "value", value);
        }
        params.outputs = parseParams(returns[2], false);
      } else {
        params.outputs = [];
      }
      return FunctionFragment2.fromObject(params);
    };
    FunctionFragment2.isFunctionFragment = function(value) {
      return value && value._isFragment && value.type === "function";
    };
    return FunctionFragment2;
  }(ConstructorFragment);
  exports.FunctionFragment = FunctionFragment;
  var ErrorFragment = function(_super) {
    __extends(ErrorFragment2, _super);
    function ErrorFragment2() {
      return _super !== null && _super.apply(this, arguments) || this;
    }
    ErrorFragment2.prototype.format = function(format) {
      if (!format) {
        format = exports.FormatTypes.sighash;
      }
      if (!exports.FormatTypes[format]) {
        logger.throwArgumentError("invalid format type", "format", format);
      }
      if (format === exports.FormatTypes.json) {
        return JSON.stringify({
          type: "error",
          name: this.name,
          inputs: this.inputs.map(function(input) {
            return JSON.parse(input.format(format));
          })
        });
      }
      var result = "";
      if (format !== exports.FormatTypes.sighash) {
        result += "error ";
      }
      result += this.name + "(" + this.inputs.map(function(input) {
        return input.format(format);
      }).join(format === exports.FormatTypes.full ? ", " : ",") + ") ";
      return result.trim();
    };
    ErrorFragment2.from = function(value) {
      if (typeof value === "string") {
        return ErrorFragment2.fromString(value);
      }
      return ErrorFragment2.fromObject(value);
    };
    ErrorFragment2.fromObject = function(value) {
      if (ErrorFragment2.isErrorFragment(value)) {
        return value;
      }
      if (value.type !== "error") {
        logger.throwArgumentError("invalid error object", "value", value);
      }
      var params = {
        type: value.type,
        name: verifyIdentifier(value.name),
        inputs: value.inputs ? value.inputs.map(ParamType.fromObject) : []
      };
      return checkForbidden(new ErrorFragment2(_constructorGuard, params));
    };
    ErrorFragment2.fromString = function(value) {
      var params = { type: "error" };
      var parens = value.match(regexParen);
      if (!parens) {
        logger.throwArgumentError("invalid error signature", "value", value);
      }
      params.name = parens[1].trim();
      if (params.name) {
        verifyIdentifier(params.name);
      }
      params.inputs = parseParams(parens[2], false);
      return checkForbidden(ErrorFragment2.fromObject(params));
    };
    ErrorFragment2.isErrorFragment = function(value) {
      return value && value._isFragment && value.type === "error";
    };
    return ErrorFragment2;
  }(Fragment);
  exports.ErrorFragment = ErrorFragment;
  var regexIdentifier = new RegExp("^[a-zA-Z$_][a-zA-Z0-9$_]*$");
  var regexParen = new RegExp("^([^)(]*)\\((.*)\\)([^)(]*)$");
});

// node_modules/@ethersproject/abi/lib/coders/abstract-coder.js
var require_abstract_coder = __commonJS((exports) => {
  var checkResultErrors = function(result) {
    var errors = [];
    var checkErrors = function(path, object) {
      if (!Array.isArray(object)) {
        return;
      }
      for (var key in object) {
        var childPath = path.slice();
        childPath.push(key);
        try {
          checkErrors(childPath, object[key]);
        } catch (error) {
          errors.push({ path: childPath, error });
        }
      }
    };
    checkErrors([], result);
    return errors;
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.Reader = exports.Writer = exports.Coder = exports.checkResultErrors = undefined;
  var bytes_1 = require_lib2();
  var bignumber_1 = require_lib3();
  var properties_1 = require_lib4();
  var logger_1 = require_lib();
  var _version_1 = require__version5();
  var logger = new logger_1.Logger(_version_1.version);
  exports.checkResultErrors = checkResultErrors;
  var Coder = function() {
    function Coder2(name, type, localName, dynamic) {
      this.name = name;
      this.type = type;
      this.localName = localName;
      this.dynamic = dynamic;
    }
    Coder2.prototype._throwError = function(message, value) {
      logger.throwArgumentError(message, this.localName, value);
    };
    return Coder2;
  }();
  exports.Coder = Coder;
  var Writer = function() {
    function Writer2(wordSize) {
      (0, properties_1.defineReadOnly)(this, "wordSize", wordSize || 32);
      this._data = [];
      this._dataLength = 0;
      this._padding = new Uint8Array(wordSize);
    }
    Object.defineProperty(Writer2.prototype, "data", {
      get: function() {
        return (0, bytes_1.hexConcat)(this._data);
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Writer2.prototype, "length", {
      get: function() {
        return this._dataLength;
      },
      enumerable: false,
      configurable: true
    });
    Writer2.prototype._writeData = function(data) {
      this._data.push(data);
      this._dataLength += data.length;
      return data.length;
    };
    Writer2.prototype.appendWriter = function(writer) {
      return this._writeData((0, bytes_1.concat)(writer._data));
    };
    Writer2.prototype.writeBytes = function(value) {
      var bytes = (0, bytes_1.arrayify)(value);
      var paddingOffset = bytes.length % this.wordSize;
      if (paddingOffset) {
        bytes = (0, bytes_1.concat)([bytes, this._padding.slice(paddingOffset)]);
      }
      return this._writeData(bytes);
    };
    Writer2.prototype._getValue = function(value) {
      var bytes = (0, bytes_1.arrayify)(bignumber_1.BigNumber.from(value));
      if (bytes.length > this.wordSize) {
        logger.throwError("value out-of-bounds", logger_1.Logger.errors.BUFFER_OVERRUN, {
          length: this.wordSize,
          offset: bytes.length
        });
      }
      if (bytes.length % this.wordSize) {
        bytes = (0, bytes_1.concat)([this._padding.slice(bytes.length % this.wordSize), bytes]);
      }
      return bytes;
    };
    Writer2.prototype.writeValue = function(value) {
      return this._writeData(this._getValue(value));
    };
    Writer2.prototype.writeUpdatableValue = function() {
      var _this = this;
      var offset = this._data.length;
      this._data.push(this._padding);
      this._dataLength += this.wordSize;
      return function(value) {
        _this._data[offset] = _this._getValue(value);
      };
    };
    return Writer2;
  }();
  exports.Writer = Writer;
  var Reader = function() {
    function Reader2(data, wordSize, coerceFunc, allowLoose) {
      (0, properties_1.defineReadOnly)(this, "_data", (0, bytes_1.arrayify)(data));
      (0, properties_1.defineReadOnly)(this, "wordSize", wordSize || 32);
      (0, properties_1.defineReadOnly)(this, "_coerceFunc", coerceFunc);
      (0, properties_1.defineReadOnly)(this, "allowLoose", allowLoose);
      this._offset = 0;
    }
    Object.defineProperty(Reader2.prototype, "data", {
      get: function() {
        return (0, bytes_1.hexlify)(this._data);
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Reader2.prototype, "consumed", {
      get: function() {
        return this._offset;
      },
      enumerable: false,
      configurable: true
    });
    Reader2.coerce = function(name, value) {
      var match = name.match("^u?int([0-9]+)$");
      if (match && parseInt(match[1]) <= 48) {
        value = value.toNumber();
      }
      return value;
    };
    Reader2.prototype.coerce = function(name, value) {
      if (this._coerceFunc) {
        return this._coerceFunc(name, value);
      }
      return Reader2.coerce(name, value);
    };
    Reader2.prototype._peekBytes = function(offset, length, loose) {
      var alignedLength = Math.ceil(length / this.wordSize) * this.wordSize;
      if (this._offset + alignedLength > this._data.length) {
        if (this.allowLoose && loose && this._offset + length <= this._data.length) {
          alignedLength = length;
        } else {
          logger.throwError("data out-of-bounds", logger_1.Logger.errors.BUFFER_OVERRUN, {
            length: this._data.length,
            offset: this._offset + alignedLength
          });
        }
      }
      return this._data.slice(this._offset, this._offset + alignedLength);
    };
    Reader2.prototype.subReader = function(offset) {
      return new Reader2(this._data.slice(this._offset + offset), this.wordSize, this._coerceFunc, this.allowLoose);
    };
    Reader2.prototype.readBytes = function(length, loose) {
      var bytes = this._peekBytes(0, length, !!loose);
      this._offset += bytes.length;
      return bytes.slice(0, length);
    };
    Reader2.prototype.readValue = function() {
      return bignumber_1.BigNumber.from(this.readBytes(this.wordSize));
    };
    return Reader2;
  }();
  exports.Reader = Reader;
});

// node_modules/js-sha3/src/sha3.js
var require_sha32 = __commonJS((exports, module) => {
  (function() {
    var INPUT_ERROR = "input is invalid type";
    var FINALIZE_ERROR = "finalize already called";
    var WINDOW = typeof window === "object";
    var root = WINDOW ? window : {};
    if (root.JS_SHA3_NO_WINDOW) {
      WINDOW = false;
    }
    var WEB_WORKER = !WINDOW && typeof self === "object";
    var NODE_JS = !root.JS_SHA3_NO_NODE_JS && typeof process === "object" && process.versions && process.versions.node;
    if (NODE_JS) {
      root = global;
    } else if (WEB_WORKER) {
      root = self;
    }
    var COMMON_JS = !root.JS_SHA3_NO_COMMON_JS && typeof module === "object" && exports;
    var AMD = typeof define === "function" && define.amd;
    var ARRAY_BUFFER = !root.JS_SHA3_NO_ARRAY_BUFFER && typeof ArrayBuffer !== "undefined";
    var HEX_CHARS = "0123456789abcdef".split("");
    var SHAKE_PADDING = [31, 7936, 2031616, 520093696];
    var CSHAKE_PADDING = [4, 1024, 262144, 67108864];
    var KECCAK_PADDING = [1, 256, 65536, 16777216];
    var PADDING = [6, 1536, 393216, 100663296];
    var SHIFT = [0, 8, 16, 24];
    var RC = [
      1,
      0,
      32898,
      0,
      32906,
      2147483648,
      2147516416,
      2147483648,
      32907,
      0,
      2147483649,
      0,
      2147516545,
      2147483648,
      32777,
      2147483648,
      138,
      0,
      136,
      0,
      2147516425,
      0,
      2147483658,
      0,
      2147516555,
      0,
      139,
      2147483648,
      32905,
      2147483648,
      32771,
      2147483648,
      32770,
      2147483648,
      128,
      2147483648,
      32778,
      0,
      2147483658,
      2147483648,
      2147516545,
      2147483648,
      32896,
      2147483648,
      2147483649,
      0,
      2147516424,
      2147483648
    ];
    var BITS = [224, 256, 384, 512];
    var SHAKE_BITS = [128, 256];
    var OUTPUT_TYPES = ["hex", "buffer", "arrayBuffer", "array", "digest"];
    var CSHAKE_BYTEPAD = {
      "128": 168,
      "256": 136
    };
    if (root.JS_SHA3_NO_NODE_JS || !Array.isArray) {
      Array.isArray = function(obj) {
        return Object.prototype.toString.call(obj) === "[object Array]";
      };
    }
    if (ARRAY_BUFFER && (root.JS_SHA3_NO_ARRAY_BUFFER_IS_VIEW || !ArrayBuffer.isView)) {
      ArrayBuffer.isView = function(obj) {
        return typeof obj === "object" && obj.buffer && obj.buffer.constructor === ArrayBuffer;
      };
    }
    var createOutputMethod = function(bits2, padding, outputType) {
      return function(message) {
        return new Keccak(bits2, padding, bits2).update(message)[outputType]();
      };
    };
    var createShakeOutputMethod = function(bits2, padding, outputType) {
      return function(message, outputBits) {
        return new Keccak(bits2, padding, outputBits).update(message)[outputType]();
      };
    };
    var createCshakeOutputMethod = function(bits2, padding, outputType) {
      return function(message, outputBits, n, s) {
        return methods["cshake" + bits2].update(message, outputBits, n, s)[outputType]();
      };
    };
    var createKmacOutputMethod = function(bits2, padding, outputType) {
      return function(key, message, outputBits, s) {
        return methods["kmac" + bits2].update(key, message, outputBits, s)[outputType]();
      };
    };
    var createOutputMethods = function(method, createMethod2, bits2, padding) {
      for (var i2 = 0;i2 < OUTPUT_TYPES.length; ++i2) {
        var type = OUTPUT_TYPES[i2];
        method[type] = createMethod2(bits2, padding, type);
      }
      return method;
    };
    var createMethod = function(bits2, padding) {
      var method = createOutputMethod(bits2, padding, "hex");
      method.create = function() {
        return new Keccak(bits2, padding, bits2);
      };
      method.update = function(message) {
        return method.create().update(message);
      };
      return createOutputMethods(method, createOutputMethod, bits2, padding);
    };
    var createShakeMethod = function(bits2, padding) {
      var method = createShakeOutputMethod(bits2, padding, "hex");
      method.create = function(outputBits) {
        return new Keccak(bits2, padding, outputBits);
      };
      method.update = function(message, outputBits) {
        return method.create(outputBits).update(message);
      };
      return createOutputMethods(method, createShakeOutputMethod, bits2, padding);
    };
    var createCshakeMethod = function(bits2, padding) {
      var w = CSHAKE_BYTEPAD[bits2];
      var method = createCshakeOutputMethod(bits2, padding, "hex");
      method.create = function(outputBits, n, s) {
        if (!n && !s) {
          return methods["shake" + bits2].create(outputBits);
        } else {
          return new Keccak(bits2, padding, outputBits).bytepad([n, s], w);
        }
      };
      method.update = function(message, outputBits, n, s) {
        return method.create(outputBits, n, s).update(message);
      };
      return createOutputMethods(method, createCshakeOutputMethod, bits2, padding);
    };
    var createKmacMethod = function(bits2, padding) {
      var w = CSHAKE_BYTEPAD[bits2];
      var method = createKmacOutputMethod(bits2, padding, "hex");
      method.create = function(key, outputBits, s) {
        return new Kmac(bits2, padding, outputBits).bytepad(["KMAC", s], w).bytepad([key], w);
      };
      method.update = function(key, message, outputBits, s) {
        return method.create(key, outputBits, s).update(message);
      };
      return createOutputMethods(method, createKmacOutputMethod, bits2, padding);
    };
    var algorithms = [
      { name: "keccak", padding: KECCAK_PADDING, bits: BITS, createMethod },
      { name: "sha3", padding: PADDING, bits: BITS, createMethod },
      { name: "shake", padding: SHAKE_PADDING, bits: SHAKE_BITS, createMethod: createShakeMethod },
      { name: "cshake", padding: CSHAKE_PADDING, bits: SHAKE_BITS, createMethod: createCshakeMethod },
      { name: "kmac", padding: CSHAKE_PADDING, bits: SHAKE_BITS, createMethod: createKmacMethod }
    ];
    var methods = {}, methodNames = [];
    for (var i = 0;i < algorithms.length; ++i) {
      var algorithm = algorithms[i];
      var bits = algorithm.bits;
      for (var j = 0;j < bits.length; ++j) {
        var methodName = algorithm.name + "_" + bits[j];
        methodNames.push(methodName);
        methods[methodName] = algorithm.createMethod(bits[j], algorithm.padding);
        if (algorithm.name !== "sha3") {
          var newMethodName = algorithm.name + bits[j];
          methodNames.push(newMethodName);
          methods[newMethodName] = methods[methodName];
        }
      }
    }
    function Keccak(bits2, padding, outputBits) {
      this.blocks = [];
      this.s = [];
      this.padding = padding;
      this.outputBits = outputBits;
      this.reset = true;
      this.finalized = false;
      this.block = 0;
      this.start = 0;
      this.blockCount = 1600 - (bits2 << 1) >> 5;
      this.byteCount = this.blockCount << 2;
      this.outputBlocks = outputBits >> 5;
      this.extraBytes = (outputBits & 31) >> 3;
      for (var i2 = 0;i2 < 50; ++i2) {
        this.s[i2] = 0;
      }
    }
    Keccak.prototype.update = function(message) {
      if (this.finalized) {
        throw new Error(FINALIZE_ERROR);
      }
      var notString, type = typeof message;
      if (type !== "string") {
        if (type === "object") {
          if (message === null) {
            throw new Error(INPUT_ERROR);
          } else if (ARRAY_BUFFER && message.constructor === ArrayBuffer) {
            message = new Uint8Array(message);
          } else if (!Array.isArray(message)) {
            if (!ARRAY_BUFFER || !ArrayBuffer.isView(message)) {
              throw new Error(INPUT_ERROR);
            }
          }
        } else {
          throw new Error(INPUT_ERROR);
        }
        notString = true;
      }
      var blocks = this.blocks, byteCount = this.byteCount, length = message.length, blockCount = this.blockCount, index = 0, s = this.s, i2, code;
      while (index < length) {
        if (this.reset) {
          this.reset = false;
          blocks[0] = this.block;
          for (i2 = 1;i2 < blockCount + 1; ++i2) {
            blocks[i2] = 0;
          }
        }
        if (notString) {
          for (i2 = this.start;index < length && i2 < byteCount; ++index) {
            blocks[i2 >> 2] |= message[index] << SHIFT[i2++ & 3];
          }
        } else {
          for (i2 = this.start;index < length && i2 < byteCount; ++index) {
            code = message.charCodeAt(index);
            if (code < 128) {
              blocks[i2 >> 2] |= code << SHIFT[i2++ & 3];
            } else if (code < 2048) {
              blocks[i2 >> 2] |= (192 | code >> 6) << SHIFT[i2++ & 3];
              blocks[i2 >> 2] |= (128 | code & 63) << SHIFT[i2++ & 3];
            } else if (code < 55296 || code >= 57344) {
              blocks[i2 >> 2] |= (224 | code >> 12) << SHIFT[i2++ & 3];
              blocks[i2 >> 2] |= (128 | code >> 6 & 63) << SHIFT[i2++ & 3];
              blocks[i2 >> 2] |= (128 | code & 63) << SHIFT[i2++ & 3];
            } else {
              code = 65536 + ((code & 1023) << 10 | message.charCodeAt(++index) & 1023);
              blocks[i2 >> 2] |= (240 | code >> 18) << SHIFT[i2++ & 3];
              blocks[i2 >> 2] |= (128 | code >> 12 & 63) << SHIFT[i2++ & 3];
              blocks[i2 >> 2] |= (128 | code >> 6 & 63) << SHIFT[i2++ & 3];
              blocks[i2 >> 2] |= (128 | code & 63) << SHIFT[i2++ & 3];
            }
          }
        }
        this.lastByteIndex = i2;
        if (i2 >= byteCount) {
          this.start = i2 - byteCount;
          this.block = blocks[blockCount];
          for (i2 = 0;i2 < blockCount; ++i2) {
            s[i2] ^= blocks[i2];
          }
          f(s);
          this.reset = true;
        } else {
          this.start = i2;
        }
      }
      return this;
    };
    Keccak.prototype.encode = function(x, right) {
      var o = x & 255, n = 1;
      var bytes = [o];
      x = x >> 8;
      o = x & 255;
      while (o > 0) {
        bytes.unshift(o);
        x = x >> 8;
        o = x & 255;
        ++n;
      }
      if (right) {
        bytes.push(n);
      } else {
        bytes.unshift(n);
      }
      this.update(bytes);
      return bytes.length;
    };
    Keccak.prototype.encodeString = function(str) {
      var notString, type = typeof str;
      if (type !== "string") {
        if (type === "object") {
          if (str === null) {
            throw new Error(INPUT_ERROR);
          } else if (ARRAY_BUFFER && str.constructor === ArrayBuffer) {
            str = new Uint8Array(str);
          } else if (!Array.isArray(str)) {
            if (!ARRAY_BUFFER || !ArrayBuffer.isView(str)) {
              throw new Error(INPUT_ERROR);
            }
          }
        } else {
          throw new Error(INPUT_ERROR);
        }
        notString = true;
      }
      var bytes = 0, length = str.length;
      if (notString) {
        bytes = length;
      } else {
        for (var i2 = 0;i2 < str.length; ++i2) {
          var code = str.charCodeAt(i2);
          if (code < 128) {
            bytes += 1;
          } else if (code < 2048) {
            bytes += 2;
          } else if (code < 55296 || code >= 57344) {
            bytes += 3;
          } else {
            code = 65536 + ((code & 1023) << 10 | str.charCodeAt(++i2) & 1023);
            bytes += 4;
          }
        }
      }
      bytes += this.encode(bytes * 8);
      this.update(str);
      return bytes;
    };
    Keccak.prototype.bytepad = function(strs, w) {
      var bytes = this.encode(w);
      for (var i2 = 0;i2 < strs.length; ++i2) {
        bytes += this.encodeString(strs[i2]);
      }
      var paddingBytes = w - bytes % w;
      var zeros = [];
      zeros.length = paddingBytes;
      this.update(zeros);
      return this;
    };
    Keccak.prototype.finalize = function() {
      if (this.finalized) {
        return;
      }
      this.finalized = true;
      var blocks = this.blocks, i2 = this.lastByteIndex, blockCount = this.blockCount, s = this.s;
      blocks[i2 >> 2] |= this.padding[i2 & 3];
      if (this.lastByteIndex === this.byteCount) {
        blocks[0] = blocks[blockCount];
        for (i2 = 1;i2 < blockCount + 1; ++i2) {
          blocks[i2] = 0;
        }
      }
      blocks[blockCount - 1] |= 2147483648;
      for (i2 = 0;i2 < blockCount; ++i2) {
        s[i2] ^= blocks[i2];
      }
      f(s);
    };
    Keccak.prototype.toString = Keccak.prototype.hex = function() {
      this.finalize();
      var blockCount = this.blockCount, s = this.s, outputBlocks = this.outputBlocks, extraBytes = this.extraBytes, i2 = 0, j2 = 0;
      var hex = "", block;
      while (j2 < outputBlocks) {
        for (i2 = 0;i2 < blockCount && j2 < outputBlocks; ++i2, ++j2) {
          block = s[i2];
          hex += HEX_CHARS[block >> 4 & 15] + HEX_CHARS[block & 15] + HEX_CHARS[block >> 12 & 15] + HEX_CHARS[block >> 8 & 15] + HEX_CHARS[block >> 20 & 15] + HEX_CHARS[block >> 16 & 15] + HEX_CHARS[block >> 28 & 15] + HEX_CHARS[block >> 24 & 15];
        }
        if (j2 % blockCount === 0) {
          f(s);
          i2 = 0;
        }
      }
      if (extraBytes) {
        block = s[i2];
        hex += HEX_CHARS[block >> 4 & 15] + HEX_CHARS[block & 15];
        if (extraBytes > 1) {
          hex += HEX_CHARS[block >> 12 & 15] + HEX_CHARS[block >> 8 & 15];
        }
        if (extraBytes > 2) {
          hex += HEX_CHARS[block >> 20 & 15] + HEX_CHARS[block >> 16 & 15];
        }
      }
      return hex;
    };
    Keccak.prototype.arrayBuffer = function() {
      this.finalize();
      var blockCount = this.blockCount, s = this.s, outputBlocks = this.outputBlocks, extraBytes = this.extraBytes, i2 = 0, j2 = 0;
      var bytes = this.outputBits >> 3;
      var buffer;
      if (extraBytes) {
        buffer = new ArrayBuffer(outputBlocks + 1 << 2);
      } else {
        buffer = new ArrayBuffer(bytes);
      }
      var array = new Uint32Array(buffer);
      while (j2 < outputBlocks) {
        for (i2 = 0;i2 < blockCount && j2 < outputBlocks; ++i2, ++j2) {
          array[j2] = s[i2];
        }
        if (j2 % blockCount === 0) {
          f(s);
        }
      }
      if (extraBytes) {
        array[i2] = s[i2];
        buffer = buffer.slice(0, bytes);
      }
      return buffer;
    };
    Keccak.prototype.buffer = Keccak.prototype.arrayBuffer;
    Keccak.prototype.digest = Keccak.prototype.array = function() {
      this.finalize();
      var blockCount = this.blockCount, s = this.s, outputBlocks = this.outputBlocks, extraBytes = this.extraBytes, i2 = 0, j2 = 0;
      var array = [], offset, block;
      while (j2 < outputBlocks) {
        for (i2 = 0;i2 < blockCount && j2 < outputBlocks; ++i2, ++j2) {
          offset = j2 << 2;
          block = s[i2];
          array[offset] = block & 255;
          array[offset + 1] = block >> 8 & 255;
          array[offset + 2] = block >> 16 & 255;
          array[offset + 3] = block >> 24 & 255;
        }
        if (j2 % blockCount === 0) {
          f(s);
        }
      }
      if (extraBytes) {
        offset = j2 << 2;
        block = s[i2];
        array[offset] = block & 255;
        if (extraBytes > 1) {
          array[offset + 1] = block >> 8 & 255;
        }
        if (extraBytes > 2) {
          array[offset + 2] = block >> 16 & 255;
        }
      }
      return array;
    };
    function Kmac(bits2, padding, outputBits) {
      Keccak.call(this, bits2, padding, outputBits);
    }
    Kmac.prototype = new Keccak;
    Kmac.prototype.finalize = function() {
      this.encode(this.outputBits, true);
      return Keccak.prototype.finalize.call(this);
    };
    var f = function(s) {
      var h, l, n, c0, c1, c2, c3, c4, c5, c6, c7, c8, c9, b0, b1, b2, b3, b4, b5, b6, b7, b8, b9, b10, b11, b12, b13, b14, b15, b16, b17, b18, b19, b20, b21, b22, b23, b24, b25, b26, b27, b28, b29, b30, b31, b32, b33, b34, b35, b36, b37, b38, b39, b40, b41, b42, b43, b44, b45, b46, b47, b48, b49;
      for (n = 0;n < 48; n += 2) {
        c0 = s[0] ^ s[10] ^ s[20] ^ s[30] ^ s[40];
        c1 = s[1] ^ s[11] ^ s[21] ^ s[31] ^ s[41];
        c2 = s[2] ^ s[12] ^ s[22] ^ s[32] ^ s[42];
        c3 = s[3] ^ s[13] ^ s[23] ^ s[33] ^ s[43];
        c4 = s[4] ^ s[14] ^ s[24] ^ s[34] ^ s[44];
        c5 = s[5] ^ s[15] ^ s[25] ^ s[35] ^ s[45];
        c6 = s[6] ^ s[16] ^ s[26] ^ s[36] ^ s[46];
        c7 = s[7] ^ s[17] ^ s[27] ^ s[37] ^ s[47];
        c8 = s[8] ^ s[18] ^ s[28] ^ s[38] ^ s[48];
        c9 = s[9] ^ s[19] ^ s[29] ^ s[39] ^ s[49];
        h = c8 ^ (c2 << 1 | c3 >>> 31);
        l = c9 ^ (c3 << 1 | c2 >>> 31);
        s[0] ^= h;
        s[1] ^= l;
        s[10] ^= h;
        s[11] ^= l;
        s[20] ^= h;
        s[21] ^= l;
        s[30] ^= h;
        s[31] ^= l;
        s[40] ^= h;
        s[41] ^= l;
        h = c0 ^ (c4 << 1 | c5 >>> 31);
        l = c1 ^ (c5 << 1 | c4 >>> 31);
        s[2] ^= h;
        s[3] ^= l;
        s[12] ^= h;
        s[13] ^= l;
        s[22] ^= h;
        s[23] ^= l;
        s[32] ^= h;
        s[33] ^= l;
        s[42] ^= h;
        s[43] ^= l;
        h = c2 ^ (c6 << 1 | c7 >>> 31);
        l = c3 ^ (c7 << 1 | c6 >>> 31);
        s[4] ^= h;
        s[5] ^= l;
        s[14] ^= h;
        s[15] ^= l;
        s[24] ^= h;
        s[25] ^= l;
        s[34] ^= h;
        s[35] ^= l;
        s[44] ^= h;
        s[45] ^= l;
        h = c4 ^ (c8 << 1 | c9 >>> 31);
        l = c5 ^ (c9 << 1 | c8 >>> 31);
        s[6] ^= h;
        s[7] ^= l;
        s[16] ^= h;
        s[17] ^= l;
        s[26] ^= h;
        s[27] ^= l;
        s[36] ^= h;
        s[37] ^= l;
        s[46] ^= h;
        s[47] ^= l;
        h = c6 ^ (c0 << 1 | c1 >>> 31);
        l = c7 ^ (c1 << 1 | c0 >>> 31);
        s[8] ^= h;
        s[9] ^= l;
        s[18] ^= h;
        s[19] ^= l;
        s[28] ^= h;
        s[29] ^= l;
        s[38] ^= h;
        s[39] ^= l;
        s[48] ^= h;
        s[49] ^= l;
        b0 = s[0];
        b1 = s[1];
        b32 = s[11] << 4 | s[10] >>> 28;
        b33 = s[10] << 4 | s[11] >>> 28;
        b14 = s[20] << 3 | s[21] >>> 29;
        b15 = s[21] << 3 | s[20] >>> 29;
        b46 = s[31] << 9 | s[30] >>> 23;
        b47 = s[30] << 9 | s[31] >>> 23;
        b28 = s[40] << 18 | s[41] >>> 14;
        b29 = s[41] << 18 | s[40] >>> 14;
        b20 = s[2] << 1 | s[3] >>> 31;
        b21 = s[3] << 1 | s[2] >>> 31;
        b2 = s[13] << 12 | s[12] >>> 20;
        b3 = s[12] << 12 | s[13] >>> 20;
        b34 = s[22] << 10 | s[23] >>> 22;
        b35 = s[23] << 10 | s[22] >>> 22;
        b16 = s[33] << 13 | s[32] >>> 19;
        b17 = s[32] << 13 | s[33] >>> 19;
        b48 = s[42] << 2 | s[43] >>> 30;
        b49 = s[43] << 2 | s[42] >>> 30;
        b40 = s[5] << 30 | s[4] >>> 2;
        b41 = s[4] << 30 | s[5] >>> 2;
        b22 = s[14] << 6 | s[15] >>> 26;
        b23 = s[15] << 6 | s[14] >>> 26;
        b4 = s[25] << 11 | s[24] >>> 21;
        b5 = s[24] << 11 | s[25] >>> 21;
        b36 = s[34] << 15 | s[35] >>> 17;
        b37 = s[35] << 15 | s[34] >>> 17;
        b18 = s[45] << 29 | s[44] >>> 3;
        b19 = s[44] << 29 | s[45] >>> 3;
        b10 = s[6] << 28 | s[7] >>> 4;
        b11 = s[7] << 28 | s[6] >>> 4;
        b42 = s[17] << 23 | s[16] >>> 9;
        b43 = s[16] << 23 | s[17] >>> 9;
        b24 = s[26] << 25 | s[27] >>> 7;
        b25 = s[27] << 25 | s[26] >>> 7;
        b6 = s[36] << 21 | s[37] >>> 11;
        b7 = s[37] << 21 | s[36] >>> 11;
        b38 = s[47] << 24 | s[46] >>> 8;
        b39 = s[46] << 24 | s[47] >>> 8;
        b30 = s[8] << 27 | s[9] >>> 5;
        b31 = s[9] << 27 | s[8] >>> 5;
        b12 = s[18] << 20 | s[19] >>> 12;
        b13 = s[19] << 20 | s[18] >>> 12;
        b44 = s[29] << 7 | s[28] >>> 25;
        b45 = s[28] << 7 | s[29] >>> 25;
        b26 = s[38] << 8 | s[39] >>> 24;
        b27 = s[39] << 8 | s[38] >>> 24;
        b8 = s[48] << 14 | s[49] >>> 18;
        b9 = s[49] << 14 | s[48] >>> 18;
        s[0] = b0 ^ ~b2 & b4;
        s[1] = b1 ^ ~b3 & b5;
        s[10] = b10 ^ ~b12 & b14;
        s[11] = b11 ^ ~b13 & b15;
        s[20] = b20 ^ ~b22 & b24;
        s[21] = b21 ^ ~b23 & b25;
        s[30] = b30 ^ ~b32 & b34;
        s[31] = b31 ^ ~b33 & b35;
        s[40] = b40 ^ ~b42 & b44;
        s[41] = b41 ^ ~b43 & b45;
        s[2] = b2 ^ ~b4 & b6;
        s[3] = b3 ^ ~b5 & b7;
        s[12] = b12 ^ ~b14 & b16;
        s[13] = b13 ^ ~b15 & b17;
        s[22] = b22 ^ ~b24 & b26;
        s[23] = b23 ^ ~b25 & b27;
        s[32] = b32 ^ ~b34 & b36;
        s[33] = b33 ^ ~b35 & b37;
        s[42] = b42 ^ ~b44 & b46;
        s[43] = b43 ^ ~b45 & b47;
        s[4] = b4 ^ ~b6 & b8;
        s[5] = b5 ^ ~b7 & b9;
        s[14] = b14 ^ ~b16 & b18;
        s[15] = b15 ^ ~b17 & b19;
        s[24] = b24 ^ ~b26 & b28;
        s[25] = b25 ^ ~b27 & b29;
        s[34] = b34 ^ ~b36 & b38;
        s[35] = b35 ^ ~b37 & b39;
        s[44] = b44 ^ ~b46 & b48;
        s[45] = b45 ^ ~b47 & b49;
        s[6] = b6 ^ ~b8 & b0;
        s[7] = b7 ^ ~b9 & b1;
        s[16] = b16 ^ ~b18 & b10;
        s[17] = b17 ^ ~b19 & b11;
        s[26] = b26 ^ ~b28 & b20;
        s[27] = b27 ^ ~b29 & b21;
        s[36] = b36 ^ ~b38 & b30;
        s[37] = b37 ^ ~b39 & b31;
        s[46] = b46 ^ ~b48 & b40;
        s[47] = b47 ^ ~b49 & b41;
        s[8] = b8 ^ ~b0 & b2;
        s[9] = b9 ^ ~b1 & b3;
        s[18] = b18 ^ ~b10 & b12;
        s[19] = b19 ^ ~b11 & b13;
        s[28] = b28 ^ ~b20 & b22;
        s[29] = b29 ^ ~b21 & b23;
        s[38] = b38 ^ ~b30 & b32;
        s[39] = b39 ^ ~b31 & b33;
        s[48] = b48 ^ ~b40 & b42;
        s[49] = b49 ^ ~b41 & b43;
        s[0] ^= RC[n];
        s[1] ^= RC[n + 1];
      }
    };
    if (COMMON_JS) {
      module.exports = methods;
    } else {
      for (i = 0;i < methodNames.length; ++i) {
        root[methodNames[i]] = methods[methodNames[i]];
      }
      if (AMD) {
        define(function() {
          return methods;
        });
      }
    }
  })();
});

// node_modules/@ethersproject/keccak256/lib/index.js
var require_lib5 = __commonJS((exports) => {
  var keccak256 = function(data) {
    return "0x" + js_sha3_1.default.keccak_256((0, bytes_1.arrayify)(data));
  };
  var __importDefault = exports && exports.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.keccak256 = undefined;
  var js_sha3_1 = __importDefault(require_sha32());
  var bytes_1 = require_lib2();
  exports.keccak256 = keccak256;
});

// node_modules/@ethersproject/rlp/lib/_version.js
var require__version6 = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.version = undefined;
  exports.version = "rlp/5.7.0";
});

// node_modules/@ethersproject/rlp/lib/index.js
var require_lib6 = __commonJS((exports) => {
  var arrayifyInteger = function(value) {
    var result = [];
    while (value) {
      result.unshift(value & 255);
      value >>= 8;
    }
    return result;
  };
  var unarrayifyInteger = function(data, offset, length) {
    var result = 0;
    for (var i = 0;i < length; i++) {
      result = result * 256 + data[offset + i];
    }
    return result;
  };
  var _encode = function(object) {
    if (Array.isArray(object)) {
      var payload_1 = [];
      object.forEach(function(child) {
        payload_1 = payload_1.concat(_encode(child));
      });
      if (payload_1.length <= 55) {
        payload_1.unshift(192 + payload_1.length);
        return payload_1;
      }
      var length_1 = arrayifyInteger(payload_1.length);
      length_1.unshift(247 + length_1.length);
      return length_1.concat(payload_1);
    }
    if (!(0, bytes_1.isBytesLike)(object)) {
      logger.throwArgumentError("RLP object must be BytesLike", "object", object);
    }
    var data = Array.prototype.slice.call((0, bytes_1.arrayify)(object));
    if (data.length === 1 && data[0] <= 127) {
      return data;
    } else if (data.length <= 55) {
      data.unshift(128 + data.length);
      return data;
    }
    var length = arrayifyInteger(data.length);
    length.unshift(183 + length.length);
    return length.concat(data);
  };
  var encode = function(object) {
    return (0, bytes_1.hexlify)(_encode(object));
  };
  var _decodeChildren = function(data, offset, childOffset, length) {
    var result = [];
    while (childOffset < offset + 1 + length) {
      var decoded = _decode(data, childOffset);
      result.push(decoded.result);
      childOffset += decoded.consumed;
      if (childOffset > offset + 1 + length) {
        logger.throwError("child data too short", logger_1.Logger.errors.BUFFER_OVERRUN, {});
      }
    }
    return { consumed: 1 + length, result };
  };
  var _decode = function(data, offset) {
    if (data.length === 0) {
      logger.throwError("data too short", logger_1.Logger.errors.BUFFER_OVERRUN, {});
    }
    if (data[offset] >= 248) {
      var lengthLength = data[offset] - 247;
      if (offset + 1 + lengthLength > data.length) {
        logger.throwError("data short segment too short", logger_1.Logger.errors.BUFFER_OVERRUN, {});
      }
      var length_2 = unarrayifyInteger(data, offset + 1, lengthLength);
      if (offset + 1 + lengthLength + length_2 > data.length) {
        logger.throwError("data long segment too short", logger_1.Logger.errors.BUFFER_OVERRUN, {});
      }
      return _decodeChildren(data, offset, offset + 1 + lengthLength, lengthLength + length_2);
    } else if (data[offset] >= 192) {
      var length_3 = data[offset] - 192;
      if (offset + 1 + length_3 > data.length) {
        logger.throwError("data array too short", logger_1.Logger.errors.BUFFER_OVERRUN, {});
      }
      return _decodeChildren(data, offset, offset + 1, length_3);
    } else if (data[offset] >= 184) {
      var lengthLength = data[offset] - 183;
      if (offset + 1 + lengthLength > data.length) {
        logger.throwError("data array too short", logger_1.Logger.errors.BUFFER_OVERRUN, {});
      }
      var length_4 = unarrayifyInteger(data, offset + 1, lengthLength);
      if (offset + 1 + lengthLength + length_4 > data.length) {
        logger.throwError("data array too short", logger_1.Logger.errors.BUFFER_OVERRUN, {});
      }
      var result = (0, bytes_1.hexlify)(data.slice(offset + 1 + lengthLength, offset + 1 + lengthLength + length_4));
      return { consumed: 1 + lengthLength + length_4, result };
    } else if (data[offset] >= 128) {
      var length_5 = data[offset] - 128;
      if (offset + 1 + length_5 > data.length) {
        logger.throwError("data too short", logger_1.Logger.errors.BUFFER_OVERRUN, {});
      }
      var result = (0, bytes_1.hexlify)(data.slice(offset + 1, offset + 1 + length_5));
      return { consumed: 1 + length_5, result };
    }
    return { consumed: 1, result: (0, bytes_1.hexlify)(data[offset]) };
  };
  var decode = function(data) {
    var bytes = (0, bytes_1.arrayify)(data);
    var decoded = _decode(bytes, 0);
    if (decoded.consumed !== bytes.length) {
      logger.throwArgumentError("invalid rlp data", "data", data);
    }
    return decoded.result;
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.decode = exports.encode = undefined;
  var bytes_1 = require_lib2();
  var logger_1 = require_lib();
  var _version_1 = require__version6();
  var logger = new logger_1.Logger(_version_1.version);
  exports.encode = encode;
  exports.decode = decode;
});

// node_modules/@ethersproject/address/lib/_version.js
var require__version7 = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.version = undefined;
  exports.version = "address/5.7.0";
});

// node_modules/@ethersproject/address/lib/index.js
var require_lib7 = __commonJS((exports) => {
  var getChecksumAddress = function(address) {
    if (!(0, bytes_1.isHexString)(address, 20)) {
      logger.throwArgumentError("invalid address", "address", address);
    }
    address = address.toLowerCase();
    var chars = address.substring(2).split("");
    var expanded = new Uint8Array(40);
    for (var i2 = 0;i2 < 40; i2++) {
      expanded[i2] = chars[i2].charCodeAt(0);
    }
    var hashed = (0, bytes_1.arrayify)((0, keccak256_1.keccak256)(expanded));
    for (var i2 = 0;i2 < 40; i2 += 2) {
      if (hashed[i2 >> 1] >> 4 >= 8) {
        chars[i2] = chars[i2].toUpperCase();
      }
      if ((hashed[i2 >> 1] & 15) >= 8) {
        chars[i2 + 1] = chars[i2 + 1].toUpperCase();
      }
    }
    return "0x" + chars.join("");
  };
  var log10 = function(x) {
    if (Math.log10) {
      return Math.log10(x);
    }
    return Math.log(x) / Math.LN10;
  };
  var ibanChecksum = function(address) {
    address = address.toUpperCase();
    address = address.substring(4) + address.substring(0, 2) + "00";
    var expanded = address.split("").map(function(c) {
      return ibanLookup[c];
    }).join("");
    while (expanded.length >= safeDigits) {
      var block = expanded.substring(0, safeDigits);
      expanded = parseInt(block, 10) % 97 + expanded.substring(block.length);
    }
    var checksum = String(98 - parseInt(expanded, 10) % 97);
    while (checksum.length < 2) {
      checksum = "0" + checksum;
    }
    return checksum;
  };
  var getAddress = function(address) {
    var result = null;
    if (typeof address !== "string") {
      logger.throwArgumentError("invalid address", "address", address);
    }
    if (address.match(/^(0x)?[0-9a-fA-F]{40}$/)) {
      if (address.substring(0, 2) !== "0x") {
        address = "0x" + address;
      }
      result = getChecksumAddress(address);
      if (address.match(/([A-F].*[a-f])|([a-f].*[A-F])/) && result !== address) {
        logger.throwArgumentError("bad address checksum", "address", address);
      }
    } else if (address.match(/^XE[0-9]{2}[0-9A-Za-z]{30,31}$/)) {
      if (address.substring(2, 4) !== ibanChecksum(address)) {
        logger.throwArgumentError("bad icap checksum", "address", address);
      }
      result = (0, bignumber_1._base36To16)(address.substring(4));
      while (result.length < 40) {
        result = "0" + result;
      }
      result = getChecksumAddress("0x" + result);
    } else {
      logger.throwArgumentError("invalid address", "address", address);
    }
    return result;
  };
  var isAddress = function(address) {
    try {
      getAddress(address);
      return true;
    } catch (error) {
    }
    return false;
  };
  var getIcapAddress = function(address) {
    var base36 = (0, bignumber_1._base16To36)(getAddress(address).substring(2)).toUpperCase();
    while (base36.length < 30) {
      base36 = "0" + base36;
    }
    return "XE" + ibanChecksum("XE00" + base36) + base36;
  };
  var getContractAddress = function(transaction) {
    var from = null;
    try {
      from = getAddress(transaction.from);
    } catch (error) {
      logger.throwArgumentError("missing from address", "transaction", transaction);
    }
    var nonce = (0, bytes_1.stripZeros)((0, bytes_1.arrayify)(bignumber_1.BigNumber.from(transaction.nonce).toHexString()));
    return getAddress((0, bytes_1.hexDataSlice)((0, keccak256_1.keccak256)((0, rlp_1.encode)([from, nonce])), 12));
  };
  var getCreate2Address = function(from, salt, initCodeHash) {
    if ((0, bytes_1.hexDataLength)(salt) !== 32) {
      logger.throwArgumentError("salt must be 32 bytes", "salt", salt);
    }
    if ((0, bytes_1.hexDataLength)(initCodeHash) !== 32) {
      logger.throwArgumentError("initCodeHash must be 32 bytes", "initCodeHash", initCodeHash);
    }
    return getAddress((0, bytes_1.hexDataSlice)((0, keccak256_1.keccak256)((0, bytes_1.concat)(["0xff", getAddress(from), salt, initCodeHash])), 12));
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.getCreate2Address = exports.getContractAddress = exports.getIcapAddress = exports.isAddress = exports.getAddress = undefined;
  var bytes_1 = require_lib2();
  var bignumber_1 = require_lib3();
  var keccak256_1 = require_lib5();
  var rlp_1 = require_lib6();
  var logger_1 = require_lib();
  var _version_1 = require__version7();
  var logger = new logger_1.Logger(_version_1.version);
  var MAX_SAFE_INTEGER = 9007199254740991;
  var ibanLookup = {};
  for (i = 0;i < 10; i++) {
    ibanLookup[String(i)] = String(i);
  }
  var i;
  for (i = 0;i < 26; i++) {
    ibanLookup[String.fromCharCode(65 + i)] = String(10 + i);
  }
  var i;
  var safeDigits = Math.floor(log10(MAX_SAFE_INTEGER));
  exports.getAddress = getAddress;
  exports.isAddress = isAddress;
  exports.getIcapAddress = getIcapAddress;
  exports.getContractAddress = getContractAddress;
  exports.getCreate2Address = getCreate2Address;
});

// node_modules/@ethersproject/abi/lib/coders/address.js
var require_address = __commonJS((exports) => {
  var __extends = exports && exports.__extends || function() {
    var extendStatics = function(d, b2) {
      extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b3) {
        d2.__proto__ = b3;
      } || function(d2, b3) {
        for (var p in b3)
          if (Object.prototype.hasOwnProperty.call(b3, p))
            d2[p] = b3[p];
      };
      return extendStatics(d, b2);
    };
    return function(d, b2) {
      if (typeof b2 !== "function" && b2 !== null)
        throw new TypeError("Class extends value " + String(b2) + " is not a constructor or null");
      extendStatics(d, b2);
      function __() {
        this.constructor = d;
      }
      d.prototype = b2 === null ? Object.create(b2) : (__.prototype = b2.prototype, new __);
    };
  }();
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.AddressCoder = undefined;
  var address_1 = require_lib7();
  var bytes_1 = require_lib2();
  var abstract_coder_1 = require_abstract_coder();
  var AddressCoder = function(_super) {
    __extends(AddressCoder2, _super);
    function AddressCoder2(localName) {
      return _super.call(this, "address", "address", localName, false) || this;
    }
    AddressCoder2.prototype.defaultValue = function() {
      return "0x0000000000000000000000000000000000000000";
    };
    AddressCoder2.prototype.encode = function(writer, value) {
      try {
        value = (0, address_1.getAddress)(value);
      } catch (error) {
        this._throwError(error.message, value);
      }
      return writer.writeValue(value);
    };
    AddressCoder2.prototype.decode = function(reader) {
      return (0, address_1.getAddress)((0, bytes_1.hexZeroPad)(reader.readValue().toHexString(), 20));
    };
    return AddressCoder2;
  }(abstract_coder_1.Coder);
  exports.AddressCoder = AddressCoder;
});

// node_modules/@ethersproject/abi/lib/coders/anonymous.js
var require_anonymous = __commonJS((exports) => {
  var __extends = exports && exports.__extends || function() {
    var extendStatics = function(d, b2) {
      extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b3) {
        d2.__proto__ = b3;
      } || function(d2, b3) {
        for (var p in b3)
          if (Object.prototype.hasOwnProperty.call(b3, p))
            d2[p] = b3[p];
      };
      return extendStatics(d, b2);
    };
    return function(d, b2) {
      if (typeof b2 !== "function" && b2 !== null)
        throw new TypeError("Class extends value " + String(b2) + " is not a constructor or null");
      extendStatics(d, b2);
      function __() {
        this.constructor = d;
      }
      d.prototype = b2 === null ? Object.create(b2) : (__.prototype = b2.prototype, new __);
    };
  }();
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.AnonymousCoder = undefined;
  var abstract_coder_1 = require_abstract_coder();
  var AnonymousCoder = function(_super) {
    __extends(AnonymousCoder2, _super);
    function AnonymousCoder2(coder) {
      var _this = _super.call(this, coder.name, coder.type, undefined, coder.dynamic) || this;
      _this.coder = coder;
      return _this;
    }
    AnonymousCoder2.prototype.defaultValue = function() {
      return this.coder.defaultValue();
    };
    AnonymousCoder2.prototype.encode = function(writer, value) {
      return this.coder.encode(writer, value);
    };
    AnonymousCoder2.prototype.decode = function(reader) {
      return this.coder.decode(reader);
    };
    return AnonymousCoder2;
  }(abstract_coder_1.Coder);
  exports.AnonymousCoder = AnonymousCoder;
});

// node_modules/@ethersproject/abi/lib/coders/array.js
var require_array = __commonJS((exports) => {
  var pack = function(writer, coders, values) {
    var arrayValues = null;
    if (Array.isArray(values)) {
      arrayValues = values;
    } else if (values && typeof values === "object") {
      var unique_1 = {};
      arrayValues = coders.map(function(coder) {
        var name = coder.localName;
        if (!name) {
          logger.throwError("cannot encode object for signature with missing names", logger_1.Logger.errors.INVALID_ARGUMENT, {
            argument: "values",
            coder,
            value: values
          });
        }
        if (unique_1[name]) {
          logger.throwError("cannot encode object for signature with duplicate names", logger_1.Logger.errors.INVALID_ARGUMENT, {
            argument: "values",
            coder,
            value: values
          });
        }
        unique_1[name] = true;
        return values[name];
      });
    } else {
      logger.throwArgumentError("invalid tuple value", "tuple", values);
    }
    if (coders.length !== arrayValues.length) {
      logger.throwArgumentError("types/value length mismatch", "tuple", values);
    }
    var staticWriter = new abstract_coder_1.Writer(writer.wordSize);
    var dynamicWriter = new abstract_coder_1.Writer(writer.wordSize);
    var updateFuncs = [];
    coders.forEach(function(coder, index) {
      var value = arrayValues[index];
      if (coder.dynamic) {
        var dynamicOffset_1 = dynamicWriter.length;
        coder.encode(dynamicWriter, value);
        var updateFunc_1 = staticWriter.writeUpdatableValue();
        updateFuncs.push(function(baseOffset) {
          updateFunc_1(baseOffset + dynamicOffset_1);
        });
      } else {
        coder.encode(staticWriter, value);
      }
    });
    updateFuncs.forEach(function(func) {
      func(staticWriter.length);
    });
    var length = writer.appendWriter(staticWriter);
    length += writer.appendWriter(dynamicWriter);
    return length;
  };
  var unpack = function(reader, coders) {
    var values = [];
    var baseReader = reader.subReader(0);
    coders.forEach(function(coder) {
      var value = null;
      if (coder.dynamic) {
        var offset = reader.readValue();
        var offsetReader = baseReader.subReader(offset.toNumber());
        try {
          value = coder.decode(offsetReader);
        } catch (error) {
          if (error.code === logger_1.Logger.errors.BUFFER_OVERRUN) {
            throw error;
          }
          value = error;
          value.baseType = coder.name;
          value.name = coder.localName;
          value.type = coder.type;
        }
      } else {
        try {
          value = coder.decode(reader);
        } catch (error) {
          if (error.code === logger_1.Logger.errors.BUFFER_OVERRUN) {
            throw error;
          }
          value = error;
          value.baseType = coder.name;
          value.name = coder.localName;
          value.type = coder.type;
        }
      }
      if (value != null) {
        values.push(value);
      }
    });
    var uniqueNames = coders.reduce(function(accum, coder) {
      var name = coder.localName;
      if (name) {
        if (!accum[name]) {
          accum[name] = 0;
        }
        accum[name]++;
      }
      return accum;
    }, {});
    coders.forEach(function(coder, index) {
      var name = coder.localName;
      if (!name || uniqueNames[name] !== 1) {
        return;
      }
      if (name === "length") {
        name = "_length";
      }
      if (values[name] != null) {
        return;
      }
      var value = values[index];
      if (value instanceof Error) {
        Object.defineProperty(values, name, {
          enumerable: true,
          get: function() {
            throw value;
          }
        });
      } else {
        values[name] = value;
      }
    });
    var _loop_1 = function(i2) {
      var value = values[i2];
      if (value instanceof Error) {
        Object.defineProperty(values, i2, {
          enumerable: true,
          get: function() {
            throw value;
          }
        });
      }
    };
    for (var i = 0;i < values.length; i++) {
      _loop_1(i);
    }
    return Object.freeze(values);
  };
  var __extends = exports && exports.__extends || function() {
    var extendStatics = function(d, b2) {
      extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b3) {
        d2.__proto__ = b3;
      } || function(d2, b3) {
        for (var p in b3)
          if (Object.prototype.hasOwnProperty.call(b3, p))
            d2[p] = b3[p];
      };
      return extendStatics(d, b2);
    };
    return function(d, b2) {
      if (typeof b2 !== "function" && b2 !== null)
        throw new TypeError("Class extends value " + String(b2) + " is not a constructor or null");
      extendStatics(d, b2);
      function __() {
        this.constructor = d;
      }
      d.prototype = b2 === null ? Object.create(b2) : (__.prototype = b2.prototype, new __);
    };
  }();
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.ArrayCoder = exports.unpack = exports.pack = undefined;
  var logger_1 = require_lib();
  var _version_1 = require__version5();
  var logger = new logger_1.Logger(_version_1.version);
  var abstract_coder_1 = require_abstract_coder();
  var anonymous_1 = require_anonymous();
  exports.pack = pack;
  exports.unpack = unpack;
  var ArrayCoder = function(_super) {
    __extends(ArrayCoder2, _super);
    function ArrayCoder2(coder, length, localName) {
      var _this = this;
      var type = coder.type + "[" + (length >= 0 ? length : "") + "]";
      var dynamic = length === -1 || coder.dynamic;
      _this = _super.call(this, "array", type, localName, dynamic) || this;
      _this.coder = coder;
      _this.length = length;
      return _this;
    }
    ArrayCoder2.prototype.defaultValue = function() {
      var defaultChild = this.coder.defaultValue();
      var result = [];
      for (var i = 0;i < this.length; i++) {
        result.push(defaultChild);
      }
      return result;
    };
    ArrayCoder2.prototype.encode = function(writer, value) {
      if (!Array.isArray(value)) {
        this._throwError("expected array value", value);
      }
      var count = this.length;
      if (count === -1) {
        count = value.length;
        writer.writeValue(value.length);
      }
      logger.checkArgumentCount(value.length, count, "coder array" + (this.localName ? " " + this.localName : ""));
      var coders = [];
      for (var i = 0;i < value.length; i++) {
        coders.push(this.coder);
      }
      return pack(writer, coders, value);
    };
    ArrayCoder2.prototype.decode = function(reader) {
      var count = this.length;
      if (count === -1) {
        count = reader.readValue().toNumber();
        if (count * 32 > reader._data.length) {
          logger.throwError("insufficient data length", logger_1.Logger.errors.BUFFER_OVERRUN, {
            length: reader._data.length,
            count
          });
        }
      }
      var coders = [];
      for (var i = 0;i < count; i++) {
        coders.push(new anonymous_1.AnonymousCoder(this.coder));
      }
      return reader.coerce(this.name, unpack(reader, coders));
    };
    return ArrayCoder2;
  }(abstract_coder_1.Coder);
  exports.ArrayCoder = ArrayCoder;
});

// node_modules/@ethersproject/abi/lib/coders/boolean.js
var require_boolean = __commonJS((exports) => {
  var __extends = exports && exports.__extends || function() {
    var extendStatics = function(d, b2) {
      extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b3) {
        d2.__proto__ = b3;
      } || function(d2, b3) {
        for (var p in b3)
          if (Object.prototype.hasOwnProperty.call(b3, p))
            d2[p] = b3[p];
      };
      return extendStatics(d, b2);
    };
    return function(d, b2) {
      if (typeof b2 !== "function" && b2 !== null)
        throw new TypeError("Class extends value " + String(b2) + " is not a constructor or null");
      extendStatics(d, b2);
      function __() {
        this.constructor = d;
      }
      d.prototype = b2 === null ? Object.create(b2) : (__.prototype = b2.prototype, new __);
    };
  }();
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.BooleanCoder = undefined;
  var abstract_coder_1 = require_abstract_coder();
  var BooleanCoder = function(_super) {
    __extends(BooleanCoder2, _super);
    function BooleanCoder2(localName) {
      return _super.call(this, "bool", "bool", localName, false) || this;
    }
    BooleanCoder2.prototype.defaultValue = function() {
      return false;
    };
    BooleanCoder2.prototype.encode = function(writer, value) {
      return writer.writeValue(value ? 1 : 0);
    };
    BooleanCoder2.prototype.decode = function(reader) {
      return reader.coerce(this.type, !reader.readValue().isZero());
    };
    return BooleanCoder2;
  }(abstract_coder_1.Coder);
  exports.BooleanCoder = BooleanCoder;
});

// node_modules/@ethersproject/abi/lib/coders/bytes.js
var require_bytes = __commonJS((exports) => {
  var __extends = exports && exports.__extends || function() {
    var extendStatics = function(d, b2) {
      extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b3) {
        d2.__proto__ = b3;
      } || function(d2, b3) {
        for (var p in b3)
          if (Object.prototype.hasOwnProperty.call(b3, p))
            d2[p] = b3[p];
      };
      return extendStatics(d, b2);
    };
    return function(d, b2) {
      if (typeof b2 !== "function" && b2 !== null)
        throw new TypeError("Class extends value " + String(b2) + " is not a constructor or null");
      extendStatics(d, b2);
      function __() {
        this.constructor = d;
      }
      d.prototype = b2 === null ? Object.create(b2) : (__.prototype = b2.prototype, new __);
    };
  }();
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.BytesCoder = exports.DynamicBytesCoder = undefined;
  var bytes_1 = require_lib2();
  var abstract_coder_1 = require_abstract_coder();
  var DynamicBytesCoder = function(_super) {
    __extends(DynamicBytesCoder2, _super);
    function DynamicBytesCoder2(type, localName) {
      return _super.call(this, type, type, localName, true) || this;
    }
    DynamicBytesCoder2.prototype.defaultValue = function() {
      return "0x";
    };
    DynamicBytesCoder2.prototype.encode = function(writer, value) {
      value = (0, bytes_1.arrayify)(value);
      var length = writer.writeValue(value.length);
      length += writer.writeBytes(value);
      return length;
    };
    DynamicBytesCoder2.prototype.decode = function(reader) {
      return reader.readBytes(reader.readValue().toNumber(), true);
    };
    return DynamicBytesCoder2;
  }(abstract_coder_1.Coder);
  exports.DynamicBytesCoder = DynamicBytesCoder;
  var BytesCoder = function(_super) {
    __extends(BytesCoder2, _super);
    function BytesCoder2(localName) {
      return _super.call(this, "bytes", localName) || this;
    }
    BytesCoder2.prototype.decode = function(reader) {
      return reader.coerce(this.name, (0, bytes_1.hexlify)(_super.prototype.decode.call(this, reader)));
    };
    return BytesCoder2;
  }(DynamicBytesCoder);
  exports.BytesCoder = BytesCoder;
});

// node_modules/@ethersproject/abi/lib/coders/fixed-bytes.js
var require_fixed_bytes = __commonJS((exports) => {
  var __extends = exports && exports.__extends || function() {
    var extendStatics = function(d, b2) {
      extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b3) {
        d2.__proto__ = b3;
      } || function(d2, b3) {
        for (var p in b3)
          if (Object.prototype.hasOwnProperty.call(b3, p))
            d2[p] = b3[p];
      };
      return extendStatics(d, b2);
    };
    return function(d, b2) {
      if (typeof b2 !== "function" && b2 !== null)
        throw new TypeError("Class extends value " + String(b2) + " is not a constructor or null");
      extendStatics(d, b2);
      function __() {
        this.constructor = d;
      }
      d.prototype = b2 === null ? Object.create(b2) : (__.prototype = b2.prototype, new __);
    };
  }();
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.FixedBytesCoder = undefined;
  var bytes_1 = require_lib2();
  var abstract_coder_1 = require_abstract_coder();
  var FixedBytesCoder = function(_super) {
    __extends(FixedBytesCoder2, _super);
    function FixedBytesCoder2(size, localName) {
      var _this = this;
      var name = "bytes" + String(size);
      _this = _super.call(this, name, name, localName, false) || this;
      _this.size = size;
      return _this;
    }
    FixedBytesCoder2.prototype.defaultValue = function() {
      return "0x0000000000000000000000000000000000000000000000000000000000000000".substring(0, 2 + this.size * 2);
    };
    FixedBytesCoder2.prototype.encode = function(writer, value) {
      var data = (0, bytes_1.arrayify)(value);
      if (data.length !== this.size) {
        this._throwError("incorrect data length", value);
      }
      return writer.writeBytes(data);
    };
    FixedBytesCoder2.prototype.decode = function(reader) {
      return reader.coerce(this.name, (0, bytes_1.hexlify)(reader.readBytes(this.size)));
    };
    return FixedBytesCoder2;
  }(abstract_coder_1.Coder);
  exports.FixedBytesCoder = FixedBytesCoder;
});

// node_modules/@ethersproject/abi/lib/coders/null.js
var require_null = __commonJS((exports) => {
  var __extends = exports && exports.__extends || function() {
    var extendStatics = function(d, b2) {
      extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b3) {
        d2.__proto__ = b3;
      } || function(d2, b3) {
        for (var p in b3)
          if (Object.prototype.hasOwnProperty.call(b3, p))
            d2[p] = b3[p];
      };
      return extendStatics(d, b2);
    };
    return function(d, b2) {
      if (typeof b2 !== "function" && b2 !== null)
        throw new TypeError("Class extends value " + String(b2) + " is not a constructor or null");
      extendStatics(d, b2);
      function __() {
        this.constructor = d;
      }
      d.prototype = b2 === null ? Object.create(b2) : (__.prototype = b2.prototype, new __);
    };
  }();
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.NullCoder = undefined;
  var abstract_coder_1 = require_abstract_coder();
  var NullCoder = function(_super) {
    __extends(NullCoder2, _super);
    function NullCoder2(localName) {
      return _super.call(this, "null", "", localName, false) || this;
    }
    NullCoder2.prototype.defaultValue = function() {
      return null;
    };
    NullCoder2.prototype.encode = function(writer, value) {
      if (value != null) {
        this._throwError("not null", value);
      }
      return writer.writeBytes([]);
    };
    NullCoder2.prototype.decode = function(reader) {
      reader.readBytes(0);
      return reader.coerce(this.name, null);
    };
    return NullCoder2;
  }(abstract_coder_1.Coder);
  exports.NullCoder = NullCoder;
});

// node_modules/@ethersproject/constants/lib/addresses.js
var require_addresses = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.AddressZero = undefined;
  exports.AddressZero = "0x0000000000000000000000000000000000000000";
});

// node_modules/@ethersproject/constants/lib/bignumbers.js
var require_bignumbers = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.MaxInt256 = exports.MinInt256 = exports.MaxUint256 = exports.WeiPerEther = exports.Two = exports.One = exports.Zero = exports.NegativeOne = undefined;
  var bignumber_1 = require_lib3();
  var NegativeOne = bignumber_1.BigNumber.from(-1);
  exports.NegativeOne = NegativeOne;
  var Zero = bignumber_1.BigNumber.from(0);
  exports.Zero = Zero;
  var One = bignumber_1.BigNumber.from(1);
  exports.One = One;
  var Two = bignumber_1.BigNumber.from(2);
  exports.Two = Two;
  var WeiPerEther = bignumber_1.BigNumber.from("1000000000000000000");
  exports.WeiPerEther = WeiPerEther;
  var MaxUint256 = bignumber_1.BigNumber.from("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
  exports.MaxUint256 = MaxUint256;
  var MinInt256 = bignumber_1.BigNumber.from("-0x8000000000000000000000000000000000000000000000000000000000000000");
  exports.MinInt256 = MinInt256;
  var MaxInt256 = bignumber_1.BigNumber.from("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
  exports.MaxInt256 = MaxInt256;
});

// node_modules/@ethersproject/constants/lib/hashes.js
var require_hashes = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.HashZero = undefined;
  exports.HashZero = "0x0000000000000000000000000000000000000000000000000000000000000000";
});

// node_modules/@ethersproject/constants/lib/strings.js
var require_strings = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.EtherSymbol = undefined;
  exports.EtherSymbol = "\u039E";
});

// node_modules/@ethersproject/constants/lib/index.js
var require_lib8 = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.EtherSymbol = exports.HashZero = exports.MaxInt256 = exports.MinInt256 = exports.MaxUint256 = exports.WeiPerEther = exports.Two = exports.One = exports.Zero = exports.NegativeOne = exports.AddressZero = undefined;
  var addresses_1 = require_addresses();
  Object.defineProperty(exports, "AddressZero", { enumerable: true, get: function() {
    return addresses_1.AddressZero;
  } });
  var bignumbers_1 = require_bignumbers();
  Object.defineProperty(exports, "NegativeOne", { enumerable: true, get: function() {
    return bignumbers_1.NegativeOne;
  } });
  Object.defineProperty(exports, "Zero", { enumerable: true, get: function() {
    return bignumbers_1.Zero;
  } });
  Object.defineProperty(exports, "One", { enumerable: true, get: function() {
    return bignumbers_1.One;
  } });
  Object.defineProperty(exports, "Two", { enumerable: true, get: function() {
    return bignumbers_1.Two;
  } });
  Object.defineProperty(exports, "WeiPerEther", { enumerable: true, get: function() {
    return bignumbers_1.WeiPerEther;
  } });
  Object.defineProperty(exports, "MaxUint256", { enumerable: true, get: function() {
    return bignumbers_1.MaxUint256;
  } });
  Object.defineProperty(exports, "MinInt256", { enumerable: true, get: function() {
    return bignumbers_1.MinInt256;
  } });
  Object.defineProperty(exports, "MaxInt256", { enumerable: true, get: function() {
    return bignumbers_1.MaxInt256;
  } });
  var hashes_1 = require_hashes();
  Object.defineProperty(exports, "HashZero", { enumerable: true, get: function() {
    return hashes_1.HashZero;
  } });
  var strings_1 = require_strings();
  Object.defineProperty(exports, "EtherSymbol", { enumerable: true, get: function() {
    return strings_1.EtherSymbol;
  } });
});

// node_modules/@ethersproject/abi/lib/coders/number.js
var require_number = __commonJS((exports) => {
  var __extends = exports && exports.__extends || function() {
    var extendStatics = function(d, b2) {
      extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b3) {
        d2.__proto__ = b3;
      } || function(d2, b3) {
        for (var p in b3)
          if (Object.prototype.hasOwnProperty.call(b3, p))
            d2[p] = b3[p];
      };
      return extendStatics(d, b2);
    };
    return function(d, b2) {
      if (typeof b2 !== "function" && b2 !== null)
        throw new TypeError("Class extends value " + String(b2) + " is not a constructor or null");
      extendStatics(d, b2);
      function __() {
        this.constructor = d;
      }
      d.prototype = b2 === null ? Object.create(b2) : (__.prototype = b2.prototype, new __);
    };
  }();
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.NumberCoder = undefined;
  var bignumber_1 = require_lib3();
  var constants_1 = require_lib8();
  var abstract_coder_1 = require_abstract_coder();
  var NumberCoder = function(_super) {
    __extends(NumberCoder2, _super);
    function NumberCoder2(size, signed, localName) {
      var _this = this;
      var name = (signed ? "int" : "uint") + size * 8;
      _this = _super.call(this, name, name, localName, false) || this;
      _this.size = size;
      _this.signed = signed;
      return _this;
    }
    NumberCoder2.prototype.defaultValue = function() {
      return 0;
    };
    NumberCoder2.prototype.encode = function(writer, value) {
      var v2 = bignumber_1.BigNumber.from(value);
      var maxUintValue = constants_1.MaxUint256.mask(writer.wordSize * 8);
      if (this.signed) {
        var bounds = maxUintValue.mask(this.size * 8 - 1);
        if (v2.gt(bounds) || v2.lt(bounds.add(constants_1.One).mul(constants_1.NegativeOne))) {
          this._throwError("value out-of-bounds", value);
        }
      } else if (v2.lt(constants_1.Zero) || v2.gt(maxUintValue.mask(this.size * 8))) {
        this._throwError("value out-of-bounds", value);
      }
      v2 = v2.toTwos(this.size * 8).mask(this.size * 8);
      if (this.signed) {
        v2 = v2.fromTwos(this.size * 8).toTwos(8 * writer.wordSize);
      }
      return writer.writeValue(v2);
    };
    NumberCoder2.prototype.decode = function(reader) {
      var value = reader.readValue().mask(this.size * 8);
      if (this.signed) {
        value = value.fromTwos(this.size * 8);
      }
      return reader.coerce(this.name, value);
    };
    return NumberCoder2;
  }(abstract_coder_1.Coder);
  exports.NumberCoder = NumberCoder;
});

// node_modules/@ethersproject/strings/lib/_version.js
var require__version8 = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.version = undefined;
  exports.version = "strings/5.7.0";
});

// node_modules/@ethersproject/strings/lib/utf8.js
var require_utf8 = __commonJS((exports) => {
  var errorFunc = function(reason, offset, bytes, output, badCodepoint) {
    return logger.throwArgumentError("invalid codepoint at offset " + offset + "; " + reason, "bytes", bytes);
  };
  var ignoreFunc = function(reason, offset, bytes, output, badCodepoint) {
    if (reason === Utf8ErrorReason.BAD_PREFIX || reason === Utf8ErrorReason.UNEXPECTED_CONTINUE) {
      var i = 0;
      for (var o = offset + 1;o < bytes.length; o++) {
        if (bytes[o] >> 6 !== 2) {
          break;
        }
        i++;
      }
      return i;
    }
    if (reason === Utf8ErrorReason.OVERRUN) {
      return bytes.length - offset - 1;
    }
    return 0;
  };
  var replaceFunc = function(reason, offset, bytes, output, badCodepoint) {
    if (reason === Utf8ErrorReason.OVERLONG) {
      output.push(badCodepoint);
      return 0;
    }
    output.push(65533);
    return ignoreFunc(reason, offset, bytes, output, badCodepoint);
  };
  var getUtf8CodePoints = function(bytes, onError) {
    if (onError == null) {
      onError = exports.Utf8ErrorFuncs.error;
    }
    bytes = (0, bytes_1.arrayify)(bytes);
    var result = [];
    var i = 0;
    while (i < bytes.length) {
      var c = bytes[i++];
      if (c >> 7 === 0) {
        result.push(c);
        continue;
      }
      var extraLength = null;
      var overlongMask = null;
      if ((c & 224) === 192) {
        extraLength = 1;
        overlongMask = 127;
      } else if ((c & 240) === 224) {
        extraLength = 2;
        overlongMask = 2047;
      } else if ((c & 248) === 240) {
        extraLength = 3;
        overlongMask = 65535;
      } else {
        if ((c & 192) === 128) {
          i += onError(Utf8ErrorReason.UNEXPECTED_CONTINUE, i - 1, bytes, result);
        } else {
          i += onError(Utf8ErrorReason.BAD_PREFIX, i - 1, bytes, result);
        }
        continue;
      }
      if (i - 1 + extraLength >= bytes.length) {
        i += onError(Utf8ErrorReason.OVERRUN, i - 1, bytes, result);
        continue;
      }
      var res = c & (1 << 8 - extraLength - 1) - 1;
      for (var j = 0;j < extraLength; j++) {
        var nextChar = bytes[i];
        if ((nextChar & 192) != 128) {
          i += onError(Utf8ErrorReason.MISSING_CONTINUE, i, bytes, result);
          res = null;
          break;
        }
        res = res << 6 | nextChar & 63;
        i++;
      }
      if (res === null) {
        continue;
      }
      if (res > 1114111) {
        i += onError(Utf8ErrorReason.OUT_OF_RANGE, i - 1 - extraLength, bytes, result, res);
        continue;
      }
      if (res >= 55296 && res <= 57343) {
        i += onError(Utf8ErrorReason.UTF16_SURROGATE, i - 1 - extraLength, bytes, result, res);
        continue;
      }
      if (res <= overlongMask) {
        i += onError(Utf8ErrorReason.OVERLONG, i - 1 - extraLength, bytes, result, res);
        continue;
      }
      result.push(res);
    }
    return result;
  };
  var toUtf8Bytes = function(str, form) {
    if (form === undefined) {
      form = UnicodeNormalizationForm.current;
    }
    if (form != UnicodeNormalizationForm.current) {
      logger.checkNormalize();
      str = str.normalize(form);
    }
    var result = [];
    for (var i = 0;i < str.length; i++) {
      var c = str.charCodeAt(i);
      if (c < 128) {
        result.push(c);
      } else if (c < 2048) {
        result.push(c >> 6 | 192);
        result.push(c & 63 | 128);
      } else if ((c & 64512) == 55296) {
        i++;
        var c2 = str.charCodeAt(i);
        if (i >= str.length || (c2 & 64512) !== 56320) {
          throw new Error("invalid utf-8 string");
        }
        var pair = 65536 + ((c & 1023) << 10) + (c2 & 1023);
        result.push(pair >> 18 | 240);
        result.push(pair >> 12 & 63 | 128);
        result.push(pair >> 6 & 63 | 128);
        result.push(pair & 63 | 128);
      } else {
        result.push(c >> 12 | 224);
        result.push(c >> 6 & 63 | 128);
        result.push(c & 63 | 128);
      }
    }
    return (0, bytes_1.arrayify)(result);
  };
  var escapeChar = function(value) {
    var hex = "0000" + value.toString(16);
    return "\\u" + hex.substring(hex.length - 4);
  };
  var _toEscapedUtf8String = function(bytes, onError) {
    return '"' + getUtf8CodePoints(bytes, onError).map(function(codePoint) {
      if (codePoint < 256) {
        switch (codePoint) {
          case 8:
            return "\\b";
          case 9:
            return "\\t";
          case 10:
            return "\\n";
          case 13:
            return "\\r";
          case 34:
            return "\\\"";
          case 92:
            return "\\\\";
        }
        if (codePoint >= 32 && codePoint < 127) {
          return String.fromCharCode(codePoint);
        }
      }
      if (codePoint <= 65535) {
        return escapeChar(codePoint);
      }
      codePoint -= 65536;
      return escapeChar((codePoint >> 10 & 1023) + 55296) + escapeChar((codePoint & 1023) + 56320);
    }).join("") + '"';
  };
  var _toUtf8String = function(codePoints) {
    return codePoints.map(function(codePoint) {
      if (codePoint <= 65535) {
        return String.fromCharCode(codePoint);
      }
      codePoint -= 65536;
      return String.fromCharCode((codePoint >> 10 & 1023) + 55296, (codePoint & 1023) + 56320);
    }).join("");
  };
  var toUtf8String = function(bytes, onError) {
    return _toUtf8String(getUtf8CodePoints(bytes, onError));
  };
  var toUtf8CodePoints = function(str, form) {
    if (form === undefined) {
      form = UnicodeNormalizationForm.current;
    }
    return getUtf8CodePoints(toUtf8Bytes(str, form));
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.toUtf8CodePoints = exports.toUtf8String = exports._toUtf8String = exports._toEscapedUtf8String = exports.toUtf8Bytes = exports.Utf8ErrorFuncs = exports.Utf8ErrorReason = exports.UnicodeNormalizationForm = undefined;
  var bytes_1 = require_lib2();
  var logger_1 = require_lib();
  var _version_1 = require__version8();
  var logger = new logger_1.Logger(_version_1.version);
  var UnicodeNormalizationForm;
  (function(UnicodeNormalizationForm2) {
    UnicodeNormalizationForm2["current"] = "";
    UnicodeNormalizationForm2["NFC"] = "NFC";
    UnicodeNormalizationForm2["NFD"] = "NFD";
    UnicodeNormalizationForm2["NFKC"] = "NFKC";
    UnicodeNormalizationForm2["NFKD"] = "NFKD";
  })(UnicodeNormalizationForm = exports.UnicodeNormalizationForm || (exports.UnicodeNormalizationForm = {}));
  var Utf8ErrorReason;
  (function(Utf8ErrorReason2) {
    Utf8ErrorReason2["UNEXPECTED_CONTINUE"] = "unexpected continuation byte";
    Utf8ErrorReason2["BAD_PREFIX"] = "bad codepoint prefix";
    Utf8ErrorReason2["OVERRUN"] = "string overrun";
    Utf8ErrorReason2["MISSING_CONTINUE"] = "missing continuation byte";
    Utf8ErrorReason2["OUT_OF_RANGE"] = "out of UTF-8 range";
    Utf8ErrorReason2["UTF16_SURROGATE"] = "UTF-16 surrogate";
    Utf8ErrorReason2["OVERLONG"] = "overlong representation";
  })(Utf8ErrorReason = exports.Utf8ErrorReason || (exports.Utf8ErrorReason = {}));
  exports.Utf8ErrorFuncs = Object.freeze({
    error: errorFunc,
    ignore: ignoreFunc,
    replace: replaceFunc
  });
  exports.toUtf8Bytes = toUtf8Bytes;
  exports._toEscapedUtf8String = _toEscapedUtf8String;
  exports._toUtf8String = _toUtf8String;
  exports.toUtf8String = toUtf8String;
  exports.toUtf8CodePoints = toUtf8CodePoints;
});

// node_modules/@ethersproject/strings/lib/bytes32.js
var require_bytes32 = __commonJS((exports) => {
  var formatBytes32String = function(text) {
    var bytes = (0, utf8_1.toUtf8Bytes)(text);
    if (bytes.length > 31) {
      throw new Error("bytes32 string must be less than 32 bytes");
    }
    return (0, bytes_1.hexlify)((0, bytes_1.concat)([bytes, constants_1.HashZero]).slice(0, 32));
  };
  var parseBytes32String = function(bytes) {
    var data = (0, bytes_1.arrayify)(bytes);
    if (data.length !== 32) {
      throw new Error("invalid bytes32 - not 32 bytes long");
    }
    if (data[31] !== 0) {
      throw new Error("invalid bytes32 string - no null terminator");
    }
    var length = 31;
    while (data[length - 1] === 0) {
      length--;
    }
    return (0, utf8_1.toUtf8String)(data.slice(0, length));
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.parseBytes32String = exports.formatBytes32String = undefined;
  var constants_1 = require_lib8();
  var bytes_1 = require_lib2();
  var utf8_1 = require_utf8();
  exports.formatBytes32String = formatBytes32String;
  exports.parseBytes32String = parseBytes32String;
});

// node_modules/@ethersproject/strings/lib/idna.js
var require_idna = __commonJS((exports) => {
  var bytes2 = function(data) {
    if (data.length % 4 !== 0) {
      throw new Error("bad data");
    }
    var result = [];
    for (var i = 0;i < data.length; i += 4) {
      result.push(parseInt(data.substring(i, i + 4), 16));
    }
    return result;
  };
  var createTable = function(data, func) {
    if (!func) {
      func = function(value) {
        return [parseInt(value, 16)];
      };
    }
    var lo = 0;
    var result = {};
    data.split(",").forEach(function(pair) {
      var comps = pair.split(":");
      lo += parseInt(comps[0], 16);
      result[lo] = func(comps[1]);
    });
    return result;
  };
  var createRangeTable = function(data) {
    var hi = 0;
    return data.split(",").map(function(v2) {
      var comps = v2.split("-");
      if (comps.length === 1) {
        comps[1] = "0";
      } else if (comps[1] === "") {
        comps[1] = "1";
      }
      var lo = hi + parseInt(comps[0], 16);
      hi = parseInt(comps[1], 16);
      return { l: lo, h: hi };
    });
  };
  var matchMap = function(value, ranges) {
    var lo = 0;
    for (var i = 0;i < ranges.length; i++) {
      var range = ranges[i];
      lo += range.l;
      if (value >= lo && value <= lo + range.h && (value - lo) % (range.d || 1) === 0) {
        if (range.e && range.e.indexOf(value - lo) !== -1) {
          continue;
        }
        return range;
      }
    }
    return null;
  };
  var flatten = function(values) {
    return values.reduce(function(accum, value) {
      value.forEach(function(value2) {
        accum.push(value2);
      });
      return accum;
    }, []);
  };
  var _nameprepTableA1 = function(codepoint) {
    return !!matchMap(codepoint, Table_A_1_ranges);
  };
  var _nameprepTableB2 = function(codepoint) {
    var range = matchMap(codepoint, Table_B_2_ranges);
    if (range) {
      return [codepoint + range.s];
    }
    var codes = Table_B_2_lut_abs[codepoint];
    if (codes) {
      return codes;
    }
    var shift = Table_B_2_lut_rel[codepoint];
    if (shift) {
      return [codepoint + shift[0]];
    }
    var complex = Table_B_2_complex[codepoint];
    if (complex) {
      return complex;
    }
    return null;
  };
  var _nameprepTableC = function(codepoint) {
    return !!matchMap(codepoint, Table_C_ranges);
  };
  var nameprep = function(value) {
    if (value.match(/^[a-z0-9-]*$/i) && value.length <= 59) {
      return value.toLowerCase();
    }
    var codes = (0, utf8_1.toUtf8CodePoints)(value);
    codes = flatten(codes.map(function(code) {
      if (Table_B_1_flags.indexOf(code) >= 0) {
        return [];
      }
      if (code >= 65024 && code <= 65039) {
        return [];
      }
      var codesTableB2 = _nameprepTableB2(code);
      if (codesTableB2) {
        return codesTableB2;
      }
      return [code];
    }));
    codes = (0, utf8_1.toUtf8CodePoints)((0, utf8_1._toUtf8String)(codes), utf8_1.UnicodeNormalizationForm.NFKC);
    codes.forEach(function(code) {
      if (_nameprepTableC(code)) {
        throw new Error("STRINGPREP_CONTAINS_PROHIBITED");
      }
    });
    codes.forEach(function(code) {
      if (_nameprepTableA1(code)) {
        throw new Error("STRINGPREP_CONTAINS_UNASSIGNED");
      }
    });
    var name = (0, utf8_1._toUtf8String)(codes);
    if (name.substring(0, 1) === "-" || name.substring(2, 4) === "--" || name.substring(name.length - 1) === "-") {
      throw new Error("invalid hyphen");
    }
    return name;
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.nameprep = exports._nameprepTableC = exports._nameprepTableB2 = exports._nameprepTableA1 = undefined;
  var utf8_1 = require_utf8();
  var Table_A_1_ranges = createRangeTable("221,13-1b,5f-,40-10,51-f,11-3,3-3,2-2,2-4,8,2,15,2d,28-8,88,48,27-,3-5,11-20,27-,8,28,3-5,12,18,b-a,1c-4,6-16,2-d,2-2,2,1b-4,17-9,8f-,10,f,1f-2,1c-34,33-14e,4,36-,13-,6-2,1a-f,4,9-,3-,17,8,2-2,5-,2,8-,3-,4-8,2-3,3,6-,16-6,2-,7-3,3-,17,8,3,3,3-,2,6-3,3-,4-a,5,2-6,10-b,4,8,2,4,17,8,3,6-,b,4,4-,2-e,2-4,b-10,4,9-,3-,17,8,3-,5-,9-2,3-,4-7,3-3,3,4-3,c-10,3,7-2,4,5-2,3,2,3-2,3-2,4-2,9,4-3,6-2,4,5-8,2-e,d-d,4,9,4,18,b,6-3,8,4,5-6,3-8,3-3,b-11,3,9,4,18,b,6-3,8,4,5-6,3-6,2,3-3,b-11,3,9,4,18,11-3,7-,4,5-8,2-7,3-3,b-11,3,13-2,19,a,2-,8-2,2-3,7,2,9-11,4-b,3b-3,1e-24,3,2-,3,2-,2-5,5,8,4,2,2-,3,e,4-,6,2,7-,b-,3-21,49,23-5,1c-3,9,25,10-,2-2f,23,6,3,8-2,5-5,1b-45,27-9,2a-,2-3,5b-4,45-4,53-5,8,40,2,5-,8,2,5-,28,2,5-,20,2,5-,8,2,5-,8,8,18,20,2,5-,8,28,14-5,1d-22,56-b,277-8,1e-2,52-e,e,8-a,18-8,15-b,e,4,3-b,5e-2,b-15,10,b-5,59-7,2b-555,9d-3,5b-5,17-,7-,27-,7-,9,2,2,2,20-,36,10,f-,7,14-,4,a,54-3,2-6,6-5,9-,1c-10,13-1d,1c-14,3c-,10-6,32-b,240-30,28-18,c-14,a0,115-,3,66-,b-76,5,5-,1d,24,2,5-2,2,8-,35-2,19,f-10,1d-3,311-37f,1b,5a-b,d7-19,d-3,41,57-,68-4,29-3,5f,29-37,2e-2,25-c,2c-2,4e-3,30,78-3,64-,20,19b7-49,51a7-59,48e-2,38-738,2ba5-5b,222f-,3c-94,8-b,6-4,1b,6,2,3,3,6d-20,16e-f,41-,37-7,2e-2,11-f,5-b,18-,b,14,5-3,6,88-,2,bf-2,7-,7-,7-,4-2,8,8-9,8-2ff,20,5-b,1c-b4,27-,27-cbb1,f7-9,28-2,b5-221,56,48,3-,2-,3-,5,d,2,5,3,42,5-,9,8,1d,5,6,2-2,8,153-3,123-3,33-27fd,a6da-5128,21f-5df,3-fffd,3-fffd,3-fffd,3-fffd,3-fffd,3-fffd,3-fffd,3-fffd,3-fffd,3-fffd,3-fffd,3,2-1d,61-ff7d");
  var Table_B_1_flags = "ad,34f,1806,180b,180c,180d,200b,200c,200d,2060,feff".split(",").map(function(v2) {
    return parseInt(v2, 16);
  });
  var Table_B_2_ranges = [
    { h: 25, s: 32, l: 65 },
    { h: 30, s: 32, e: [23], l: 127 },
    { h: 54, s: 1, e: [48], l: 64, d: 2 },
    { h: 14, s: 1, l: 57, d: 2 },
    { h: 44, s: 1, l: 17, d: 2 },
    { h: 10, s: 1, e: [2, 6, 8], l: 61, d: 2 },
    { h: 16, s: 1, l: 68, d: 2 },
    { h: 84, s: 1, e: [18, 24, 66], l: 19, d: 2 },
    { h: 26, s: 32, e: [17], l: 435 },
    { h: 22, s: 1, l: 71, d: 2 },
    { h: 15, s: 80, l: 40 },
    { h: 31, s: 32, l: 16 },
    { h: 32, s: 1, l: 80, d: 2 },
    { h: 52, s: 1, l: 42, d: 2 },
    { h: 12, s: 1, l: 55, d: 2 },
    { h: 40, s: 1, e: [38], l: 15, d: 2 },
    { h: 14, s: 1, l: 48, d: 2 },
    { h: 37, s: 48, l: 49 },
    { h: 148, s: 1, l: 6351, d: 2 },
    { h: 88, s: 1, l: 160, d: 2 },
    { h: 15, s: 16, l: 704 },
    { h: 25, s: 26, l: 854 },
    { h: 25, s: 32, l: 55915 },
    { h: 37, s: 40, l: 1247 },
    { h: 25, s: -119711, l: 53248 },
    { h: 25, s: -119763, l: 52 },
    { h: 25, s: -119815, l: 52 },
    { h: 25, s: -119867, e: [1, 4, 5, 7, 8, 11, 12, 17], l: 52 },
    { h: 25, s: -119919, l: 52 },
    { h: 24, s: -119971, e: [2, 7, 8, 17], l: 52 },
    { h: 24, s: -120023, e: [2, 7, 13, 15, 16, 17], l: 52 },
    { h: 25, s: -120075, l: 52 },
    { h: 25, s: -120127, l: 52 },
    { h: 25, s: -120179, l: 52 },
    { h: 25, s: -120231, l: 52 },
    { h: 25, s: -120283, l: 52 },
    { h: 25, s: -120335, l: 52 },
    { h: 24, s: -119543, e: [17], l: 56 },
    { h: 24, s: -119601, e: [17], l: 58 },
    { h: 24, s: -119659, e: [17], l: 58 },
    { h: 24, s: -119717, e: [17], l: 58 },
    { h: 24, s: -119775, e: [17], l: 58 }
  ];
  var Table_B_2_lut_abs = createTable("b5:3bc,c3:ff,7:73,2:253,5:254,3:256,1:257,5:259,1:25b,3:260,1:263,2:269,1:268,5:26f,1:272,2:275,7:280,3:283,5:288,3:28a,1:28b,5:292,3f:195,1:1bf,29:19e,125:3b9,8b:3b2,1:3b8,1:3c5,3:3c6,1:3c0,1a:3ba,1:3c1,1:3c3,2:3b8,1:3b5,1bc9:3b9,1c:1f76,1:1f77,f:1f7a,1:1f7b,d:1f78,1:1f79,1:1f7c,1:1f7d,107:63,5:25b,4:68,1:68,1:68,3:69,1:69,1:6c,3:6e,4:70,1:71,1:72,1:72,1:72,7:7a,2:3c9,2:7a,2:6b,1:e5,1:62,1:63,3:65,1:66,2:6d,b:3b3,1:3c0,6:64,1b574:3b8,1a:3c3,20:3b8,1a:3c3,20:3b8,1a:3c3,20:3b8,1a:3c3,20:3b8,1a:3c3");
  var Table_B_2_lut_rel = createTable("179:1,2:1,2:1,5:1,2:1,a:4f,a:1,8:1,2:1,2:1,3:1,5:1,3:1,4:1,2:1,3:1,4:1,8:2,1:1,2:2,1:1,2:2,27:2,195:26,2:25,1:25,1:25,2:40,2:3f,1:3f,33:1,11:-6,1:-9,1ac7:-3a,6d:-8,1:-8,1:-8,1:-8,1:-8,1:-8,1:-8,1:-8,9:-8,1:-8,1:-8,1:-8,1:-8,1:-8,b:-8,1:-8,1:-8,1:-8,1:-8,1:-8,1:-8,1:-8,9:-8,1:-8,1:-8,1:-8,1:-8,1:-8,1:-8,1:-8,9:-8,1:-8,1:-8,1:-8,1:-8,1:-8,c:-8,2:-8,2:-8,2:-8,9:-8,1:-8,1:-8,1:-8,1:-8,1:-8,1:-8,1:-8,49:-8,1:-8,1:-4a,1:-4a,d:-56,1:-56,1:-56,1:-56,d:-8,1:-8,f:-8,1:-8,3:-7");
  var Table_B_2_complex = createTable("df:00730073,51:00690307,19:02BC006E,a7:006A030C,18a:002003B9,16:03B903080301,20:03C503080301,1d7:05650582,190f:00680331,1:00740308,1:0077030A,1:0079030A,1:006102BE,b6:03C50313,2:03C503130300,2:03C503130301,2:03C503130342,2a:1F0003B9,1:1F0103B9,1:1F0203B9,1:1F0303B9,1:1F0403B9,1:1F0503B9,1:1F0603B9,1:1F0703B9,1:1F0003B9,1:1F0103B9,1:1F0203B9,1:1F0303B9,1:1F0403B9,1:1F0503B9,1:1F0603B9,1:1F0703B9,1:1F2003B9,1:1F2103B9,1:1F2203B9,1:1F2303B9,1:1F2403B9,1:1F2503B9,1:1F2603B9,1:1F2703B9,1:1F2003B9,1:1F2103B9,1:1F2203B9,1:1F2303B9,1:1F2403B9,1:1F2503B9,1:1F2603B9,1:1F2703B9,1:1F6003B9,1:1F6103B9,1:1F6203B9,1:1F6303B9,1:1F6403B9,1:1F6503B9,1:1F6603B9,1:1F6703B9,1:1F6003B9,1:1F6103B9,1:1F6203B9,1:1F6303B9,1:1F6403B9,1:1F6503B9,1:1F6603B9,1:1F6703B9,3:1F7003B9,1:03B103B9,1:03AC03B9,2:03B10342,1:03B1034203B9,5:03B103B9,6:1F7403B9,1:03B703B9,1:03AE03B9,2:03B70342,1:03B7034203B9,5:03B703B9,6:03B903080300,1:03B903080301,3:03B90342,1:03B903080342,b:03C503080300,1:03C503080301,1:03C10313,2:03C50342,1:03C503080342,b:1F7C03B9,1:03C903B9,1:03CE03B9,2:03C90342,1:03C9034203B9,5:03C903B9,ac:00720073,5b:00B00063,6:00B00066,d:006E006F,a:0073006D,1:00740065006C,1:0074006D,124f:006800700061,2:00610075,2:006F0076,b:00700061,1:006E0061,1:03BC0061,1:006D0061,1:006B0061,1:006B0062,1:006D0062,1:00670062,3:00700066,1:006E0066,1:03BC0066,4:0068007A,1:006B0068007A,1:006D0068007A,1:00670068007A,1:00740068007A,15:00700061,1:006B00700061,1:006D00700061,1:006700700061,8:00700076,1:006E0076,1:03BC0076,1:006D0076,1:006B0076,1:006D0076,1:00700077,1:006E0077,1:03BC0077,1:006D0077,1:006B0077,1:006D0077,1:006B03C9,1:006D03C9,2:00620071,3:00632215006B0067,1:0063006F002E,1:00640062,1:00670079,2:00680070,2:006B006B,1:006B006D,9:00700068,2:00700070006D,1:00700072,2:00730076,1:00770062,c723:00660066,1:00660069,1:0066006C,1:006600660069,1:00660066006C,1:00730074,1:00730074,d:05740576,1:05740565,1:0574056B,1:057E0576,1:0574056D", bytes2);
  var Table_C_ranges = createRangeTable("80-20,2a0-,39c,32,f71,18e,7f2-f,19-7,30-4,7-5,f81-b,5,a800-20ff,4d1-1f,110,fa-6,d174-7,2e84-,ffff-,ffff-,ffff-,ffff-,ffff-,ffff-,ffff-,ffff-,ffff-,ffff-,ffff-,ffff-,2,1f-5f,ff7f-20001");
  exports._nameprepTableA1 = _nameprepTableA1;
  exports._nameprepTableB2 = _nameprepTableB2;
  exports._nameprepTableC = _nameprepTableC;
  exports.nameprep = nameprep;
});

// node_modules/@ethersproject/strings/lib/index.js
var require_lib9 = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.nameprep = exports.parseBytes32String = exports.formatBytes32String = exports.UnicodeNormalizationForm = exports.Utf8ErrorReason = exports.Utf8ErrorFuncs = exports.toUtf8String = exports.toUtf8CodePoints = exports.toUtf8Bytes = exports._toEscapedUtf8String = undefined;
  var bytes32_1 = require_bytes32();
  Object.defineProperty(exports, "formatBytes32String", { enumerable: true, get: function() {
    return bytes32_1.formatBytes32String;
  } });
  Object.defineProperty(exports, "parseBytes32String", { enumerable: true, get: function() {
    return bytes32_1.parseBytes32String;
  } });
  var idna_1 = require_idna();
  Object.defineProperty(exports, "nameprep", { enumerable: true, get: function() {
    return idna_1.nameprep;
  } });
  var utf8_1 = require_utf8();
  Object.defineProperty(exports, "_toEscapedUtf8String", { enumerable: true, get: function() {
    return utf8_1._toEscapedUtf8String;
  } });
  Object.defineProperty(exports, "toUtf8Bytes", { enumerable: true, get: function() {
    return utf8_1.toUtf8Bytes;
  } });
  Object.defineProperty(exports, "toUtf8CodePoints", { enumerable: true, get: function() {
    return utf8_1.toUtf8CodePoints;
  } });
  Object.defineProperty(exports, "toUtf8String", { enumerable: true, get: function() {
    return utf8_1.toUtf8String;
  } });
  Object.defineProperty(exports, "UnicodeNormalizationForm", { enumerable: true, get: function() {
    return utf8_1.UnicodeNormalizationForm;
  } });
  Object.defineProperty(exports, "Utf8ErrorFuncs", { enumerable: true, get: function() {
    return utf8_1.Utf8ErrorFuncs;
  } });
  Object.defineProperty(exports, "Utf8ErrorReason", { enumerable: true, get: function() {
    return utf8_1.Utf8ErrorReason;
  } });
});

// node_modules/@ethersproject/abi/lib/coders/string.js
var require_string = __commonJS((exports) => {
  var __extends = exports && exports.__extends || function() {
    var extendStatics = function(d, b2) {
      extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b3) {
        d2.__proto__ = b3;
      } || function(d2, b3) {
        for (var p in b3)
          if (Object.prototype.hasOwnProperty.call(b3, p))
            d2[p] = b3[p];
      };
      return extendStatics(d, b2);
    };
    return function(d, b2) {
      if (typeof b2 !== "function" && b2 !== null)
        throw new TypeError("Class extends value " + String(b2) + " is not a constructor or null");
      extendStatics(d, b2);
      function __() {
        this.constructor = d;
      }
      d.prototype = b2 === null ? Object.create(b2) : (__.prototype = b2.prototype, new __);
    };
  }();
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.StringCoder = undefined;
  var strings_1 = require_lib9();
  var bytes_1 = require_bytes();
  var StringCoder = function(_super) {
    __extends(StringCoder2, _super);
    function StringCoder2(localName) {
      return _super.call(this, "string", localName) || this;
    }
    StringCoder2.prototype.defaultValue = function() {
      return "";
    };
    StringCoder2.prototype.encode = function(writer, value) {
      return _super.prototype.encode.call(this, writer, (0, strings_1.toUtf8Bytes)(value));
    };
    StringCoder2.prototype.decode = function(reader) {
      return (0, strings_1.toUtf8String)(_super.prototype.decode.call(this, reader));
    };
    return StringCoder2;
  }(bytes_1.DynamicBytesCoder);
  exports.StringCoder = StringCoder;
});

// node_modules/@ethersproject/abi/lib/coders/tuple.js
var require_tuple = __commonJS((exports) => {
  var __extends = exports && exports.__extends || function() {
    var extendStatics = function(d, b2) {
      extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b3) {
        d2.__proto__ = b3;
      } || function(d2, b3) {
        for (var p in b3)
          if (Object.prototype.hasOwnProperty.call(b3, p))
            d2[p] = b3[p];
      };
      return extendStatics(d, b2);
    };
    return function(d, b2) {
      if (typeof b2 !== "function" && b2 !== null)
        throw new TypeError("Class extends value " + String(b2) + " is not a constructor or null");
      extendStatics(d, b2);
      function __() {
        this.constructor = d;
      }
      d.prototype = b2 === null ? Object.create(b2) : (__.prototype = b2.prototype, new __);
    };
  }();
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.TupleCoder = undefined;
  var abstract_coder_1 = require_abstract_coder();
  var array_1 = require_array();
  var TupleCoder = function(_super) {
    __extends(TupleCoder2, _super);
    function TupleCoder2(coders, localName) {
      var _this = this;
      var dynamic = false;
      var types = [];
      coders.forEach(function(coder) {
        if (coder.dynamic) {
          dynamic = true;
        }
        types.push(coder.type);
      });
      var type = "tuple(" + types.join(",") + ")";
      _this = _super.call(this, "tuple", type, localName, dynamic) || this;
      _this.coders = coders;
      return _this;
    }
    TupleCoder2.prototype.defaultValue = function() {
      var values = [];
      this.coders.forEach(function(coder) {
        values.push(coder.defaultValue());
      });
      var uniqueNames = this.coders.reduce(function(accum, coder) {
        var name = coder.localName;
        if (name) {
          if (!accum[name]) {
            accum[name] = 0;
          }
          accum[name]++;
        }
        return accum;
      }, {});
      this.coders.forEach(function(coder, index) {
        var name = coder.localName;
        if (!name || uniqueNames[name] !== 1) {
          return;
        }
        if (name === "length") {
          name = "_length";
        }
        if (values[name] != null) {
          return;
        }
        values[name] = values[index];
      });
      return Object.freeze(values);
    };
    TupleCoder2.prototype.encode = function(writer, value) {
      return (0, array_1.pack)(writer, this.coders, value);
    };
    TupleCoder2.prototype.decode = function(reader) {
      return reader.coerce(this.name, (0, array_1.unpack)(reader, this.coders));
    };
    return TupleCoder2;
  }(abstract_coder_1.Coder);
  exports.TupleCoder = TupleCoder;
});

// node_modules/@ethersproject/abi/lib/abi-coder.js
var require_abi_coder = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.defaultAbiCoder = exports.AbiCoder = undefined;
  var bytes_1 = require_lib2();
  var properties_1 = require_lib4();
  var logger_1 = require_lib();
  var _version_1 = require__version5();
  var logger = new logger_1.Logger(_version_1.version);
  var abstract_coder_1 = require_abstract_coder();
  var address_1 = require_address();
  var array_1 = require_array();
  var boolean_1 = require_boolean();
  var bytes_2 = require_bytes();
  var fixed_bytes_1 = require_fixed_bytes();
  var null_1 = require_null();
  var number_1 = require_number();
  var string_1 = require_string();
  var tuple_1 = require_tuple();
  var fragments_1 = require_fragments();
  var paramTypeBytes = new RegExp(/^bytes([0-9]*)$/);
  var paramTypeNumber = new RegExp(/^(u?int)([0-9]*)$/);
  var AbiCoder = function() {
    function AbiCoder2(coerceFunc) {
      (0, properties_1.defineReadOnly)(this, "coerceFunc", coerceFunc || null);
    }
    AbiCoder2.prototype._getCoder = function(param) {
      var _this = this;
      switch (param.baseType) {
        case "address":
          return new address_1.AddressCoder(param.name);
        case "bool":
          return new boolean_1.BooleanCoder(param.name);
        case "string":
          return new string_1.StringCoder(param.name);
        case "bytes":
          return new bytes_2.BytesCoder(param.name);
        case "array":
          return new array_1.ArrayCoder(this._getCoder(param.arrayChildren), param.arrayLength, param.name);
        case "tuple":
          return new tuple_1.TupleCoder((param.components || []).map(function(component) {
            return _this._getCoder(component);
          }), param.name);
        case "":
          return new null_1.NullCoder(param.name);
      }
      var match = param.type.match(paramTypeNumber);
      if (match) {
        var size = parseInt(match[2] || "256");
        if (size === 0 || size > 256 || size % 8 !== 0) {
          logger.throwArgumentError("invalid " + match[1] + " bit length", "param", param);
        }
        return new number_1.NumberCoder(size / 8, match[1] === "int", param.name);
      }
      match = param.type.match(paramTypeBytes);
      if (match) {
        var size = parseInt(match[1]);
        if (size === 0 || size > 32) {
          logger.throwArgumentError("invalid bytes length", "param", param);
        }
        return new fixed_bytes_1.FixedBytesCoder(size, param.name);
      }
      return logger.throwArgumentError("invalid type", "type", param.type);
    };
    AbiCoder2.prototype._getWordSize = function() {
      return 32;
    };
    AbiCoder2.prototype._getReader = function(data, allowLoose) {
      return new abstract_coder_1.Reader(data, this._getWordSize(), this.coerceFunc, allowLoose);
    };
    AbiCoder2.prototype._getWriter = function() {
      return new abstract_coder_1.Writer(this._getWordSize());
    };
    AbiCoder2.prototype.getDefaultValue = function(types) {
      var _this = this;
      var coders = types.map(function(type) {
        return _this._getCoder(fragments_1.ParamType.from(type));
      });
      var coder = new tuple_1.TupleCoder(coders, "_");
      return coder.defaultValue();
    };
    AbiCoder2.prototype.encode = function(types, values) {
      var _this = this;
      if (types.length !== values.length) {
        logger.throwError("types/values length mismatch", logger_1.Logger.errors.INVALID_ARGUMENT, {
          count: { types: types.length, values: values.length },
          value: { types, values }
        });
      }
      var coders = types.map(function(type) {
        return _this._getCoder(fragments_1.ParamType.from(type));
      });
      var coder = new tuple_1.TupleCoder(coders, "_");
      var writer = this._getWriter();
      coder.encode(writer, values);
      return writer.data;
    };
    AbiCoder2.prototype.decode = function(types, data, loose) {
      var _this = this;
      var coders = types.map(function(type) {
        return _this._getCoder(fragments_1.ParamType.from(type));
      });
      var coder = new tuple_1.TupleCoder(coders, "_");
      return coder.decode(this._getReader((0, bytes_1.arrayify)(data), loose));
    };
    return AbiCoder2;
  }();
  exports.AbiCoder = AbiCoder;
  exports.defaultAbiCoder = new AbiCoder;
});

// node_modules/@ethersproject/hash/lib/id.js
var require_id = __commonJS((exports) => {
  var id = function(text) {
    return (0, keccak256_1.keccak256)((0, strings_1.toUtf8Bytes)(text));
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.id = undefined;
  var keccak256_1 = require_lib5();
  var strings_1 = require_lib9();
  exports.id = id;
});

// node_modules/@ethersproject/hash/lib/_version.js
var require__version9 = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.version = undefined;
  exports.version = "hash/5.7.0";
});

// node_modules/@ethersproject/base64/lib/browser-base64.js
var require_browser_base64 = __commonJS((exports) => {
  var decode = function(textData) {
    textData = atob(textData);
    var data = [];
    for (var i = 0;i < textData.length; i++) {
      data.push(textData.charCodeAt(i));
    }
    return (0, bytes_1.arrayify)(data);
  };
  var encode = function(data) {
    data = (0, bytes_1.arrayify)(data);
    var textData = "";
    for (var i = 0;i < data.length; i++) {
      textData += String.fromCharCode(data[i]);
    }
    return btoa(textData);
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.encode = exports.decode = undefined;
  var bytes_1 = require_lib2();
  exports.decode = decode;
  exports.encode = encode;
});

// node_modules/@ethersproject/base64/lib/index.js
var require_lib10 = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.encode = exports.decode = undefined;
  var base64_1 = require_browser_base64();
  Object.defineProperty(exports, "decode", { enumerable: true, get: function() {
    return base64_1.decode;
  } });
  Object.defineProperty(exports, "encode", { enumerable: true, get: function() {
    return base64_1.encode;
  } });
});

// node_modules/@ethersproject/hash/lib/ens-normalize/decoder.js
var require_decoder = __commonJS((exports) => {
  var flat = function(array, depth) {
    if (depth == null) {
      depth = 1;
    }
    var result = [];
    var forEach = result.forEach;
    var flatDeep = function(arr, depth2) {
      forEach.call(arr, function(val) {
        if (depth2 > 0 && Array.isArray(val)) {
          flatDeep(val, depth2 - 1);
        } else {
          result.push(val);
        }
      });
    };
    flatDeep(array, depth);
    return result;
  };
  var fromEntries = function(array) {
    var result = {};
    for (var i = 0;i < array.length; i++) {
      var value = array[i];
      result[value[0]] = value[1];
    }
    return result;
  };
  var decode_arithmetic = function(bytes) {
    var pos = 0;
    function u16() {
      return bytes[pos++] << 8 | bytes[pos++];
    }
    var symbol_count = u16();
    var total = 1;
    var acc = [0, 1];
    for (var i = 1;i < symbol_count; i++) {
      acc.push(total += u16());
    }
    var skip = u16();
    var pos_payload = pos;
    pos += skip;
    var read_width = 0;
    var read_buffer = 0;
    function read_bit() {
      if (read_width == 0) {
        read_buffer = read_buffer << 8 | bytes[pos++];
        read_width = 8;
      }
      return read_buffer >> --read_width & 1;
    }
    var N = 31;
    var FULL = Math.pow(2, N);
    var HALF = FULL >>> 1;
    var QRTR = HALF >> 1;
    var MASK = FULL - 1;
    var register = 0;
    for (var i = 0;i < N; i++)
      register = register << 1 | read_bit();
    var symbols = [];
    var low = 0;
    var range = FULL;
    while (true) {
      var value = Math.floor(((register - low + 1) * total - 1) / range);
      var start = 0;
      var end = symbol_count;
      while (end - start > 1) {
        var mid = start + end >>> 1;
        if (value < acc[mid]) {
          end = mid;
        } else {
          start = mid;
        }
      }
      if (start == 0)
        break;
      symbols.push(start);
      var a = low + Math.floor(range * acc[start] / total);
      var b2 = low + Math.floor(range * acc[start + 1] / total) - 1;
      while (((a ^ b2) & HALF) == 0) {
        register = register << 1 & MASK | read_bit();
        a = a << 1 & MASK;
        b2 = b2 << 1 & MASK | 1;
      }
      while (a & ~b2 & QRTR) {
        register = register & HALF | register << 1 & MASK >>> 1 | read_bit();
        a = a << 1 ^ HALF;
        b2 = (b2 ^ HALF) << 1 | HALF | 1;
      }
      low = a;
      range = 1 + b2 - a;
    }
    var offset = symbol_count - 4;
    return symbols.map(function(x) {
      switch (x - offset) {
        case 3:
          return offset + 65792 + (bytes[pos_payload++] << 16 | bytes[pos_payload++] << 8 | bytes[pos_payload++]);
        case 2:
          return offset + 256 + (bytes[pos_payload++] << 8 | bytes[pos_payload++]);
        case 1:
          return offset + bytes[pos_payload++];
        default:
          return x - 1;
      }
    });
  };
  var read_payload = function(v2) {
    var pos = 0;
    return function() {
      return v2[pos++];
    };
  };
  var read_compressed_payload = function(bytes) {
    return read_payload(decode_arithmetic(bytes));
  };
  var signed = function(i) {
    return i & 1 ? ~i >> 1 : i >> 1;
  };
  var read_counts = function(n, next) {
    var v2 = Array(n);
    for (var i = 0;i < n; i++)
      v2[i] = 1 + next();
    return v2;
  };
  var read_ascending = function(n, next) {
    var v2 = Array(n);
    for (var i = 0, x = -1;i < n; i++)
      v2[i] = x += 1 + next();
    return v2;
  };
  var read_deltas = function(n, next) {
    var v2 = Array(n);
    for (var i = 0, x = 0;i < n; i++)
      v2[i] = x += signed(next());
    return v2;
  };
  var read_member_array = function(next, lookup) {
    var v2 = read_ascending(next(), next);
    var n = next();
    var vX = read_ascending(n, next);
    var vN = read_counts(n, next);
    for (var i = 0;i < n; i++) {
      for (var j = 0;j < vN[i]; j++) {
        v2.push(vX[i] + j);
      }
    }
    return lookup ? v2.map(function(x) {
      return lookup[x];
    }) : v2;
  };
  var read_mapped_map = function(next) {
    var ret = [];
    while (true) {
      var w = next();
      if (w == 0)
        break;
      ret.push(read_linear_table(w, next));
    }
    while (true) {
      var w = next() - 1;
      if (w < 0)
        break;
      ret.push(read_replacement_table(w, next));
    }
    return fromEntries(flat(ret));
  };
  var read_zero_terminated_array = function(next) {
    var v2 = [];
    while (true) {
      var i = next();
      if (i == 0)
        break;
      v2.push(i);
    }
    return v2;
  };
  var read_transposed = function(n, w, next) {
    var m = Array(n).fill(undefined).map(function() {
      return [];
    });
    for (var i = 0;i < w; i++) {
      read_deltas(n, next).forEach(function(x, j) {
        return m[j].push(x);
      });
    }
    return m;
  };
  var read_linear_table = function(w, next) {
    var dx = 1 + next();
    var dy = next();
    var vN = read_zero_terminated_array(next);
    var m = read_transposed(vN.length, 1 + w, next);
    return flat(m.map(function(v2, i) {
      var x = v2[0], ys = v2.slice(1);
      return Array(vN[i]).fill(undefined).map(function(_2, j) {
        var j_dy = j * dy;
        return [x + j * dx, ys.map(function(y) {
          return y + j_dy;
        })];
      });
    }));
  };
  var read_replacement_table = function(w, next) {
    var n = 1 + next();
    var m = read_transposed(n, 1 + w, next);
    return m.map(function(v2) {
      return [v2[0], v2.slice(1)];
    });
  };
  var read_emoji_trie = function(next) {
    var sorted = read_member_array(next).sort(function(a, b2) {
      return a - b2;
    });
    return read();
    function read() {
      var branches = [];
      while (true) {
        var keys = read_member_array(next, sorted);
        if (keys.length == 0)
          break;
        branches.push({ set: new Set(keys), node: read() });
      }
      branches.sort(function(a, b2) {
        return b2.set.size - a.set.size;
      });
      var temp = next();
      var valid = temp % 3;
      temp = temp / 3 | 0;
      var fe0f = !!(temp & 1);
      temp >>= 1;
      var save = temp == 1;
      var check = temp == 2;
      return { branches, valid, fe0f, save, check };
    }
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.read_emoji_trie = exports.read_zero_terminated_array = exports.read_mapped_map = exports.read_member_array = exports.signed = exports.read_compressed_payload = exports.read_payload = exports.decode_arithmetic = undefined;
  exports.decode_arithmetic = decode_arithmetic;
  exports.read_payload = read_payload;
  exports.read_compressed_payload = read_compressed_payload;
  exports.signed = signed;
  exports.read_member_array = read_member_array;
  exports.read_mapped_map = read_mapped_map;
  exports.read_zero_terminated_array = read_zero_terminated_array;
  exports.read_emoji_trie = read_emoji_trie;
});

// node_modules/@ethersproject/hash/lib/ens-normalize/include.js
var require_include = __commonJS((exports) => {
  var getData = function() {
    return (0, decoder_js_1.read_compressed_payload)((0, base64_1.decode)("AEQF2AO2DEsA2wIrAGsBRABxAN8AZwCcAEwAqgA0AGwAUgByADcATAAVAFYAIQAyACEAKAAYAFgAGwAjABQAMAAmADIAFAAfABQAKwATACoADgAbAA8AHQAYABoAGQAxADgALAAoADwAEwA9ABMAGgARAA4ADwAWABMAFgAIAA8AHgQXBYMA5BHJAS8JtAYoAe4AExozi0UAH21tAaMnBT8CrnIyhrMDhRgDygIBUAEHcoFHUPe8AXBjAewCjgDQR8IICIcEcQLwATXCDgzvHwBmBoHNAqsBdBcUAykgDhAMShskMgo8AY8jqAQfAUAfHw8BDw87MioGlCIPBwZCa4ELatMAAMspJVgsDl8AIhckSg8XAHdvTwBcIQEiDT4OPhUqbyECAEoAS34Aej8Ybx83JgT/Xw8gHxZ/7w8RICxPHA9vBw+Pfw8PHwAPFv+fAsAvCc8vEr8ivwD/EQ8Bol8OEBa/A78hrwAPCU8vESNvvwWfHwNfAVoDHr+ZAAED34YaAdJPAK7PLwSEgDLHAGo1Pz8Pvx9fUwMrpb8O/58VTzAPIBoXIyQJNF8hpwIVAT8YGAUADDNBaX3RAMomJCg9EhUeA29MABsZBTMNJipjOhc19gcIDR8bBwQHEggCWi6DIgLuAQYA+BAFCha3A5XiAEsqM7UFFgFLhAMjFTMYE1Klnw74nRVBG/ASCm0BYRN/BrsU3VoWy+S0vV8LQx+vN8gF2AC2AK5EAWwApgYDKmAAroQ0NDQ0AT+OCg7wAAIHRAbpNgVcBV0APTA5BfbPFgMLzcYL/QqqA82eBALKCjQCjqYCht0/k2+OAsXQAoP3ASTKDgDw6ACKAUYCMpIKJpRaAE4A5womABzZvs0REEKiACIQAd5QdAECAj4Ywg/wGqY2AVgAYADYvAoCGAEubA0gvAY2ALAAbpbvqpyEAGAEpgQAJgAG7gAgAEACmghUFwCqAMpAINQIwC4DthRAAPcycKgApoIdABwBfCisABoATwBqASIAvhnSBP8aH/ECeAKXAq40NjgDBTwFYQU6AXs3oABgAD4XNgmcCY1eCl5tIFZeUqGgyoNHABgAEQAaABNwWQAmABMATPMa3T34ADldyprmM1M2XociUQgLzvwAXT3xABgAEQAaABNwIGFAnADD8AAgAD4BBJWzaCcIAIEBFMAWwKoAAdq9BWAF5wLQpALEtQAKUSGkahR4GnJM+gsAwCgeFAiUAECQ0BQuL8AAIAAAADKeIheclvFqQAAETr4iAMxIARMgAMIoHhQIAn0E0pDQFC4HhznoAAAAIAI2C0/4lvFqQAAETgBJJwYCAy4ABgYAFAA8MBKYEH4eRhTkAjYeFcgACAYAeABsOqyQ5gRwDayqugEgaIIAtgoACgDmEABmBAWGme5OBJJA2m4cDeoAmITWAXwrMgOgAGwBCh6CBXYF1Tzg1wKAAFdiuABRAFwAXQBsAG8AdgBrAHYAbwCEAHEwfxQBVE5TEQADVFhTBwBDANILAqcCzgLTApQCrQL6vAAMAL8APLhNBKkE6glGKTAU4Dr4N2EYEwBCkABKk8rHAbYBmwIoAiU4Ajf/Aq4CowCAANIChzgaNBsCsTgeODcFXrgClQKdAqQBiQGYAqsCsjTsNHsfNPA0ixsAWTWiOAMFPDQSNCk2BDZHNow2TTZUNhk28Jk9VzI3QkEoAoICoQKwAqcAQAAxBV4FXbS9BW47YkIXP1ciUqs05DS/FwABUwJW11e6nHuYZmSh/RAYA8oMKvZ8KASoUAJYWAJ6ILAsAZSoqjpgA0ocBIhmDgDWAAawRDQoAAcuAj5iAHABZiR2AIgiHgCaAU68ACxuHAG0ygM8MiZIAlgBdF4GagJqAPZOHAMuBgoATkYAsABiAHgAMLoGDPj0HpKEBAAOJgAuALggTAHWAeAMEDbd20Uege0ADwAWADkAQgA9OHd+2MUQZBBhBgNNDkxxPxUQArEPqwvqERoM1irQ090ANK4H8ANYB/ADWANYB/AH8ANYB/ADWANYA1gDWBwP8B/YxRBkD00EcgWTBZAE2wiIJk4RhgctCNdUEnQjHEwDSgEBIypJITuYMxAlR0wRTQgIATZHbKx9PQNMMbBU+pCnA9AyVDlxBgMedhKlAC8PeCE1uk6DekxxpQpQT7NX9wBFBgASqwAS5gBJDSgAUCwGPQBI4zTYABNGAE2bAE3KAExdGABKaAbgAFBXAFCOAFBJABI2SWdObALDOq0//QomCZhvwHdTBkIQHCemEPgMNAG2ATwN7kvZBPIGPATKH34ZGg/OlZ0Ipi3eDO4m5C6igFsj9iqEBe5L9TzeC05RaQ9aC2YJ5DpkgU8DIgEOIowK3g06CG4Q9ArKbA3mEUYHOgPWSZsApgcCCxIdNhW2JhFirQsKOXgG/Br3C5AmsBMqev0F1BoiBk4BKhsAANAu6IWxWjJcHU9gBgQLJiPIFKlQIQ0mQLh4SRocBxYlqgKSQ3FKiFE3HpQh9zw+DWcuFFF9B/Y8BhlQC4I8n0asRQ8R0z6OPUkiSkwtBDaALDAnjAnQD4YMunxzAVoJIgmyDHITMhEYN8YIOgcaLpclJxYIIkaWYJsE+KAD9BPSAwwFQAlCBxQDthwuEy8VKgUOgSXYAvQ21i60ApBWgQEYBcwPJh/gEFFH4Q7qCJwCZgOEJewALhUiABginAhEZABgj9lTBi7MCMhqbSN1A2gU6GIRdAeSDlgHqBw0FcAc4nDJXgyGCSiksAlcAXYJmgFgBOQICjVcjKEgQmdUi1kYnCBiQUBd/QIyDGYVoES+h3kCjA9sEhwBNgF0BzoNAgJ4Ee4RbBCWCOyGBTW2M/k6JgRQIYQgEgooA1BszwsoJvoM+WoBpBJjAw00PnfvZ6xgtyUX/gcaMsZBYSHyC5NPzgydGsIYQ1QvGeUHwAP0GvQn60FYBgADpAQUOk4z7wS+C2oIjAlAAEoOpBgH2BhrCnKM0QEyjAG4mgNYkoQCcJAGOAcMAGgMiAV65gAeAqgIpAAGANADWAA6Aq4HngAaAIZCAT4DKDABIuYCkAOUCDLMAZYwAfQqBBzEDBYA+DhuSwLDsgKAa2ajBd5ZAo8CSjYBTiYEBk9IUgOwcuIA3ABMBhTgSAEWrEvMG+REAeBwLADIAPwABjYHBkIBzgH0bgC4AWALMgmjtLYBTuoqAIQAFmwB2AKKAN4ANgCA8gFUAE4FWvoF1AJQSgESMhksWGIBvAMgATQBDgB6BsyOpsoIIARuB9QCEBwV4gLvLwe2AgMi4BPOQsYCvd9WADIXUu5eZwqoCqdeaAC0YTQHMnM9UQAPH6k+yAdy/BZIiQImSwBQ5gBQQzSaNTFWSTYBpwGqKQK38AFtqwBI/wK37gK3rQK3sAK6280C0gK33AK3zxAAUEIAUD9SklKDArekArw5AEQAzAHCO147WTteO1k7XjtZO147WTteO1kDmChYI03AVU0oJqkKbV9GYewMpw3VRMk6ShPcYFJgMxPJLbgUwhXPJVcZPhq9JwYl5VUKDwUt1GYxCC00dhe9AEApaYNCY4ceMQpMHOhTklT5LRwAskujM7ANrRsWREEFSHXuYisWDwojAmSCAmJDXE6wXDchAqH4AmiZAmYKAp+FOBwMAmY8AmYnBG8EgAN/FAN+kzkHOXgYOYM6JCQCbB4CMjc4CwJtyAJtr/CLADRoRiwBaADfAOIASwYHmQyOAP8MwwAOtgJ3MAJ2o0ACeUxEAni7Hl3cRa9G9AJ8QAJ6yQJ9CgJ88UgBSH5kJQAsFklZSlwWGErNAtECAtDNSygDiFADh+dExpEzAvKiXQQDA69Lz0wuJgTQTU1NsAKLQAKK2cIcCB5EaAa4Ao44Ao5dQZiCAo7aAo5deVG1UzYLUtVUhgKT/AKTDQDqAB1VH1WwVdEHLBwplocy4nhnRTw6ApegAu+zWCKpAFomApaQApZ9nQCqWa1aCoJOADwClrYClk9cRVzSApnMApllXMtdCBoCnJw5wzqeApwXAp+cAp65iwAeEDIrEAKd8gKekwC2PmE1YfACntQCoG8BqgKeoCACnk+mY8lkKCYsAiewAiZ/AqD8AqBN2AKmMAKlzwKoAAB+AqfzaH1osgAESmodatICrOQCrK8CrWgCrQMCVx4CVd0CseLYAx9PbJgCsr4OArLpGGzhbWRtSWADJc4Ctl08QG6RAylGArhfArlIFgK5K3hwN3DiAr0aAy2zAzISAr6JcgMDM3ICvhtzI3NQAsPMAsMFc4N0TDZGdOEDPKgDPJsDPcACxX0CxkgCxhGKAshqUgLIRQLJUALJLwJkngLd03h6YniveSZL0QMYpGcDAmH1GfSVJXsMXpNevBICz2wCz20wTFTT9BSgAMeuAs90ASrrA04TfkwGAtwoAtuLAtJQA1JdA1NgAQIDVY2AikABzBfuYUZ2AILPg44C2sgC2d+EEYRKpz0DhqYAMANkD4ZyWvoAVgLfZgLeuXR4AuIw7RUB8zEoAfScAfLTiALr9ALpcXoAAur6AurlAPpIAboC7ooC652Wq5cEAu5AA4XhmHpw4XGiAvMEAGoDjheZlAL3FAORbwOSiAL3mQL52gL4Z5odmqy8OJsfA52EAv77ARwAOp8dn7QDBY4DpmsDptoA0sYDBmuhiaIGCgMMSgFgASACtgNGAJwEgLpoBgC8BGzAEowcggCEDC6kdjoAJAM0C5IKRoABZCgiAIzw3AYBLACkfng9ogigkgNmWAN6AEQCvrkEVqTGAwCsBRbAA+4iQkMCHR072jI2PTbUNsk2RjY5NvA23TZKNiU3EDcZN5I+RTxDRTBCJkK5VBYKFhZfwQCWygU3AJBRHpu+OytgNxa61A40GMsYjsn7BVwFXQVcBV0FaAVdBVwFXQVcBV0FXAVdBVwFXUsaCNyKAK4AAQUHBwKU7oICoW1e7jAEzgPxA+YDwgCkBFDAwADABKzAAOxFLhitA1UFTDeyPkM+bj51QkRCuwTQWWQ8X+0AWBYzsACNA8xwzAGm7EZ/QisoCTAbLDs6fnLfb8H2GccsbgFw13M1HAVkBW/Jxsm9CNRO8E8FDD0FBQw9FkcClOYCoMFegpDfADgcMiA2AJQACB8AsigKAIzIEAJKeBIApY5yPZQIAKQiHb4fvj5BKSRPQrZCOz0oXyxgOywfKAnGbgMClQaCAkILXgdeCD9IIGUgQj5fPoY+dT52Ao5CM0dAX9BTVG9SDzFwWTQAbxBzJF/lOEIQQglCCkKJIAls5AcClQICoKPMODEFxhi6KSAbiyfIRrMjtCgdWCAkPlFBIitCsEJRzAbMAV/OEyQzDg0OAQQEJ36i328/Mk9AybDJsQlq3tDRApUKAkFzXf1d/j9uALYP6hCoFgCTGD8kPsFKQiobrm0+zj0KSD8kPnVCRBwMDyJRTHFgMTJa5rwXQiQ2YfI/JD7BMEJEHGINTw4TOFlIRzwJO0icMQpyPyQ+wzJCRBv6DVgnKB01NgUKj2bwYzMqCoBkznBgEF+zYDIocwRIX+NgHj4HICNfh2C4CwdwFWpTG/lgUhYGAwRfv2Ts8mAaXzVgml/XYIJfuWC4HI1gUF9pYJZgMR6ilQHMAOwLAlDRefC0in4AXAEJA6PjCwc0IamOANMMCAECRQDFNRTZBgd+CwQlRA+r6+gLBDEFBnwUBXgKATIArwAGRAAHA3cDdAN2A3kDdwN9A3oDdQN7A30DfAN4A3oDfQAYEAAlAtYASwMAUAFsAHcKAHcAmgB3AHUAdQB2AHVu8UgAygDAAHcAdQB1AHYAdQALCgB3AAsAmgB3AAsCOwB3AAtu8UgAygDAAHgKAJoAdwB3AHUAdQB2AHUAeAB1AHUAdgB1bvFIAMoAwAALCgCaAHcACwB3AAsCOwB3AAtu8UgAygDAAH4ACwGgALcBpwC6AahdAu0COwLtbvFIAMoAwAALCgCaAu0ACwLtAAsCOwLtAAtu8UgAygDAA24ACwNvAAu0VsQAAzsAABCkjUIpAAsAUIusOggWcgMeBxVsGwL67U/2HlzmWOEeOgALASvuAAseAfpKUpnpGgYJDCIZM6YyARUE9ThqAD5iXQgnAJYJPnOzw0ZAEZxEKsIAkA4DhAHnTAIDxxUDK0lxCQlPYgIvIQVYJQBVqE1GakUAKGYiDToSBA1EtAYAXQJYAIF8GgMHRyAAIAjOe9YncekRAA0KACUrjwE7Ayc6AAYWAqaiKG4McEcqANoN3+Mg9TwCBhIkuCny+JwUQ29L008JluRxu3K+oAdqiHOqFH0AG5SUIfUJ5SxCGfxdipRzqTmT4V5Zb+r1Uo4Vm+NqSSEl2mNvR2JhIa8SpYO6ntdwFXHCWTCK8f2+Hxo7uiG3drDycAuKIMP5bhi06ACnqArH1rz4Rqg//lm6SgJGEVbF9xJHISaR6HxqxSnkw6shDnelHKNEfGUXSJRJ1GcsmtJw25xrZMDK9gXSm1/YMkdX4/6NKYOdtk/NQ3/NnDASjTc3fPjIjW/5sVfVObX2oTDWkr1dF9f3kxBsD3/3aQO8hPfRz+e0uEiJqt1161griu7gz8hDDwtpy+F+BWtefnKHZPAxcZoWbnznhJpy0e842j36bcNzGnIEusgGX0a8ZxsnjcSsPDZ09yZ36fCQbriHeQ72JRMILNl6ePPf2HWoVwgWAm1fb3V2sAY0+B6rAXqSwPBgseVmoqsBTSrm91+XasMYYySI8eeRxH3ZvHkMz3BQ5aJ3iUVbYPNM3/7emRtjlsMgv/9VyTsyt/mK+8fgWeT6SoFaclXqn42dAIsvAarF5vNNWHzKSkKQ/8Hfk5ZWK7r9yliOsooyBjRhfkHP4Q2DkWXQi6FG/9r/IwbmkV5T7JSopHKn1pJwm9tb5Ot0oyN1Z2mPpKXHTxx2nlK08fKk1hEYA8WgVVWL5lgx0iTv+KdojJeU23ZDjmiubXOxVXJKKi2Wjuh2HLZOFLiSC7Tls5SMh4f+Pj6xUSrNjFqLGehRNB8lC0QSLNmkJJx/wSG3MnjE9T1CkPwJI0wH2lfzwETIiVqUxg0dfu5q39Gt+hwdcxkhhNvQ4TyrBceof3Mhs/IxFci1HmHr4FMZgXEEczPiGCx0HRwzAqDq2j9AVm1kwN0mRVLWLylgtoPNapF5cY4Y1wJh/e0BBwZj44YgZrDNqvD/9Hv7GFYdUQeDJuQ3EWI4HaKqavU1XjC/n41kT4L79kqGq0kLhdTZvgP3TA3fS0ozVz+5piZsoOtIvBUFoMKbNcmBL6YxxaUAusHB38XrS8dQMnQwJfUUkpRoGr5AUeWicvBTzyK9g77+yCkf5PAysL7r/JjcZgrbvRpMW9iyaxZvKO6ceZN2EwIxKwVFPuvFuiEPGCoagbMo+SpydLrXqBzNCDGFCrO/rkcwa2xhokQZ5CdZ0AsU3JfSqJ6n5I14YA+P/uAgfhPU84Tlw7cEFfp7AEE8ey4sP12PTt4Cods1GRgDOB5xvyiR5m+Bx8O5nBCNctU8BevfV5A08x6RHd5jcwPTMDSZJOedIZ1cGQ704lxbAzqZOP05ZxaOghzSdvFBHYqomATARyAADK4elP8Ly3IrUZKfWh23Xy20uBUmLS4Pfagu9+oyVa2iPgqRP3F2CTUsvJ7+RYnN8fFZbU/HVvxvcFFDKkiTqV5UBZ3Gz54JAKByi9hkKMZJvuGgcSYXFmw08UyoQyVdfTD1/dMkCHXcTGAKeROgArsvmRrQTLUOXioOHGK2QkjHuoYFgXciZoTJd6Fs5q1QX1G+p/e26hYsEf7QZD1nnIyl/SFkNtYYmmBhpBrxl9WbY0YpHWRuw2Ll/tj9mD8P4snVzJl4F9J+1arVeTb9E5r2ILH04qStjxQNwn3m4YNqxmaNbLAqW2TN6LidwuJRqS+NXbtqxoeDXpxeGWmxzSkWxjkyCkX4NQRme6q5SAcC+M7+9ETfA/EwrzQajKakCwYyeunP6ZFlxU2oMEn1Pz31zeStW74G406ZJFCl1wAXIoUKkWotYEpOuXB1uVNxJ63dpJEqfxBeptwIHNrPz8BllZoIcBoXwgfJ+8VAUnVPvRvexnw0Ma/WiGYuJO5y8QTvEYBigFmhUxY5RqzE8OcywN/8m4UYrlaniJO75XQ6KSo9+tWHlu+hMi0UVdiKQp7NelnoZUzNaIyBPVeOwK6GNp+FfHuPOoyhaWuNvTYFkvxscMQWDh+zeFCFkgwbXftiV23ywJ4+uwRqmg9k3KzwIQpzppt8DBBOMbrqwQM5Gb05sEwdKzMiAqOloaA/lr0KA+1pr0/+HiWoiIjHA/wir2nIuS3PeU/ji3O6ZwoxcR1SZ9FhtLC5S0FIzFhbBWcGVP/KpxOPSiUoAdWUpqKH++6Scz507iCcxYI6rdMBICPJZea7OcmeFw5mObJSiqpjg2UoWNIs+cFhyDSt6geV5qgi3FunmwwDoGSMgerFOZGX1m0dMCYo5XOruxO063dwENK9DbnVM9wYFREzh4vyU1WYYJ/LRRp6oxgjqP/X5a8/4Af6p6NWkQferzBmXme0zY/4nwMJm/wd1tIqSwGz+E3xPEAOoZlJit3XddD7/BT1pllzOx+8bmQtANQ/S6fZexc6qi3W+Q2xcmXTUhuS5mpHQRvcxZUN0S5+PL9lXWUAaRZhEH8hTdAcuNMMCuVNKTEGtSUKNi3O6KhSaTzck8csZ2vWRZ+d7mW8c4IKwXIYd25S/zIftPkwPzufjEvOHWVD1m+FjpDVUTV0DGDuHj6QnaEwLu/dEgdLQOg9E1Sro9XHJ8ykLAwtPu+pxqKDuFexqON1sKQm7rwbE1E68UCfA/erovrTCG+DBSNg0l4goDQvZN6uNlbyLpcZAwj2UclycvLpIZMgv4yRlpb3YuMftozorbcGVHt/VeDV3+Fdf1TP0iuaCsPi2G4XeGhsyF1ubVDxkoJhmniQ0/jSg/eYML9KLfnCFgISWkp91eauR3IQvED0nAPXK+6hPCYs+n3+hCZbiskmVMG2da+0EsZPonUeIY8EbfusQXjsK/eFDaosbPjEfQS0RKG7yj5GG69M7MeO1HmiUYocgygJHL6M1qzUDDwUSmr99V7Sdr2F3JjQAJY+F0yH33Iv3+C9M38eML7gTgmNu/r2bUMiPvpYbZ6v1/IaESirBHNa7mPKn4dEmYg7v/+HQgPN1G79jBQ1+soydfDC2r+h2Bl/KIc5KjMK7OH6nb1jLsNf0EHVe2KBiE51ox636uyG6Lho0t3J34L5QY/ilE3mikaF4HKXG1mG1rCevT1Vv6GavltxoQe/bMrpZvRggnBxSEPEeEzkEdOxTnPXHVjUYdw8JYvjB/o7Eegc3Ma+NUxLLnsK0kJlinPmUHzHGtrk5+CAbVzFOBqpyy3QVUnzTDfC/0XD94/okH+OB+i7g9lolhWIjSnfIb+Eq43ZXOWmwvjyV/qqD+t0e+7mTEM74qP/Ozt8nmC7mRpyu63OB4KnUzFc074SqoyPUAgM+/TJGFo6T44EHnQU4X4z6qannVqgw/U7zCpwcmXV1AubIrvOmkKHazJAR55ePjp5tLBsN8vAqs3NAHdcEHOR2xQ0lsNAFzSUuxFQCFYvXLZJdOj9p4fNq6p0HBGUik2YzaI4xySy91KzhQ0+q1hjxvImRwPRf76tChlRkhRCi74NXZ9qUNeIwP+s5p+3m5nwPdNOHgSLD79n7O9m1n1uDHiMntq4nkYwV5OZ1ENbXxFd4PgrlvavZsyUO4MqYlqqn1O8W/I1dEZq5dXhrbETLaZIbC2Kj/Aa/QM+fqUOHdf0tXAQ1huZ3cmWECWSXy/43j35+Mvq9xws7JKseriZ1pEWKc8qlzNrGPUGcVgOa9cPJYIJsGnJTAUsEcDOEVULO5x0rXBijc1lgXEzQQKhROf8zIV82w8eswc78YX11KYLWQRcgHNJElBxfXr72lS2RBSl07qTKorO2uUDZr3sFhYsvnhLZn0A94KRzJ/7DEGIAhW5ZWFpL8gEwu1aLA9MuWZzNwl8Oze9Y+bX+v9gywRVnoB5I/8kXTXU3141yRLYrIOOz6SOnyHNy4SieqzkBXharjfjqq1q6tklaEbA8Qfm2DaIPs7OTq/nvJBjKfO2H9bH2cCMh1+5gspfycu8f/cuuRmtDjyqZ7uCIMyjdV3a+p3fqmXsRx4C8lujezIFHnQiVTXLXuI1XrwN3+siYYj2HHTvESUx8DlOTXpak9qFRK+L3mgJ1WsD7F4cu1aJoFoYQnu+wGDMOjJM3kiBQWHCcvhJ/HRdxodOQp45YZaOTA22Nb4XKCVxqkbwMYFhzYQYIAnCW8FW14uf98jhUG2zrKhQQ0q0CEq0t5nXyvUyvR8DvD69LU+g3i+HFWQMQ8PqZuHD+sNKAV0+M6EJC0szq7rEr7B5bQ8BcNHzvDMc9eqB5ZCQdTf80Obn4uzjwpYU7SISdtV0QGa9D3Wrh2BDQtpBKxaNFV+/Cy2P/Sv+8s7Ud0Fd74X4+o/TNztWgETUapy+majNQ68Lq3ee0ZO48VEbTZYiH1Co4OlfWef82RWeyUXo7woM03PyapGfikTnQinoNq5z5veLpeMV3HCAMTaZmA1oGLAn7XS3XYsz+XK7VMQsc4XKrmDXOLU/pSXVNUq8dIqTba///3x6LiLS6xs1xuCAYSfcQ3+rQgmu7uvf3THKt5Ooo97TqcbRqxx7EASizaQCBQllG/rYxVapMLgtLbZS64w1MDBMXX+PQpBKNwqUKOf2DDRDUXQf9EhOS0Qj4nTmlA8dzSLz/G1d+Ud8MTy/6ghhdiLpeerGY/UlDOfiuqFsMUU5/UYlP+BAmgRLuNpvrUaLlVkrqDievNVEAwF+4CoM1MZTmjxjJMsKJq+u8Zd7tNCUFy6LiyYXRJQ4VyvEQFFaCGKsxIwQkk7EzZ6LTJq2hUuPhvAW+gQnSG6J+MszC+7QCRHcnqDdyNRJ6T9xyS87A6MDutbzKGvGktpbXqtzWtXb9HsfK2cBMomjN9a4y+TaJLnXxAeX/HWzmf4cR4vALt/P4w4qgKY04ml4ZdLOinFYS6cup3G/1ie4+t1eOnpBNlqGqs75ilzkT4+DsZQxNvaSKJ//6zIbbk/M7LOhFmRc/1R+kBtz7JFGdZm/COotIdvQoXpTqP/1uqEUmCb/QWoGLMwO5ANcHzxdY48IGP5+J+zKOTBFZ4Pid+GTM+Wq12MV/H86xEJptBa6T+p3kgpwLedManBHC2GgNrFpoN2xnrMz9WFWX/8/ygSBkavq2Uv7FdCsLEYLu9LLIvAU0bNRDtzYl+/vXmjpIvuJFYjmI0im6QEYqnIeMsNjXG4vIutIGHijeAG/9EDBozKV5cldkHbLxHh25vT+ZEzbhXlqvpzKJwcEgfNwLAKFeo0/pvEE10XDB+EXRTXtSzJozQKFFAJhMxYkVaCW+E9AL7tMeU8acxidHqzb6lX4691UsDpy/LLRmT+epgW56+5Cw8tB4kMUv6s9lh3eRKbyGs+H/4mQMaYzPTf2OOdokEn+zzgvoD3FqNKk8QqGAXVsqcGdXrT62fSPkR2vROFi68A6se86UxRUk4cajfPyCC4G5wDhD+zNq4jodQ4u4n/m37Lr36n4LIAAsVr02dFi9AiwA81MYs2rm4eDlDNmdMRvEKRHfBwW5DdMNp0jPFZMeARqF/wL4XBfd+EMLBfMzpH5GH6NaW+1vrvMdg+VxDzatk3MXgO3ro3P/DpcC6+Mo4MySJhKJhSR01SGGGp5hPWmrrUgrv3lDnP+HhcI3nt3YqBoVAVTBAQT5iuhTg8nvPtd8ZeYj6w1x6RqGUBrSku7+N1+BaasZvjTk64RoIDlL8brpEcJx3OmY7jLoZsswdtmhfC/G21llXhITOwmvRDDeTTPbyASOa16cF5/A1fZAidJpqju3wYAy9avPR1ya6eNp9K8XYrrtuxlqi+bDKwlfrYdR0RRiKRVTLOH85+ZY7XSmzRpfZBJjaTa81VDcJHpZnZnSQLASGYW9l51ZV/h7eVzTi3Hv6hUsgc/51AqJRTkpbFVLXXszoBL8nBX0u/0jBLT8nH+fJePbrwURT58OY+UieRjd1vs04w0VG5VN2U6MoGZkQzKN/ptz0Q366dxoTGmj7i1NQGHi9GgnquXFYdrCfZBmeb7s0T6yrdlZH5cZuwHFyIJ/kAtGsTg0xH5taAAq44BAk1CPk9KVVbqQzrCUiFdF/6gtlPQ8bHHc1G1W92MXGZ5HEHftyLYs8mbD/9xYRUWkHmlM0zC2ilJlnNgV4bfALpQghxOUoZL7VTqtCHIaQSXm+YUMnpkXybnV+A6xlm2CVy8fn0Xlm2XRa0+zzOa21JWWmixfiPMSCZ7qA4rS93VN3pkpF1s5TonQjisHf7iU9ZGvUPOAKZcR1pbeVf/Ul7OhepGCaId9wOtqo7pJ7yLcBZ0pFkOF28y4zEI/kcUNmutBHaQpBdNM8vjCS6HZRokkeo88TBAjGyG7SR+6vUgTcyK9Imalj0kuxz0wmK+byQU11AiJFk/ya5dNduRClcnU64yGu/ieWSeOos1t3ep+RPIWQ2pyTYVbZltTbsb7NiwSi3AV+8KLWk7LxCnfZUetEM8ThnsSoGH38/nyAwFguJp8FjvlHtcWZuU4hPva0rHfr0UhOOJ/F6vS62FW7KzkmRll2HEc7oUq4fyi5T70Vl7YVIfsPHUCdHesf9Lk7WNVWO75JDkYbMI8TOW8JKVtLY9d6UJRITO8oKo0xS+o99Yy04iniGHAaGj88kEWgwv0OrHdY/nr76DOGNS59hXCGXzTKUvDl9iKpLSWYN1lxIeyywdNpTkhay74w2jFT6NS8qkjo5CxA1yfSYwp6AJIZNKIeEK5PJAW7ORgWgwp0VgzYpqovMrWxbu+DGZ6Lhie1RAqpzm8VUzKJOH3mCzWuTOLsN3VT/dv2eeYe9UjbR8YTBsLz7q60VN1sU51k+um1f8JxD5pPhbhSC8rRaB454tmh6YUWrJI3+GWY0qeWioj/tbkYITOkJaeuGt4JrJvHA+l0Gu7kY7XOaa05alMnRWVCXqFgLIwSY4uF59Ue5SU4QKuc/HamDxbr0x6csCetXGoP7Qn1Bk/J9DsynO/UD6iZ1Hyrz+jit0hDCwi/E9OjgKTbB3ZQKQ/0ZOvevfNHG0NK4Aj3Cp7NpRk07RT1i/S0EL93Ag8GRgKI9CfpajKyK6+Jj/PI1KO5/85VAwz2AwzP8FTBb075IxCXv6T9RVvWT2tUaqxDS92zrGUbWzUYk9mSs82pECH+fkqsDt93VW++4YsR/dHCYcQSYTO/KaBMDj9LSD/J/+z20Kq8XvZUAIHtm9hRPP3ItbuAu2Hm5lkPs92pd7kCxgRs0xOVBnZ13ccdA0aunrwv9SdqElJRC3g+oCu+nXyCgmXUs9yMjTMAIHfxZV+aPKcZeUBWt057Xo85Ks1Ir5gzEHCWqZEhrLZMuF11ziGtFQUds/EESajhagzcKsxamcSZxGth4UII+adPhQkUnx2WyN+4YWR+r3f8MnkyGFuR4zjzxJS8WsQYR5PTyRaD9ixa6Mh741nBHbzfjXHskGDq179xaRNrCIB1z1xRfWfjqw2pHc1zk9xlPpL8sQWAIuETZZhbnmL54rceXVNRvUiKrrqIkeogsl0XXb17ylNb0f4GA9Wd44vffEG8FSZGHEL2fbaTGRcSiCeA8PmA/f6Hz8HCS76fXUHwgwkzSwlI71ekZ7Fapmlk/KC+Hs8hUcw3N2LN5LhkVYyizYFl/uPeVP5lsoJHhhfWvvSWruCUW1ZcJOeuTbrDgywJ/qG07gZJplnTvLcYdNaH0KMYOYMGX+rB4NGPFmQsNaIwlWrfCezxre8zXBrsMT+edVLbLqN1BqB76JH4BvZTqUIMfGwPGEn+EnmTV86fPBaYbFL3DFEhjB45CewkXEAtJxk4/Ms2pPXnaRqdky0HOYdcUcE2zcXq4vaIvW2/v0nHFJH2XXe22ueDmq/18XGtELSq85j9X8q0tcNSSKJIX8FTuJF/Pf8j5PhqG2u+osvsLxYrvvfeVJL+4tkcXcr9JV7v0ERmj/X6fM3NC4j6dS1+9Umr2oPavqiAydTZPLMNRGY23LO9zAVDly7jD+70G5TPPLdhRIl4WxcYjLnM+SNcJ26FOrkrISUtPObIz5Zb3AG612krnpy15RMW+1cQjlnWFI6538qky9axd2oJmHIHP08KyP0ubGO+TQNOYuv2uh17yCIvR8VcStw7o1g0NM60sk+8Tq7YfIBJrtp53GkvzXH7OA0p8/n/u1satf/VJhtR1l8Wa6Gmaug7haSpaCaYQax6ta0mkutlb+eAOSG1aobM81D9A4iS1RRlzBBoVX6tU1S6WE2N9ORY6DfeLRC4l9Rvr5h95XDWB2mR1d4WFudpsgVYwiTwT31ljskD8ZyDOlm5DkGh9N/UB/0AI5Xvb8ZBmai2hQ4BWMqFwYnzxwB26YHSOv9WgY3JXnvoN+2R4rqGVh/LLDMtpFP+SpMGJNWvbIl5SOodbCczW2RKleksPoUeGEzrjtKHVdtZA+kfqO+rVx/iclCqwoopepvJpSTDjT+b9GWylGRF8EDbGlw6eUzmJM95Ovoz+kwLX3c2fTjFeYEsE7vUZm3mqdGJuKh2w9/QGSaqRHs99aScGOdDqkFcACoqdbBoQqqjamhH6Q9ng39JCg3lrGJwd50Qk9ovnqBTr8MME7Ps2wiVfygUmPoUBJJfJWX5Nda0nuncbFkA=="));
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.getData = undefined;
  var base64_1 = require_lib10();
  var decoder_js_1 = require_decoder();
  exports.getData = getData;
});

// node_modules/@ethersproject/hash/lib/ens-normalize/lib.js
var require_lib11 = __commonJS((exports) => {
  var explode_cp = function(name) {
    return (0, strings_1.toUtf8CodePoints)(name);
  };
  var filter_fe0f = function(cps) {
    return cps.filter(function(cp) {
      return cp != 65039;
    });
  };
  var ens_normalize_post_check = function(name) {
    for (var _i = 0, _a = name.split(".");_i < _a.length; _i++) {
      var label = _a[_i];
      var cps = explode_cp(label);
      try {
        for (var i = cps.lastIndexOf(UNDERSCORE) - 1;i >= 0; i--) {
          if (cps[i] !== UNDERSCORE) {
            throw new Error("underscore only allowed at start");
          }
        }
        if (cps.length >= 4 && cps.every(function(cp) {
          return cp < 128;
        }) && cps[2] === HYPHEN && cps[3] === HYPHEN) {
          throw new Error("invalid label extension");
        }
      } catch (err) {
        throw new Error("Invalid label \"" + label + "\": " + err.message);
      }
    }
    return name;
  };
  var ens_normalize = function(name) {
    return ens_normalize_post_check(normalize(name, filter_fe0f));
  };
  var normalize = function(name, emoji_filter) {
    var input = explode_cp(name).reverse();
    var output = [];
    while (input.length) {
      var emoji = consume_emoji_reversed(input);
      if (emoji) {
        output.push.apply(output, emoji_filter(emoji));
        continue;
      }
      var cp = input.pop();
      if (VALID.has(cp)) {
        output.push(cp);
        continue;
      }
      if (IGNORED.has(cp)) {
        continue;
      }
      var cps = MAPPED[cp];
      if (cps) {
        output.push.apply(output, cps);
        continue;
      }
      throw new Error("Disallowed codepoint: 0x" + cp.toString(16).toUpperCase());
    }
    return ens_normalize_post_check(nfc(String.fromCodePoint.apply(String, output)));
  };
  var nfc = function(s) {
    return s.normalize("NFC");
  };
  var consume_emoji_reversed = function(cps, eaten) {
    var _a;
    var node = EMOJI_ROOT;
    var emoji;
    var saved;
    var stack = [];
    var pos = cps.length;
    if (eaten)
      eaten.length = 0;
    var _loop_1 = function() {
      var cp = cps[--pos];
      node = (_a = node.branches.find(function(x) {
        return x.set.has(cp);
      })) === null || _a === undefined ? undefined : _a.node;
      if (!node)
        return "break";
      if (node.save) {
        saved = cp;
      } else if (node.check) {
        if (cp === saved)
          return "break";
      }
      stack.push(cp);
      if (node.fe0f) {
        stack.push(65039);
        if (pos > 0 && cps[pos - 1] == 65039)
          pos--;
      }
      if (node.valid) {
        emoji = stack.slice();
        if (node.valid == 2)
          emoji.splice(1, 1);
        if (eaten)
          eaten.push.apply(eaten, cps.slice(pos).reverse());
        cps.length = pos;
      }
    };
    while (pos) {
      var state_1 = _loop_1();
      if (state_1 === "break")
        break;
    }
    return emoji;
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.ens_normalize = exports.ens_normalize_post_check = undefined;
  var strings_1 = require_lib9();
  var include_js_1 = require_include();
  var r = (0, include_js_1.getData)();
  var decoder_js_1 = require_decoder();
  var VALID = new Set((0, decoder_js_1.read_member_array)(r));
  var IGNORED = new Set((0, decoder_js_1.read_member_array)(r));
  var MAPPED = (0, decoder_js_1.read_mapped_map)(r);
  var EMOJI_ROOT = (0, decoder_js_1.read_emoji_trie)(r);
  var HYPHEN = 45;
  var UNDERSCORE = 95;
  exports.ens_normalize_post_check = ens_normalize_post_check;
  exports.ens_normalize = ens_normalize;
});

// node_modules/@ethersproject/hash/lib/namehash.js
var require_namehash = __commonJS((exports) => {
  var checkComponent = function(comp) {
    if (comp.length === 0) {
      throw new Error("invalid ENS name; empty component");
    }
    return comp;
  };
  var ensNameSplit = function(name) {
    var bytes = (0, strings_1.toUtf8Bytes)((0, lib_1.ens_normalize)(name));
    var comps = [];
    if (name.length === 0) {
      return comps;
    }
    var last = 0;
    for (var i = 0;i < bytes.length; i++) {
      var d = bytes[i];
      if (d === 46) {
        comps.push(checkComponent(bytes.slice(last, i)));
        last = i + 1;
      }
    }
    if (last >= bytes.length) {
      throw new Error("invalid ENS name; empty component");
    }
    comps.push(checkComponent(bytes.slice(last)));
    return comps;
  };
  var ensNormalize = function(name) {
    return ensNameSplit(name).map(function(comp) {
      return (0, strings_1.toUtf8String)(comp);
    }).join(".");
  };
  var isValidName = function(name) {
    try {
      return ensNameSplit(name).length !== 0;
    } catch (error) {
    }
    return false;
  };
  var namehash = function(name) {
    if (typeof name !== "string") {
      logger.throwArgumentError("invalid ENS name; not a string", "name", name);
    }
    var result = Zeros;
    var comps = ensNameSplit(name);
    while (comps.length) {
      result = (0, keccak256_1.keccak256)((0, bytes_1.concat)([result, (0, keccak256_1.keccak256)(comps.pop())]));
    }
    return (0, bytes_1.hexlify)(result);
  };
  var dnsEncode = function(name) {
    return (0, bytes_1.hexlify)((0, bytes_1.concat)(ensNameSplit(name).map(function(comp) {
      if (comp.length > 63) {
        throw new Error("invalid DNS encoded entry; length exceeds 63 bytes");
      }
      var bytes = new Uint8Array(comp.length + 1);
      bytes.set(comp, 1);
      bytes[0] = bytes.length - 1;
      return bytes;
    }))) + "00";
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.dnsEncode = exports.namehash = exports.isValidName = exports.ensNormalize = undefined;
  var bytes_1 = require_lib2();
  var strings_1 = require_lib9();
  var keccak256_1 = require_lib5();
  var logger_1 = require_lib();
  var _version_1 = require__version9();
  var logger = new logger_1.Logger(_version_1.version);
  var lib_1 = require_lib11();
  var Zeros = new Uint8Array(32);
  Zeros.fill(0);
  exports.ensNormalize = ensNormalize;
  exports.isValidName = isValidName;
  exports.namehash = namehash;
  exports.dnsEncode = dnsEncode;
});

// node_modules/@ethersproject/hash/lib/message.js
var require_message = __commonJS((exports) => {
  var hashMessage = function(message) {
    if (typeof message === "string") {
      message = (0, strings_1.toUtf8Bytes)(message);
    }
    return (0, keccak256_1.keccak256)((0, bytes_1.concat)([
      (0, strings_1.toUtf8Bytes)(exports.messagePrefix),
      (0, strings_1.toUtf8Bytes)(String(message.length)),
      message
    ]));
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.hashMessage = exports.messagePrefix = undefined;
  var bytes_1 = require_lib2();
  var keccak256_1 = require_lib5();
  var strings_1 = require_lib9();
  exports.messagePrefix = `\x19Ethereum Signed Message:
`;
  exports.hashMessage = hashMessage;
});

// node_modules/@ethersproject/hash/lib/typed-data.js
var require_typed_data = __commonJS((exports) => {
  var hexPadRight = function(value) {
    var bytes = (0, bytes_1.arrayify)(value);
    var padOffset = bytes.length % 32;
    if (padOffset) {
      return (0, bytes_1.hexConcat)([bytes, padding.slice(padOffset)]);
    }
    return (0, bytes_1.hexlify)(bytes);
  };
  var checkString = function(key) {
    return function(value) {
      if (typeof value !== "string") {
        logger.throwArgumentError("invalid domain value for " + JSON.stringify(key), "domain." + key, value);
      }
      return value;
    };
  };
  var getBaseEncoder = function(type) {
    {
      var match = type.match(/^(u?)int(\d*)$/);
      if (match) {
        var signed = match[1] === "";
        var width = parseInt(match[2] || "256");
        if (width % 8 !== 0 || width > 256 || match[2] && match[2] !== String(width)) {
          logger.throwArgumentError("invalid numeric width", "type", type);
        }
        var boundsUpper_1 = MaxUint256.mask(signed ? width - 1 : width);
        var boundsLower_1 = signed ? boundsUpper_1.add(One).mul(NegativeOne) : Zero;
        return function(value) {
          var v2 = bignumber_1.BigNumber.from(value);
          if (v2.lt(boundsLower_1) || v2.gt(boundsUpper_1)) {
            logger.throwArgumentError("value out-of-bounds for " + type, "value", value);
          }
          return (0, bytes_1.hexZeroPad)(v2.toTwos(256).toHexString(), 32);
        };
      }
    }
    {
      var match = type.match(/^bytes(\d+)$/);
      if (match) {
        var width_1 = parseInt(match[1]);
        if (width_1 === 0 || width_1 > 32 || match[1] !== String(width_1)) {
          logger.throwArgumentError("invalid bytes width", "type", type);
        }
        return function(value) {
          var bytes = (0, bytes_1.arrayify)(value);
          if (bytes.length !== width_1) {
            logger.throwArgumentError("invalid length for " + type, "value", value);
          }
          return hexPadRight(value);
        };
      }
    }
    switch (type) {
      case "address":
        return function(value) {
          return (0, bytes_1.hexZeroPad)((0, address_1.getAddress)(value), 32);
        };
      case "bool":
        return function(value) {
          return !value ? hexFalse : hexTrue;
        };
      case "bytes":
        return function(value) {
          return (0, keccak256_1.keccak256)(value);
        };
      case "string":
        return function(value) {
          return (0, id_1.id)(value);
        };
    }
    return null;
  };
  var encodeType = function(name, fields) {
    return name + "(" + fields.map(function(_a) {
      var { name: name2, type } = _a;
      return type + " " + name2;
    }).join(",") + ")";
  };
  var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  var __generator = exports && exports.__generator || function(thisArg, body) {
    var _2 = { label: 0, sent: function() {
      if (t[0] & 1)
        throw t[1];
      return t[1];
    }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), throw: verb(1), return: verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
      return this;
    }), g;
    function verb(n) {
      return function(v2) {
        return step([n, v2]);
      };
    }
    function step(op) {
      if (f)
        throw new TypeError("Generator is already executing.");
      while (_2)
        try {
          if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
            return t;
          if (y = 0, t)
            op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _2.label++;
              return { value: op[1], done: false };
            case 5:
              _2.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _2.ops.pop();
              _2.trys.pop();
              continue;
            default:
              if (!(t = _2.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                _2 = 0;
                continue;
              }
              if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                _2.label = op[1];
                break;
              }
              if (op[0] === 6 && _2.label < t[1]) {
                _2.label = t[1];
                t = op;
                break;
              }
              if (t && _2.label < t[2]) {
                _2.label = t[2];
                _2.ops.push(op);
                break;
              }
              if (t[2])
                _2.ops.pop();
              _2.trys.pop();
              continue;
          }
          op = body.call(thisArg, _2);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5)
        throw op[1];
      return { value: op[0] ? op[1] : undefined, done: true };
    }
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.TypedDataEncoder = undefined;
  var address_1 = require_lib7();
  var bignumber_1 = require_lib3();
  var bytes_1 = require_lib2();
  var keccak256_1 = require_lib5();
  var properties_1 = require_lib4();
  var logger_1 = require_lib();
  var _version_1 = require__version9();
  var logger = new logger_1.Logger(_version_1.version);
  var id_1 = require_id();
  var padding = new Uint8Array(32);
  padding.fill(0);
  var NegativeOne = bignumber_1.BigNumber.from(-1);
  var Zero = bignumber_1.BigNumber.from(0);
  var One = bignumber_1.BigNumber.from(1);
  var MaxUint256 = bignumber_1.BigNumber.from("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
  var hexTrue = (0, bytes_1.hexZeroPad)(One.toHexString(), 32);
  var hexFalse = (0, bytes_1.hexZeroPad)(Zero.toHexString(), 32);
  var domainFieldTypes = {
    name: "string",
    version: "string",
    chainId: "uint256",
    verifyingContract: "address",
    salt: "bytes32"
  };
  var domainFieldNames = [
    "name",
    "version",
    "chainId",
    "verifyingContract",
    "salt"
  ];
  var domainChecks = {
    name: checkString("name"),
    version: checkString("version"),
    chainId: function(value) {
      try {
        return bignumber_1.BigNumber.from(value).toString();
      } catch (error) {
      }
      return logger.throwArgumentError("invalid domain value for \"chainId\"", "domain.chainId", value);
    },
    verifyingContract: function(value) {
      try {
        return (0, address_1.getAddress)(value).toLowerCase();
      } catch (error) {
      }
      return logger.throwArgumentError("invalid domain value \"verifyingContract\"", "domain.verifyingContract", value);
    },
    salt: function(value) {
      try {
        var bytes = (0, bytes_1.arrayify)(value);
        if (bytes.length !== 32) {
          throw new Error("bad length");
        }
        return (0, bytes_1.hexlify)(bytes);
      } catch (error) {
      }
      return logger.throwArgumentError("invalid domain value \"salt\"", "domain.salt", value);
    }
  };
  var TypedDataEncoder = function() {
    function TypedDataEncoder2(types) {
      (0, properties_1.defineReadOnly)(this, "types", Object.freeze((0, properties_1.deepCopy)(types)));
      (0, properties_1.defineReadOnly)(this, "_encoderCache", {});
      (0, properties_1.defineReadOnly)(this, "_types", {});
      var links = {};
      var parents = {};
      var subtypes = {};
      Object.keys(types).forEach(function(type) {
        links[type] = {};
        parents[type] = [];
        subtypes[type] = {};
      });
      var _loop_1 = function(name_12) {
        var uniqueNames = {};
        types[name_12].forEach(function(field) {
          if (uniqueNames[field.name]) {
            logger.throwArgumentError("duplicate variable name " + JSON.stringify(field.name) + " in " + JSON.stringify(name_12), "types", types);
          }
          uniqueNames[field.name] = true;
          var baseType = field.type.match(/^([^\x5b]*)(\x5b|$)/)[1];
          if (baseType === name_12) {
            logger.throwArgumentError("circular type reference to " + JSON.stringify(baseType), "types", types);
          }
          var encoder = getBaseEncoder(baseType);
          if (encoder) {
            return;
          }
          if (!parents[baseType]) {
            logger.throwArgumentError("unknown type " + JSON.stringify(baseType), "types", types);
          }
          parents[baseType].push(name_12);
          links[name_12][baseType] = true;
        });
      };
      for (var name_1 in types) {
        _loop_1(name_1);
      }
      var primaryTypes = Object.keys(parents).filter(function(n) {
        return parents[n].length === 0;
      });
      if (primaryTypes.length === 0) {
        logger.throwArgumentError("missing primary type", "types", types);
      } else if (primaryTypes.length > 1) {
        logger.throwArgumentError("ambiguous primary types or unused types: " + primaryTypes.map(function(t) {
          return JSON.stringify(t);
        }).join(", "), "types", types);
      }
      (0, properties_1.defineReadOnly)(this, "primaryType", primaryTypes[0]);
      function checkCircular(type, found) {
        if (found[type]) {
          logger.throwArgumentError("circular type reference to " + JSON.stringify(type), "types", types);
        }
        found[type] = true;
        Object.keys(links[type]).forEach(function(child) {
          if (!parents[child]) {
            return;
          }
          checkCircular(child, found);
          Object.keys(found).forEach(function(subtype) {
            subtypes[subtype][child] = true;
          });
        });
        delete found[type];
      }
      checkCircular(this.primaryType, {});
      for (var name_2 in subtypes) {
        var st = Object.keys(subtypes[name_2]);
        st.sort();
        this._types[name_2] = encodeType(name_2, types[name_2]) + st.map(function(t) {
          return encodeType(t, types[t]);
        }).join("");
      }
    }
    TypedDataEncoder2.prototype.getEncoder = function(type) {
      var encoder = this._encoderCache[type];
      if (!encoder) {
        encoder = this._encoderCache[type] = this._getEncoder(type);
      }
      return encoder;
    };
    TypedDataEncoder2.prototype._getEncoder = function(type) {
      var _this = this;
      {
        var encoder = getBaseEncoder(type);
        if (encoder) {
          return encoder;
        }
      }
      var match = type.match(/^(.*)(\x5b(\d*)\x5d)$/);
      if (match) {
        var subtype_1 = match[1];
        var subEncoder_1 = this.getEncoder(subtype_1);
        var length_1 = parseInt(match[3]);
        return function(value) {
          if (length_1 >= 0 && value.length !== length_1) {
            logger.throwArgumentError("array length mismatch; expected length ${ arrayLength }", "value", value);
          }
          var result = value.map(subEncoder_1);
          if (_this._types[subtype_1]) {
            result = result.map(keccak256_1.keccak256);
          }
          return (0, keccak256_1.keccak256)((0, bytes_1.hexConcat)(result));
        };
      }
      var fields = this.types[type];
      if (fields) {
        var encodedType_1 = (0, id_1.id)(this._types[type]);
        return function(value) {
          var values = fields.map(function(_a) {
            var { name, type: type2 } = _a;
            var result = _this.getEncoder(type2)(value[name]);
            if (_this._types[type2]) {
              return (0, keccak256_1.keccak256)(result);
            }
            return result;
          });
          values.unshift(encodedType_1);
          return (0, bytes_1.hexConcat)(values);
        };
      }
      return logger.throwArgumentError("unknown type: " + type, "type", type);
    };
    TypedDataEncoder2.prototype.encodeType = function(name) {
      var result = this._types[name];
      if (!result) {
        logger.throwArgumentError("unknown type: " + JSON.stringify(name), "name", name);
      }
      return result;
    };
    TypedDataEncoder2.prototype.encodeData = function(type, value) {
      return this.getEncoder(type)(value);
    };
    TypedDataEncoder2.prototype.hashStruct = function(name, value) {
      return (0, keccak256_1.keccak256)(this.encodeData(name, value));
    };
    TypedDataEncoder2.prototype.encode = function(value) {
      return this.encodeData(this.primaryType, value);
    };
    TypedDataEncoder2.prototype.hash = function(value) {
      return this.hashStruct(this.primaryType, value);
    };
    TypedDataEncoder2.prototype._visit = function(type, value, callback) {
      var _this = this;
      {
        var encoder = getBaseEncoder(type);
        if (encoder) {
          return callback(type, value);
        }
      }
      var match = type.match(/^(.*)(\x5b(\d*)\x5d)$/);
      if (match) {
        var subtype_2 = match[1];
        var length_2 = parseInt(match[3]);
        if (length_2 >= 0 && value.length !== length_2) {
          logger.throwArgumentError("array length mismatch; expected length ${ arrayLength }", "value", value);
        }
        return value.map(function(v2) {
          return _this._visit(subtype_2, v2, callback);
        });
      }
      var fields = this.types[type];
      if (fields) {
        return fields.reduce(function(accum, _a) {
          var { name, type: type2 } = _a;
          accum[name] = _this._visit(type2, value[name], callback);
          return accum;
        }, {});
      }
      return logger.throwArgumentError("unknown type: " + type, "type", type);
    };
    TypedDataEncoder2.prototype.visit = function(value, callback) {
      return this._visit(this.primaryType, value, callback);
    };
    TypedDataEncoder2.from = function(types) {
      return new TypedDataEncoder2(types);
    };
    TypedDataEncoder2.getPrimaryType = function(types) {
      return TypedDataEncoder2.from(types).primaryType;
    };
    TypedDataEncoder2.hashStruct = function(name, types, value) {
      return TypedDataEncoder2.from(types).hashStruct(name, value);
    };
    TypedDataEncoder2.hashDomain = function(domain) {
      var domainFields = [];
      for (var name_3 in domain) {
        var type = domainFieldTypes[name_3];
        if (!type) {
          logger.throwArgumentError("invalid typed-data domain key: " + JSON.stringify(name_3), "domain", domain);
        }
        domainFields.push({ name: name_3, type });
      }
      domainFields.sort(function(a, b2) {
        return domainFieldNames.indexOf(a.name) - domainFieldNames.indexOf(b2.name);
      });
      return TypedDataEncoder2.hashStruct("EIP712Domain", { EIP712Domain: domainFields }, domain);
    };
    TypedDataEncoder2.encode = function(domain, types, value) {
      return (0, bytes_1.hexConcat)([
        "0x1901",
        TypedDataEncoder2.hashDomain(domain),
        TypedDataEncoder2.from(types).hash(value)
      ]);
    };
    TypedDataEncoder2.hash = function(domain, types, value) {
      return (0, keccak256_1.keccak256)(TypedDataEncoder2.encode(domain, types, value));
    };
    TypedDataEncoder2.resolveNames = function(domain, types, value, resolveName) {
      return __awaiter(this, undefined, undefined, function() {
        var ensCache, encoder, _a, _b, _i, name_4, _c, _d;
        return __generator(this, function(_e) {
          switch (_e.label) {
            case 0:
              domain = (0, properties_1.shallowCopy)(domain);
              ensCache = {};
              if (domain.verifyingContract && !(0, bytes_1.isHexString)(domain.verifyingContract, 20)) {
                ensCache[domain.verifyingContract] = "0x";
              }
              encoder = TypedDataEncoder2.from(types);
              encoder.visit(value, function(type, value2) {
                if (type === "address" && !(0, bytes_1.isHexString)(value2, 20)) {
                  ensCache[value2] = "0x";
                }
                return value2;
              });
              _a = [];
              for (_b in ensCache)
                _a.push(_b);
              _i = 0;
              _e.label = 1;
            case 1:
              if (!(_i < _a.length))
                return [3, 4];
              name_4 = _a[_i];
              _c = ensCache;
              _d = name_4;
              return [4, resolveName(name_4)];
            case 2:
              _c[_d] = _e.sent();
              _e.label = 3;
            case 3:
              _i++;
              return [3, 1];
            case 4:
              if (domain.verifyingContract && ensCache[domain.verifyingContract]) {
                domain.verifyingContract = ensCache[domain.verifyingContract];
              }
              value = encoder.visit(value, function(type, value2) {
                if (type === "address" && ensCache[value2]) {
                  return ensCache[value2];
                }
                return value2;
              });
              return [2, { domain, value }];
          }
        });
      });
    };
    TypedDataEncoder2.getPayload = function(domain, types, value) {
      TypedDataEncoder2.hashDomain(domain);
      var domainValues = {};
      var domainTypes = [];
      domainFieldNames.forEach(function(name) {
        var value2 = domain[name];
        if (value2 == null) {
          return;
        }
        domainValues[name] = domainChecks[name](value2);
        domainTypes.push({ name, type: domainFieldTypes[name] });
      });
      var encoder = TypedDataEncoder2.from(types);
      var typesWithDomain = (0, properties_1.shallowCopy)(types);
      if (typesWithDomain.EIP712Domain) {
        logger.throwArgumentError("types must not contain EIP712Domain type", "types.EIP712Domain", types);
      } else {
        typesWithDomain.EIP712Domain = domainTypes;
      }
      encoder.encode(value);
      return {
        types: typesWithDomain,
        domain: domainValues,
        primaryType: encoder.primaryType,
        message: encoder.visit(value, function(type, value2) {
          if (type.match(/^bytes(\d*)/)) {
            return (0, bytes_1.hexlify)((0, bytes_1.arrayify)(value2));
          }
          if (type.match(/^u?int/)) {
            return bignumber_1.BigNumber.from(value2).toString();
          }
          switch (type) {
            case "address":
              return value2.toLowerCase();
            case "bool":
              return !!value2;
            case "string":
              if (typeof value2 !== "string") {
                logger.throwArgumentError("invalid string", "value", value2);
              }
              return value2;
          }
          return logger.throwArgumentError("unsupported type", "type", type);
        })
      };
    };
    return TypedDataEncoder2;
  }();
  exports.TypedDataEncoder = TypedDataEncoder;
});

// node_modules/@ethersproject/hash/lib/index.js
var require_lib12 = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports._TypedDataEncoder = exports.hashMessage = exports.messagePrefix = exports.ensNormalize = exports.isValidName = exports.namehash = exports.dnsEncode = exports.id = undefined;
  var id_1 = require_id();
  Object.defineProperty(exports, "id", { enumerable: true, get: function() {
    return id_1.id;
  } });
  var namehash_1 = require_namehash();
  Object.defineProperty(exports, "dnsEncode", { enumerable: true, get: function() {
    return namehash_1.dnsEncode;
  } });
  Object.defineProperty(exports, "isValidName", { enumerable: true, get: function() {
    return namehash_1.isValidName;
  } });
  Object.defineProperty(exports, "namehash", { enumerable: true, get: function() {
    return namehash_1.namehash;
  } });
  var message_1 = require_message();
  Object.defineProperty(exports, "hashMessage", { enumerable: true, get: function() {
    return message_1.hashMessage;
  } });
  Object.defineProperty(exports, "messagePrefix", { enumerable: true, get: function() {
    return message_1.messagePrefix;
  } });
  var namehash_2 = require_namehash();
  Object.defineProperty(exports, "ensNormalize", { enumerable: true, get: function() {
    return namehash_2.ensNormalize;
  } });
  var typed_data_1 = require_typed_data();
  Object.defineProperty(exports, "_TypedDataEncoder", { enumerable: true, get: function() {
    return typed_data_1.TypedDataEncoder;
  } });
});

// node_modules/@ethersproject/abi/lib/interface.js
var require_interface = __commonJS((exports) => {
  var wrapAccessError = function(property, error) {
    var wrap = new Error("deferred error during ABI decoding triggered accessing " + property);
    wrap.error = error;
    return wrap;
  };
  var __extends = exports && exports.__extends || function() {
    var extendStatics = function(d, b2) {
      extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b3) {
        d2.__proto__ = b3;
      } || function(d2, b3) {
        for (var p in b3)
          if (Object.prototype.hasOwnProperty.call(b3, p))
            d2[p] = b3[p];
      };
      return extendStatics(d, b2);
    };
    return function(d, b2) {
      if (typeof b2 !== "function" && b2 !== null)
        throw new TypeError("Class extends value " + String(b2) + " is not a constructor or null");
      extendStatics(d, b2);
      function __() {
        this.constructor = d;
      }
      d.prototype = b2 === null ? Object.create(b2) : (__.prototype = b2.prototype, new __);
    };
  }();
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.Interface = exports.Indexed = exports.ErrorDescription = exports.TransactionDescription = exports.LogDescription = exports.checkResultErrors = undefined;
  var address_1 = require_lib7();
  var bignumber_1 = require_lib3();
  var bytes_1 = require_lib2();
  var hash_1 = require_lib12();
  var keccak256_1 = require_lib5();
  var properties_1 = require_lib4();
  var abi_coder_1 = require_abi_coder();
  var abstract_coder_1 = require_abstract_coder();
  Object.defineProperty(exports, "checkResultErrors", { enumerable: true, get: function() {
    return abstract_coder_1.checkResultErrors;
  } });
  var fragments_1 = require_fragments();
  var logger_1 = require_lib();
  var _version_1 = require__version5();
  var logger = new logger_1.Logger(_version_1.version);
  var LogDescription = function(_super) {
    __extends(LogDescription2, _super);
    function LogDescription2() {
      return _super !== null && _super.apply(this, arguments) || this;
    }
    return LogDescription2;
  }(properties_1.Description);
  exports.LogDescription = LogDescription;
  var TransactionDescription = function(_super) {
    __extends(TransactionDescription2, _super);
    function TransactionDescription2() {
      return _super !== null && _super.apply(this, arguments) || this;
    }
    return TransactionDescription2;
  }(properties_1.Description);
  exports.TransactionDescription = TransactionDescription;
  var ErrorDescription = function(_super) {
    __extends(ErrorDescription2, _super);
    function ErrorDescription2() {
      return _super !== null && _super.apply(this, arguments) || this;
    }
    return ErrorDescription2;
  }(properties_1.Description);
  exports.ErrorDescription = ErrorDescription;
  var Indexed = function(_super) {
    __extends(Indexed2, _super);
    function Indexed2() {
      return _super !== null && _super.apply(this, arguments) || this;
    }
    Indexed2.isIndexed = function(value) {
      return !!(value && value._isIndexed);
    };
    return Indexed2;
  }(properties_1.Description);
  exports.Indexed = Indexed;
  var BuiltinErrors = {
    "0x08c379a0": { signature: "Error(string)", name: "Error", inputs: ["string"], reason: true },
    "0x4e487b71": { signature: "Panic(uint256)", name: "Panic", inputs: ["uint256"] }
  };
  var Interface = function() {
    function Interface2(fragments) {
      var _newTarget = this.constructor;
      var _this = this;
      var abi = [];
      if (typeof fragments === "string") {
        abi = JSON.parse(fragments);
      } else {
        abi = fragments;
      }
      (0, properties_1.defineReadOnly)(this, "fragments", abi.map(function(fragment) {
        return fragments_1.Fragment.from(fragment);
      }).filter(function(fragment) {
        return fragment != null;
      }));
      (0, properties_1.defineReadOnly)(this, "_abiCoder", (0, properties_1.getStatic)(_newTarget, "getAbiCoder")());
      (0, properties_1.defineReadOnly)(this, "functions", {});
      (0, properties_1.defineReadOnly)(this, "errors", {});
      (0, properties_1.defineReadOnly)(this, "events", {});
      (0, properties_1.defineReadOnly)(this, "structs", {});
      this.fragments.forEach(function(fragment) {
        var bucket = null;
        switch (fragment.type) {
          case "constructor":
            if (_this.deploy) {
              logger.warn("duplicate definition - constructor");
              return;
            }
            (0, properties_1.defineReadOnly)(_this, "deploy", fragment);
            return;
          case "function":
            bucket = _this.functions;
            break;
          case "event":
            bucket = _this.events;
            break;
          case "error":
            bucket = _this.errors;
            break;
          default:
            return;
        }
        var signature = fragment.format();
        if (bucket[signature]) {
          logger.warn("duplicate definition - " + signature);
          return;
        }
        bucket[signature] = fragment;
      });
      if (!this.deploy) {
        (0, properties_1.defineReadOnly)(this, "deploy", fragments_1.ConstructorFragment.from({
          payable: false,
          type: "constructor"
        }));
      }
      (0, properties_1.defineReadOnly)(this, "_isInterface", true);
    }
    Interface2.prototype.format = function(format) {
      if (!format) {
        format = fragments_1.FormatTypes.full;
      }
      if (format === fragments_1.FormatTypes.sighash) {
        logger.throwArgumentError("interface does not support formatting sighash", "format", format);
      }
      var abi = this.fragments.map(function(fragment) {
        return fragment.format(format);
      });
      if (format === fragments_1.FormatTypes.json) {
        return JSON.stringify(abi.map(function(j) {
          return JSON.parse(j);
        }));
      }
      return abi;
    };
    Interface2.getAbiCoder = function() {
      return abi_coder_1.defaultAbiCoder;
    };
    Interface2.getAddress = function(address) {
      return (0, address_1.getAddress)(address);
    };
    Interface2.getSighash = function(fragment) {
      return (0, bytes_1.hexDataSlice)((0, hash_1.id)(fragment.format()), 0, 4);
    };
    Interface2.getEventTopic = function(eventFragment) {
      return (0, hash_1.id)(eventFragment.format());
    };
    Interface2.prototype.getFunction = function(nameOrSignatureOrSighash) {
      if ((0, bytes_1.isHexString)(nameOrSignatureOrSighash)) {
        for (var name_1 in this.functions) {
          if (nameOrSignatureOrSighash === this.getSighash(name_1)) {
            return this.functions[name_1];
          }
        }
        logger.throwArgumentError("no matching function", "sighash", nameOrSignatureOrSighash);
      }
      if (nameOrSignatureOrSighash.indexOf("(") === -1) {
        var name_2 = nameOrSignatureOrSighash.trim();
        var matching = Object.keys(this.functions).filter(function(f) {
          return f.split("(")[0] === name_2;
        });
        if (matching.length === 0) {
          logger.throwArgumentError("no matching function", "name", name_2);
        } else if (matching.length > 1) {
          logger.throwArgumentError("multiple matching functions", "name", name_2);
        }
        return this.functions[matching[0]];
      }
      var result = this.functions[fragments_1.FunctionFragment.fromString(nameOrSignatureOrSighash).format()];
      if (!result) {
        logger.throwArgumentError("no matching function", "signature", nameOrSignatureOrSighash);
      }
      return result;
    };
    Interface2.prototype.getEvent = function(nameOrSignatureOrTopic) {
      if ((0, bytes_1.isHexString)(nameOrSignatureOrTopic)) {
        var topichash = nameOrSignatureOrTopic.toLowerCase();
        for (var name_3 in this.events) {
          if (topichash === this.getEventTopic(name_3)) {
            return this.events[name_3];
          }
        }
        logger.throwArgumentError("no matching event", "topichash", topichash);
      }
      if (nameOrSignatureOrTopic.indexOf("(") === -1) {
        var name_4 = nameOrSignatureOrTopic.trim();
        var matching = Object.keys(this.events).filter(function(f) {
          return f.split("(")[0] === name_4;
        });
        if (matching.length === 0) {
          logger.throwArgumentError("no matching event", "name", name_4);
        } else if (matching.length > 1) {
          logger.throwArgumentError("multiple matching events", "name", name_4);
        }
        return this.events[matching[0]];
      }
      var result = this.events[fragments_1.EventFragment.fromString(nameOrSignatureOrTopic).format()];
      if (!result) {
        logger.throwArgumentError("no matching event", "signature", nameOrSignatureOrTopic);
      }
      return result;
    };
    Interface2.prototype.getError = function(nameOrSignatureOrSighash) {
      if ((0, bytes_1.isHexString)(nameOrSignatureOrSighash)) {
        var getSighash = (0, properties_1.getStatic)(this.constructor, "getSighash");
        for (var name_5 in this.errors) {
          var error = this.errors[name_5];
          if (nameOrSignatureOrSighash === getSighash(error)) {
            return this.errors[name_5];
          }
        }
        logger.throwArgumentError("no matching error", "sighash", nameOrSignatureOrSighash);
      }
      if (nameOrSignatureOrSighash.indexOf("(") === -1) {
        var name_6 = nameOrSignatureOrSighash.trim();
        var matching = Object.keys(this.errors).filter(function(f) {
          return f.split("(")[0] === name_6;
        });
        if (matching.length === 0) {
          logger.throwArgumentError("no matching error", "name", name_6);
        } else if (matching.length > 1) {
          logger.throwArgumentError("multiple matching errors", "name", name_6);
        }
        return this.errors[matching[0]];
      }
      var result = this.errors[fragments_1.FunctionFragment.fromString(nameOrSignatureOrSighash).format()];
      if (!result) {
        logger.throwArgumentError("no matching error", "signature", nameOrSignatureOrSighash);
      }
      return result;
    };
    Interface2.prototype.getSighash = function(fragment) {
      if (typeof fragment === "string") {
        try {
          fragment = this.getFunction(fragment);
        } catch (error) {
          try {
            fragment = this.getError(fragment);
          } catch (_2) {
            throw error;
          }
        }
      }
      return (0, properties_1.getStatic)(this.constructor, "getSighash")(fragment);
    };
    Interface2.prototype.getEventTopic = function(eventFragment) {
      if (typeof eventFragment === "string") {
        eventFragment = this.getEvent(eventFragment);
      }
      return (0, properties_1.getStatic)(this.constructor, "getEventTopic")(eventFragment);
    };
    Interface2.prototype._decodeParams = function(params, data) {
      return this._abiCoder.decode(params, data);
    };
    Interface2.prototype._encodeParams = function(params, values) {
      return this._abiCoder.encode(params, values);
    };
    Interface2.prototype.encodeDeploy = function(values) {
      return this._encodeParams(this.deploy.inputs, values || []);
    };
    Interface2.prototype.decodeErrorResult = function(fragment, data) {
      if (typeof fragment === "string") {
        fragment = this.getError(fragment);
      }
      var bytes = (0, bytes_1.arrayify)(data);
      if ((0, bytes_1.hexlify)(bytes.slice(0, 4)) !== this.getSighash(fragment)) {
        logger.throwArgumentError("data signature does not match error " + fragment.name + ".", "data", (0, bytes_1.hexlify)(bytes));
      }
      return this._decodeParams(fragment.inputs, bytes.slice(4));
    };
    Interface2.prototype.encodeErrorResult = function(fragment, values) {
      if (typeof fragment === "string") {
        fragment = this.getError(fragment);
      }
      return (0, bytes_1.hexlify)((0, bytes_1.concat)([
        this.getSighash(fragment),
        this._encodeParams(fragment.inputs, values || [])
      ]));
    };
    Interface2.prototype.decodeFunctionData = function(functionFragment, data) {
      if (typeof functionFragment === "string") {
        functionFragment = this.getFunction(functionFragment);
      }
      var bytes = (0, bytes_1.arrayify)(data);
      if ((0, bytes_1.hexlify)(bytes.slice(0, 4)) !== this.getSighash(functionFragment)) {
        logger.throwArgumentError("data signature does not match function " + functionFragment.name + ".", "data", (0, bytes_1.hexlify)(bytes));
      }
      return this._decodeParams(functionFragment.inputs, bytes.slice(4));
    };
    Interface2.prototype.encodeFunctionData = function(functionFragment, values) {
      if (typeof functionFragment === "string") {
        functionFragment = this.getFunction(functionFragment);
      }
      return (0, bytes_1.hexlify)((0, bytes_1.concat)([
        this.getSighash(functionFragment),
        this._encodeParams(functionFragment.inputs, values || [])
      ]));
    };
    Interface2.prototype.decodeFunctionResult = function(functionFragment, data) {
      if (typeof functionFragment === "string") {
        functionFragment = this.getFunction(functionFragment);
      }
      var bytes = (0, bytes_1.arrayify)(data);
      var reason = null;
      var message = "";
      var errorArgs = null;
      var errorName = null;
      var errorSignature = null;
      switch (bytes.length % this._abiCoder._getWordSize()) {
        case 0:
          try {
            return this._abiCoder.decode(functionFragment.outputs, bytes);
          } catch (error2) {
          }
          break;
        case 4: {
          var selector = (0, bytes_1.hexlify)(bytes.slice(0, 4));
          var builtin = BuiltinErrors[selector];
          if (builtin) {
            errorArgs = this._abiCoder.decode(builtin.inputs, bytes.slice(4));
            errorName = builtin.name;
            errorSignature = builtin.signature;
            if (builtin.reason) {
              reason = errorArgs[0];
            }
            if (errorName === "Error") {
              message = "; VM Exception while processing transaction: reverted with reason string " + JSON.stringify(errorArgs[0]);
            } else if (errorName === "Panic") {
              message = "; VM Exception while processing transaction: reverted with panic code " + errorArgs[0];
            }
          } else {
            try {
              var error = this.getError(selector);
              errorArgs = this._abiCoder.decode(error.inputs, bytes.slice(4));
              errorName = error.name;
              errorSignature = error.format();
            } catch (error2) {
            }
          }
          break;
        }
      }
      return logger.throwError("call revert exception" + message, logger_1.Logger.errors.CALL_EXCEPTION, {
        method: functionFragment.format(),
        data: (0, bytes_1.hexlify)(data),
        errorArgs,
        errorName,
        errorSignature,
        reason
      });
    };
    Interface2.prototype.encodeFunctionResult = function(functionFragment, values) {
      if (typeof functionFragment === "string") {
        functionFragment = this.getFunction(functionFragment);
      }
      return (0, bytes_1.hexlify)(this._abiCoder.encode(functionFragment.outputs, values || []));
    };
    Interface2.prototype.encodeFilterTopics = function(eventFragment, values) {
      var _this = this;
      if (typeof eventFragment === "string") {
        eventFragment = this.getEvent(eventFragment);
      }
      if (values.length > eventFragment.inputs.length) {
        logger.throwError("too many arguments for " + eventFragment.format(), logger_1.Logger.errors.UNEXPECTED_ARGUMENT, {
          argument: "values",
          value: values
        });
      }
      var topics = [];
      if (!eventFragment.anonymous) {
        topics.push(this.getEventTopic(eventFragment));
      }
      var encodeTopic = function(param, value) {
        if (param.type === "string") {
          return (0, hash_1.id)(value);
        } else if (param.type === "bytes") {
          return (0, keccak256_1.keccak256)((0, bytes_1.hexlify)(value));
        }
        if (param.type === "bool" && typeof value === "boolean") {
          value = value ? "0x01" : "0x00";
        }
        if (param.type.match(/^u?int/)) {
          value = bignumber_1.BigNumber.from(value).toHexString();
        }
        if (param.type === "address") {
          _this._abiCoder.encode(["address"], [value]);
        }
        return (0, bytes_1.hexZeroPad)((0, bytes_1.hexlify)(value), 32);
      };
      values.forEach(function(value, index) {
        var param = eventFragment.inputs[index];
        if (!param.indexed) {
          if (value != null) {
            logger.throwArgumentError("cannot filter non-indexed parameters; must be null", "contract." + param.name, value);
          }
          return;
        }
        if (value == null) {
          topics.push(null);
        } else if (param.baseType === "array" || param.baseType === "tuple") {
          logger.throwArgumentError("filtering with tuples or arrays not supported", "contract." + param.name, value);
        } else if (Array.isArray(value)) {
          topics.push(value.map(function(value2) {
            return encodeTopic(param, value2);
          }));
        } else {
          topics.push(encodeTopic(param, value));
        }
      });
      while (topics.length && topics[topics.length - 1] === null) {
        topics.pop();
      }
      return topics;
    };
    Interface2.prototype.encodeEventLog = function(eventFragment, values) {
      var _this = this;
      if (typeof eventFragment === "string") {
        eventFragment = this.getEvent(eventFragment);
      }
      var topics = [];
      var dataTypes = [];
      var dataValues = [];
      if (!eventFragment.anonymous) {
        topics.push(this.getEventTopic(eventFragment));
      }
      if (values.length !== eventFragment.inputs.length) {
        logger.throwArgumentError("event arguments/values mismatch", "values", values);
      }
      eventFragment.inputs.forEach(function(param, index) {
        var value = values[index];
        if (param.indexed) {
          if (param.type === "string") {
            topics.push((0, hash_1.id)(value));
          } else if (param.type === "bytes") {
            topics.push((0, keccak256_1.keccak256)(value));
          } else if (param.baseType === "tuple" || param.baseType === "array") {
            throw new Error("not implemented");
          } else {
            topics.push(_this._abiCoder.encode([param.type], [value]));
          }
        } else {
          dataTypes.push(param);
          dataValues.push(value);
        }
      });
      return {
        data: this._abiCoder.encode(dataTypes, dataValues),
        topics
      };
    };
    Interface2.prototype.decodeEventLog = function(eventFragment, data, topics) {
      if (typeof eventFragment === "string") {
        eventFragment = this.getEvent(eventFragment);
      }
      if (topics != null && !eventFragment.anonymous) {
        var topicHash = this.getEventTopic(eventFragment);
        if (!(0, bytes_1.isHexString)(topics[0], 32) || topics[0].toLowerCase() !== topicHash) {
          logger.throwError("fragment/topic mismatch", logger_1.Logger.errors.INVALID_ARGUMENT, { argument: "topics[0]", expected: topicHash, value: topics[0] });
        }
        topics = topics.slice(1);
      }
      var indexed = [];
      var nonIndexed = [];
      var dynamic = [];
      eventFragment.inputs.forEach(function(param, index) {
        if (param.indexed) {
          if (param.type === "string" || param.type === "bytes" || param.baseType === "tuple" || param.baseType === "array") {
            indexed.push(fragments_1.ParamType.fromObject({ type: "bytes32", name: param.name }));
            dynamic.push(true);
          } else {
            indexed.push(param);
            dynamic.push(false);
          }
        } else {
          nonIndexed.push(param);
          dynamic.push(false);
        }
      });
      var resultIndexed = topics != null ? this._abiCoder.decode(indexed, (0, bytes_1.concat)(topics)) : null;
      var resultNonIndexed = this._abiCoder.decode(nonIndexed, data, true);
      var result = [];
      var nonIndexedIndex = 0, indexedIndex = 0;
      eventFragment.inputs.forEach(function(param, index) {
        if (param.indexed) {
          if (resultIndexed == null) {
            result[index] = new Indexed({ _isIndexed: true, hash: null });
          } else if (dynamic[index]) {
            result[index] = new Indexed({ _isIndexed: true, hash: resultIndexed[indexedIndex++] });
          } else {
            try {
              result[index] = resultIndexed[indexedIndex++];
            } catch (error) {
              result[index] = error;
            }
          }
        } else {
          try {
            result[index] = resultNonIndexed[nonIndexedIndex++];
          } catch (error) {
            result[index] = error;
          }
        }
        if (param.name && result[param.name] == null) {
          var value_1 = result[index];
          if (value_1 instanceof Error) {
            Object.defineProperty(result, param.name, {
              enumerable: true,
              get: function() {
                throw wrapAccessError("property " + JSON.stringify(param.name), value_1);
              }
            });
          } else {
            result[param.name] = value_1;
          }
        }
      });
      var _loop_1 = function(i2) {
        var value = result[i2];
        if (value instanceof Error) {
          Object.defineProperty(result, i2, {
            enumerable: true,
            get: function() {
              throw wrapAccessError("index " + i2, value);
            }
          });
        }
      };
      for (var i = 0;i < result.length; i++) {
        _loop_1(i);
      }
      return Object.freeze(result);
    };
    Interface2.prototype.parseTransaction = function(tx) {
      var fragment = this.getFunction(tx.data.substring(0, 10).toLowerCase());
      if (!fragment) {
        return null;
      }
      return new TransactionDescription({
        args: this._abiCoder.decode(fragment.inputs, "0x" + tx.data.substring(10)),
        functionFragment: fragment,
        name: fragment.name,
        signature: fragment.format(),
        sighash: this.getSighash(fragment),
        value: bignumber_1.BigNumber.from(tx.value || "0")
      });
    };
    Interface2.prototype.parseLog = function(log) {
      var fragment = this.getEvent(log.topics[0]);
      if (!fragment || fragment.anonymous) {
        return null;
      }
      return new LogDescription({
        eventFragment: fragment,
        name: fragment.name,
        signature: fragment.format(),
        topic: this.getEventTopic(fragment),
        args: this.decodeEventLog(fragment, log.data, log.topics)
      });
    };
    Interface2.prototype.parseError = function(data) {
      var hexData = (0, bytes_1.hexlify)(data);
      var fragment = this.getError(hexData.substring(0, 10).toLowerCase());
      if (!fragment) {
        return null;
      }
      return new ErrorDescription({
        args: this._abiCoder.decode(fragment.inputs, "0x" + hexData.substring(10)),
        errorFragment: fragment,
        name: fragment.name,
        signature: fragment.format(),
        sighash: this.getSighash(fragment)
      });
    };
    Interface2.isInterface = function(value) {
      return !!(value && value._isInterface);
    };
    return Interface2;
  }();
  exports.Interface = Interface;
});

// node_modules/@ethersproject/abi/lib/index.js
var require_lib13 = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.TransactionDescription = exports.LogDescription = exports.checkResultErrors = exports.Indexed = exports.Interface = exports.defaultAbiCoder = exports.AbiCoder = exports.FormatTypes = exports.ParamType = exports.FunctionFragment = exports.Fragment = exports.EventFragment = exports.ErrorFragment = exports.ConstructorFragment = undefined;
  var fragments_1 = require_fragments();
  Object.defineProperty(exports, "ConstructorFragment", { enumerable: true, get: function() {
    return fragments_1.ConstructorFragment;
  } });
  Object.defineProperty(exports, "ErrorFragment", { enumerable: true, get: function() {
    return fragments_1.ErrorFragment;
  } });
  Object.defineProperty(exports, "EventFragment", { enumerable: true, get: function() {
    return fragments_1.EventFragment;
  } });
  Object.defineProperty(exports, "FormatTypes", { enumerable: true, get: function() {
    return fragments_1.FormatTypes;
  } });
  Object.defineProperty(exports, "Fragment", { enumerable: true, get: function() {
    return fragments_1.Fragment;
  } });
  Object.defineProperty(exports, "FunctionFragment", { enumerable: true, get: function() {
    return fragments_1.FunctionFragment;
  } });
  Object.defineProperty(exports, "ParamType", { enumerable: true, get: function() {
    return fragments_1.ParamType;
  } });
  var abi_coder_1 = require_abi_coder();
  Object.defineProperty(exports, "AbiCoder", { enumerable: true, get: function() {
    return abi_coder_1.AbiCoder;
  } });
  Object.defineProperty(exports, "defaultAbiCoder", { enumerable: true, get: function() {
    return abi_coder_1.defaultAbiCoder;
  } });
  var interface_1 = require_interface();
  Object.defineProperty(exports, "checkResultErrors", { enumerable: true, get: function() {
    return interface_1.checkResultErrors;
  } });
  Object.defineProperty(exports, "Indexed", { enumerable: true, get: function() {
    return interface_1.Indexed;
  } });
  Object.defineProperty(exports, "Interface", { enumerable: true, get: function() {
    return interface_1.Interface;
  } });
  Object.defineProperty(exports, "LogDescription", { enumerable: true, get: function() {
    return interface_1.LogDescription;
  } });
  Object.defineProperty(exports, "TransactionDescription", { enumerable: true, get: function() {
    return interface_1.TransactionDescription;
  } });
});

// node_modules/@openzeppelin/merkle-tree/dist/bytes.js
var require_bytes2 = __commonJS((exports) => {
  var compareBytes = function(a, b2) {
    const n = Math.min(a.length, b2.length);
    for (let i = 0;i < n; i++) {
      if (a[i] !== b2[i]) {
        return a[i] - b2[i];
      }
    }
    return a.length - b2.length;
  };
  var hex = function(b2) {
    return "0x" + (0, utils_1.bytesToHex)(b2);
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.hex = exports.compareBytes = undefined;
  var utils_1 = require_utils2();
  exports.compareBytes = compareBytes;
  exports.hex = hex;
});

// node_modules/@openzeppelin/merkle-tree/dist/utils/throw-error.js
var require_throw_error = __commonJS((exports) => {
  var throwError = function(message) {
    throw new Error(message);
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.throwError = undefined;
  exports.throwError = throwError;
});

// node_modules/@openzeppelin/merkle-tree/dist/core.js
var require_core = __commonJS((exports) => {
  var makeMerkleTree = function(leaves) {
    leaves.forEach(checkValidMerkleNode);
    if (leaves.length === 0) {
      throw new Error("Expected non-zero number of leaves");
    }
    const tree = new Array(2 * leaves.length - 1);
    for (const [i, leaf] of leaves.entries()) {
      tree[tree.length - 1 - i] = leaf;
    }
    for (let i = tree.length - 1 - leaves.length;i >= 0; i--) {
      tree[i] = hashPair(tree[leftChildIndex(i)], tree[rightChildIndex(i)]);
    }
    return tree;
  };
  var getProof = function(tree, index) {
    checkLeafNode(tree, index);
    const proof = [];
    while (index > 0) {
      proof.push(tree[siblingIndex(index)]);
      index = parentIndex(index);
    }
    return proof;
  };
  var processProof = function(leaf, proof) {
    checkValidMerkleNode(leaf);
    proof.forEach(checkValidMerkleNode);
    return proof.reduce(hashPair, leaf);
  };
  var getMultiProof = function(tree, indices) {
    indices.forEach((i) => checkLeafNode(tree, i));
    indices.sort((a, b2) => b2 - a);
    if (indices.slice(1).some((i, p) => i === indices[p])) {
      throw new Error("Cannot prove duplicated index");
    }
    const stack = indices.concat();
    const proof = [];
    const proofFlags = [];
    while (stack.length > 0 && stack[0] > 0) {
      const j = stack.shift();
      const s = siblingIndex(j);
      const p = parentIndex(j);
      if (s === stack[0]) {
        proofFlags.push(true);
        stack.shift();
      } else {
        proofFlags.push(false);
        proof.push(tree[s]);
      }
      stack.push(p);
    }
    if (indices.length === 0) {
      proof.push(tree[0]);
    }
    return {
      leaves: indices.map((i) => tree[i]),
      proof,
      proofFlags
    };
  };
  var processMultiProof = function(multiproof) {
    multiproof.leaves.forEach(checkValidMerkleNode);
    multiproof.proof.forEach(checkValidMerkleNode);
    if (multiproof.proof.length < multiproof.proofFlags.filter((b2) => !b2).length) {
      throw new Error("Invalid multiproof format");
    }
    if (multiproof.leaves.length + multiproof.proof.length !== multiproof.proofFlags.length + 1) {
      throw new Error("Provided leaves and multiproof are not compatible");
    }
    const stack = multiproof.leaves.concat();
    const proof = multiproof.proof.concat();
    for (const flag of multiproof.proofFlags) {
      const a = stack.shift();
      const b2 = flag ? stack.shift() : proof.shift();
      if (a === undefined || b2 === undefined) {
        throw new Error("Broken invariant");
      }
      stack.push(hashPair(a, b2));
    }
    if (stack.length + proof.length !== 1) {
      throw new Error("Broken invariant");
    }
    return stack.pop() ?? proof.shift();
  };
  var isValidMerkleTree = function(tree) {
    for (const [i, node] of tree.entries()) {
      if (!isValidMerkleNode(node)) {
        return false;
      }
      const l = leftChildIndex(i);
      const r = rightChildIndex(i);
      if (r >= tree.length) {
        if (l < tree.length) {
          return false;
        }
      } else if (!(0, utils_1.equalsBytes)(node, hashPair(tree[l], tree[r]))) {
        return false;
      }
    }
    return tree.length > 0;
  };
  var renderMerkleTree = function(tree) {
    if (tree.length === 0) {
      throw new Error("Expected non-zero number of nodes");
    }
    const stack = [[0, []]];
    const lines = [];
    while (stack.length > 0) {
      const [i, path] = stack.pop();
      lines.push(path.slice(0, -1).map((p) => ["   ", "\u2502  "][p]).join("") + path.slice(-1).map((p) => ["\u2514\u2500 ", "\u251C\u2500 "][p]).join("") + i + ") " + (0, utils_1.bytesToHex)(tree[i]));
      if (rightChildIndex(i) < tree.length) {
        stack.push([rightChildIndex(i), path.concat(0)]);
        stack.push([leftChildIndex(i), path.concat(1)]);
      }
    }
    return lines.join("\n");
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.renderMerkleTree = exports.isValidMerkleTree = exports.processMultiProof = exports.getMultiProof = exports.processProof = exports.getProof = exports.makeMerkleTree = undefined;
  var keccak_1 = require_keccak();
  var utils_1 = require_utils2();
  var bytes_1 = require_bytes2();
  var throw_error_1 = require_throw_error();
  var hashPair = (a, b2) => (0, keccak_1.keccak256)((0, utils_1.concatBytes)(...[a, b2].sort(bytes_1.compareBytes)));
  var leftChildIndex = (i) => 2 * i + 1;
  var rightChildIndex = (i) => 2 * i + 2;
  var parentIndex = (i) => i > 0 ? Math.floor((i - 1) / 2) : (0, throw_error_1.throwError)("Root has no parent");
  var siblingIndex = (i) => i > 0 ? i - (-1) ** (i % 2) : (0, throw_error_1.throwError)("Root has no siblings");
  var isTreeNode = (tree, i) => i >= 0 && i < tree.length;
  var isInternalNode = (tree, i) => isTreeNode(tree, leftChildIndex(i));
  var isLeafNode = (tree, i) => isTreeNode(tree, i) && !isInternalNode(tree, i);
  var isValidMerkleNode = (node) => node instanceof Uint8Array && node.length === 32;
  var checkLeafNode = (tree, i) => void (isLeafNode(tree, i) || (0, throw_error_1.throwError)("Index is not a leaf"));
  var checkValidMerkleNode = (node) => void (isValidMerkleNode(node) || (0, throw_error_1.throwError)("Merkle tree nodes must be Uint8Array of length 32"));
  exports.makeMerkleTree = makeMerkleTree;
  exports.getProof = getProof;
  exports.processProof = processProof;
  exports.getMultiProof = getMultiProof;
  exports.processMultiProof = processMultiProof;
  exports.isValidMerkleTree = isValidMerkleTree;
  exports.renderMerkleTree = renderMerkleTree;
});

// node_modules/@openzeppelin/merkle-tree/dist/utils/check-bounds.js
var require_check_bounds = __commonJS((exports) => {
  var checkBounds = function(array, index) {
    if (index < 0 || index >= array.length) {
      throw new Error("Index out of bounds");
    }
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.checkBounds = undefined;
  exports.checkBounds = checkBounds;
});

// node_modules/@openzeppelin/merkle-tree/dist/standard.js
var require_standard = __commonJS((exports) => {
  var standardLeafHash = function(value, types) {
    return (0, keccak_1.keccak256)((0, keccak_1.keccak256)((0, utils_1.hexToBytes)(abi_1.defaultAbiCoder.encode(types, value))));
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.StandardMerkleTree = undefined;
  var keccak_1 = require_keccak();
  var utils_1 = require_utils2();
  var abi_1 = require_lib13();
  var bytes_1 = require_bytes2();
  var core_1 = require_core();
  var check_bounds_1 = require_check_bounds();
  var throw_error_1 = require_throw_error();

  class StandardMerkleTree {
    constructor(tree, values, leafEncoding) {
      this.tree = tree;
      this.values = values;
      this.leafEncoding = leafEncoding;
      this.hashLookup = Object.fromEntries(values.map(({ value }, valueIndex) => [
        (0, bytes_1.hex)(standardLeafHash(value, leafEncoding)),
        valueIndex
      ]));
    }
    static of(values, leafEncoding) {
      const hashedValues = values.map((value, valueIndex) => ({ value, valueIndex, hash: standardLeafHash(value, leafEncoding) })).sort((a, b2) => (0, bytes_1.compareBytes)(a.hash, b2.hash));
      const tree = (0, core_1.makeMerkleTree)(hashedValues.map((v2) => v2.hash));
      const indexedValues = values.map((value) => ({ value, treeIndex: 0 }));
      for (const [leafIndex, { valueIndex }] of hashedValues.entries()) {
        indexedValues[valueIndex].treeIndex = tree.length - leafIndex - 1;
      }
      return new StandardMerkleTree(tree, indexedValues, leafEncoding);
    }
    static load(data) {
      if (data.format !== "standard-v1") {
        throw new Error(`Unknown format '${data.format}'`);
      }
      return new StandardMerkleTree(data.tree.map(utils_1.hexToBytes), data.values, data.leafEncoding);
    }
    static verify(root, leafEncoding, leaf, proof) {
      const impliedRoot = (0, core_1.processProof)(standardLeafHash(leaf, leafEncoding), proof.map(utils_1.hexToBytes));
      return (0, utils_1.equalsBytes)(impliedRoot, (0, utils_1.hexToBytes)(root));
    }
    static verifyMultiProof(root, leafEncoding, multiproof) {
      const leafHashes = multiproof.leaves.map((leaf) => standardLeafHash(leaf, leafEncoding));
      const proofBytes = multiproof.proof.map(utils_1.hexToBytes);
      const impliedRoot = (0, core_1.processMultiProof)({
        leaves: leafHashes,
        proof: proofBytes,
        proofFlags: multiproof.proofFlags
      });
      return (0, utils_1.equalsBytes)(impliedRoot, (0, utils_1.hexToBytes)(root));
    }
    dump() {
      return {
        format: "standard-v1",
        tree: this.tree.map(bytes_1.hex),
        values: this.values,
        leafEncoding: this.leafEncoding
      };
    }
    render() {
      return (0, core_1.renderMerkleTree)(this.tree);
    }
    get root() {
      return (0, bytes_1.hex)(this.tree[0]);
    }
    *entries() {
      for (const [i, { value }] of this.values.entries()) {
        yield [i, value];
      }
    }
    validate() {
      for (let i = 0;i < this.values.length; i++) {
        this.validateValue(i);
      }
      if (!(0, core_1.isValidMerkleTree)(this.tree)) {
        throw new Error("Merkle tree is invalid");
      }
    }
    leafHash(leaf) {
      return (0, bytes_1.hex)(standardLeafHash(leaf, this.leafEncoding));
    }
    leafLookup(leaf) {
      return this.hashLookup[this.leafHash(leaf)] ?? (0, throw_error_1.throwError)("Leaf is not in tree");
    }
    getProof(leaf) {
      const valueIndex = typeof leaf === "number" ? leaf : this.leafLookup(leaf);
      this.validateValue(valueIndex);
      const { treeIndex } = this.values[valueIndex];
      const proof = (0, core_1.getProof)(this.tree, treeIndex);
      if (!this._verify(this.tree[treeIndex], proof)) {
        throw new Error("Unable to prove value");
      }
      return proof.map(bytes_1.hex);
    }
    getMultiProof(leaves) {
      const valueIndices = leaves.map((leaf) => typeof leaf === "number" ? leaf : this.leafLookup(leaf));
      for (const valueIndex of valueIndices)
        this.validateValue(valueIndex);
      const indices = valueIndices.map((i) => this.values[i].treeIndex);
      const proof = (0, core_1.getMultiProof)(this.tree, indices);
      if (!this._verifyMultiProof(proof)) {
        throw new Error("Unable to prove values");
      }
      return {
        leaves: proof.leaves.map((hash) => this.values[this.hashLookup[(0, bytes_1.hex)(hash)]].value),
        proof: proof.proof.map(bytes_1.hex),
        proofFlags: proof.proofFlags
      };
    }
    verify(leaf, proof) {
      return this._verify(this.getLeafHash(leaf), proof.map(utils_1.hexToBytes));
    }
    _verify(leafHash, proof) {
      const impliedRoot = (0, core_1.processProof)(leafHash, proof);
      return (0, utils_1.equalsBytes)(impliedRoot, this.tree[0]);
    }
    verifyMultiProof(multiproof) {
      return this._verifyMultiProof({
        leaves: multiproof.leaves.map((l) => this.getLeafHash(l)),
        proof: multiproof.proof.map(utils_1.hexToBytes),
        proofFlags: multiproof.proofFlags
      });
    }
    _verifyMultiProof(multiproof) {
      const impliedRoot = (0, core_1.processMultiProof)(multiproof);
      return (0, utils_1.equalsBytes)(impliedRoot, this.tree[0]);
    }
    validateValue(valueIndex) {
      (0, check_bounds_1.checkBounds)(this.values, valueIndex);
      const { value, treeIndex } = this.values[valueIndex];
      (0, check_bounds_1.checkBounds)(this.tree, treeIndex);
      const leaf = standardLeafHash(value, this.leafEncoding);
      if (!(0, utils_1.equalsBytes)(leaf, this.tree[treeIndex])) {
        throw new Error("Merkle tree does not contain the expected value");
      }
      return leaf;
    }
    getLeafHash(leaf) {
      if (typeof leaf === "number") {
        return this.validateValue(leaf);
      } else {
        return standardLeafHash(leaf, this.leafEncoding);
      }
    }
  }
  exports.StandardMerkleTree = StandardMerkleTree;
});

// node_modules/@openzeppelin/merkle-tree/dist/index.js
var require_dist = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.StandardMerkleTree = undefined;
  var standard_1 = require_standard();
  Object.defineProperty(exports, "StandardMerkleTree", { enumerable: true, get: function() {
    return standard_1.StandardMerkleTree;
  } });
});

// bun/uiModules/merkleBuilder.js
var merkle_tree = __toESM(require_dist(), 1);
async function main() {
  let startTimeGlobal = Date.now();
  const rpcProviderUrl = Bun.argv[2];
  const outpurDir = Bun.argv[3];
  const csvInput = Bun.argv[4];
  const provider = await new ethers.providers.JsonRpcProvider(`${rpcProviderUrl}`);
  const balances = [
    ["0xF62849F9A0B5Bf2913b396098F7c7019b51A820a", "1", "1000000000000000000"],
    ["0xF62849F9A0B5Bf2913b396098F7c7019b51A820a", "2", "2000000000000000000"],
    ["0xF62849F9A0B5Bf2913b396098F7c7019b51A820a", "3", "4000000000000000000"],
    ["0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9", "3", "5000000000000000000"],
    ["0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9", "5", "6000000000000000000"],
    ["0xF62849F9A0B5Bf2913b396098F7c7019b51A820a", "12169697774812703230153278869778437256039855339638969837407632192044393630491", "1000000000000000000000000000"],
    ["0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9", "12169697774812703230153278869778437256039855339638969837407632192044393630491", "10000000000000000000000000000000000000000000000000000000000000000000000000000"]
  ];
  let m = new MerkleBuilder(balances, provider);
  ;
  const multiProof = m.getMultiProof({ "0xF62849F9A0B5Bf2913b396098F7c7019b51A820a": ["2", "3"], "0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9": ["3", "5"] });
  console.log(multiProof);
  const singleProof = m.getProof("0xF62849F9A0B5Bf2913b396098F7c7019b51A820a", "1");
  console.log("---single proof----");
  console.log(await singleProof);
  console.log("---all proof----");
  await m.getAllProofs();
  await m.exportAllProofs(`${outpurDir}/allProofs-test.json`, 2);
  let m2 = new MerkleBuilder([], provider);
  await m2.importBalancesCsvFromFile(csvInput);
  await m2.buildTree();
  console.log(m2.merkleRoot);
  let startTimeProofTime = Date.now();
  console.log("getting singleProof");
  console.log(await m2.getProof("0x3Fc3a022EB15352D3f5E4e6D6f02BBfC57D9C159", "3"));
  let timeTakenProof = Date.now() - startTimeProofTime;
  console.log("getting 1 proof took: " + timeTakenProof + " milliseconds");
  await m2.exportTree(`${outpurDir}/tree-dump-big.json`, 0);
  await m2.exportBalancesCsv(`${outpurDir}/balances-output-big.csv`);
  console.log("getting all proofs");
  await m2.exportAllProofs(`${outpurDir}/allProofs-test-big.json`, 2);
  let timeTaken = Date.now() - startTimeGlobal;
  console.log("script ran for: " + timeTaken + " milliseconds");
}

export class MerkleBuilder {
  balances = [];
  dataTypes = [];
  allProofs = {};
  allContractAddrs = new Set;
  merkleRoot = "";
  ipfsForExports = false;
  tree;
  provider;
  constructor(balances = [], provider, dataTypes = ["address", "uint256", "uint256"], ipfsForExports = false) {
    this.provider = provider;
    this.ipfsForExports = ipfsForExports;
    this.dataTypes = dataTypes;
    this.balances = balances;
    this.allContractAddrs = new Set([...this.balances.map((x) => x[0])]);
    if (balances.length) {
      this.buildTree();
      this.merkleRoot = this.tree.root;
    }
  }
  formatAddressInBalances(balances) {
    return balances.map((x) => [
      ethers.utils.getAddress(x[0]),
      x[1],
      x[2]
    ]);
  }
  buildTree(balances = this.balances, dataTypes = this.dataTypes) {
    this.balances = this.formatAddressInBalances(balances);
    console.log("building Tree");
    this.tree = merkle_tree.StandardMerkleTree.of(balances, dataTypes);
    console.log("done building Tree");
    return this.tree;
  }
  getTreeIndex(nftAddress = "", id = "") {
    return this.tree.values.findIndex((x) => x.value[0] === nftAddress && x.value[1] === id);
  }
  getTreeIndexes(idsPerNftAddr = {}) {
    const idsPerNftAddrAsArr = Object.keys(idsPerNftAddr).map((x) => idsPerNftAddr[x].map((y) => [x, y])).flat();
    let indexes = [];
    for (const i in this.tree.values) {
      const value = this.tree.values[i].value;
      const vAddr = value[0];
      const vId = value[1];
      if (idsPerNftAddrAsArr.find((x) => x[0] === vAddr && x[1] === vId)) {
        indexes.push(parseInt(i));
      }
    }
    return indexes;
  }
  getMultiProof(idsPerNftAddr) {
    return this.tree.getMultiProof(this.getTreeIndexes(idsPerNftAddr));
  }
  delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  getProof(nftAddr, id) {
    if (typeof id === "number") {
      throw Error("Id was set as a number. Javascript numbers are unsafe to be used for uint256 values");
    }
    const index = this.getTreeIndex(nftAddr, id);
    if (index !== -1) {
      return {
        ["nftAddress"]: nftAddr,
        ["id"]: id,
        ["amount"]: this.tree.values[index].value[2],
        ["treeIndex"]: this.tree.values[index].treeIndex,
        ["index"]: index,
        ["proof"]: this.tree.getProof(index)
      };
    } else {
      console.warn(`value not in merkle tree. Searched for nft address: ${nftAddr} and id ${id}`);
      return;
    }
  }
  getProofsInChunk(chunkedBalances) {
    let proofs = []
    for (const i in chunkedBalances) {
      proofs.push(this.getProof(chunkedBalances[i][0], chunkedBalances[i][1]))
      }
    const message = `processed proofs till id: ${chunkedBalances[chunkedBalances.length-1][1]} of nft ${chunkedBalances[chunkedBalances.length-1][0]}`
    //console.log(message)
    document.getElementById("progressProofGen").innerText = message
    return proofs 
  }

  async getAllProofsInChunks(chunkSize=100) {
    let proofs = { ["nftAddresses"]: [...this.allContractAddrs], ["proofPerAddress"]: {} };
    let proofChunks=[]
    for (let i = 0; i < this.balances.length; i += chunkSize) {
        const chunk = this.balances.slice(i, i + chunkSize);
        const poofsChunk = new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(this.getProofsInChunk(chunk));
          },1);
        });
        
        proofChunks.push(poofsChunk)
    }
    proofChunks = (await Promise.all(proofChunks)).flat()

    for (const item of proofChunks) {
      if (item.nftAddress in proofs["proofPerAddress"]) {
        proofs["proofPerAddress"][item.nftAddress]["ids"][item.id] = { ["amount"]: item.amount, ["treeIndex"]: item.treeIndex, ["index"]: item.index, ["proof"]: item.proof };
      } else {
        //proofs["proofPerAddress"][item.nftAddress] = { ["ids"]: [] };
        proofs["proofPerAddress"][item.nftAddress]= {["ids"]:{[item.id]:{["amount"]: item.amount, ["treeIndex"]: item.treeIndex, ["index"]: item.index, ["proof"]: item.proof}}}
      }
    }
    
    this.allProofs = proofs
    return proofs;
  }

  importBalancesCsv(csvString) {
    let csvArr = Papa.parse(csvString).data;
    this.balances = this.formatAddressInBalances(csvArr.map((line) => line.slice(1, 4)));
    this.allContractAddrs = new Set([...this.balances.map((x) => x[0])]);
    console.log(`imported ${this.balances.length} entries`);
  }
  async importBalancesCsvFromFile(url) {
    let file;
    let csvString;
    if (Bun) {
      url = `${import.meta.url}${url}`;
      console.log(`reading file ${url} with Bun.file()`);
      file = Bun.file(new URL(url));
      csvString = await file.text();
    } else {
      console.warn("didnt import file todo implement");
    }
    this.importBalancesCsv(csvString);
  }
  exportMultiProofSolidity(filePath = "") {
  }
  exportSingleProofSolidity(filePath = "") {
  }
  async exportBalancesCsv(fileDest="",justString=false) {
    const abi = [
      {
        inputs: [],
        name: "name",
        outputs: [
          {
            internalType: "string",
            name: "",
            type: "string"
          }
        ],
        stateMutability: "view",
        type: "function"
      }
    ];
    let addrToNameMap = {};
    for (const addr of this.allContractAddrs) {
      const constractObj = new ethers.Contract(addr, abi, this.provider);
      console.log(addr)
      addrToNameMap[addr] = await constractObj.name();
    }
    const balancesWithNftName = this.balances.map((x) => [...x,addrToNameMap[ethers.utils.getAddress(x[0])]]);
    const csvString = Papa.unparse(balancesWithNftName)
    if(justString) {return csvString}
    this.exportObjAsFile(csvString, fileDest);
  }
  async exportTree(dest, prettyPrint = 0) {
    await this.exportObjAsFile(this.tree.dump(), dest, prettyPrint);
  }
  async exportAllProofs(dest, prettyPrint = 0) {
    if (!this.allProofs.length) {
      await this.getAllProofs();
    }
    await this.exportObjAsFile(this.allProofs, dest, prettyPrint);
  }
  async exportObjAsFile(obj, url, prettyPrint = 0) {
    if (typeof obj !== "string") {
      obj = JSON.stringify(obj, null, prettyPrint);
    }
    if (Bun) {
      url = `${import.meta.url}/../${url}`;
      console.log(`writing file ${url} with Bun.write()`);
      Bun.write(new URL(url), obj);
    } else {
      console.warn("didnt export file todo implement");
    }
  }
  getIdsPerCollection() {
    let idsPerCollection = {}
    for (const balance of this.balances) {
      const addr =balance[0]
      const id =balance[1]
      const amount = balance[2]
      if (addr in idsPerCollection) {
        idsPerCollection[addr][id] = amount
      } else {
        idsPerCollection[addr] = {[id]:amount}
      }
    }
    return idsPerCollection
  }

}
main();

