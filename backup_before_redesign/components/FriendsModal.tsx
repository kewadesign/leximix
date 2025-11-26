import React from 'react';
import { Modal, Button } from './UI';
import { User } from 'lucide-react';
import { FriendCodeDisplay } from './FriendCodeDisplay';

interface FriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  friendCode?: string;
  onAddFriend: (code: string) => void;
}

export const FriendsModal: React.FC<FriendsModalProps> = ({ isOpen, onClose, friendCode, onAddFriend }) => {
  const [inputCode, setInputCode] = React.useState('');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Freunde">
      <div className="space-y-6">
        {/* Friend Code Display */}
        <FriendCodeDisplay code={friendCode || ''} />

        {/* Online Friends List (Placeholder) */}
        <div className="space-y-2">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online
            </p>
            <div className="p-4 bg-white/5 rounded-xl flex flex-col items-center justify-center text-center min-h-[100px] border border-white/5 border-dashed">
                <User size={24} className="text-gray-600 mb-2" />
                <p className="text-gray-500 text-xs font-medium">Keine Freunde online</p>
            </div>
        </div>

        {/* Add Friend Input */}
        <div className="flex gap-2">
            <input 
                type="text" 
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="CODE EINGEBEN"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 text-center font-mono uppercase text-white focus:border-cyan-400 outline-none"
                maxLength={6}
            />
            <Button onClick={() => { onAddFriend(inputCode); setInputCode(''); }} disabled={inputCode.length < 6}>
                ADD
            </Button>
        </div>
      </div>
    </Modal>
  );
};
