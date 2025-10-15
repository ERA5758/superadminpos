import { stores } from "@/lib/data";
import { StoresTable } from "@/components/stores/stores-table";

// In a real app, you'd fetch this data from an API or database
async function getStores() {
  return stores;
}

export default async function StoresPage() {
  const storesData = await getStores();

  return (
    <div>
      <StoresTable stores={storesData} />
    </div>
  );
}
