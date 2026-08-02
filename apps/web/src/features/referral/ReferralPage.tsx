import { Gift } from "lucide-react";
import { Placeholder } from "@/components/ui/Placeholder";

export default function ReferralPage() {
  return (
    <Placeholder
      icon={Gift}
      title="Referral & affiliate"
      body="Invite friends and earn commission on their trading and earn products."
      items={[
        "Personal referral link + QR code",
        "Tiered commission (20–40% of fees)",
        "Affiliate dashboard: clicks, signups, earnings",
        "Payout in USDT or chosen token",
      ]}
    />
  );
}
