// This is an exact copy of the file `packages/aws-cdk/lib/logging.ts` from 2024-11-29
// https://github.com/aws/aws-cdk/blob/81cde0e2e1f83f80273d14724d5518cc20dc5a80/packages/aws-cdk/lib/logging.ts
// After this we started refactoring the file and functionality changed significantly.
// In order to preserver backwards-compatibly for users with unsanctioned usage of this file,
// we keep a copy of the original version around.
// See https://github.com/aws/aws-cdk/pull/33021 for more information.

import type { Writable } from 'stream';
import * as util from 'util';
import * as chalk from 'chalk';

type StyleFn = (str: string) => string;
const { stdout, stderr } = process;

type WritableFactory = () => Writable;

/**
 * @deprecated
 */
export async function withCorkedLogging<A>(block: () => Promise<A>): Promise<A> {
  corkLogging();
  try {
    return await block();
  } finally {
    uncorkLogging();
  }
}

let CORK_COUNTER = 0;
const logBuffer: [Writable, string][] = [];

function corked() {
  return CORK_COUNTER !== 0;
}

function corkLogging() {
  CORK_COUNTER += 1;
}

function uncorkLogging() {
  CORK_COUNTER -= 1;
  if (!corked()) {
    logBuffer.forEach(([stream, str]) => stream.write(str + '\n'));
    logBuffer.splice(0);
  }
}

const logger = (stream: Writable | WritableFactory, styles?: StyleFn[], timestamp?: boolean) => (fmt: string, ...args: unknown[]) => {
  const ts = timestamp ? `[${formatTime(new Date())}] ` : '';

  let str = ts + util.format(fmt, ...args);
  if (styles && styles.length) {
    str = styles.reduce((a, style) => style(a), str);
  }

  const realStream = typeof stream === 'function' ? stream() : stream;

  // Logger is currently corked, so we store the message to be printed
  // later when we are uncorked.
  if (corked()) {
    logBuffer.push([realStream, str]);
    return;
  }

  realStream.write(str + '\n');
};

function formatTime(d: Date) {
  return `${lpad(d.getHours(), 2)}:${lpad(d.getMinutes(), 2)}:${lpad(d.getSeconds(), 2)}`;

  function lpad(x: any, w: number) {
    const s = `${x}`;
    return '0'.repeat(Math.max(w - s.length, 0)) + s;
  }
}

/**
 * @deprecated
 */
export enum LogLevel {
  /** Not verbose at all */
  DEFAULT = 0,
  /** Pretty verbose */
  DEBUG = 1,
  /** Extremely verbose */
  TRACE = 2,
}

/**
 * @deprecated
 */
export let logLevel = LogLevel.DEFAULT;
/**
 * @deprecated
 */
export let CI = false;

/**
 * @deprecated
 */
export function setLogLevel(newLogLevel: LogLevel) {
  logLevel = newLogLevel;
}

/**
 * @deprecated
 */
export function setCI(newCI: boolean) {
  CI = newCI;
}

/**
 * @deprecated
 */
export function increaseVerbosity() {
  logLevel += 1;
}

const stream = () => CI ? stdout : stderr;
const _debug = logger(stream, [chalk.gray], true);

/**
 * @deprecated
 */
export const trace = (fmt: string, ...args: unknown[]) => logLevel >= LogLevel.TRACE && _debug(fmt, ...args);
/**
 * @deprecated
 */
export const debug = (fmt: string, ...args: unknown[]) => logLevel >= LogLevel.DEBUG && _debug(fmt, ...args);
/**
 * @deprecated
 */
export const error = logger(stderr, [chalk.red]);
/**
 * @deprecated
 */
export const warning = logger(stream, [chalk.yellow]);
/**
 * @deprecated
 */
export const success = logger(stream, [chalk.green]);
/**
 * @deprecated
 */
export const highlight = logger(stream, [chalk.bold]);
/**
 * @deprecated
 */
export const print = logger(stream);
/**
 * @deprecated
 */
export const data = logger(stdout);

/**
 * @deprecated
 */
export type LoggerFunction = (fmt: string, ...args: unknown[]) => void;

/**
 * Create a logger output that features a constant prefix string.
 *
 * @deprecated
 *
 * @param prefixString - the prefix string to be appended before any log entry.
 * @param fn   - the logger function to be used (typically one of the other functions in this module)
 *
 * @returns a new LoggerFunction.
 */
export function prefix(prefixString: string, fn: LoggerFunction): LoggerFunction {
  return (fmt: string, ...args: any[]) => fn(`%s ${fmt}`, prefixString, ...args);
}
