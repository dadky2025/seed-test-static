#!/usr/bin/env node
// The security headers and the SPA rewrite exist in three places that no tool keeps in sync:
// netlify.toml, deploy/cloudfront/response-headers-policy.json and deploy/aws/stack.yml (which
// inlines deploy/cloudfront/spa-rewrite.js). Checks they agree and that the rewrite behaves.
// Exit 1 on any difference.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const NETLIFY = 'netlify.toml';
const POLICY = 'deploy/cloudfront/response-headers-policy.json';
const STACK = 'deploy/aws/stack.yml';
const FUNCTION = 'deploy/cloudfront/spa-rewrite.js';

const read = (file) => readFileSync(file, 'utf8');
const errors = [];
const expectEqual = (what, actual, expected) => {
  if (actual !== expected)
    errors.push(`${what}: ${JSON.stringify(actual)} ≠ ${JSON.stringify(expected)}`);
};

// ── Headers: netlify.toml is the reference ──────────────────────────────────────────────────
const toml = read(NETLIFY);
const header = (name) => {
  const match = new RegExp(`^\\s*${name} = "(.*)"$`, 'm').exec(toml);
  if (!match) errors.push(`${NETLIFY}: no ${name} header`);
  return match?.[1] ?? '';
};
const csp = header('Content-Security-Policy');
const hsts = header('Strict-Transport-Security');
const referrer = header('Referrer-Policy');
const permissions = header('Permissions-Policy');
const coop = header('Cross-Origin-Opener-Policy');
expectEqual(`${NETLIFY} X-Content-Type-Options`, header('X-Content-Type-Options'), 'nosniff');
const hstsMaxAge = Number(/max-age=(\d+)/.exec(hsts)?.[1]);
const hstsSubdomains = hsts.includes('includeSubDomains');

const policy = JSON.parse(read(POLICY));
const security = policy.SecurityHeadersConfig;
const custom = Object.fromEntries(
  policy.CustomHeadersConfig.Items.map((item) => [item.Header, item.Value]),
);
expectEqual(`${POLICY} CSP`, security.ContentSecurityPolicy.ContentSecurityPolicy, csp);
expectEqual(
  `${POLICY} HSTS max-age`,
  security.StrictTransportSecurity.AccessControlMaxAgeSec,
  hstsMaxAge,
);
expectEqual(
  `${POLICY} HSTS subdomains`,
  security.StrictTransportSecurity.IncludeSubdomains,
  hstsSubdomains,
);
expectEqual(`${POLICY} Referrer-Policy`, security.ReferrerPolicy.ReferrerPolicy, referrer);
expectEqual(`${POLICY} Permissions-Policy`, custom['Permissions-Policy'], permissions);
expectEqual(`${POLICY} Cross-Origin-Opener-Policy`, custom['Cross-Origin-Opener-Policy'], coop);
expectEqual(`${POLICY} custom header count`, policy.CustomHeadersConfig.Quantity, 2);

// The stack is CloudFormation YAML with short-form tags; its values are checked line by line.
const stack = read(STACK);
const stackLines = new Set(stack.split('\n').map((line) => line.trim()));
const expectLine = (line) => {
  if (!stackLines.has(line)) errors.push(`${STACK}: missing line ${JSON.stringify(line)}`);
};
expectLine(`ContentSecurityPolicy: "${csp}"`);
expectLine(`AccessControlMaxAgeSec: ${hstsMaxAge}`);
expectLine(`IncludeSubdomains: ${hstsSubdomains}`);
expectLine(`ReferrerPolicy: ${referrer}`);
expectLine(`Value: ${permissions}`);
expectLine(`Value: ${coop}`);

// ── SPA rewrite: the stack inlines the same handler ─────────────────────────────────────────
/** The code from `function handler` on, one trimmed line per entry (comments and indentation differ). */
const handlerCode = (source) => {
  const lines = source.split('\n');
  const start = lines.findIndex((line) => line.trim().startsWith('function handler('));
  return start < 0
    ? []
    : lines
        .slice(start)
        .map((line) => line.trim())
        .filter(Boolean);
};
const stackLinesInOrder = stack.split('\n');
const codeStart = stackLinesInOrder.findIndex((line) => line.trim() === 'FunctionCode: |');
const codeIndent = stackLinesInOrder[codeStart + 1]?.search(/\S/) ?? 0;
const stackCodeLines = [];
for (const line of stackLinesInOrder.slice(codeStart + 1)) {
  if (line.trim() && line.search(/\S/) < codeIndent) break;
  stackCodeLines.push(line);
}
const stackCode = stackCodeLines.join('\n');
const fileCode = read(FUNCTION);
expectEqual(
  `${STACK} FunctionCode`,
  handlerCode(stackCode).join('\n'),
  handlerCode(fileCode).join('\n'),
);

// Both copies must parse as a classic script (the runtime has no modules) and rewrite correctly.
const cases = [
  ['/', '/index.html'],
  ['/items', '/index.html'],
  ['/items/abc', '/index.html'],
  ['/index.html', '/index.html'],
  ['/healthz.json', '/healthz.json'],
  ['/assets/index-abc123.js', '/assets/index-abc123.js'],
  ['/assets/missing-XYZ.js', '/assets/missing-XYZ.js'], // stays a miss: 404 from the origin
];
for (const [name, code] of [
  [FUNCTION, fileCode],
  [STACK, stackCode],
]) {
  const context = vm.createContext({});
  vm.runInContext(code, context, { filename: name });
  for (const [uri, expected] of cases) {
    const request = context.handler({
      request: { method: 'GET', uri, querystring: {}, headers: {} },
    });
    expectEqual(`${name} handler(${uri})`, request.uri, expected);
  }
}

if (errors.length) {
  for (const error of errors) console.error(error);
  process.exit(1);
}
console.log(
  'deploy config: headers and SPA rewrite agree across Netlify, CloudFront and the stack',
);
