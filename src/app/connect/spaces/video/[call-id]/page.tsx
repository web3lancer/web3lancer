"use client";
import React from "react";
import { useRouter, useParams } from "next/navigation";
import CallRoom from "@/components/CallRoom";

export default function VideoCallPage() {
  const params = useParams();
  const callId = params["call-id"] as string;
  return <CallRoom callId={callId} mode="video" />;
}
