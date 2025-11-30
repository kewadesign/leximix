// ============================================
// KARTENSCHMIEDE - Map View Component (FIXED)
// ============================================
// Neo-Brutalist roguelike map with proper scrolling

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Coins, Layers, Swords, Skull, ShoppingBag, Coffee, Gift, HelpCircle, Crown } from 'lucide-react';
import { GameMap, MapNode, MapNodeType } from '../../utils/deckbuilder/types';
import { ACTS, getAvailableNodes } from '../../utils/deckbuilder/mapGeneration';
import { audio } from '../../utils/audio';

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

// Node type configuration - Neo-Brutalist colors
const NODE_CONFIG: Record<MapNodeType, { icon: React.ReactNode; color: string; label: string; labelDE: string }> = {
  combat: { icon: <Swords className="w-6 h-6" />, color: '#FF006E', label: 'Combat', labelDE: 'Kampf' },
  elite: { icon: <Skull className="w-6 h-6" />, color: '#FFB800', label: 'Elite', labelDE: 'Elite' },
  boss: { icon: <Crown className="w-6 h-6" />, color: '#DC2626', label: 'Boss', labelDE: 'Boss' },
  shop: { icon: <ShoppingBag className="w-6 h-6" />, color: '#06FFA5', label: 'Shop', labelDE: 'Shop' },
  rest: { icon: <Coffee className="w-6 h-6" />, color: '#00D9FF', label: 'Rest', labelDE: 'Rasten' },
  treasure: { icon: <Gift className="w-6 h-6" />, color: '#FBBF24', label: 'Treasure', labelDE: 'Schatz' },
  event: { icon: <HelpCircle className="w-6 h-6" />, color: '#8B5CF6', label: 'Event', labelDE: 'Ereignis' },
};

const FLOOR_HEIGHT = 100; // px between floors

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

  // Get available nodes - recalculate on every render for safety
  useEffect(() => {
    const available = getAvailableNodes(map);
    const availableIds = available.map(n => n.id);
    setAvailableNodes(availableIds);
    console.log('[Map] Current node:', map.currentNodeId);
    console.log('[Map] Available nodes:', availableIds);
    console.log('[Map] Total nodes:', map.nodes.length);
  }, [map, map.currentNodeId]);

  // Group nodes by floor (y value)
  const floorGroups: Map<number, MapNode[]> = new Map();
  map.nodes.forEach(node => {
    if (!floorGroups.has(node.y)) {
      floorGroups.set(node.y, []);
    }
    floorGroups.get(node.y)!.push(node);
  });

  // Sort floors ascending (0 at bottom, 49 at top)
  const sortedFloors = Array.from(floorGroups.keys()).sort((a, b) => a - b);
  const totalFloors = sortedFloors.length;
  const mapHeight = totalFloors * FLOOR_HEIGHT + 150;

  // Auto-scroll to bottom (start) on mount
  useEffect(() => {
    if (scrollRef.current) {
      // Scroll to bottom to show floor 1
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    }
  }, []);

  // Get visual Y position (inverted: floor 0 at bottom, floor 49 at top)
  const getVisualY = (floorY: number): number => {
    return (totalFloors - 1 - floorY) * FLOOR_HEIGHT + 50;
  };

  const handleNodeClick = (nodeId: string) => {
    console.log('[Map] Node clicked:', nodeId, 'Available:', availableNodes.includes(nodeId));
    audio.playSelect();
    onNodeSelect(nodeId);
  };
  
  const handleNodeHover = (nodeId: string, isAvailable: boolean) => {
    if (isAvailable) {
      audio.playHover();
    }
  };

  const renderNode = (node: MapNode) => {
    const config = NODE_CONFIG[node.type];
    const isAvailable = availableNodes.includes(node.id);
    const isVisited = node.visited;
    const isCurrent = node.id === map.currentNodeId;

    return (
      <motion.div
        key={node.id}
        whileHover={isAvailable && !isVisited ? { scale: 1.15 } : {}}
        whileTap={isAvailable && !isVisited ? { scale: 0.95 } : {}}
        onClick={() => {
          if (isAvailable) {
            handleNodeClick(node.id);
          }
        }}
        onMouseEnter={() => handleNodeHover(node.id, isAvailable && !isVisited)}
        className="relative flex items-center justify-center cursor-pointer"
        style={{
          width: '56px',
          height: '56px',
          background: isVisited 
            ? '#374151' 
            : isAvailable 
              ? config.color 
              : '#1F2937',
          border: `4px solid ${isVisited ? '#4B5563' : '#000'}`,
          boxShadow: isAvailable && !isVisited 
            ? '6px 6px 0 #000' 
            : isVisited 
              ? '2px 2px 0 #000' 
              : 'none',
          opacity: isVisited ? 0.5 : isAvailable ? 1 : 0.3,
          cursor: isAvailable ? 'pointer' : 'default',
          borderRadius: '8px',
          transition: 'transform 0.2s, box-shadow 0.2s',
          transform: isCurrent ? 'scale(1.1)' : isAvailable ? 'scale(1)' : 'scale(0.9)',
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

        {/* Current indicator */}
        {isCurrent && (
          <span className="absolute -inset-1 border-4 border-white rounded-lg animate-pulse" />
        )}
        
        {/* Label for available nodes */}
        {isAvailable && !isVisited && (
          <span 
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black whitespace-nowrap uppercase"
            style={{ color: config.color }}
          >
            {isDE ? config.labelDE : config.label}
          </span>
        )}
      </motion.div>
    );
  };

  const renderConnections = () => {
    const lines: JSX.Element[] = [];
    
    map.nodes.forEach(node => {
      node.connections.forEach(targetId => {
        const targetNode = map.nodes.find(n => n.id === targetId);
        if (!targetNode) return;

        // Get x positions (0-1 range converted to percentage)
        const startX = node.x * 100;
        const endX = targetNode.x * 100;
        
        // Get visual y positions
        const startY = getVisualY(node.y) + 28; // Center of node
        const endY = getVisualY(targetNode.y) + 28;

        const isActive = availableNodes.includes(targetId) && 
          (node.visited || node.id === map.currentNodeId || !map.currentNodeId);

        lines.push(
          <line
            key={`${node.id}-${targetId}`}
            x1={`${startX}%`}
            y1={startY}
            x2={`${endX}%`}
            y2={endY}
            stroke={isActive ? '#8B5CF6' : '#374151'}
            strokeWidth={isActive ? 4 : 2}
            strokeDasharray={isActive ? 'none' : '8,4'}
            style={{
              filter: isActive ? 'drop-shadow(0 0 8px #8B5CF6)' : 'none'
            }}
          />
        );
      });
    });

    return lines;
  };

  return (
    <div className="h-full flex flex-col bg-gray-900" style={{ minHeight: '100vh', maxHeight: '100vh' }}>
      {/* Header - Neo-Brutalist Style */}
      <div 
        className="sticky top-0 z-20 p-4"
        style={{ 
          background: '#1F2937',
          borderBottom: '4px solid #000',
          boxShadow: '0 4px 0 #000'
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              audio.playClose();
              onBack();
            }}
            onMouseEnter={() => audio.playHover()}
            className="p-2 flex items-center gap-2 font-black uppercase"
            style={{ 
              background: '#FF006E', 
              border: '3px solid #000',
              boxShadow: '4px 4px 0 #000',
              color: '#FFF'
            }}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>

          <div 
            className="text-center px-4 py-2"
            style={{
              background: '#8B5CF6',
              border: '3px solid #000',
              boxShadow: '4px 4px 0 #000'
            }}
          >
            <h2 className="text-lg font-black text-white uppercase">
              {isDE ? act?.nameDE || 'Akt' : act?.name || 'Act'} {currentAct}
            </h2>
            <p className="text-xs font-bold text-white/80">
              Floor {currentFloor}/50
            </p>
          </div>

          <div className="w-14" />
        </div>

        {/* Player Stats Bar - Neo-Brutalist */}
        <div className="flex items-center justify-between gap-2">
          {/* HP */}
          <div 
            className="flex items-center gap-2 px-3 py-1"
            style={{
              background: '#EF4444',
              border: '3px solid #000',
              boxShadow: '3px 3px 0 #000'
            }}
          >
            <Heart className="w-5 h-5 text-white" fill="white" />
            <span className="font-black text-white">{playerHp}/{playerMaxHp}</span>
          </div>

          {/* Gold */}
          <div 
            className="flex items-center gap-2 px-3 py-1"
            style={{
              background: '#FBBF24',
              border: '3px solid #000',
              boxShadow: '3px 3px 0 #000'
            }}
          >
            <Coins className="w-5 h-5 text-black" />
            <span className="font-black text-black">{playerGold}</span>
          </div>

          {/* Deck */}
          <div 
            className="flex items-center gap-2 px-3 py-1"
            style={{
              background: '#8B5CF6',
              border: '3px solid #000',
              boxShadow: '3px 3px 0 #000'
            }}
          >
            <Layers className="w-5 h-5 text-white" />
            <span className="font-black text-white">{deckSize}</span>
          </div>
        </div>
      </div>

      {/* Map Container - Scrollable */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-scroll overflow-x-hidden"
        style={{ 
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y',
          overscrollBehavior: 'contain',
          minHeight: 0
        }}
      >
        <div 
          className="relative mx-auto"
          style={{ 
            width: '100%',
            maxWidth: '400px',
            height: `${mapHeight}px`,
            padding: '20px'
          }}
        >
          {/* SVG for connections */}
          <svg 
            className="absolute inset-0 w-full pointer-events-none"
            style={{ height: `${mapHeight}px` }}
            preserveAspectRatio="none"
          >
            {renderConnections()}
          </svg>

          {/* Nodes by floor */}
          {sortedFloors.map(floorY => {
            const nodes = floorGroups.get(floorY) || [];
            const visualY = getVisualY(floorY);
            
            return (
              <div
                key={floorY}
                className="absolute left-0 right-0 flex justify-around items-center px-8"
                style={{ 
                  top: `${visualY}px`,
                  height: '56px'
                }}
              >
                {/* Floor indicator */}
                <div 
                  className="absolute left-1 top-1/2 -translate-y-1/2 text-xs font-black px-1"
                  style={{ 
                    background: '#374151',
                    color: '#9CA3AF',
                    border: '1px solid #4B5563'
                  }}
                >
                  {floorY + 1}
                </div>

                {/* Nodes */}
                {nodes.map(node => renderNode(node))}
              </div>
            );
          })}

          {/* Start indicator */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 font-black text-sm uppercase px-4 py-2"
            style={{ 
              bottom: '10px',
              background: '#06FFA5',
              color: '#000',
              border: '3px solid #000',
              boxShadow: '4px 4px 0 #000'
            }}
          >
            {isDE ? 'START' : 'START'}
          </div>

          {/* Boss indicator */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 font-black text-sm uppercase px-4 py-2"
            style={{ 
              top: '10px',
              background: '#DC2626',
              color: '#FFF',
              border: '3px solid #000',
              boxShadow: '4px 4px 0 #000'
            }}
          >
            {isDE ? 'BOSS' : 'BOSS'}
          </div>
        </div>
      </div>

      {/* Legend - Neo-Brutalist */}
      <div 
        className="sticky bottom-0 p-3"
        style={{ 
          background: '#1F2937',
          borderTop: '4px solid #000'
        }}
      >
        <div className="flex gap-3 justify-center flex-wrap">
          {Object.entries(NODE_CONFIG).map(([type, config]) => (
            <div 
              key={type} 
              className="flex items-center gap-1.5 px-2 py-1"
              style={{
                background: config.color,
                border: '2px solid #000',
                boxShadow: '2px 2px 0 #000'
              }}
            >
              {React.cloneElement(config.icon as React.ReactElement, { 
                className: 'w-4 h-4 text-white' 
              })}
              <span className="text-xs font-bold text-white">
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
