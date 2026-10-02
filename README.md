# Eyitayo Timilehin — Architectural Portfolio

A static site (plain HTML/CSS/JS, no build step) with a no-code editor at `/admin` (Decap CMS).

## How content is organised
**Category → Folders (projects) → Pictures**

- Categories are fixed: Residential, Mixed Use, Public Buildings. A category with no folders shows "Projects coming soon".
- Each folder has a name, an optional location, an optional short description, an optional order number and an ordered list of pictures. Each picture has a caption and an optional full-resolution file. The first picture is the cover.
- Everything lives in two files:
  - `content/portfolio.json`: folders and pictures
  - `content/site.json`: name, title, email, phone, location, tagline, bio
- Uploaded pictures go to `assets/img/uploads/`.

## Editing without code (after deployment)
Go to `https://<your-site>/admin`, log in with GitHub, then open **Portfolio**:

- **Projects (folders and pictures):**
  - **Add folder** creates a new project. Pick its category and type its name (renaming works the same way).
  - Fill in the location and description, or leave them empty to hide them.
  - **Add picture** uploads an image. Drag the ≡ handle to reorder pictures or folders. ✕ deletes one.
  - **Move a picture to another folder:** add a picture in the target folder, choose the existing file from the media library, then remove it from the old folder.
  - **Move a folder to another category:** change its Category.
- **Your details:** name, email, phone, bio.
- Press **Publish**. The change is committed to GitHub and Netlify redeploys within about a minute.

Tip: resize photos to about 2000 px wide before uploading (under about 1 MB) so the site stays fast.

## Editing by hand
Edit the two JSON files directly, following the same structure.

## Files
```
index.html            Welcome page
portfolio.html        Portfolio, About, Contact, folder viewer
content/              Editable content (JSON)
admin/                Decap CMS editor (index.html + config.yml)
assets/css/style.css  Styling
assets/js/            content.js (loader), main.js (portfolio), landing.js
assets/img/           Hero image, favicon, uploads/
netlify.toml          Netlify settings (no build; publish the folder as is)
tools/screenshots.py  Local visual test
DEPLOY.md             Go-live checklist
CREDITS.md            Image credits and licenses
```

## Local preview
```
python3 -m http.server 8000      # open http://localhost:8000
npx decap-server                 # optional, in a second terminal: try /admin locally without logging in
```
The site loads its content with `fetch`, so it must be served over http(s). Double-clicking the HTML files won't load the projects.

Share a folder directly with a link like `portfolio.html#folder=3-bed-bungalow`.
