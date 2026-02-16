# 🔧 Troubleshooting Guide

_Common issues and their solutions for LearnCraft Spanish development_

---

## Table of Contents

1. [Development Environment Issues](#development-environment-issues)
2. [Build and Compilation Errors](#build-and-compilation-errors)
3. [Testing Issues](#testing-issues)
4. [Runtime Errors](#runtime-errors)
5. [API and Data Issues](#api-and-data-issues)
6. [Authentication Issues](#auth-and-authentication-issues)
7. [Performance Issues](#performance-issues)
8. [Git and Version Control](#git-and-version-control)

---

## Development Environment Issues

### Issue: `pnpm: command not found`

**Problem**: pnpm is not installed.

**Solution**:
```bash
npm install -g pnpm
```

Verify installation:
```bash
pnpm --version
```

---

### Issue: Node version mismatch

**Problem**: Project requires Node >= 16, but you have an older version.

**Solution**:

1. Install nvm (Node Version Manager):
   ```bash
   # macOS/Linux
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   
   # Windows: Download from https://github.com/coreybutler/nvm-windows
   ```

2. Install and use correct Node version:
   ```bash
   nvm install 18
   nvm use 18
   ```

---

### Issue: `Module not found` after installing dependencies

**Problem**: Dependencies not properly installed or cached.

**Solution**:

1. Clean install:
   ```bash
   rm -rf node_modules pnpm-lock.yaml
   pnpm install:local
   ```

2. If using CI lockfile:
   ```bash
   pnpm install:ci
   ```

---

### Issue: Port already in use (5173)

**Problem**: Development server port is already occupied.

**Solution**:

1. Kill the process using the port:
   ```bash
   # macOS/Linux
   lsof -ti:5173 | xargs kill -9
   
   # Windows
   netstat -ano | findstr :5173
   taskkill /PID <PID> /F
   ```

2. Or use a different port:
   ```bash
   pnpm start -- --port 3000
   ```

---

## Build and Compilation Errors

### Issue: TypeScript errors about missing types

**Problem**: Type definitions not found or outdated.

**Solution**:

1. Ensure `@types` packages are installed:
   ```bash
   pnpm install
   ```

2. Check for type errors:
   ```bash
   pnpm typecheck
   ```

3. If types are from `@learncraft-spanish/shared`, update:
   ```bash
   pnpm update-shared
   ```

---

### Issue: `Cannot find module '@domain/...'` or other path aliases

**Problem**: TypeScript path mapping not configured correctly.

**Solution**:

1. Verify `tsconfig.json` has correct paths:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@domain/*": ["./src/hexagon/domain/*"],
         "@application/*": ["./src/hexagon/application/*"],
         "@infrastructure/*": ["./src/hexagon/infrastructure/*"],
         "@interface/*": ["./src/hexagon/interface/*"],
         "@composition/*": ["./src/hexagon/composition/*"],
         "@testing/*": ["./src/hexagon/testing/*"]
       }
     }
   }
   ```

2. Restart your editor (VS Code, etc.)

3. Check `vite.config.ts` has matching aliases

---

### Issue: Build fails with "out of memory"

**Problem**: Vite build process running out of memory.

**Solution**:

1. Increase Node memory limit:
   ```bash
   NODE_OPTIONS=--max_old_space_size=4096 pnpm build
   ```

2. Add to `package.json` scripts if persistent:
   ```json
   {
     "scripts": {
       "build": "NODE_OPTIONS=--max_old_space_size=4096 vite build"
     }
   }
   ```

---

## Testing Issues

### Issue: Tests fail with "Cannot find module" for mocks

**Problem**: Mock files not properly set up or imported.

**Solution**:

1. Ensure mock file exists: `myHook.mock.ts`

2. Check mock is properly imported in test:
   ```typescript
   import { myHookMock } from './myHook.mock';
   
   vi.mock('./myHook', () => ({
     myHook: vi.fn(() => myHookMock.defaultImplementation()),
   }));
   ```

3. Verify mock uses `createOverrideableMock`:
   ```typescript
   export const myHookMock = createOverrideableMock<typeof myHook>({
     defaultImplementation: () => ({
       // mock return value
     }),
   });
   ```

---

### Issue: Tests pass locally but fail in CI

**Problem**: Environment differences between local and CI.

**Solution**:

1. Check if you're using correct lockfile:
   ```bash
   # For CI
   pnpm install:ci
   ```

2. Ensure all mocks are reset properly:
   ```typescript
   afterEach(() => {
     myHookMock.resetMock();
   });
   ```

3. Check for timing issues (use `waitFor` from testing-library)

---

### Issue: "ReferenceError: vi is not defined"

**Problem**: Vitest globals not configured.

**Solution**:

1. Check `vitest.config.ts` or `vitest.config-hexagon.ts`:
   ```typescript
   export default defineConfig({
     test: {
       globals: true, // Enable this
     },
   });
   ```

2. Or import explicitly:
   ```typescript
   import { vi, describe, it, expect } from 'vitest';
   ```

---

### Issue: Tests timeout or hang

**Problem**: Async operations not completing or infinite loops.

**Solution**:

1. Increase timeout for specific test:
   ```typescript
   it('slow test', async () => {
     // test code
   }, 10000); // 10 second timeout
   ```

2. Check for missing `await`:
   ```typescript
   // ❌ BAD
   it('test', () => {
     renderHook(() => useMyHook());
   });
   
   // ✅ GOOD
   it('test', async () => {
     await waitFor(() => {
       const { result } = renderHook(() => useMyHook());
       expect(result.current.data).toBeDefined();
     });
   });
   ```

3. Use `vi.runAllTimers()` if testing code with timers

---

## Runtime Errors

### Issue: "Cannot read property 'X' of undefined"

**Problem**: Accessing property on undefined/null object.

**Common Causes**:

1. **API data not loaded yet**:
   ```typescript
   // ❌ BAD
   function Component() {
     const { data } = useQuery();
     return <div>{data.name}</div>; // data might be undefined
   }
   
   // ✅ GOOD
   function Component() {
     const { data, isLoading } = useQuery();
     
     if (isLoading) return <Loading />;
     if (!data) return <Error />;
     
     return <div>{data.name}</div>;
   }
   ```

2. **Context used outside provider**:
   ```typescript
   // Make sure component is wrapped in provider
   <MyProvider>
     <MyComponent /> {/* Can use useMyContext() */}
   </MyProvider>
   ```

---

### Issue: Infinite render loop

**Problem**: Component re-rendering endlessly.

**Common Causes**:

1. **Missing dependencies in useEffect**:
   ```typescript
   // ❌ BAD
   useEffect(() => {
     setData(computeData()); // setData causes re-render, useEffect runs again
   }); // No dependency array!
   
   // ✅ GOOD
   useEffect(() => {
     setData(computeData());
   }, [initialData]); // Only run when initialData changes
   ```

2. **Creating new object/array in render**:
   ```typescript
   // ❌ BAD
   function Component() {
     const config = { option: 'value' }; // New object every render
     return <Child config={config} />; // Child re-renders every time
   }
   
   // ✅ GOOD
   function Component() {
     const config = useMemo(() => ({ option: 'value' }), []); // Stable reference
     return <Child config={config} />;
   }
   ```

---

### Issue: "Maximum update depth exceeded"

**Problem**: State update causing itself to trigger again.

**Solution**:

1. Check for direct state updates in render:
   ```typescript
   // ❌ BAD
   function Component() {
     const [count, setCount] = useState(0);
     setCount(count + 1); // Causes infinite loop!
     return <div>{count}</div>;
   }
   
   // ✅ GOOD
   function Component() {
     const [count, setCount] = useState(0);
     
     useEffect(() => {
       setCount(count + 1); // In effect with proper dependencies
     }, []);
     
     return <div>{count}</div>;
   }
   ```

---

## API and Data Issues

### Issue: API requests failing with CORS errors

**Problem**: Backend not configured to allow requests from frontend origin.

**Solution**:

1. Check `VITE_API_BASE_URL` in `.env`:
   ```
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

2. Verify backend CORS configuration allows your origin

3. For local development, use proxy in `vite.config.ts`:
   ```typescript
   export default defineConfig({
     server: {
       proxy: {
         '/api': {
           target: 'http://localhost:8000',
           changeOrigin: true,
         },
       },
     },
   });
   ```

---

### Issue: API returns 401 Unauthorized

**Problem**: Authentication token missing or expired.

**Solution**:

1. Check if user is logged in:
   ```typescript
   const { isAuthenticated, loginWithRedirect } = useAuth0();
   
   if (!isAuthenticated) {
     return <button onClick={loginWithRedirect}>Log In</button>;
   }
   ```

2. Verify token is being sent in requests (check Network tab)

3. Log out and log back in to refresh token

4. Check Auth0 configuration in `.env`

---

### Issue: TanStack Query not refetching data

**Problem**: Query using cached data instead of refetching.

**Solution**:

1. Check `staleTime` configuration:
   ```typescript
   useQuery({
     queryKey: ['data'],
     queryFn: fetchData,
     staleTime: 0, // Always refetch (for debugging)
   });
   ```

2. Manually invalidate query:
   ```typescript
   const queryClient = useQueryClient();
   queryClient.invalidateQueries({ queryKey: ['data'] });
   ```

3. Force refetch:
   ```typescript
   const { data, refetch } = useQuery({...});
   
   // Later
   refetch();
   ```

---

## Auth and Authentication Issues

### Issue: Redirected to Auth0 login constantly

**Problem**: Auth0 callback not properly configured.

**Solution**:

1. Check Auth0 callback URLs in Auth0 dashboard:
   - Allowed Callback URLs: `http://localhost:5173`
   - Allowed Logout URLs: `http://localhost:5173`
   - Allowed Web Origins: `http://localhost:5173`

2. Verify `.env` variables:
   ```
   VITE_AUTH0_DOMAIN=your-tenant.auth0.com
   VITE_AUTH0_CLIENT_ID=your-client-id
   VITE_AUTH0_AUDIENCE=your-api-identifier
   ```

---

### Issue: "User is not authorized" for certain features

**Problem**: User lacks required permissions or role.

**Solution**:

1. Check user's role/permissions:
   ```typescript
   const { user } = useAuth0();
   console.log('User roles:', user?.['https://your-domain.com/roles']);
   ```

2. Verify backend is returning correct user data

3. Check permission logic in code matches backend

---

## Performance Issues

### Issue: App feels sluggish or slow to render

**Solution**:

1. **Use React DevTools Profiler** to identify slow components

2. **Memoize expensive computations**:
   ```typescript
   const expensiveResult = useMemo(() => {
     return computeExpensiveValue(data);
   }, [data]);
   ```

3. **Virtualize long lists**:
   ```typescript
   import { useVirtualizer } from '@tanstack/react-virtual';
   
   // Render only visible items in long list
   ```

4. **Lazy load components**:
   ```typescript
   const HeavyComponent = lazy(() => import('./HeavyComponent'));
   
   <Suspense fallback={<Loading />}>
     <HeavyComponent />
   </Suspense>
   ```

---

### Issue: Too many network requests

**Problem**: Queries refetching too frequently.

**Solution**:

1. Adjust `staleTime` and `cacheTime`:
   ```typescript
   useQuery({
     queryKey: ['data'],
     queryFn: fetchData,
     staleTime: 5 * 60 * 1000, // 5 minutes
     cacheTime: 10 * 60 * 1000, // 10 minutes
   });
   ```

2. Batch related queries

3. Use query dependencies to avoid parallel fetching:
   ```typescript
   const { data: user } = useUserQuery();
   const { data: posts } = usePostsQuery(user?.id, {
     enabled: !!user?.id, // Only fetch when user is available
   });
   ```

---

## Git and Version Control

### Issue: Merge conflicts

**Solution**:

1. Pull latest changes:
   ```bash
   git fetch origin
   git merge origin/main
   ```

2. Resolve conflicts in your editor

3. After resolving:
   ```bash
   git add .
   git commit -m "Resolve merge conflicts"
   ```

---

### Issue: Accidentally committed to wrong branch

**Solution**:

1. If not pushed yet:
   ```bash
   # Move commits to new branch
   git branch new-branch-name
   git reset --hard origin/current-branch
   git checkout new-branch-name
   ```

2. If already pushed (coordinate with team first!):
   ```bash
   git revert <commit-hash>
   git push
   ```

---

### Issue: Need to update branch with latest main

**Solution**:

```bash
# Option 1: Merge (preserves history)
git checkout your-branch
git merge origin/main
git push

# Option 2: Rebase (cleaner history, but be careful)
git checkout your-branch
git rebase origin/main
git push --force-with-lease
```

---

## Still Stuck?

### Debugging Steps

1. **Check the console**: Browser console and terminal for error messages
2. **Use debugger**: Add `debugger;` statement or breakpoints in your editor
3. **Check Network tab**: Verify API requests/responses
4. **Read error messages carefully**: They often tell you exactly what's wrong
5. **Search the codebase**: Look for similar patterns that work
6. **Check Git history**: See how something worked before it broke
7. **Ask for help**: Slack, pair programming, or team discussion

### Getting Help

When asking for help, provide:

1. **What you're trying to do**
2. **What's happening instead** (include error messages)
3. **What you've tried already**
4. **Relevant code snippets**
5. **Steps to reproduce** (if applicable)

### Useful Debugging Commands

```bash
# Check what's running on a port
lsof -i :5173

# View all environment variables
printenv | grep VITE

# Check Node and pnpm versions
node --version
pnpm --version

# Clear pnpm cache
pnpm store prune

# Check Git status and branches
git status
git branch -a

# View recent commits
git log --oneline -10
```

---

## Related Documentation

- [`ONBOARDING.md`](./ONBOARDING.md) - Setup and getting started
- [`TESTING_STANDARDS.md`](./TESTING_STANDARDS.md) - Testing best practices
- [`DATA_FLOW.md`](./DATA_FLOW.md) - Understanding data flow and state
- [`COMMON_PATTERNS.md`](./COMMON_PATTERNS.md) - Code patterns and conventions
- [`ARCHITECTURE.md`](../src/hexagon/ARCHITECTURE.md) - Architecture documentation

---

**Remember**: Most issues can be solved by reading error messages carefully, checking documentation, and following the debugging steps above. Don't hesitate to ask for help when you're stuck!
