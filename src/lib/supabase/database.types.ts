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
      page_sections: {
        Row: {
          id: string;
          profile_id: string;
          title: string;
          slug: string;
          position: number;
          is_visible: boolean;
          is_collapsed_in_editor: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          profile_id: string;
          title: string;
          slug: string;
          position?: number;
          is_visible?: boolean;
          is_collapsed_in_editor?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          profile_id?: string;
          title?: string;
          slug?: string;
          position?: number;
          is_visible?: boolean;
          is_collapsed_in_editor?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      page_blocks: {
        Row: {
          id: string;
          profile_id: string;
          section_id: string | null;
          block_type: string;
          title: string;
          position: number;
          is_visible: boolean;
          config: Json;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          profile_id: string;
          section_id?: string | null;
          block_type: string;
          title?: string;
          position?: number;
          is_visible?: boolean;
          config?: Json;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          profile_id?: string;
          section_id?: string | null;
          block_type?: string;
          title?: string;
          position?: number;
          is_visible?: boolean;
          config?: Json;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      projects: {
        Row: {
          id: string;
          profile_id: string;
          title: string;
          slug: string;
          summary: string;
          case_study_md: string;
          role: string;
          project_type: Database["public"]["Enums"]["project_type"];
          status: Database["public"]["Enums"]["project_status"];
          start_date: string | null;
          end_date: string | null;
          cover_image_url: string | null;
          cover_image_alt: string | null;
          cover_image_caption: string | null;
          lessons_learned: string | null;
          search_text: string;
          position: number;
          is_featured: boolean;
          is_visible: boolean;
          is_published: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          profile_id: string;
          title: string;
          slug: string;
          summary?: string;
          case_study_md?: string;
          role?: string;
          project_type?: Database["public"]["Enums"]["project_type"];
          status?: Database["public"]["Enums"]["project_status"];
          start_date?: string | null;
          end_date?: string | null;
          cover_image_url?: string | null;
          cover_image_alt?: string | null;
          cover_image_caption?: string | null;
          lessons_learned?: string | null;
          search_text?: string;
          position?: number;
          is_featured?: boolean;
          is_visible?: boolean;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          profile_id?: string;
          title?: string;
          slug?: string;
          summary?: string;
          case_study_md?: string;
          role?: string;
          project_type?: Database["public"]["Enums"]["project_type"];
          status?: Database["public"]["Enums"]["project_status"];
          start_date?: string | null;
          end_date?: string | null;
          cover_image_url?: string | null;
          cover_image_alt?: string | null;
          cover_image_caption?: string | null;
          lessons_learned?: string | null;
          search_text?: string;
          position?: number;
          is_featured?: boolean;
          is_visible?: boolean;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      project_technologies: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          position: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          position?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          name?: string;
          position?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      project_tags: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          position: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          position?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          name?: string;
          position?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      project_links: {
        Row: {
          id: string;
          project_id: string;
          kind: Database["public"]["Enums"]["project_link_kind"];
          url: string;
          position: number;
          is_visible: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          kind: Database["public"]["Enums"]["project_link_kind"];
          url: string;
          position?: number;
          is_visible?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          kind?: Database["public"]["Enums"]["project_link_kind"];
          url?: string;
          position?: number;
          is_visible?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      project_status: "draft" | "in_progress" | "shipped" | "archived";
      project_type:
        | "web_app"
        | "mobile_app"
        | "library"
        | "tool"
        | "design_system"
        | "open_source"
        | "experiment"
        | "other";
      project_link_kind: "live" | "repository" | "demo";
    };
  };
}
