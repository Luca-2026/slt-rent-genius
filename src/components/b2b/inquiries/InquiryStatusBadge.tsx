import { INQUIRY_STATUS_CLASSES, inquiryStatusLabel, normalizeInquiryStatus } from "@/lib/inquiryStatus";

export function InquiryStatusBadge({ status }: { status: string }) {
  const normalized = normalizeInquiryStatus(status);
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${INQUIRY_STATUS_CLASSES[normalized]}`}
    >
      {inquiryStatusLabel(normalized)}
    </span>
  );
}
