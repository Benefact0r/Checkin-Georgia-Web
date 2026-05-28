"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getMe, type Me } from "@/lib/admin-api";

interface AuthCtx {
  user: User | null;
  profile: Me | null;
  loading: boolean;
  /** Fresh Firebase ID token for authed API calls. */
  token: () => Promise<string>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function useAuth(): AuthCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within <AuthProvider>");
  return c;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          setProfile(await getMe(await u.getIdToken()));
        } catch {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const token = useCallback(async () => {
    if (!auth?.currentUser) throw new Error("not signed in");
    return auth.currentUser.getIdToken();
  }, []);

  const logout = useCallback(async () => {
    if (auth) await signOut(auth);
  }, []);

  return (
    <Ctx.Provider value={{ user, profile, loading, token, logout }}>
      {children}
    </Ctx.Provider>
  );
}
