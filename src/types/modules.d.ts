// Comprehensive TypeScript Declarations for CMFlow dependencies

declare module 'lucide-react' {
  import * as React from 'react';
  export type LucideProps = React.SVGProps<SVGSVGElement> & {
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
    className?: string;
  };
  export type LucideIcon = React.ComponentType<LucideProps>;

  export const LayoutDashboard: LucideIcon;
  export const Building2: LucideIcon;
  export const Receipt: LucideIcon;
  export const Settings2: LucideIcon;
  export const Settings: LucideIcon;
  export const ArrowUpRight: LucideIcon;
  export const ArrowDownRight: LucideIcon;
  export const ArrowLeft: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const Lock: LucideIcon;
  export const KeyRound: LucideIcon;
  export const Sparkles: LucideIcon;
  export const ExternalLink: LucideIcon;
  export const ShieldAlert: LucideIcon;
  export const ShieldCheck: LucideIcon;
  export const Shield: LucideIcon;
  export const Zap: LucideIcon;
  export const DollarSign: LucideIcon;
  export const TrendingUp: LucideIcon;
  export const Users: LucideIcon;
  export const CreditCard: LucideIcon;
  export const Clock: LucideIcon;
  export const CheckCircle2: LucideIcon;
  export const Check: LucideIcon;
  export const AlertTriangle: LucideIcon;
  export const Download: LucideIcon;
  export const Plus: LucideIcon;
  export const RefreshCw: LucideIcon;
  export const Search: LucideIcon;
  export const Filter: LucideIcon;
  export const Trash2: LucideIcon;
  export const Ban: LucideIcon;
  export const MessageSquare: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const Layers: LucideIcon;
  export const Smartphone: LucideIcon;
  export const Server: LucideIcon;
  export const Save: LucideIcon;
  export const Bell: LucideIcon;
  export const X: LucideIcon;
  export const User: LucideIcon;
  export const Mail: LucideIcon;
  export const Phone: LucideIcon;
  export const Calendar: LucideIcon;
  export const BarChart3: LucideIcon;
  export const Globe: LucideIcon;
  export const QrCode: LucideIcon;
  export const FileText: LucideIcon;
  export const HelpCircle: LucideIcon;
  export const Image: LucideIcon;
  export const Eye: LucideIcon;
  export const MessageCircle: LucideIcon;
  export const Share2: LucideIcon;
  export const FileDown: LucideIcon;
  export const Award: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const Heart: LucideIcon;
  export const Bookmark: LucideIcon;
  export const Send: LucideIcon;
  export const Printer: LucideIcon;
  export const Flame: LucideIcon;
  export const Loader2: LucideIcon;
  export const MapPin: LucideIcon;
  export const Compass: LucideIcon;
  export const Lightbulb: LucideIcon;
  export const Target: LucideIcon;
  export const Video: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const Copy: LucideIcon;
  export const RotateCcw: LucideIcon;
  export const FileCheck: LucideIcon;
  export const UploadCloud: LucideIcon;
  export const Tag: LucideIcon;
  export const FolderPlus: LucideIcon;
  export const HardDrive: LucideIcon;
  export const Type: LucideIcon;
  export const GripVertical: LucideIcon;
  export const Palette: LucideIcon;
  export const Layout: LucideIcon;
  export const Link: LucideIcon;
  export const Upload: LucideIcon;
  export const Instagram: LucideIcon;
  export const Facebook: LucideIcon;
  export const Music2: LucideIcon;
  export const ChevronUp: LucideIcon;
  export const CheckCheck: LucideIcon;
  export const ChevronLeft: LucideIcon;
  export const Edit2: LucideIcon;
  export const Linkedin: LucideIcon;
  export const Film: LucideIcon;
  export const Play: LucideIcon;
  export const MoreHorizontal: LucideIcon;
  export const FolderOpen: LucideIcon;
  export const Sliders: LucideIcon;
  export const CheckSquare: LucideIcon;
  export const Square: LucideIcon;
  export const MoreVertical: LucideIcon;
  export const Paperclip: LucideIcon;
  export const Smile: LucideIcon;
  export const Star: LucideIcon;
  export const CornerDownRight: LucideIcon;
  export const Info: LucideIcon;
  export const Link2: LucideIcon;
  export const Key: LucideIcon;
  export const Laptop: LucideIcon;
  export const Unlink: LucideIcon;
  export const PartyPopper: LucideIcon;
  export const Hourglass: LucideIcon;
  export const Volume2: LucideIcon;
  export const VolumeX: LucideIcon;
  export const Briefcase: LucideIcon;
  export const Crown: LucideIcon;
  export const EyeOff: LucideIcon;
  export const Gift: LucideIcon;
  export const Bot: LucideIcon;
}

declare module 'firebase/app' {
  export interface FirebaseApp {
    name: string;
    options: Record<string, any>;
  }
  export function initializeApp(config: any): FirebaseApp;
  export function getApps(): FirebaseApp[];
  export function getApp(): FirebaseApp;
}

declare module 'firebase/firestore' {
  export interface Firestore {
    type: string;
    app: any;
  }
  export interface Timestamp {
    seconds: number;
    nanoseconds: number;
    toDate(): Date;
    toMillis(): number;
  }
  export const Timestamp: {
    now(): Timestamp;
    fromDate(date: Date): Timestamp;
    fromMillis(millis: number): Timestamp;
  };
  export type Unsubscribe = () => void;
  export function getFirestore(app?: any): Firestore;
  export function collection(firestore: any, ...pathSegments: string[]): any;
  export function doc(firestore: any, ...pathSegments: string[]): any;
  export function getDocs(query: any): Promise<any>;
  export function getDoc(docRef: any): Promise<any>;
  export function setDoc(docRef: any, data: any, options?: any): Promise<void>;
  export function updateDoc(docRef: any, data: any): Promise<void>;
  export function deleteDoc(docRef: any): Promise<void>;
  export function query(collectionRef: any, ...queryConstraints: any[]): any;
  export function where(fieldPath: string, opStr: string, value: any): any;
  export function orderBy(fieldPath: string, directionStr?: 'asc' | 'desc'): any;
  export function limit(limitNumber: number): any;
  export function onSnapshot(reference: any, onNext: (snapshot: any) => void, onError?: (error: any) => void): Unsubscribe;
  export function serverTimestamp(): any;
  export function increment(n: number): any;
  export function arrayUnion(...elements: any[]): any;
  export function arrayRemove(...elements: any[]): any;
}

declare module 'firebase/storage' {
  export interface FirebaseStorage {
    app: any;
  }
  export interface UploadTaskSnapshot {
    bytesTransferred: number;
    totalBytes: number;
    state: string;
    ref: any;
  }
  export function getStorage(app?: any): FirebaseStorage;
  export function ref(storage: any, url?: string): any;
  export function uploadBytesResumable(ref: any, data: any, metadata?: any): any;
  export function getDownloadURL(ref: any): Promise<string>;
}

declare module 'firebase/auth' {
  export interface User {
    uid: string;
    email?: string | null;
    displayName?: string | null;
    photoURL?: string | null;
    getIdTokenResult(forceRefresh?: boolean): Promise<any>;
  }
  export interface UserCredential {
    user: User;
  }
  export interface Auth {
    app: any;
    currentUser: User | null;
  }
  export function getAuth(app?: any): Auth;
  export function onAuthStateChanged(
    auth: any,
    nextOrObserver: (user: User | null) => void,
    error?: (a: any) => void,
    completed?: () => void
  ): () => void;
  export function createUserWithEmailAndPassword(auth: any, email: string, password: string): Promise<UserCredential>;
  export function signInWithEmailAndPassword(auth: any, email: string, password: string): Promise<UserCredential>;
  export function signOut(auth: any): Promise<void>;
  export function updateProfile(user: any, profile: { displayName?: string | null; photoURL?: string | null }): Promise<void>;
}

declare module 'firebase-admin' {
  namespace admin {
    export interface App {
      name: string;
    }
    export const apps: (App | null)[];
    export function initializeApp(options?: any): App;
    export const credential: {
      cert(serviceAccountPathOrObject: any): any;
      applicationDefault(): any;
    };
    export function firestore(): any;
    export function auth(): any;
    export function storage(): any;
  }
  export = admin;
}
