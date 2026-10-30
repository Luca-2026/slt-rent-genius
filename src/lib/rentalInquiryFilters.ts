import { DEFAULT_INQUIRY_LIST_FILTER } from "@/lib/inquiryStatus";

/** A fresh list visit starts at the employee's branch, not a previous saved filter. */
export function initialRentalInquiryFilters(
  search: string,
  returningFromDetail: boolean,
  staffLocation?: string | null,
): URLSearchParams | null {
  if (search || returningFromDetail) return null;
  const params = new URLSearchParams({ status: DEFAULT_INQUIRY_LIST_FILTER });
  const branch = (staffLocation ?? "").trim().toLowerCase().replace(/ü/g, "ue").replace(/\s+an der ruhr$/, "");
  if (["bonn", "krefeld", "muelheim"].includes(branch)) params.set("standort", branch);
  return params;
}