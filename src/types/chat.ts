// Chat System Types

export enum ChannelType {
  PUBLIC = 'public',
  PRIVATE = 'private',
  DEPARTMENT = 'department',
}

export enum MessageType {
  TEXT = 'text',
  SYSTEM = 'system',
  FILE = 'file',
  THREAD_REPLY = 'thread_reply',
}

export enum MemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

export interface ChatChannel {
  id: number;
  tenant_id: number;
  name: string;
  description: string | null;
  channel_type: ChannelType;
  department: string | null;
  project_id: number | null;
  event_id: number | null;
  is_read_only: boolean;
  is_archived: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface ChatChannelMember {
  id: number;
  channel_id: number;
  user_id: number;
  role: MemberRole;
  last_read_message_id: number | null;
  last_read_at: string | null;
  is_muted: boolean;
  joined_at: string;
}

export interface ChatChannelDetail extends ChatChannel {
  members: ChatChannelMember[];
  unread_count?: number;
}

export interface ChatGroup {
  id: number;
  tenant_id: number;
  name: string;
  is_dm: boolean;
  avatar_url: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface ChatGroupMember {
  id: number;
  group_id: number;
  user_id: number;
  last_read_message_id: number | null;
  last_read_at: string | null;
  is_muted: boolean;
  joined_at: string;
}

export interface ChatGroupDetail extends ChatGroup {
  members: ChatGroupMember[];
  unread_count?: number;
}

export interface ChatMessage {
  id: number;
  tenant_id: number;
  channel_id: number | null;
  group_id: number | null;
  parent_message_id: number | null;
  sender_id: number;
  message_type: MessageType;
  content: string;
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  thread_reply_count: number;
  is_edited: boolean;
  edited_at: string | null;
  is_deleted: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  reactions?: ChatReaction[];
  mentions?: ChatMention[];
  sender?: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface ChatReaction {
  id: number;
  message_id: number;
  user_id: number;
  emoji: string;
  created_at: string;
  user?: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface ChatMention {
  id: number;
  message_id: number;
  mentioned_user_id: number;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

// Request/Response Types
export interface ChatChannelCreate {
  name: string;
  description?: string;
  channel_type: ChannelType;
  department?: string;
  project_id?: number;
  event_id?: number;
  is_read_only?: boolean;
}

export interface ChatChannelUpdate {
  name?: string;
  description?: string;
  is_read_only?: boolean;
  is_archived?: boolean;
}

export interface ChatGroupCreate {
  name: string;
  is_dm: boolean;
  avatar_url?: string;
  member_user_ids: number[];
}

export interface ChatMessageCreate {
  channel_id?: number;
  group_id?: number;
  parent_message_id?: number;
  content: string;
  message_type?: MessageType;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  mentioned_user_ids?: number[];
}

export interface ChatMessageUpdate {
  content: string;
}

export interface ChatReactionCreate {
  emoji: string;
}

export interface UnreadCount {
  channel_id?: number;
  group_id?: number;
  count: number;
}

export interface MessageSearchParams {
  channel_id?: number;
  group_id?: number;
  parent_message_id?: number;
  sender_id?: number;
  query?: string;
  limit?: number;
  offset?: number;
}

export interface ChannelListParams {
  channel_type?: ChannelType;
  department?: string;
  project_id?: number;
  event_id?: number;
  is_archived?: boolean;
}

export interface GroupListParams {
  is_dm?: boolean;
}

// UI State Types
export interface ChatState {
  selectedChannel: ChatChannelDetail | null;
  selectedGroup: ChatGroupDetail | null;
  messages: ChatMessage[];
  threadMessages: ChatMessage[];
  selectedThreadMessage: ChatMessage | null;
  isLoadingMessages: boolean;
  isLoadingThread: boolean;
}
