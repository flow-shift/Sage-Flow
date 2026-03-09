import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const VerifyDevice = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      return;
    }

    fetch(`https://sageflow-backend.onrender.com/api/auth/verify-device?token=${token}`)
      .then(res => res.json())
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Device Verification</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === "loading" && (
            <>
              <Loader2 className="w-16 h-16 mx-auto animate-spin text-primary" />
              <p>Verifying your device...</p>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
              <p className="text-lg font-medium">Device verified successfully!</p>
              <p className="text-sm text-muted-foreground">You can now login from this device</p>
              <Link to="/login">
                <Button>Go to Login</Button>
              </Link>
            </>
          )}
          {status === "error" && (
            <>
              <XCircle className="w-16 h-16 mx-auto text-red-500" />
              <p className="text-lg font-medium">Verification failed</p>
              <p className="text-sm text-muted-foreground">Invalid or expired token</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyDevice;
