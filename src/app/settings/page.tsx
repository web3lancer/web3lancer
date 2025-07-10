"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardContent, Button, Grid, Typography } from "@mui/material";

export default function SettingsHomePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p>You need to be logged in to access settings.</p>
        <div className="mt-4">
          <Link
            href="/signin"
            className="rounded-md bg-primary py-2 px-4 text-white shadow-sm hover:bg-primary/90"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const sections = [
    {
      title: "Verification",
      description: "Submit documents to verify your identity or organization.",
      href: "/settings/verification-new",
    },
    {
      title: "Account Security",
      description: "Manage your password and security settings.",
      href: "/settings/account",
    },
    {
      title: "Wallets",
      description: "Manage your connected crypto wallets.",
      href: "/settings/wallets",
    },
    {
      title: "Payment Methods",
      description: "Add or update your payout and payment methods.",
      href: "/settings/payment-methods",
    },
    {
      title: "Notifications",
      description: "Configure your notification preferences.",
      href: "/settings/notifications",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <Grid container spacing={3}>
        {sections.map((section) => (
          <Grid item xs={12} md={6} key={section.title}>
            <Card>
              <CardHeader
                title={<Typography variant="h6">{section.title}</Typography>}
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {section.description}
                </Typography>
                <Button
                  component={Link as any}
                  href={section.href}
                  variant="contained"
                  color="primary"
                  size="small"
                >
                  Manage
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}