import { topUpRequests } from "@/lib/data";
import { TopUpRequestsTable } from "@/components/top-up-requests/top-up-requests-table";

// In a real app, you'd fetch this data from an API or database
async function getTopUpRequests() {
  return topUpRequests;
}

export default async function TopUpRequestsPage() {
  const requests = await getTopUpRequests();

  return (
    <div>
      <TopUpRequestsTable requests={requests} />
    </div>
  );
}
