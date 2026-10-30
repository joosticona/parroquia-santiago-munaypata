import { build } from 'astro';

process.env.DEPLOY_TARGET = 'pages';
await build({});
