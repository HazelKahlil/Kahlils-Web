# How to Publish Your Portfolio (with Editing Capabilities)

Since your website requires a "Backend" to save data and upload images, you cannot use simple static hosting like GitHub Pages. You need a host that supports **Python**.

The best free/cheap option for this is **PythonAnywhere**.

## Step 1: Sign Up
1. Go to [PythonAnywhere.com](https://www.pythonanywhere.com/) and create a free beginner account.

## Step 2: Upload Your Code
1. Go to the **Files** tab in PythonAnywhere dashboard.
2. Upload the following files from your computer:
   - `app.py`
   - `requirements.txt`
   - `index.html`
   - `archive.html`, `project.html`, `biography.html`, `admin.html`, `contact.html`
   - `style.css`, `script.js`, `data.json`
3. Create a directory called `images` and upload your images there.

## Step 3: Install Requirements
1. Go to the **Consoles** tab and open a **Bash** console.
2. Type the following command and hit Enter:
   ```bash
   pip3 install -r requirements.txt --user
   ```

## Step 4: Configure Web App
1. Go to the **Web** tab.
2. Click **Add a new web app**.
3. Choose **Flask** -> **Python 3.x**.
4. Important: In the "Path to your flask app" section, make sure it points to the `app.py` file you uploaded.
5. In the **WSGI configuration file** (link provided on the page), edit it to import your app correctly:
   ```python
   # Delete everything and add:
   import sys
   path = '/home/YOUR_USERNAME/mysite' # Update this path to where you uploaded files
   if path not in sys.path:
       sys.path.append(path)
   
   from app import app as application
   ```

## Step 5: Reload
1. Click the big green **Reload** button at the top of the Web tab.
2. Click the link to your site (e.g., `yourname.pythonanywhere.com`).

**Your site is now online!** You can log in to `/admin.html` to modify it, and changes will be saved permanently.
