import {
  getFirestore,
  doc,
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  getDocFromServer,
  Firestore,
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { auth } from './firebaseAuth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Transaction } from '../types/finance';
import { UserProfile } from '../types/user';

// The designated Super Admin email with global visibility rights
export const SUPER_ADMIN_EMAIL = 'rennyangraeni99@gmail.com';

export function isUserSuperAdmin(user: User | UserProfile | null | undefined): boolean {
  if (!user || !user.email) return false;
  return user.email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
}

// Initialize Firestore with specific database ID if configured
let dbInstance: Firestore;
try {
  if (firebaseConfig.firestoreDatabaseId) {
    dbInstance = getFirestore(auth?.app, firebaseConfig.firestoreDatabaseId);
  } else {
    dbInstance = getFirestore(auth?.app);
  }
} catch (e) {
  console.warn('Firestore init note:', e);
  dbInstance = getFirestore();
}

export const db = dbInstance;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo:
        auth?.currentUser?.providerData?.map((provider: { providerId: string; email: string | null }) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connectivity on app boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline notice. Offline cache will be used.');
    }
    return false;
  }
}

// Save or sync user profile
export async function saveUserProfileToFirestore(userProfile: UserProfile): Promise<void> {
  if (!auth?.currentUser || !userProfile.id) return;
  const path = `users/${userProfile.id}`;
  try {
    const isSuperAdmin = isUserSuperAdmin(userProfile);
    const dataToSave = {
      id: userProfile.id,
      name: userProfile.name || 'Pengguna',
      email: userProfile.email || '',
      photoURL: userProfile.photoURL || '',
      role: isSuperAdmin ? 'super_admin' : 'user',
      roleDescription: userProfile.roleDescription || (isSuperAdmin ? 'Super Administrator' : 'Pengguna Publik'),
      isGoogle: Boolean(userProfile.isGoogle),
      createdAt: userProfile.lastActive || new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', userProfile.id), dataToSave, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Super admin fetch of all users
export async function fetchAllUsersForSuperAdmin(): Promise<UserProfile[]> {
  const path = 'users';
  try {
    const snapshot = await getDocs(collection(db, path));
    const list: UserProfile[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: data.id || docSnap.id,
        name: data.name || 'Pengguna',
        email: data.email || '',
        photoURL: data.photoURL || undefined,
        isGoogle: Boolean(data.isGoogle),
        roleDescription: data.roleDescription || (data.role === 'super_admin' ? 'Super Administrator' : 'Pengguna Publik'),
        lastActive: data.lastActive || new Date().toISOString(),
      });
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// Real-time listener for transactions
// If regular user: strictly queries transactions for their userId
// If super admin and viewAllUsers == true: queries all transactions
export function subscribeTransactions(
  userId: string,
  isSuperAdmin: boolean,
  viewAllUsers: boolean,
  targetUserIdFilter: string | null, // optional filter for super admin
  onData: (transactions: Transaction[]) => void,
  onError: (error: any) => void
): () => void {
  const path = 'transactions';
  try {
    let q;
    if (isSuperAdmin && viewAllUsers) {
      if (targetUserIdFilter && targetUserIdFilter !== 'ALL') {
        q = query(collection(db, path), where('userId', '==', targetUserIdFilter));
      } else {
        q = query(collection(db, path));
      }
    } else {
      q = query(collection(db, path), where('userId', '==', userId));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: Transaction[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          items.push({
            id: d.id || docSnap.id,
            userId: d.userId,
            userEmail: d.userEmail,
            userName: d.userName,
            bulan: d.bulan,
            tanggal: d.tanggal,
            tipe: d.tipe,
            jenisPemasukan: d.jenisPemasukan,
            jenisPengeluaran: d.jenisPengeluaran,
            kategori: d.kategori,
            jumlah: Number(d.jumlah) || 0,
            catatan: d.catatan || '',
            createdAt: d.createdAt,
            updatedAt: d.updatedAt,
          });
        });
        // Sort newest first
        items.sort((a, b) => b.tanggal.localeCompare(a.tanggal) || b.createdAt.localeCompare(a.createdAt));
        onData(items);
      },
      (error) => {
        onError(error);
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );

    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// Save transaction (create or edit)
export async function saveTransaction(
  transaction: Transaction,
  currentUser: UserProfile
): Promise<void> {
  const path = `transactions/${transaction.id}`;
  try {
    const dataToSave: any = {
      id: transaction.id,
      userId: transaction.userId || currentUser.id,
      userEmail: currentUser.email || '',
      userName: currentUser.name || 'Pengguna',
      bulan: transaction.bulan,
      tanggal: transaction.tanggal,
      tipe: transaction.tipe,
      kategori: transaction.kategori,
      jumlah: Number(transaction.jumlah),
      catatan: transaction.catatan || '',
      createdAt: transaction.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (transaction.jenisPemasukan) {
      dataToSave.jenisPemasukan = transaction.jenisPemasukan;
    }
    if (transaction.jenisPengeluaran) {
      dataToSave.jenisPengeluaran = transaction.jenisPengeluaran;
    }

    await setDoc(doc(db, 'transactions', transaction.id), dataToSave, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Delete transaction
export async function deleteTransaction(transactionId: string): Promise<void> {
  const path = `transactions/${transactionId}`;
  try {
    await deleteDoc(doc(db, 'transactions', transactionId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Batch sync local transactions to Firestore when logging in
export async function syncLocalTransactionsToFirestore(
  localTransactions: Transaction[],
  currentUser: UserProfile
): Promise<number> {
  if (!localTransactions.length || !currentUser.id) return 0;
  let syncedCount = 0;
  for (const tx of localTransactions) {
    try {
      const fixedTx = {
        ...tx,
        userId: currentUser.id,
        userEmail: currentUser.email,
        userName: currentUser.name,
      };
      await saveTransaction(fixedTx, currentUser);
      syncedCount++;
    } catch (e) {
      console.warn('Skipping unsynced item:', tx.id, e);
    }
  }
  return syncedCount;
}
