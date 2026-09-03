import { RejectInquiryDialog } from "@/components/b2b/inquiries/RejectInquiryDialog";

export default function DevRejectPreview() {
  return (
    <div className="p-6">
      <RejectInquiryDialog
        inquiryType="rental"
        inquiryId="00000000-0000-0000-0000-000000000001"
        customerEmail="kunde@example.com"
        location="bonn"
        onDone={() => {}}
      />
    </div>
  );
}
