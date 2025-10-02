export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url?: string;
          role: 'owner' | 'user';
          created_at: string;
        };
      };
      spaces: {
        Row: {
            id: string | null | undefined;
            name: string,
            capacity: number,
            location: string,
            description: string,
            pph: string, // or a number if column type changes
            ownerid: string,
            organizationid?: number,
            updated_at?: string | null;
            category?: 'Wedding' | 'Corporate' | 'Birthday' | 'Conference' | 'Social';
            amenities?: string[];
        };
      };
      organisations: {
        Row: {
          id: string;
          user_id: string;
          organisation_id: string;
          created_at: string;
        };
      };      
    };
  };
};

export type UserProfile = Database['public']['Tables']['users']['Row'];
export type Space = Database['public']['Tables']['spaces']['Row'];
export type Organisation = Database['public']['Tables']['organisations']['Row'];