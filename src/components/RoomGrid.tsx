import { useState, useCallback } from 'react';
import { useGameStore } from '../engine/gameStore';
import type { Room, ValidationResult } from '../types/game';
import { RoomCell } from './RoomCell';
import { RoomDetailPanel } from './RoomDetailPanel';

interface Props {
  dragOverRoomId: string | null;
  roomValidations: Map<string, ValidationResult>;
}

export function RoomGrid({ dragOverRoomId, roomValidations }: Props) {
  const rooms = useGameStore((s) => s.rooms);
  const aiSuggestion = useGameStore((s) => s.aiSuggestion);
  const [hoveredRoom, setHoveredRoom] = useState<Room | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  const handleHover = useCallback((room: Room, e: React.MouseEvent) => {
    setHoveredRoom(room);
    setHoverPos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleHoverEnd = useCallback(() => {
    setHoveredRoom(null);
    setHoverPos(null);
  }, []);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 h-full">
        {rooms.map((room) => (
          <RoomCell
            key={room.id}
            room={room}
            validationResult={
              dragOverRoomId === room.id
                ? (roomValidations.get(room.id) ?? null)
                : null
            }
            isSuggested={aiSuggestion?.roomId === room.id}
            onHover={handleHover}
            onHoverEnd={handleHoverEnd}
          />
        ))}
      </div>
      <RoomDetailPanel room={hoveredRoom} position={hoverPos} />
    </>
  );
}
