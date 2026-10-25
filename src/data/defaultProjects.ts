import { Project } from '../types';

export const SAMPLE_TEMPLATES: Project[] = [
  {
    id: 'template-web-fullstack',
    name: 'Full-Stack Web Platform',
    description: 'Static example diagram with a web client, API gateway, database, and cache.',
    type: 'web',
    updatedAt: new Date().toISOString(),
    nodes: [
      {
        id: 'node-web-client',
        type: 'architectureCard',
        position: { x: 80, y: 140 },
        data: {
          label: 'Client Web Application',
          category: 'frontend',
          subtitle: 'src/app (Next.js / React)',
          description: 'Responsive user dashboard, authentication forms, and client telemetry hooks.',
          tags: ['React', 'TypeScript', 'Tailwind'],
          status: 'done',
        },
      },
      {
        id: 'node-api-gateway',
        type: 'architectureCard',
        position: { x: 460, y: 140 },
        data: {
          label: 'API Gateway & Router',
          category: 'gateway',
          subtitle: 'src/api / Express / Fastify',
          description: 'JWT session validation, CORS security headers, rate limiting, and request routing.',
          tags: ['REST', 'JWT', 'RateLimit'],
          status: 'done',
        },
      },
      {
        id: 'node-db-primary',
        type: 'architectureCard',
        position: { x: 840, y: 80 },
        data: {
          label: 'PostgreSQL Database',
          category: 'database',
          subtitle: 'Prisma / Drizzle ORM',
          description: 'Primary relational data store for user records, workspaces, and audit events.',
          tags: ['PostgreSQL', 'SQL', 'ACID'],
          status: 'done',
        },
      },
      {
        id: 'node-cache-redis',
        type: 'architectureCard',
        position: { x: 840, y: 260 },
        data: {
          label: 'Redis Cache & Session Store',
          category: 'cache',
          subtitle: 'Redis Cluster',
          description: 'In-memory fast retrieval for active user sessions and distributed rate limiter counters.',
          tags: ['Redis', 'In-Memory', 'Pub/Sub'],
          status: 'idle',
        },
      },
    ],
    edges: [
      { id: 'e-web-api', source: 'node-web-client', target: 'node-api-gateway', animated: true },
      { id: 'e-api-db', source: 'node-api-gateway', target: 'node-db-primary' },
      { id: 'e-api-cache', source: 'node-api-gateway', target: 'node-cache-redis' },
    ],
  },
  {
    id: 'template-microservices',
    name: 'Microservices & Event Mesh',
    description: 'Static example diagram with an API gateway, authentication service, event queue, and workers.',
    type: 'backend',
    updatedAt: new Date().toISOString(),
    nodes: [
      {
        id: 'ms-gateway',
        type: 'architectureCard',
        position: { x: 80, y: 160 },
        data: {
          label: 'Ingress API Gateway',
          category: 'gateway',
          subtitle: 'Envoy / NGINX',
          description: 'Central entry point handling SSL termination, rate limiting, and request routing.',
          tags: ['Ingress', 'ReverseProxy'],
          status: 'done',
        },
      },
      {
        id: 'ms-auth',
        type: 'architectureCard',
        position: { x: 440, y: 80 },
        data: {
          label: 'Auth & Identity Service',
          category: 'auth',
          subtitle: 'Go / gRPC',
          description: 'OAuth 2.0 token issuing, cryptographic verification, and RBAC policy evaluation.',
          tags: ['OAuth', 'JWT', 'gRPC'],
          status: 'done',
        },
      },
      {
        id: 'ms-queue',
        type: 'architectureCard',
        position: { x: 440, y: 260 },
        data: {
          label: 'Kafka Event Bus',
          category: 'queue',
          subtitle: 'Apache Kafka Cluster',
          description: 'Distributed commit log for asynchronous domain events and telemetry pub/sub.',
          tags: ['Kafka', 'EventDriven', 'Stream'],
          status: 'done',
        },
      },
      {
        id: 'ms-worker',
        type: 'architectureCard',
        position: { x: 800, y: 260 },
        data: {
          label: 'Background Job Consumer',
          category: 'worker',
          subtitle: 'Node / BullMQ Worker',
          description: 'Consumes domain events from Kafka and handles email delivery and async tasks.',
          tags: ['Worker', 'AsyncJob'],
          status: 'running',
        },
      },
    ],
    edges: [
      { id: 'e-gw-auth', source: 'ms-gateway', target: 'ms-auth' },
      { id: 'e-gw-queue', source: 'ms-gateway', target: 'ms-queue', animated: true },
      { id: 'e-queue-worker', source: 'ms-queue', target: 'ms-worker', animated: true },
    ],
  },
];

export const DEFAULT_PROJECTS: Project[] = [];
