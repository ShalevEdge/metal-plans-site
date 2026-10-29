'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const bin = process.env.GITLEAKS_BIN;
if (!bin) { console.log('SKIP GITLEAKS_BIN required for scanner negative control'); process.exit(77); }
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'shalvero-secret-control-'));
try {
  fs.copyFileSync(path.join(__dirname, '../.gitleaksignore'), path.join(dir, '.gitleaksignore'));
  // Generate a synthetic value at runtime; it never belongs to a provider account.
  fs.writeFileSync(path.join(dir, 'fresh-credential.txt'), 'api_key = "' + crypto.randomBytes(32).toString('hex') + '"\n', {mode: 0o600});
  const result = cp.spawnSync(bin, ['dir', '--redact=100', '--no-banner', dir], {cwd: dir, encoding: 'utf8', timeout: 30000});
  assert.ifError(result.error);
  assert.equal(result.status, 1, 'historical exceptions must not suppress a new credential-shaped value');
  console.log('PASS new synthetic credential remains detected with historical exceptions present');
} finally {
  fs.rmSync(dir, {recursive: true, force: true});
}
