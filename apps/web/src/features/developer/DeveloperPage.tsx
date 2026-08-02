import { Code2 } from "lucide-react";
import { Placeholder } from "@/components/ui/Placeholder";
import { Button } from "@/components/ui/Button";

export default function DeveloperPage() {
  return (
    <Placeholder
      icon={Code2}
      title="Developer portal"
      body="REST + WebSocket APIs for trading, market data, and account management."
      items={[
        "API keys with IP allow-listing and read-only scopes",
        "OpenAPI docs for Peatio, Barong, and Ranger endpoints",
        "Webhooks for orders, deposits, and withdrawals",
        "Node, Python, and Go SDK examples",
      ]}
      action={<Button variant="outline">Generate API key</Button>}
    />
  );
}
