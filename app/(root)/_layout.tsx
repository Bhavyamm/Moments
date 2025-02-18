// File: app/(root)/_layout.tsx
import { useSegments, Redirect, Slot } from "expo-router";
import { Header } from "@/components/Header";

export default function AppLayout() {
  const segments = useSegments();
  let isLogged = false;

  // Allow unauthenticated for sign-in route:
  if (!isLogged && !segments.includes("sign-in")) {
    return <Redirect href="/welcome" />;
  }

  return (
    <>
      <Header />
      <Slot />
    </>
  );
}
