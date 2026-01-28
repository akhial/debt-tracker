export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      exchange_rates: {
        Row: {
          currency_code: string;
          id: string;
          rate_to_primary: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          currency_code: string;
          id?: string;
          rate_to_primary: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          currency_code?: string;
          id?: string;
          rate_to_primary?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "exchange_rates_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      people: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "people_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          id: string;
          primary_currency: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id: string;
          primary_currency?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          primary_currency?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      transaction_attachments: {
        Row: {
          content_type: string;
          created_at: string;
          file_name: string;
          file_path: string;
          file_size: number;
          id: string;
          transaction_id: string;
          user_id: string;
        };
        Insert: {
          content_type: string;
          created_at?: string;
          file_name: string;
          file_path: string;
          file_size: number;
          id?: string;
          transaction_id: string;
          user_id: string;
        };
        Update: {
          content_type?: string;
          created_at?: string;
          file_name?: string;
          file_path?: string;
          file_size?: number;
          id?: string;
          transaction_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transaction_attachments_transaction_id_fkey";
            columns: ["transaction_id"];
            isOneToOne: false;
            referencedRelation: "transactions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transaction_attachments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      transactions: {
        Row: {
          amount: number;
          created_at: string;
          currency_code: string;
          description: string | null;
          id: string;
          incurred_date: string;
          person_id: string;
          type: string;
          user_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          currency_code: string;
          description?: string | null;
          id?: string;
          incurred_date?: string;
          person_id: string;
          type: string;
          user_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          currency_code?: string;
          description?: string | null;
          id?: string;
          incurred_date?: string;
          person_id?: string;
          type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_person_id_fkey";
            columns: ["person_id"];
            isOneToOne: false;
            referencedRelation: "people";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

type DefaultSchema = Database["public"];

export type Tables<TableName extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][TableName]["Row"];

export type TablesInsert<TableName extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][TableName]["Insert"];

export type TablesUpdate<TableName extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][TableName]["Update"];
