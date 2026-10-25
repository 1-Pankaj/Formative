import type { Node } from '@xyflow/react';

const LEGACY_ARCHITECTURE_NODE_TYPES = new Set(['paperclipCard', 'archNode']);

/**
 * Keep project canvases created by earlier Formative versions readable while
 * moving them to the current, product-owned architecture node type.
 */
export function normalizeArchitectureNodeTypes(nodes: Node[]): Node[] {
  return nodes.map((node) =>
    LEGACY_ARCHITECTURE_NODE_TYPES.has(node.type || '')
      ? { ...node, type: 'architectureCard' }
      : node
  );
}
