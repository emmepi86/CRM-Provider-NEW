import React, { useState, useEffect } from 'react';
import {
  Hash,
  Lock,
  Users,
  MessageCircle,
  Plus,
  ChevronDown,
  ChevronRight,
  Settings,
} from 'lucide-react';
import { ChatChannel, ChatGroup, ChannelType } from '../../types/chat';
import { chatAPI } from '../../api/chat';

interface ChannelListProps {
  selectedChannelId?: number;
  selectedGroupId?: number;
  onSelectChannel: (channel: ChatChannel) => void;
  onSelectGroup: (group: ChatGroup) => void;
  onCreateChannel?: () => void;
  onCreateGroup?: () => void;
}

export const ChannelList: React.FC<ChannelListProps> = ({
  selectedChannelId,
  selectedGroupId,
  onSelectChannel,
  onSelectGroup,
  onCreateChannel,
  onCreateGroup,
}) => {
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedChannels, setExpandedChannels] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState(true);
  const [expandedDMs, setExpandedDMs] = useState(true);

  useEffect(() => {
    fetchChannelsAndGroups();
  }, []);

  const fetchChannelsAndGroups = async () => {
    setLoading(true);
    try {
      const [channelsData, groupsData] = await Promise.all([
        chatAPI.listChannels(),
        chatAPI.listGroups(),
      ]);
      setChannels(channelsData);
      setGroups(groupsData);
    } catch (error) {
      console.error('Failed to fetch channels/groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChannelIcon = (channel: ChatChannel) => {
    switch (channel.channel_type) {
      case ChannelType.PUBLIC:
        return <Hash className="w-4 h-4" />;
      case ChannelType.PRIVATE:
        return <Lock className="w-4 h-4" />;
      case ChannelType.DEPARTMENT:
        return <Users className="w-4 h-4" />;
      default:
        return <Hash className="w-4 h-4" />;
    }
  };

  const publicChannels = channels.filter(
    (c) => c.channel_type === ChannelType.PUBLIC
  );
  const privateChannels = channels.filter(
    (c) => c.channel_type === ChannelType.PRIVATE
  );
  const directMessages = groups.filter((g) => g.is_dm);
  const privateGroups = groups.filter((g) => !g.is_dm);

  if (loading) {
    return (
      <div className="w-64 bg-gray-800 text-white flex items-center justify-center">
        <div className="text-sm text-gray-400">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="font-semibold text-lg">Chat Interna</h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Public Channels Section */}
        <div className="py-2">
          <button
            onClick={() => setExpandedChannels(!expandedChannels)}
            className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-700 text-sm font-semibold text-gray-300"
          >
            <span className="flex items-center">
              {expandedChannels ? (
                <ChevronDown className="w-4 h-4 mr-1" />
              ) : (
                <ChevronRight className="w-4 h-4 mr-1" />
              )}
              Canali Pubblici
            </span>
            {onCreateChannel && (
              <Plus
                className="w-4 h-4 hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateChannel();
                }}
              />
            )}
          </button>

          {expandedChannels && (
            <div>
              {publicChannels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => onSelectChannel(channel)}
                  className={`w-full px-6 py-2 flex items-center space-x-2 hover:bg-gray-700 ${
                    selectedChannelId === channel.id
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : ''
                  }`}
                >
                  {getChannelIcon(channel)}
                  <span className="text-sm truncate">{channel.name}</span>
                </button>
              ))}
              {publicChannels.length === 0 && (
                <div className="px-6 py-2 text-xs text-gray-400">
                  Nessun canale pubblico
                </div>
              )}
            </div>
          )}
        </div>

        {/* Private Channels Section */}
        {privateChannels.length > 0 && (
          <div className="py-2">
            <button
              onClick={() => setExpandedChannels(!expandedChannels)}
              className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-700 text-sm font-semibold text-gray-300"
            >
              <span className="flex items-center">
                {expandedChannels ? (
                  <ChevronDown className="w-4 h-4 mr-1" />
                ) : (
                  <ChevronRight className="w-4 h-4 mr-1" />
                )}
                Canali Privati
              </span>
            </button>

            {expandedChannels && (
              <div>
                {privateChannels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => onSelectChannel(channel)}
                    className={`w-full px-6 py-2 flex items-center space-x-2 hover:bg-gray-700 ${
                      selectedChannelId === channel.id
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : ''
                    }`}
                  >
                    {getChannelIcon(channel)}
                    <span className="text-sm truncate">{channel.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Direct Messages Section */}
        <div className="py-2">
          <button
            onClick={() => setExpandedDMs(!expandedDMs)}
            className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-700 text-sm font-semibold text-gray-300"
          >
            <span className="flex items-center">
              {expandedDMs ? (
                <ChevronDown className="w-4 h-4 mr-1" />
              ) : (
                <ChevronRight className="w-4 h-4 mr-1" />
              )}
              Messaggi Diretti
            </span>
            {onCreateGroup && (
              <Plus
                className="w-4 h-4 hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateGroup();
                }}
              />
            )}
          </button>

          {expandedDMs && (
            <div>
              {directMessages.map((group) => (
                <button
                  key={group.id}
                  onClick={() => onSelectGroup(group)}
                  className={`w-full px-6 py-2 flex items-center space-x-2 hover:bg-gray-700 ${
                    selectedGroupId === group.id
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : ''
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm truncate">{group.name}</span>
                </button>
              ))}
              {directMessages.length === 0 && (
                <div className="px-6 py-2 text-xs text-gray-400">
                  Nessun messaggio diretto
                </div>
              )}
            </div>
          )}
        </div>

        {/* Private Groups Section */}
        {privateGroups.length > 0 && (
          <div className="py-2">
            <button
              onClick={() => setExpandedGroups(!expandedGroups)}
              className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-700 text-sm font-semibold text-gray-300"
            >
              <span className="flex items-center">
                {expandedGroups ? (
                  <ChevronDown className="w-4 h-4 mr-1" />
                ) : (
                  <ChevronRight className="w-4 h-4 mr-1" />
                )}
                Gruppi Privati
              </span>
            </button>

            {expandedGroups && (
              <div>
                {privateGroups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => onSelectGroup(group)}
                    className={`w-full px-6 py-2 flex items-center space-x-2 hover:bg-gray-700 ${
                      selectedGroupId === group.id
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : ''
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span className="text-sm truncate">{group.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer / Settings */}
      <div className="p-4 border-t border-gray-700">
        <button className="w-full flex items-center space-x-2 text-sm text-gray-300 hover:text-white">
          <Settings className="w-4 h-4" />
          <span>Impostazioni</span>
        </button>
      </div>
    </div>
  );
};
