export type NodeType = 'LOCATION' | 'STANDARD' | 'PURPLE';

export interface GraphNode {
  id: string;
  type: NodeType;
}

export const NODE_TYPES: Record<string, NodeType> = {
  DOMEK: 'LOCATION',
  LASEK: 'LOCATION',
  PALENISKO: 'LOCATION',
  ALTANA: 'LOCATION',
  WZGÓRZE: 'LOCATION',
  GRANICA: 'LOCATION',
  
  L_S1: 'STANDARD', L_P1: 'PURPLE', L_S2: 'STANDARD', L_P2: 'PURPLE',
  P_S1: 'STANDARD', P_P1: 'PURPLE',
  W_S1: 'STANDARD', W_P1: 'PURPLE', W_S2: 'STANDARD', W_P2: 'PURPLE', W_S3: 'STANDARD', W_P3: 'PURPLE',
  G_S1: 'STANDARD', G_P1: 'PURPLE'
};

const ROUTES: string[][] = [
  ['DOMEK', 'L_S1', 'L_P1', 'L_S2', 'L_P2', 'LASEK'],
  ['DOMEK', 'P_S1', 'P_P1', 'PALENISKO'],
  ['DOMEK', 'ALTANA'],
  ['DOMEK', 'W_S1', 'W_P1', 'W_S2', 'W_P2', 'W_S3', 'W_P3', 'WZGÓRZE'],
  ['DOMEK', 'G_S1', 'G_P1', 'GRANICA']
];

export const BASE_ADJACENCY_LIST: Record<string, string[]> = {};

function buildGraph() {
  for (const node of Object.keys(NODE_TYPES)) {
    BASE_ADJACENCY_LIST[node] = [];
  }

  for (const route of ROUTES) {
    for (let i = 0; i < route.length - 1; i++) {
      const current = route[i];
      const next = route[i + 1];
      
      if (!BASE_ADJACENCY_LIST[current].includes(next)) {
        BASE_ADJACENCY_LIST[current].push(next);
      }
      if (!BASE_ADJACENCY_LIST[next].includes(current)) {
        BASE_ADJACENCY_LIST[next].push(current);
      }
    }
  }
}

buildGraph();

function getDynamicNeighbors(nodeId: string, isDay: boolean): string[] {
  if (!isDay) {
    return BASE_ADJACENCY_LIST[nodeId] || [];
  }

  const neighbors = new Set<string>();
  const visited = new Set<string>([nodeId]);
  const queue = [...(BASE_ADJACENCY_LIST[nodeId] || [])];

  while (queue.length > 0) {
    const current = queue.shift()!;
    
    if (visited.has(current)) {
      continue;
    }
    
    visited.add(current);

    if (NODE_TYPES[current] !== 'PURPLE') {
      neighbors.add(current);
    } else {
      queue.push(...(BASE_ADJACENCY_LIST[current] || []));
    }
  }

  return Array.from(neighbors);
}

export interface PathResult {
  path: string[];
  totalCostAP: number;
}

export function calculatePathCost(
  startNode: string,
  endNode: string,
  currentHour: number,
  isBackpackHeavy: boolean
): PathResult {
  const isDay = currentHour >= 8 && currentHour <= 18;
  const costPerStep = isBackpackHeavy ? 2 : 1;

  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited = new Set<string>(Object.keys(NODE_TYPES));

  for (const node of unvisited) {
    distances[node] = Infinity;
    previous[node] = null;
  }
  
  distances[startNode] = 0;

  while (unvisited.size > 0) {
    let current: string | null = null;
    let minDistance = Infinity;

    for (const node of unvisited) {
      if (distances[node] < minDistance) {
        minDistance = distances[node];
        current = node;
      }
    }

    if (current === null || current === endNode) {
      break;
    }

    unvisited.delete(current);

    const neighbors = getDynamicNeighbors(current, isDay);
    
    for (const neighbor of neighbors) {
      if (!unvisited.has(neighbor)) {
        continue;
      }

      const altDistance = distances[current] + costPerStep;
      
      if (altDistance < distances[neighbor]) {
        distances[neighbor] = altDistance;
        previous[neighbor] = current;
      }
    }
  }

  const path: string[] = [];
  let currentNode: string | null = endNode;

  while (currentNode !== null) {
    path.unshift(currentNode);
    currentNode = previous[currentNode];
  }

  if (path[0] !== startNode) {
    return { path: [], totalCostAP: Infinity };
  }

  return { 
    path, 
    totalCostAP: distances[endNode] 
  };
}