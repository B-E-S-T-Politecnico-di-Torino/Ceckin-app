import { supabase } from "../lib/supabase";

export async function callScan(input: {
  matricola: string;
  event_id: string;
  action_code: string;
}) {
  const { data, error } = await supabase.functions.invoke("scan", {
    body: input,
  });

  if (error) {
    console.error("SCAN ERROR", error);
    throw error;
  }

  return data;
}

export async function callDeposit(input: {
  matricola: string;
  event_id: string;
  new_status: "PAID" | "REFUNDED" | "CANCELLED";
  note?: string;
}) {
  const { data, error } = await supabase.functions.invoke("deposit", {
    body: input,
  });

  if (error) {
    console.error("DEPOSIT ERROR", error);
    throw error;
  }

  return data;
}
