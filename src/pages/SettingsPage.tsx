import BundleManager from "../components/settings/BundleManager";
import CategoryManager from "../components/settings/CategoryManager";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";

/**
 * 分类管理页 — 分类设置 + 套件管理
 */
export default function SettingsPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold font-[var(--font-code)] mb-6">
        分类管理
      </h1>
      <Tabs defaultValue="categories">
        <TabsList>
          <TabsTrigger value="categories">分类设置</TabsTrigger>
          <TabsTrigger value="bundles">套件管理</TabsTrigger>
        </TabsList>
        <TabsContent value="categories">
          <CategoryManager />
        </TabsContent>
        <TabsContent value="bundles">
          <BundleManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
