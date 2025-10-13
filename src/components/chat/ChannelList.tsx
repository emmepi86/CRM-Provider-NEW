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
  Search,
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
  const [searchQuery, setSearchQuery] = useState('');
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
        return <Hash className="w-4 h-4 text-indigo-500" />;
      case ChannelType.PRIVATE:
        return <Lock className="w-4 h-4 text-amber-500" />;
      case ChannelType.DEPARTMENT:
        return <Users className="w-4 h-4 text-emerald-500" />;
      default:
        return <Hash className="w-4 h-4 text-indigo-500" />;
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

  // Filter based on search query
  const filterItems = (items: any[]) => {
    if (!searchQuery) return items;
    return items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  if (loading) {
    return (
      <div className="w-72 bg-white border-r border-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
          <div className="text-sm text-gray-500">Caricamento...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
        <h2 className="font-bold text-lg text-gray-900 mb-3">💬 Chat Interna</h2>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca chat..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Public Channels Section */}
        <div className="py-2">
          <button
            onClick={() => setExpandedChannels(!expandedChannels)}
            className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50 text-sm font-semibold text-gray-700 transition-colors"
          >
            <span className="flex items-center gap-2">
              {expandedChannels ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
              <span>Canali Pubblici</span>
              {publicChannels.length > 0 && (
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                  {publicChannels.length}
                </span>
              )}
            </span>
            {onCreateChannel && (
              <Plus
                className="w-4 h-4 text-gray-400 hover:text-indigo-600 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateChannel();
                }}
              />
            )}
          </button>

          {expandedChannels && (
            <div className="space-y-0.5 mt-1">
              {filterItems(publicChannels).map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => onSelectChannel(channel)}
                  className={`w-full px-4 py-2.5 flex items-center gap-3 hover:bg-indigo-50 transition-all ${
                    selectedChannelId === channel.id
                      ? 'bg-indigo-100 border-l-4 border-indigo-600'
                      : 'border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {getChannelIcon(channel)}
                  </div>
                  <span className={`text-sm truncate flex-1 text-left ${
                    selectedChannelId === channel.id
                      ? 'font-semibold text-indigo-900'
                      : 'text-gray-700'
                  }`}>
                    {channel.name}
                  </span>
                  {channel.unread_count && channel.unread_count > 0 && (
                    <span className="flex-shrink-0 bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                      {channel.unread_count > 99 ? '99+' : channel.unread_count}
                    </span>
                  )}
                </button>
              ))}
              {filterItems(publicChannels).length === 0 && (
                <div className="px-4 py-3 text-xs text-gray-400 text-center">
                  {searchQuery ? 'Nessun risultato' : 'Nessun canale pubblico'}
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
              className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50 text-sm font-semibold text-gray-700 transition-colors"
            >
              <span className="flex items-center gap-2">
                {expandedChannels ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
                <span>Canali Privati</span>
                {privateChannels.length > 0 && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                    {privateChannels.length}
                  </span>
                )}
              </span>
            </button>

            {expandedChannels && (
              <div className="space-y-0.5 mt-1">
                {filterItems(privateChannels).map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => onSelectChannel(channel)}
                    className={`w-full px-4 py-2.5 flex items-center gap-3 hover:bg-amber-50 transition-all ${
                      selectedChannelId === channel.id
                        ? 'bg-amber-100 border-l-4 border-amber-600'
                        : 'border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {getChannelIcon(channel)}
                    </div>
                    <span className={`text-sm truncate flex-1 text-left ${
                      selectedChannelId === channel.id
                        ? 'font-semibold text-amber-900'
                        : 'text-gray-700'
                    }`}>
                      {channel.name}
                    </span>
                    {channel.unread_count && channel.unread_count > 0 && (
                      <span className="flex-shrink-0 bg-amber-600 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                        {channel.unread_count > 99 ? '99+' : channel.unread_count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Direct Messages Section */}
        <div className="py-2 border-t border-gray-200 mt-2">
          <button
            onClick={() => setExpandedDMs(!expandedDMs)}
            className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50 text-sm font-semibold text-gray-700 transition-colors"
          >
            <span className="flex items-center gap-2">
              {expandedDMs ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
              <span>Messaggi Diretti</span>
              {directMessages.length > 0 && (
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                  {directMessages.length}
                </span>
              )}
            </span>
            {onCreateGroup && (
              <Plus
                className="w-4 h-4 text-gray-400 hover:text-emerald-600 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateGroup();
                }}
              />
            )}
          </button>

          {expandedDMs && (
            <div className="space-y-0.5 mt-1">
              {filterItems(directMessages).map((group) => (
                <button
                  key={group.id}
                  onClick={() => onSelectGroup(group)}
                  className={`w-full px-4 py-2.5 flex items-center gap-3 hover:bg-emerald-50 transition-all ${
                    selectedGroupId === group.id
                      ? 'bg-emerald-100 border-l-4 border-emerald-600'
                      : 'border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex-shrink-0">
                    <MessageCircle className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span className={`text-sm truncate flex-1 text-left ${
                    selectedGroupId === group.id
                      ? 'font-semibold text-emerald-900'
                      : 'text-gray-700'
                  }`}>
                    {group.name}
                  </span>
                  {group.unread_count && group.unread_count > 0 && (
                    <span className="flex-shrink-0 bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                      {group.unread_count > 99 ? '99+' : group.unread_count}
                    </span>
                  )}
                </button>
              ))}
              {filterItems(directMessages).length === 0 && (
                <div className="px-4 py-3 text-xs text-gray-400 text-center">
                  {searchQuery ? 'Nessun risultato' : 'Nessun messaggio diretto'}
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
              className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50 text-sm font-semibold text-gray-700 transition-colors"
            >
              <span className="flex items-center gap-2">
                {expandedGroups ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
                <span>Gruppi Privati</span>
                {privateGroups.length > 0 && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                    {privateGroups.length}
                  </span>
                )}
              </span>
            </button>

            {expandedGroups && (
              <div className="space-y-0.5 mt-1">
                {filterItems(privateGroups).map((group) => (
                  <button
                    key={group.id}
                    onClick={() => onSelectGroup(group)}
                    className={`w-full px-4 py-2.5 flex items-center gap-3 hover:bg-purple-50 transition-all ${
                      selectedGroupId === group.id
                        ? 'bg-purple-100 border-l-4 border-purple-600'
                        : 'border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      <Users className="w-4 h-4 text-purple-500" />
                    </div>
                    <span className={`text-sm truncate flex-1 text-left ${
                      selectedGroupId === group.id
                        ? 'font-semibold text-purple-900'
                        : 'text-gray-700'
                    }`}>
                      {group.name}
                    </span>
                    {group.unread_count && group.unread_count > 0 && (
                      <span className="flex-shrink-0 bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                        {group.unread_count > 99 ? '99+' : group.unread_count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer / Settings */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-all">
          <Settings className="w-4 h-4" />
          <span className="font-medium">Impostazioni</span>
        </button>
      </div>
    </div>
  );
};
