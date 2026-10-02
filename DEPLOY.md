# Go-live checklist (Netlify + GitHub, both free)

## Accounts needed
1. **GitHub** (free): stores the site files. The /admin editor saves changes here.
2. **Netlify** (free plan): hosts the site and gives it a link (e.g. `eyitayo-portfolio.netlify.app`). Sign up with the GitHub account.
3. *(Optional)* A custom domain such as `eyitayotimilehin.com` (about $10–15 per year). It can be connected in Netlify later.

## Steps
1. Create a GitHub repository (e.g. `eyitayo-portfolio`; public or private) and upload the contents of this folder.
2. In `admin/config.yml`, set `repo: <github-username>/eyitayo-portfolio` (and `branch` if it isn't `main`).
3. Netlify: **Add new project → Import from Git → GitHub →** choose the repo. There's no build command; the publish directory is `.` (already in `netlify.toml`). Deploy.
4. Optional: rename the site in Netlify (**Project configuration → Change project name**).
5. Turn on the editor's GitHub login:
   - GitHub → Settings → Developer settings → **OAuth Apps → New OAuth App**
     - Homepage URL: the Netlify URL
     - Authorization callback URL: `https://api.netlify.com/auth/done`
     - Generate a client secret and copy the Client ID and Secret.
   - Netlify → **Project configuration → Access & security → OAuth → Install provider → GitHub** and paste both values.
6. Open `https://<site>.netlify.app/admin`, click **Login with GitHub**, and test an edit.
7. Update `og:url` and `og:image` in `index.html` and `portfolio.html` to full URLs (e.g. `https://<site>.netlify.app/assets/img/hero-sydney-opera-house-1280.jpg`) so shared links show a preview image.

## Notes
- Anyone who can log in needs write access to the GitHub repo. Only the owner has it by default.
- Netlify Identity / Git Gateway is deliberately not used: Netlify has deprecated Git Gateway for new setups.
- The public site works on any static host (GitHub Pages, Vercel, Cloudflare Pages). Hosts other than Netlify need their own OAuth proxy for /admin.
