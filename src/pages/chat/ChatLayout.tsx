import React, { useState } from 'react';
import { ChatChannel, ChatGroup, ChatMessage } from '../../types/chat';
import { ChannelList } from '../../components/chat/ChannelList';
import { ChatView } from '../../components/chat/ChatView';
import { ThreadView } from '../../components/chat/ThreadView';

export const ChatLayout: React.FC = () => {
  const [selectedChannel, setSelectedChannel] = useState<ChatChannel | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<ChatGroup | null>(null);
  const [threadMessage, setThreadMessage] = useState<ChatMessage | null>(null);

  // Get current user ID from localStorage or context
  const currentUserId = parseInt(localStorage.getItem('user_id') || '0', 10);

  const handleSelectChannel = (channel: ChatChannel) => {
    setSelectedChannel(channel);
    setSelectedGroup(null);
    setThreadMessage(null); // Close thread when switching channels
  };

  const handleSelectGroup = (group: ChatGroup) => {
    setSelectedGroup(group);
    setSelectedChannel(null);
    setThreadMessage(null); // Close thread when switching groups
  };

  const handleOpenThread = (message: ChatMessage) => {
    setThreadMessage(message);
  };

  const handleCloseThread = () => {
    setThreadMessage(null);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar - Channel/Group List */}
      <ChannelList
        selectedChannelId={selectedChannel?.id}
        selectedGroupId={selectedGroup?.id}
        onSelectChannel={handleSelectChannel}
        onSelectGroup={handleSelectGroup}
        onCreateChannel={() => {
          // TODO: Open create channel modal
          alert('Crea canale - TODO');
        }}
        onCreateGroup={() => {
          // TODO: Open create DM/group modal
          alert('Crea DM/Gruppo - TODO');
        }}
      />

      {/* Main Content - Chat View */}
      <ChatView
        channel={selectedChannel}
        group={selectedGroup}
        currentUserId={currentUserId}
        onOpenThread={handleOpenThread}
      />

      {/* Right Sidebar - Thread View (conditional) */}
      {threadMessage && (
        <ThreadView
          parentMessage={threadMessage}
          currentUserId={currentUserId}
          onClose={handleCloseThread}
        />
      )}
    </div>
  );
};
