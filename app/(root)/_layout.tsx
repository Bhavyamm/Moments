import { Redirect, Slot } from "expo-router";
import { Header } from "@/components/Header";

export default function AppLayout() {
  let isLogged = true;

  if (!isLogged) {
    return <Redirect href="/welcome" />;
  }

  return (
    <>
      <Header />
      <Slot />
    </>
  );
}
