# Claude Development Notes

## GitHub Pages Deployment

**Issue**: GitHub Actions npm build fails with "npm error enoent spawn cmd.exe ENOENT" - exit code 254.

**Solution**: Deploy pre-built static files instead of building in GitHub Actions.

### Deployment Process

1. **Make code changes locally**
2. **Build locally**: `./node_modules/.bin/next build`
3. **Commit source changes AND built files**:
   ```bash
   git add -A
   git add -f out/  # Force add since out/ is in .gitignore
   git commit -m "Your commit message"
   git push origin main
   ```

### GitHub Actions Workflow

The workflow (`.github/workflows/static.yml`) is simplified to only deploy pre-built files:
- No npm install or build steps
- Just uploads the `out/` directory to GitHub Pages
- Avoids npm/dependency issues in CI environment

### Environment Variables

The following environment variables are needed for local builds:
- `NEXT_PUBLIC_SUPABASE_URL=https://wxvcmvacajexdtcbgdva.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4dmNtdmFjYWpleGR0Y2JnZHZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMjMzMzYsImV4cCI6MjA2NDc5OTMzNn0.rKIixUac8fxLrHGzlXDEMz2xGcfgpX_QY6ZjhlVpWmQ`

These are stored in `.env.local` for local development.