import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Monitor, Globe } from "lucide-react";

const API = "https://sageflow-backend.onrender.com/api/auth";

const ADMIN_EMAIL = "gunarajtamilarasan2008@gmail.com";

interface Device {
  device: string;
  browser: string;
  os: string;
  ip: string;
  last_login: string;
  verified: boolean;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  verified: boolean;
  created_at: string;
  devices: Device[] | null;
}

const Admin = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  if (!user) return <Navigate to="/login" replace />;
  if (user.email !== ADMIN_EMAIL) return <Navigate to="/dashboard" replace />;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) setError(data.error);
        else setUsers(data.users);
      } catch {
        setError("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-destructive">{error}</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-2">
        <Users className="w-6 h-6" />
        <h1 className="text-3xl font-bold">Admin — Users</h1>
        <Badge className="ml-2">{users.length} total</Badge>
      </div>

      {users.map((u) => (
        <Card key={u.id}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span>{u.name}</span>
              <Badge variant={u.verified ? "default" : "destructive"}>
                {u.verified ? "Verified" : "Unverified"}
              </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">{u.email}</p>
            <p className="text-xs text-muted-foreground">
              Joined: {new Date(u.created_at).toLocaleString()}
            </p>
          </CardHeader>
          <CardContent>
            {u.devices && u.devices.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-1">
                  <Monitor className="w-4 h-4" /> Devices
                </p>
                {u.devices.map((d, i) => (
                  <div key={i} className="bg-muted rounded-md p-3 text-sm space-y-1">
                    <div className="flex items-center justify-between">
                      <span>{d.browser} — {d.os}</span>
                      <Badge variant={d.verified ? "default" : "secondary"} className="text-xs">
                        {d.verified ? "Trusted" : "Unverified"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground text-xs">
                      <Globe className="w-3 h-3" /> {d.ip}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Last login: {d.last_login ? new Date(d.last_login).toLocaleString() : "Never"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No devices logged in yet</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Admin;
