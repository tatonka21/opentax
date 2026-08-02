import { Rocket } from "lucide-react";
import { Placeholder } from "@/components/ui/Placeholder";

export default function LaunchpadPage() {
  return (
    <Placeholder
      icon={Rocket}
      title="Launchpad"
      body="IDO/ICO launchpad for token projects to raise liquidity and launch on OpenTAX."
      items={[
        "Project application & due-diligence workflow",
        "Tiered allocation (staking + volume based)",
        "Allocation claims, vesting schedules, and lockups",
        "FCFS / lottery allocation rounds",
      ]}
    />
  );
}
