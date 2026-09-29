import { execFileSync } from 'node:child_process';
import process from 'node:process';

/** Must match preview/vite.config.ts server.port. */
const PORT = 5273;

/**
 * PIDs listening on the preview port.
 * Killing the `pnpm gauntlet:preview` wrapper is not enough: its Vite child
 * can keep the port. These are the processes that must actually exit.
 * @returns {number[]}
 */
function listeningPids() {
  try {
    const out = execFileSync(
      'lsof',
      ['-nP', `-iTCP:${PORT}`, '-sTCP:LISTEN', '-t'],
      { encoding: 'utf8' },
    );
    return [
      ...new Set(
        out
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => Number(line))
          .filter((pid) => Number.isInteger(pid) && pid > 0),
      ),
    ];
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      console.error('lsof is required to stop the gauntlet preview.');
      process.exit(1);
    }
    // lsof exits 1 when nothing is listening.
    if (error && error.status === 1) {
      return [];
    }
    throw error;
  }
}

/**
 * @param {number} pid
 * @returns {boolean}
 */
function isAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    if (error && error.code === 'EPERM') {
      return true;
    }
    return false;
  }
}

/**
 * @param {number[]} pids
 * @param {NodeJS.Signals} signal
 */
function signalPids(pids, signal) {
  for (const pid of pids) {
    try {
      process.kill(pid, signal);
    } catch (error) {
      if (!error || error.code !== 'ESRCH') {
        throw error;
      }
    }
  }
}

/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * @param {number[]} pids
 * @param {number} timeoutMs
 * @returns {Promise<boolean>}
 */
async function waitUntilGone(pids, timeoutMs) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const portBusy = listeningPids().length > 0;
    const stillAlive = pids.some((pid) => isAlive(pid));
    if (!portBusy && !stillAlive) {
      return true;
    }
    await delay(100);
  }
  return listeningPids().length === 0 && pids.every((pid) => !isAlive(pid));
}

const initial = listeningPids();
if (initial.length === 0) {
  console.log(`Port ${PORT} is already free. No preview listener is running.`);
  process.exit(0);
}

console.log(
  `Stopping preview listener(s) on port ${PORT}: ${initial.join(', ')}`,
);
signalPids(initial, 'SIGTERM');

let gone = await waitUntilGone(initial, 2000);
if (!gone) {
  const stillListening = listeningPids();
  const stillAlive = initial.filter((pid) => isAlive(pid));
  const killSet = [...new Set([...stillListening, ...stillAlive])];
  console.log(
    `Listener still running after SIGTERM. Sending SIGKILL to ${killSet.join(', ')}`,
  );
  signalPids(killSet, 'SIGKILL');
  gone = await waitUntilGone(killSet, 1000);
}

const left = listeningPids();
const alive = initial.filter((pid) => isAlive(pid));
if (left.length > 0 || alive.length > 0) {
  console.error(
    `FAILED: preview child still running on port ${PORT}.` +
      ` listening=${left.join(',') || 'none'}` +
      ` alive=${alive.join(',') || 'none'}`,
  );
  process.exit(1);
}

console.log(`Port ${PORT} is free. Preview listener has exited.`);
