
export type RoleType = 'Retailer' | 'Wholesaler' | 'Distributor' | 'Manufacturer';

export interface SimulationNode {
  id: string;
  name: string;
  role: RoleType;
  inventory: number;
  backlog: number;
  lastIncomingOrder: number;
  lastOutgoingOrder: number;
  lastIncomingShipment: number;
  lastOutgoingShipment: number;
  totalProduced: number;
  cumulativeDemand: number;
  cumulativeSupply: number;
  cumulativeShipped: number;
  targetInventory: number;
  // History for charting
  history: {
    inventory: number;
    order: number;
    backlog: number;
  }[];
}

export interface SimulationEvent {
  id: string;
  type: 'SHORTAGE' | 'CONGESTION' | 'SPIKE';
  name: string;
  description: string;
  remainingTicks: number;
}

export interface SimulationState {
  tick: number;
  customerDemand: number;
  nodes: SimulationNode[];
  // In-transit shipments and orders (simplified as a queue for each link)
  // Key: "sourceId-targetId", Value: Array of { amount: number, arrivalTick: number }
  transit: Record<string, { amount: number; arrivalTick: number }[]>;
  activeEvents: SimulationEvent[];
  userOrders: Record<string, number | undefined>;
  config: {
    baseLeadTime: number;
    orderDelay: number;
    initialInventory: number;
  };
}

export const INITIAL_INVENTORY = 15;
export const BASE_LEAD_TIME = 1; // Ticks to arrive (1 period delay)
export const ORDER_DELAY = 0; // Ticks for order to be received (No delay/Immediate)
export const FIXED_PRODUCTION_CAPACITY = 20; // Fixed production for Manufacturer

export const createInitialState = (): SimulationState => {
  return {
    tick: 0,
    customerDemand: 10, // Base demand
    activeEvents: [],
    userOrders: {},
    transit: {},
    config: {
      baseLeadTime: BASE_LEAD_TIME,
      orderDelay: ORDER_DELAY,
      initialInventory: INITIAL_INVENTORY,
    },
    nodes: [
      {
        id: 'retailer',
        name: '零售商 (Retailer)',
        role: 'Retailer',
        inventory: INITIAL_INVENTORY,
        backlog: 0,
        lastIncomingOrder: 0,
        lastOutgoingOrder: 0,
        lastIncomingShipment: 0,
        lastOutgoingShipment: 0,
        totalProduced: 0,
        cumulativeDemand: 0,
        cumulativeSupply: 0,
        cumulativeShipped: 0,
        targetInventory: INITIAL_INVENTORY,
        history: [],
      },
      {
        id: 'wholesaler',
        name: '批发商 (Wholesaler)',
        role: 'Wholesaler',
        inventory: INITIAL_INVENTORY,
        backlog: 0,
        lastIncomingOrder: 0,
        lastOutgoingOrder: 0,
        lastIncomingShipment: 0,
        lastOutgoingShipment: 0,
        totalProduced: 0,
        cumulativeDemand: 0,
        cumulativeSupply: 0,
        cumulativeShipped: 0,
        targetInventory: INITIAL_INVENTORY,
        history: [],
      },
      {
        id: 'distributor',
        name: '分销商 (Distributor)',
        role: 'Distributor',
        inventory: INITIAL_INVENTORY,
        backlog: 0,
        lastIncomingOrder: 0,
        lastOutgoingOrder: 0,
        lastIncomingShipment: 0,
        lastOutgoingShipment: 0,
        totalProduced: 0,
        cumulativeDemand: 0,
        cumulativeSupply: 0,
        cumulativeShipped: 0,
        targetInventory: INITIAL_INVENTORY,
        history: [],
      },
      {
        id: 'manufacturer',
        name: '生产商 (Manufacturer)',
        role: 'Manufacturer',
        inventory: INITIAL_INVENTORY,
        backlog: 0,
        lastIncomingOrder: 0,
        lastOutgoingOrder: 0,
        lastIncomingShipment: 0,
        lastOutgoingShipment: 0,
        totalProduced: 0,
        cumulativeDemand: 0,
        cumulativeSupply: 0,
        cumulativeShipped: 0,
        targetInventory: INITIAL_INVENTORY,
        history: [],
      },
    ],
  };
};

// Trigger a black swan event
export const triggerBlackSwan = (state: SimulationState, type: 'SHORTAGE' | 'CONGESTION' | 'SPIKE'): SimulationState => {
  const newEvent: SimulationEvent = {
    id: Math.random().toString(36).substr(2, 9),
    type,
    remainingTicks: type === 'SPIKE' ? 1 : 5,
    name: type === 'SHORTAGE' ? '原材料断供' : type === 'CONGESTION' ? '物流拥堵' : '需求暴增',
    description: type === 'SHORTAGE' 
      ? '由于气候或政策原因，生产商原材料供应中断，生产延迟翻倍。' 
      : type === 'CONGESTION' 
        ? '港口罢工或运输线路发生重大事故，全线物流时间增加。' 
        : '热门话题引发抢购热潮，客户需求瞬间飙升。',
  };

  return {
    ...state,
    activeEvents: [...state.activeEvents, newEvent]
  };
};

// Helper to get upstream node ID
const getUpstreamId = (nodeId: string): string | null => {
  switch (nodeId) {
    case 'retailer': return 'wholesaler';
    case 'wholesaler': return 'distributor';
    case 'distributor': return 'manufacturer';
    case 'manufacturer': return null; // Infinite source
    default: return null;
  }
};

// Helper to get downstream node ID
const getDownstreamId = (nodeId: string): string | null => {
  switch (nodeId) {
    case 'retailer': return null; // Customer
    case 'wholesaler': return 'retailer';
    case 'distributor': return 'wholesaler';
    case 'manufacturer': return 'distributor';
    default: return null;
  }
};

export const calculateRecommendedOrder = (node: { lastIncomingOrder: number, inventory: number, backlog: number }, leadTime: number): number => {
  const expectedDemand = node.lastIncomingOrder; 
  const target = (expectedDemand * leadTime) + 5; 
  const gap = target - node.inventory + node.backlog;
  return Math.max(0, gap);
};

export const advanceSimulation = (state: SimulationState, userOrderOverride?: number): SimulationState => {
  const nextTick = state.tick + 1;
  const nextNodes = state.nodes.map(n => ({ ...n, history: [...n.history] }));
  
  // Tick events
  const nextEvents = state.activeEvents
    .map(e => ({ ...e, remainingTicks: e.remainingTicks - 1 }))
    .filter(e => e.remainingTicks > 0);

  // Check current modifiers
  const currentLeadTime = nextEvents.some(e => e.type === 'CONGESTION') ? state.config.baseLeadTime + 3 : state.config.baseLeadTime;
  const productionDelay = nextEvents.some(e => e.type === 'SHORTAGE') ? state.config.baseLeadTime * 3 : state.config.baseLeadTime;
  
  // Deep copy transit to avoid mutating previous state
  const nextTransit: Record<string, { amount: number; arrivalTick: number }[]> = {};
  Object.keys(state.transit).forEach(key => {
    nextTransit[key] = [...state.transit[key]];
  });

  // 1. Receive Shipments & Produce (Step 1 is always ADDING to inventory)
  nextNodes.forEach(node => {
    let incomingShipment = 0;
    const upstreamId = getUpstreamId(node.id);

    if (upstreamId) {
      const key = `${upstreamId}-${node.id}`;
      const shipments = nextTransit[key] || [];
      const arrived = shipments.filter(s => s.arrivalTick <= nextTick);
      const remaining = shipments.filter(s => s.arrivalTick > nextTick);
      
      incomingShipment = arrived.reduce((sum, s) => sum + s.amount, 0);
      nextTransit[key] = remaining;
    } else if (node.role === 'Manufacturer') {
      // Manufacturer produces only when there's an order (from the previous tick)
      // Production is completed in the same period it's ordered, ready to ship next period
      incomingShipment = node.lastIncomingOrder;
    }

    node.inventory += incomingShipment;
    node.lastIncomingShipment = incomingShipment;
    node.cumulativeSupply += incomingShipment;
    
    if (node.role === 'Manufacturer') {
      node.totalProduced += incomingShipment;
    }
  });

  // 2. Receive Orders (Define current tick demand)
  let currentCustomerDemand = 0;
  nextNodes.forEach(node => {
    const downstreamId = getDownstreamId(node.id);
    let incomingOrder = 0;

    if (!downstreamId) {
      const isSpike = nextEvents.some(e => e.type === 'SPIKE');
      const baseDemand = isSpike ? 35 : 10;
      const noise = isSpike ? Math.floor(Math.random() * 10) : Math.floor(Math.random() * 7) - 3; 
      incomingOrder = Math.max(0, baseDemand + noise);
      currentCustomerDemand = incomingOrder;
    } else {
      const key = `${downstreamId}-${node.id}-order`;
      const orders = nextTransit[key] || [];
      const arrived = orders.filter(o => o.arrivalTick <= nextTick);
      const remaining = orders.filter(o => o.arrivalTick > nextTick);
      incomingOrder = arrived.reduce((sum, o) => sum + o.amount, 0);
      nextTransit[key] = remaining;
    }
    node.lastIncomingOrder = incomingOrder;
    node.cumulativeDemand += incomingOrder;
  });

    // 3. Fulfill Orders (Subtract from inventory using cumulative logic for Backlog)
    nextNodes.forEach(node => {
      const initialPlusSupply = state.config.initialInventory + node.cumulativeSupply;
      
      // Calculate how much we CAN ship in total up to this point
      // It is limited by both total demand and total available supply (Initial + Supply)
      const totalPossibleShipped = Math.min(node.cumulativeDemand, initialPlusSupply);
      const shipmentVolume = totalPossibleShipped - node.cumulativeShipped;
      
      node.cumulativeShipped = totalPossibleShipped;
      node.lastOutgoingShipment = shipmentVolume;

      // Now calculate physical state values based on the balance
      // Inventory = (Initial + Total Inflow) - Total Outflow
      node.inventory = initialPlusSupply - node.cumulativeShipped;
      
      // Backlog = Total Demand from Downstream - Total Outflow
      node.backlog = node.cumulativeDemand - node.cumulativeShipped;

      const downstreamId = getDownstreamId(node.id);
    if (downstreamId) {
      const key = `${node.id}-${downstreamId}`;
      if (!nextTransit[key]) nextTransit[key] = [];
      nextTransit[key].push({
        amount: shipmentVolume,
        arrivalTick: nextTick + currentLeadTime
      });
    }
  });

  // 4. Place Orders (Strategy)
  nextNodes.forEach(node => {
    let orderAmount = 0;
    const currentLeadTimeEffective = currentLeadTime;

    if (node.role === 'Manufacturer') {
      // Manufacturer does not place orders upstream
      orderAmount = 0;
    } else {
      // Check for user override
      if (state.userOrders[node.id] !== undefined) {
        orderAmount = state.userOrders[node.id];
      } else {
        // Order-up-to level strategy
        const expectedDemand = node.lastIncomingOrder; 
        const target = (expectedDemand * currentLeadTime) + 5; 
        const gap = target - node.inventory + node.backlog;
        orderAmount = Math.max(0, gap);
      }
    }

    node.lastOutgoingOrder = orderAmount;

    // Send order upstream
    const upstreamId = getUpstreamId(node.id);
    if (upstreamId) {
      const key = `${node.id}-${upstreamId}-order`;
      if (!nextTransit[key]) nextTransit[key] = [];
      nextTransit[key].push({
        amount: orderAmount,
        arrivalTick: nextTick + state.config.orderDelay
      });
    }

    // Record History (Using Net Inventory for better visualization)
    node.history.push({
      inventory: node.inventory - node.backlog,
      order: node.lastOutgoingOrder,
      backlog: node.backlog
    });
  });

  return {
    tick: nextTick,
    customerDemand: currentCustomerDemand,
    nodes: nextNodes,
    transit: nextTransit,
    activeEvents: nextEvents,
    config: { ...state.config },
    userOrders: {}, // Clear overrides after use
  };
};
