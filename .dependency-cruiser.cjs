/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      comment:
        'A cycle makes load order and code splitting unpredictable. Extract the shared part.',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'shared-is-a-leaf',
      comment: 'shared/ is used by everyone and uses no one: never features, shell or routes.',
      severity: 'error',
      from: { path: '^src/shared/' },
      to: { path: '^src/(features|shell|app|routes)/' },
    },
    {
      name: 'no-feature-to-feature',
      comment:
        'A feature never imports another feature. Compose them in a route, or move the shared part to shared/.',
      severity: 'error',
      from: { path: '^src/features/([^/]+)/' },
      to: { path: '^src/features/([^/]+)/', pathNot: '^src/features/$1/' },
    },
    {
      name: 'feature-public-api-only',
      comment:
        'Outside its folder, a feature is used through index.ts only (MSW handlers are the test-only exception).',
      severity: 'error',
      from: { pathNot: '^src/features/' },
      to: {
        path: '^src/features/[^/]+/.+',
        pathNot: [
          '^src/features/[^/]+/index\\.ts$',
          '^src/features/[^/]+/api/[^/]+\\.handlers\\.ts$',
        ],
      },
    },
    {
      name: 'model-is-pure',
      comment:
        'model/ holds types, schemas and pure functions: no React, no framework, no network, no other layer.',
      severity: 'error',
      from: { path: '^src/features/[^/]+/model/' },
      to: {
        path: [
          '^src/features/[^/]+/(api|ui)/',
          '^src/(shell|app|routes)/',
          '^src/shared/(lib/http|ui|config)/',
          // Unanchored, so it also matches pnpm's node_modules/.pnpm/<pkg>/node_modules/<name>/ paths.
          // (An optional group here is rejected by dependency-cruiser as an unsafe regular expression.)
          'node_modules/(react|react-dom|next|react-router|@tanstack/[^/]+)/',
        ],
      },
    },
    {
      name: 'api-below-ui',
      comment: 'api/ serves ui/, never the other way round.',
      severity: 'error',
      from: { path: '^src/features/([^/]+)/api/' },
      to: { path: '^src/features/$1/ui/' },
    },
    {
      name: 'no-dev-deps-in-production-code',
      comment:
        'Production code must not import devDependencies (they are not installed in production images).',
      severity: 'error',
      from: {
        path: '^src/',
        pathNot: ['\\.test\\.tsx?$', '\\.stories\\.tsx$', '^src/test/', '\\.handlers\\.ts$'],
      },
      to: { dependencyTypes: ['npm-dev'], dependencyTypesNot: ['type-only'] },
    },
    {
      name: 'no-unresolvable',
      severity: 'error',
      from: {},
      to: { couldNotResolve: true },
    },
    {
      name: 'no-orphans',
      comment:
        'A file nothing imports is dead code — or an entry point that belongs in pathNot below.',
      severity: 'error',
      from: {
        orphan: true,
        pathNot: [
          '\\.d\\.ts$',
          '\\.(test|stories)\\.tsx?$',
          '^src/test/',
          '^src/routes/', // TanStack Router file routes
          '^src/(main|root|routes|entry\\.client|entry\\.server)\\.tsx?$',
          '^src/routeTree\\.gen\\.ts$',
        ],
      },
      to: {},
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.app.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      mainFields: ['module', 'main', 'types', 'typings'],
    },
    reporterOptions: { text: { highlightFocused: true } },
  },
};
