import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { CurrencySelect } from "@/components/ui/CurrencySelect";
import { Button } from "@/components/ui/button/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";

export function SettingsPage() {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const navigate = useNavigate();

  const [primaryCurrency, setPrimaryCurrency] = useState<string | null>(null);

  // Initialize from profile after load
  const currentCurrency = primaryCurrency ?? profile?.primary_currency ?? "USD";

  const handleSave = async () => {
    if (primaryCurrency && primaryCurrency !== profile?.primary_currency) {
      await updateProfile.mutateAsync({ primary_currency: primaryCurrency });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const hasChanges =
    primaryCurrency && primaryCurrency !== profile?.primary_currency;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-zinc-400">Manage your account and preferences</p>
      </div>

      {/* Account info */}
      <Card className="border-zinc-800 bg-zinc-800/50">
        <CardHeader>
          <CardTitle className="text-white">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-zinc-400">Email</p>
            <p className="font-medium text-white">{user?.email}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-400">Account created</p>
            <p className="font-medium text-white">
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString()
                : "Unknown"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Primary currency */}
      <Card className="border-zinc-800 bg-zinc-800/50">
        <CardHeader>
          <CardTitle className="text-white">Primary Currency</CardTitle>
          <CardDescription>
            All balances will be converted to this currency for totals and
            shadow text
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Field>
            <FieldLabel>Currency</FieldLabel>
            <div className="flex gap-3">
              <div className="w-48">
                <CurrencySelect
                  value={currentCurrency}
                  onChange={setPrimaryCurrency}
                />
              </div>
              {hasChanges && (
                <Button onClick={handleSave} disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? "Saving..." : "Save"}
                </Button>
              )}
            </div>
          </Field>
          <p className="mt-2 text-sm text-zinc-500">
            Changing your primary currency will update all shadow text
            calculations. Your exchange rates are relative to this currency.
          </p>
        </CardContent>
      </Card>

      {/* Sign out */}
      <Card className="border-red-900/30 bg-zinc-800/50">
        <CardHeader>
          <CardTitle className="text-white">Sign Out</CardTitle>
          <CardDescription>
            Log out of your account on this device
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleSignOut}>
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
