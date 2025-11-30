// ============================================
// KARTENSCHMIEDE - Map View Component
// ============================================
// Visualizes the roguelike path with branching nodes

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Coins, Layers, Swords, Skull, ShoppingBag, Coffee, Gift, HelpCircle, Crown } from 'lucide-react';
import { GameMap, MapNode, MapNodeType } from '../../utils/deckbuilder/types';
import { ACTS, getAvailableNodes } from '../../utils/deckbuilder/mapGeneration';

interface DeckbuilderMapViewProps {
  map: GameMap;
  currentFloor: number;
  currentAct: number;
  playerHp: number;
  playerMaxHp: number;
  playerGold: number;
  deckSize: number;
  onNodeSelect: (nodeId: string) => void;
  onBack: () => void;
  language?: 'EN' | 'DE' | 'ES';
}

// Node type configuration
const NODE_CONFIG: Record<MapNodeType, { icon: React.ReactNode; color: string; label: string; labelDE: string }> = {
  combat: { icon: <Swords className="w-5 h-5" />, color: '#EF4444', label: 'Combat', labelDE: 'Kampf' },
  elite: { icon: <Skull className="w-5 h-5" />, color: '#F59E0B', label: 'Elite', labelDE: 'Elite' },
  boss: { icon: <Crown className="w-5 h-5" />, color: '#DC2626', label: 'Boss', labelDE: 'Boss' },
  shop: { icon: <ShoppingBag className="w-5 h-5" />, color: '#10B981', label: 'Shop', labelDE: 'Shop' },
  rest: { icon: <Coffee className="w-5 h-5" />, color: '#06B6D4', label: 'Rest', labelDE: 'Rasten' },
  treasure: { icon: <Gift className="w-5 h-5" />, color: '#FBBF24', label: 'Treasure', labelDE: 'Schatz' },
  event: { icon: <HelpCircle className="w-5 h-5" />, color: '#8B5CF6', label: 'Event', labelDE: 'Ereignis' },
};

export const DeckbuilderMapView: React.FC<DeckbuilderMapViewProps> = ({
  map,
  currentFloor,
  currentAct,
  playerHp,
  playerMaxHp,
  playerGold,
  deckSize,
  onNodeSelect,
  onBack,
  language = 'DE'
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [availableNodes, setAvailableNodes] = useState<string[]>([]);
  const isDE = language === 'DE';

  const act = ACTS[currentAct - 1];

  // Get available nodes
  useEffect(() => {
    const available = getAvailableNodes(map);
    setAvailableNodes(available.map(n => n.id));
  }, [map]);

  // Auto-scroll to current position
  useEffect(() => {
    if (scrollRef.current) {
      const scrollPosition = Math.max(0, (currentFloor - 5) * 80);
      scrollRef.current.scrollTop = scrollPosition;
    }
  }, [currentFloor]);

  // Group nodes by floor
  const floorGroups: Map<number, MapNode[]> = new Map();
  map.nodes.forEach(node => {
    const floor = node.y;
    if (!floorGroups.has(floor)) {
      floorGroups.set(floor, []);
    }
    floorGroups.get(floor)!.push(node);
  });

  const sortedFloors = Array.from(floorGroups.keys()).sort((a, b) => b - a); // Top to bottom (highest first)

  const renderNode = (node: MapNode) => {
    const config = NODE_CONFIG[node.type];
    const isAvailable = availableNodes.includes(node.id);
    const isVisited = node.visited;
    const isCurrent = node.id === map.currentNodeId;

    return (
      <motion.button
        key={node.id}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={isAvailable ? { scale: 1.15 } : {}}
        whileTap={isAvailable ? { scale: 0.95 } : {}}
        onClick={() => isAvailable && onNodeSelect(node.id)}
        disabled={!isAvailable}
        className={`
          relative w-14 h-14 rounded-lg flex items-center justify-center
          transition-all duration-200
          ${isAvailable ? 'cursor-pointer' : 'cursor-not-allowed'}
          ${isCurrent ? 'ring-4 ring-white ring-opacity-80' : ''}
        `}
        style={{
          background: isVisited ? '#374151' : isAvailable ? config.color : '#1F2937',
          border: `3px solid ${isVisited ? '#4B5563' : isAvailable ? '#000' : '#374151'}`,
          boxShadow: isAvailable ? '4px 4px 0 #000' : 'none',
          opacity: isVisited ? 0.5 : isAvailable ? 1 : 0.4
        }}
      >
        <span className={isVisited ? 'text-gray-500' : 'text-white'}>
          {config.icon}
        </span>
        
        {/* Pulse animation for available nodes */}
        {isAvailable && !isVisited && (
          <span 
            className="absolute inset-0 rounded-lg animate-ping"
            style={{ background: config.color, opacity: 0.3 }}
          />
        )}

        {/* Node type label */}
        {isAvailable && (
          <span 
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold whitespace-nowrap"
            style={{ color: config.color }}
          >
            {isDE ? config.labelDE : config.label}
          </span>
        )}
      </motion.button>
    );
  };

  const renderConnections = () => {
    const connections: JSX.Element[] = [];
    
    map.nodes.forEach(node => {
      node.connections.forEach(targetId => {
        const targetNode = map.nodes.find(n => n.id === targetId);
        if (!targetNode) return;

        // Calculate positions
        const startX = node.x * 100;
        const startY = node.y * 80;
        const endX = targetNode.x * 100;
        const endY = targetNode.y * 80;

        const isActive = availableNodes.includes(targetId) && (node.visited || node.id === map.currentNodeId || !map.currentNodeId);

        connections.push(
          <line
            key={`${node.id}-${targetId}`}
            x1={`${startX}%`}
            y1={startY + 28}
            x2={`${endX}%`}
            y2={endY + 28}
            stroke={isActive ? '#8B5CF6' : '#374151'}
            strokeWidth={isActive ? 3 : 2}
            strokeDasharray={isActive ? 'none' : '5,5'}
            style={{
              filter: isActive ? 'drop-shadow(0 0 6px #8B5CF6)' : 'none'
            }}
          />
        );
      });
    });

    return connections;
  };

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}
    >
      {/* Header */}
      <div 
        className="sticky top-0 z-20 p-4"
        style={{ 
          background: 'linear-gradient(180deg, rgba(26,26,46,1) 0%, rgba(26,26,46,0.9) 80%, transparent 100%)',
          borderBottom: '3px solid #8B5CF6'
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onBack}
            className="p-2 flex items-center gap-2"
            style={{ background: '#374151', border: '2px solid #000' }}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          <div className="text-center">
            <h2 className="text-lg font-black text-white">
              {isDE ? act?.nameDE || 'Akt' : act?.name || 'Act'} {currentAct}
            </h2>
            <p className="text-xs text-gray-400">
              Floor {currentFloor}/50
            </p>
          </div>

          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Player Stats Bar */}
        <div className="flex items-center justify-between gap-4">
          {/* HP */}
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            <div className="flex items-center gap-1">
              <span className="font-bold text-white">{playerHp}</span>
              <span className="text-gray-400">/ {playerMaxHp}</span>
            </div>
          </div>

          {/* Gold */}
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-yellow-400" />
            <span className="font-bold text-yellow-400">{playerGold}</span>
          </div>

          {/* Deck */}
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" />
            <span className="font-bold text-white">{deckSize}</span>
          </div>
        </div>

        {/* HP Bar */}
        <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(playerHp / playerMaxHp) * 100}%` }}
            className="h-full"
            style={{ 
              background: playerHp > playerMaxHp * 0.5 
                ? 'linear-gradient(90deg, #10B981, #34D399)' 
                : playerHp > playerMaxHp * 0.25 
                  ? 'linear-gradient(90deg, #F59E0B, #FBBF24)'
                  : 'linear-gradient(90deg, #EF4444, #F87171)'
            }}
          />
        </div>
      </div>

      {/* Map Container */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 pb-20"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="relative max-w-md mx-auto" style={{ minHeight: `${sortedFloors.length * 80 + 100}px` }}>
          {/* SVG for connections */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ minHeight: `${sortedFloors.length * 80 + 100}px` }}
          >
            {renderConnections()}
          </svg>

          {/* Nodes by floor */}
          {sortedFloors.map(floor => {
            const nodes = floorGroups.get(floor) || [];
            const floorIndex = sortedFloors.indexOf(floor);
            
            return (
              <div
                key={floor}
                className="absolute w-full flex justify-around items-center px-4"
                style={{ 
                  top: `${floorIndex * 80}px`,
                  height: '56px'
                }}
              >
                {/* Floor indicator */}
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-mono">
                  {floor + 1}
                </div>

                {/* Nodes */}
                <div className="flex justify-around w-full gap-2">
                  {nodes.map(node => renderNode(node))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div 
        className="sticky bottom-0 p-3 overflow-x-auto"
        style={{ 
          background: 'linear-gradient(0deg, rgba(26,26,46,1) 0%, rgba(26,26,46,0.95) 80%, transparent 100%)',
          borderTop: '2px solid #374151'
        }}
      >
        <div className="flex gap-4 justify-center min-w-max">
          {Object.entries(NODE_CONFIG).map(([type, config]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div 
                className="w-6 h-6 rounded flex items-center justify-center"
                style={{ background: config.color }}
              >
                {React.cloneElement(config.icon as React.ReactElement, { className: 'w-3.5 h-3.5 text-white' })}
              </div>
              <span className="text-xs text-gray-400">
                {isDE ? config.labelDE : config.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeckbuilderMapView;
