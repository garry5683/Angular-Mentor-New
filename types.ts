
export interface Question {
  id: string;
  text: string;
  category?: string;
  cachedAnswer?: string;
  isCustom?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export enum AuthMode {
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP'
}

export interface AudioState {
  isPlaying: boolean;
  activeId: string | null;
}
