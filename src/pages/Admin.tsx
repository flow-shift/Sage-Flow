import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Users } from "lucide-react";

const ADMIN_EMAIL = "gunarajtamilarasan2008@gmail.com";

interface UserData {
  id: string;
  name: string;
  email: string;
  createdAt: any;
}

const Admin = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  if (!user) return <Navigate to="/login" replace />;
  if (user.email !== ADMIN_EMAIL) return <Navigate to="/dashboard" replace />;

  useEffect(() => {
    getDocs(collection(db, "users"))
      .then((snap) => setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() } as UserData))))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-2">
        <Users className="w-6 h-6" />
        <h1 className="text-3xl font-bold">Admin — Users</h1>
        <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium">
          {users.length} total
        </span>
      </div>

      {users.map((u) => (
        <div key={u.id} className="border rounded-xl p-5 bg-card shadow-sm">
          <p className="font-semibold text-lg">{u.name}</p>
          <p className="text-sm text-muted-foreground">{u.email}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Joined: {u.createdAt?.toDate?.().toLocaleString() ?? "—"}
          </p>
        </div>
      ))}
    </div>
  );
};

export default Admin;
