# Routes

When the backend service grows, this is where its HTTP routes live.

Suggested shape (not yet wired up):

```
routes/
├── auth/
│   ├── login.ts
│   └── refresh.ts
├── users/
│   ├── index.ts
│   └── [id].ts
└── jobs/
    ├── index.ts
    └── [id].ts
```

Each route file exports a handler of shape `(req, ctx) => Response`
compatible with whatever HTTP framework we adopt (likely Fastify or
Hono, given the NodeNext ESM setup in `tsconfig.json`).
