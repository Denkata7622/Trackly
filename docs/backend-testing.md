# Backend Testing & Review (No Full Dependency Install)

When backend dependencies cannot be installed in CI/dev sandbox, use:

```bash
npm run check:backend
```

This command performs:
1. **Dry TypeScript validation** for `backend/src/**` using temporary dependency stubs.
2. **Backend unit tests** in `backend/tests/**`.

It restores `backend/tsconfig.json` and removes temporary stubs after the run.

## Individual commands

```bash
npm run test:backend
node scripts/backend-validate.mjs
```

## Notes
- This is a fallback validation path for restricted environments.
- For production readiness, still run the full backend build in an environment with full npm access:

```bash
npm run build --prefix backend
```
