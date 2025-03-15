import { Navigation } from "@/components/Navigation";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type Props = {
  children: React.ReactNode;
};

export default async function AuthLayout(props: Props) {
  const supabase = await createClient();
  if (!(await supabase.auth.getUser()).data.user) {
    redirect("/");
  }

  return (
    <>
      <Navigation />
      {props.children}
    </>
  );
}
