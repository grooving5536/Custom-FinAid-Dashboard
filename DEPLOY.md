# Deploy to GitHub

Run these commands in your terminal from the project folder to push the app to your GitHub repo.

## 1. Open terminal and go to the project

```bash
cd /Users/am/financial-projector
```

## 2. Initialize git and make the first commit

```bash
git init
git add .
git commit -m "Initial commit: Custom FinAid Dashboard"
```

## 3. Add your GitHub repo and push

```bash
git remote add origin https://github.com/grooving5536/Custom-FinAid-Dashboard.git
git branch -M main
git push -u origin main
```

If GitHub asks you to sign in, use your credentials or a [Personal Access Token](https://github.com/settings/tokens) (recommended).

---

## Optional: Deploy the app to the web

After the code is on GitHub you can host the built app for free:

- **GitHub Pages**: Repo → Settings → Pages → Source: Deploy from branch → Branch: `main`, folder: `/ (root)` or use a GitHub Action to build and deploy the `dist` folder.
- **Netlify**: [netlify.com](https://www.netlify.com) → Add new site → Import from Git → choose your repo → Build command: `npm run build`, Publish directory: `dist`.
- **Vercel**: [vercel.com](https://vercel.com) → New Project → Import from Git → choose your repo (Vite is auto-detected; Publish directory: `dist`).
