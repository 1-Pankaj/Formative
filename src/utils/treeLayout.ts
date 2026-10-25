import { Node, Edge } from '@xyflow/react';

/**
 * Adapted from Paperclip's recursive OrgChart layout approach.
 * See THIRD_PARTY_NOTICES.md for its MIT notice and source.
 */

const CARD_W = 260;
const CARD_H = 110;
const GAP_X = 80;
const GAP_Y = 140;

interface TreeNode {
  id: string;
  node: Node;
  children: TreeNode[];
}

/** Compute width required for each subtree */
function getSubtreeWidth(tree: TreeNode): number {
  if (tree.children.length === 0) return CARD_W;
  const childrenW = tree.children.reduce((sum, c) => sum + getSubtreeWidth(c), 0);
  const gaps = (tree.children.length - 1) * GAP_X;
  return Math.max(CARD_W, childrenW + gaps);
}

/** Recursively assign non-overlapping x, y positions */
function assignTreePositions(
  tree: TreeNode,
  x: number,
  y: number,
  positions: Map<string, { x: number; y: number }>
) {
  const totalW = getSubtreeWidth(tree);
  positions.set(tree.id, {
    x: x + (totalW - CARD_W) / 2,
    y,
  });

  if (tree.children.length > 0) {
    const childrenW = tree.children.reduce((sum, c) => sum + getSubtreeWidth(c), 0);
    const gaps = (tree.children.length - 1) * GAP_X;
    let childX = x + (totalW - childrenW - gaps) / 2;

    for (const child of tree.children) {
      const cw = getSubtreeWidth(child);
      assignTreePositions(child, childX, y + CARD_H + GAP_Y, positions);
      childX += cw + GAP_X;
    }
  }
}

/**
 * Arranges ReactFlow nodes in a clean hierarchical tree with zero overlapping
 */
export function hierarchicalTreeLayout(nodes: Node[], edges: Edge[]): Node[] {
  if (nodes.length === 0) return [];

  // Build adjacency map (target -> parents, source -> children)
  const childrenMap = new Map<string, string[]>();
  const parentMap = new Map<string, string[]>();
  const nodeMap = new Map<string, Node>();

  nodes.forEach((n) => {
    nodeMap.set(n.id, n);
    childrenMap.set(n.id, []);
    parentMap.set(n.id, []);
  });

  edges.forEach((e) => {
    if (childrenMap.has(e.source) && parentMap.has(e.target)) {
      childrenMap.get(e.source)!.push(e.target);
      parentMap.get(e.target)!.push(e.source);
    }
  });

  // Find root nodes (nodes with 0 incoming edges, or the first node if cycle)
  let roots = nodes.filter((n) => (parentMap.get(n.id) || []).length === 0);
  if (roots.length === 0) {
    roots = [nodes[0]];
  }

  const visited = new Set<string>();

  function buildSubtree(nodeId: string): TreeNode {
    visited.add(nodeId);
    const rawChildren = childrenMap.get(nodeId) || [];
    const childrenNodes: TreeNode[] = [];

    for (const cid of rawChildren) {
      if (!visited.has(cid)) {
        childrenNodes.push(buildSubtree(cid));
      }
    }

    return {
      id: nodeId,
      node: nodeMap.get(nodeId)!,
      children: childrenNodes,
    };
  }

  const forest: TreeNode[] = [];
  roots.forEach((r) => {
    if (!visited.has(r.id)) {
      forest.push(buildSubtree(r.id));
    }
  });

  // Any remaining unvisited nodes become independent root trees
  nodes.forEach((n) => {
    if (!visited.has(n.id)) {
      forest.push(buildSubtree(n.id));
    }
  });

  const positions = new Map<string, { x: number; y: number }>();
  let currentX = 80;
  const startY = 80;

  forest.forEach((rootTree) => {
    const w = getSubtreeWidth(rootTree);
    assignTreePositions(rootTree, currentX, startY, positions);
    currentX += w + GAP_X * 1.5;
  });

  return nodes.map((n) => {
    const pos = positions.get(n.id);
    return {
      ...n,
      position: pos ? { x: Math.round(pos.x), y: Math.round(pos.y) } : n.position,
    };
  });
}
