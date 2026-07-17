export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          handle: string;
          display_name: string;
          headline: string | null;
          bio: string | null;
          location: string | null;
          timezone: string | null;
          avatar_url: string | null;
          avatar_initials: string | null;
          primary_cta_label: string | null;
          primary_cta_url: string | null;
          is_available: boolean;
          is_published: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          handle: string;
          display_name: string;
          headline?: string | null;
          bio?: string | null;
          location?: string | null;
          timezone?: string | null;
          avatar_url?: string | null;
          avatar_initials?: string | null;
          primary_cta_label?: string | null;
          primary_cta_url?: string | null;
          is_available?: boolean;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          handle?: string;
          display_name?: string;
          headline?: string | null;
          bio?: string | null;
          location?: string | null;
          timezone?: string | null;
          avatar_url?: string | null;
          avatar_initials?: string | null;
          primary_cta_label?: string | null;
          primary_cta_url?: string | null;
          is_available?: boolean;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      profile_links: {
        Row: {
          id: string;
          profile_id: string;
          title: string;
          url: string;
          icon_label: string | null;
          position: number;
          is_visible: boolean;
          is_enabled: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          profile_id: string;
          title: string;
          url: string;
          icon_label?: string | null;
          position?: number;
          is_visible?: boolean;
          is_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          profile_id?: string;
          title?: string;
          url?: string;
          icon_label?: string | null;
          position?: number;
          is_visible?: boolean;
          is_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      public_profile_settings: {
        Row: {
          id: string;
          profile_id: string;
          show_location: boolean;
          show_timezone: boolean;
          show_availability: boolean;
          theme: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          show_location?: boolean;
          show_timezone?: boolean;
          show_availability?: boolean;
          theme?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          show_location?: boolean;
          show_timezone?: boolean;
          show_availability?: boolean;
          theme?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          table_name: string;
          record_id: string;
          old_data: Json | null;
          new_data: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          table_name: string;
          record_id: string;
          old_data?: Json | null;
          new_data?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: string;
          table_name?: string;
          record_id?: string;
          old_data?: Json | null;
          new_data?: Json | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
