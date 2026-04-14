# 示例代码参考

## 1. 依赖分析示例

以下示例展示如何识别待抽取代码中的各类外部依赖。

```typescript
// 原始代码片段（待抽取）
function UserProfile() {
  const { userId } = useParams();          // ← Router 依赖
  const { theme } = useContext(ThemeCtx);  // ← Context 依赖
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchUser(userId).then(data => {       // ← 外部函数依赖
      setUser(data);
      setLoading(false);
    });
  }, [userId]);

  return (
    <div className={`profile ${theme}`}>   // ← 样式依赖
      {loading ? <Spinner /> : <UserCard user={user} />}
    </div>
  );
}
```

**依赖清单输出示例：**

```
✅ Router 依赖：useParams() → userId（需在 Router 上下文内使用）
✅ Context 依赖：ThemeCtx → theme（需在 ThemeProvider 内使用）
✅ 外部函数：fetchUser（需 import 或通过 props 传入）
✅ 内部 state：loading、user（可随逻辑一起抽取）
```

---

## 2. 最小化原则示例

避免过度抽取，只抽取真正复杂、可复用的逻辑。

```typescript
// ❌ 过度抽取：把简单的条件渲染也抽成组件
const LoadingWrapper = ({ loading, children }) => (
  loading ? <Spinner /> : children
);

// ✅ 最小化：只抽取真正复杂、可复用的逻辑
// 将数据获取逻辑抽为 Hook，UI 保持简洁
function useUserData(userId: string) {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();
    setLoading(true);

    fetchUser(userId, { signal: controller.signal })
      .then(data => setUser(data))
      .catch(err => {
        if (err.name !== 'AbortError') setError(err);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [userId]);

  return { loading, user, error };
}
```
