import DalleTest from "@/components/DalleTest";

export default function DalleTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          DALL-E 2 & 3 Test Interface
        </h1>
        <DalleTest />
      </div>
    </div>
  );
}