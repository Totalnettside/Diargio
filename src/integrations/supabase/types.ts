export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      account_library: {
        Row: {
          data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          data?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      administrative_actions: {
        Row: {
          action: string
          actor_id: string
          after_data: Json | null
          before_data: Json | null
          created_at: string
          id: string
          internal_note: string | null
          reason: string | null
          target_id: string
          target_type: string
        }
        Insert: {
          action: string
          actor_id: string
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          id?: string
          internal_note?: string | null
          reason?: string | null
          target_id: string
          target_type: string
        }
        Update: {
          action?: string
          actor_id?: string
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          id?: string
          internal_note?: string | null
          reason?: string | null
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      art_exhibitions: {
        Row: {
          created_at: string
          id: string
          published: boolean
          rooms: Json
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          published?: boolean
          rooms?: Json
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          published?: boolean
          rooms?: Json
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      art_orders: {
        Row: {
          admin_note: string | null
          approved_at: string | null
          artwork_amount: number
          buyer_id: string
          created_at: string
          currency: string
          dispute_note: string | null
          environment: string
          expires_at: string
          id: string
          listing_id: string
          paid_at: string | null
          seller_id: string
          shipping_amount: number
          shipping_note: string | null
          snapshot: Json
          status: string
          stripe_payment_id: string | null
          stripe_refund_id: string | null
          stripe_session_id: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          admin_note?: string | null
          approved_at?: string | null
          artwork_amount: number
          buyer_id: string
          created_at?: string
          currency?: string
          dispute_note?: string | null
          environment: string
          expires_at?: string
          id?: string
          listing_id: string
          paid_at?: string | null
          seller_id: string
          shipping_amount?: number
          shipping_note?: string | null
          snapshot: Json
          status?: string
          stripe_payment_id?: string | null
          stripe_refund_id?: string | null
          stripe_session_id?: string | null
          total_amount: number
          updated_at?: string
        }
        Update: {
          admin_note?: string | null
          approved_at?: string | null
          artwork_amount?: number
          buyer_id?: string
          created_at?: string
          currency?: string
          dispute_note?: string | null
          environment?: string
          expires_at?: string
          id?: string
          listing_id?: string
          paid_at?: string | null
          seller_id?: string
          shipping_amount?: number
          shipping_note?: string | null
          snapshot?: Json
          status?: string
          stripe_payment_id?: string | null
          stripe_refund_id?: string | null
          stripe_session_id?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      art_walls: {
        Row: {
          created_at: string
          id: string
          layout: Json
          name: string
          shared: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          layout?: Json
          name?: string
          shared?: boolean
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          layout?: Json
          name?: string
          shared?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      artist_follows: {
        Row: {
          artist_id: string
          created_at: string
          follower_id: string
          last_seen_at: string
        }
        Insert: {
          artist_id: string
          created_at?: string
          follower_id?: string
          last_seen_at?: string
        }
        Update: {
          artist_id?: string
          created_at?: string
          follower_id?: string
          last_seen_at?: string
        }
        Relationships: []
      }
      artist_payment_accounts: {
        Row: {
          created_at: string
          environment: string
          stripe_account_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          environment: string
          stripe_account_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          environment?: string
          stripe_account_id?: string
          user_id?: string
        }
        Relationships: []
      }
      bids: {
        Row: {
          amount: number
          buyer_id: string
          conversation_id: string | null
          created_at: string
          decided_at: string | null
          id: string
          listing_id: string
          message: string | null
          read_at: string | null
          seller_id: string
          status: string
        }
        Insert: {
          amount: number
          buyer_id?: string
          conversation_id?: string | null
          created_at?: string
          decided_at?: string | null
          id?: string
          listing_id: string
          message?: string | null
          read_at?: string | null
          seller_id: string
          status?: string
        }
        Update: {
          amount?: number
          buyer_id?: string
          conversation_id?: string | null
          created_at?: string
          decided_at?: string | null
          id?: string
          listing_id?: string
          message?: string | null
          read_at?: string | null
          seller_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "bids_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bids_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          listing_id: string
          seller_id: string
          updated_at: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          listing_id: string
          seller_id: string
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          listing_id?: string
          seller_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      listing_review_events: {
        Row: {
          actor_id: string
          created_at: string
          decision: string
          email_error: string | null
          email_retry_at: string | null
          email_status: string
          id: string
          listing_id: string
          price: number
          read_at: string | null
          reason: string | null
          reviewed_data: Json | null
          revision_id: string | null
          title: string
          user_id: string
          version: number
        }
        Insert: {
          actor_id: string
          created_at?: string
          decision: string
          email_error?: string | null
          email_retry_at?: string | null
          email_status?: string
          id?: string
          listing_id: string
          price?: number
          read_at?: string | null
          reason?: string | null
          reviewed_data?: Json | null
          revision_id?: string | null
          title: string
          user_id: string
          version: number
        }
        Update: {
          actor_id?: string
          created_at?: string
          decision?: string
          email_error?: string | null
          email_retry_at?: string | null
          email_status?: string
          id?: string
          listing_id?: string
          price?: number
          read_at?: string | null
          reason?: string | null
          reviewed_data?: Json | null
          revision_id?: string | null
          title?: string
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "listing_review_events_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_review_events_revision_id_fkey"
            columns: ["revision_id"]
            isOneToOne: false
            referencedRelation: "listing_revisions"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_review_notes: {
        Row: {
          event_id: string
          note: string
        }
        Insert: {
          event_id: string
          note: string
        }
        Update: {
          event_id?: string
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_review_notes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "listing_review_events"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_revisions: {
        Row: {
          created_at: string
          data: Json
          id: string
          listing_id: string
          seller_message: string | null
          status: string
          submitted_at: string | null
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          created_at?: string
          data: Json
          id?: string
          listing_id: string
          seller_message?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          listing_id?: string
          seller_message?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "listing_revisions_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          blocked: boolean
          created_at: string
          data: Json
          deleted_at: string | null
          id: string
          moderation_status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          blocked?: boolean
          created_at?: string
          data: Json
          deleted_at?: string | null
          id: string
          moderation_status?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          blocked?: boolean
          created_at?: string
          data?: Json
          deleted_at?: string | null
          id?: string
          moderation_status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_events: {
        Row: {
          created_at: string
          environment: string
          event_id: string
          processed_at: string | null
          processing_until: string | null
        }
        Insert: {
          created_at?: string
          environment: string
          event_id: string
          processed_at?: string | null
          processing_until?: string | null
        }
        Update: {
          created_at?: string
          environment?: string
          event_id?: string
          processed_at?: string | null
          processing_until?: string | null
        }
        Relationships: []
      }
      profile_restrictions: {
        Row: {
          blocked: boolean
          reason: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          blocked?: boolean
          reason?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          blocked?: boolean
          reason?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_restrictions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bankid_verified: boolean
          bio: string | null
          created_at: string
          display_name: string | null
          first_name: string | null
          id: string
          last_name: string | null
          location: string | null
          onboarded: boolean
          phone: string | null
          story: string | null
          studio_images: string[]
          techniques: string[]
          updated_at: string
          vipps_sub: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bankid_verified?: boolean
          bio?: string | null
          created_at?: string
          display_name?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          location?: string | null
          onboarded?: boolean
          phone?: string | null
          story?: string | null
          studio_images?: string[]
          techniques?: string[]
          updated_at?: string
          vipps_sub?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bankid_verified?: boolean
          bio?: string | null
          created_at?: string
          display_name?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          location?: string | null
          onboarded?: boolean
          phone?: string | null
          story?: string | null
          studio_images?: string[]
          techniques?: string[]
          updated_at?: string
          vipps_sub?: string | null
          website?: string | null
        }
        Relationships: []
      }
      purchases: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          listing_id: string
          seller_id: string
        }
        Insert: {
          buyer_id?: string
          created_at?: string
          id?: string
          listing_id: string
          seller_id: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          listing_id?: string
          seller_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          reviewer_id: string
          seller_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          reviewer_id?: string
          seller_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          reviewer_id?: string
          seller_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_save_listing_revision: {
        Args: { _data: Json; _id: string; _note?: string; _reason?: string }
        Returns: string
      }
      artist_follower_count: { Args: { _artist: string }; Returns: number }
      change_listing_visibility: {
        Args: { _action: string; _id: string }
        Returns: undefined
      }
      claim_payment_event: {
        Args: { _environment: string; _event: string }
        Returns: boolean
      }
      confirm_art_payment: {
        Args: {
          _amount: number
          _currency: string
          _order: string
          _payment: string
          _session: string
        }
        Returns: undefined
      }
      decide_artwork_bid: {
        Args: { _bid_id: string; _decision: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_conversation_member: {
        Args: { _cid: string; _uid: string }
        Returns: boolean
      }
      manage_listing_visibility: {
        Args: { _action: string; _id: string; _note?: string; _reason?: string }
        Returns: undefined
      }
      manage_profile_restriction: {
        Args: {
          _blocked: boolean
          _note?: string
          _reason: string
          _user: string
        }
        Returns: undefined
      }
      mark_review_events_read: { Args: never; Returns: undefined }
      profile_is_blocked: { Args: { _user: string }; Returns: boolean }
      reserve_art_order: {
        Args: {
          _artwork: number
          _buyer: string
          _environment: string
          _listing: string
          _shipping: number
          _snapshot: Json
        }
        Returns: {
          admin_note: string | null
          approved_at: string | null
          artwork_amount: number
          buyer_id: string
          created_at: string
          currency: string
          dispute_note: string | null
          environment: string
          expires_at: string
          id: string
          listing_id: string
          paid_at: string | null
          seller_id: string
          shipping_amount: number
          shipping_note: string | null
          snapshot: Json
          status: string
          stripe_payment_id: string | null
          stripe_refund_id: string | null
          stripe_session_id: string | null
          total_amount: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "art_orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      review_listing_revision: {
        Args: {
          _decision: string
          _note: string
          _reason: string
          _revision: string
          _version: number
        }
        Returns: string
      }
      save_listing_revision: {
        Args: { _data: Json; _id: string }
        Returns: string
      }
      sold_listing_ids: { Args: { _seller: string }; Returns: string[] }
      submit_artwork_bid: {
        Args: { _amount: number; _listing_id: string; _message?: string }
        Returns: string
      }
      submit_listing_revision: { Args: { _id: string }; Returns: string }
      unavailable_artwork_ids: { Args: never; Returns: string[] }
      validate_review_content: { Args: { _data: Json }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
