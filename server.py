import http.server
import socketserver
import json
import os
import cgi
import shutil

PORT = 5001
DIRECTORY = "."
IMAGES_DIR = "images"

# Ensure images directory exists
if not os.path.exists(IMAGES_DIR):
    os.makedirs(IMAGES_DIR)

class PortfolioHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        # Endpoint: Save Projects JSON
        if self.path == '/api/save':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                # Validate JSON
                data = json.loads(post_data)
                with open('data.json', 'w') as f:
                    json.dump(data, f, indent=4)
                
                # === AUTOMATIC PUBLISH (GIT PUSH) ===
                # Executing git commands to sync changes to GitHub
                try:
                    import subprocess
                    print("[Server] Auto-publishing changes...")
                    
                    # 1. Add all changes (data.json and any new images)
                    subprocess.check_call(['git', 'add', '.', 'images/*.webp']) 
                    
                    # 2. Commit
                    # Check if there are changes first to avoid empty commit error
                    status = subprocess.run(['git', 'status', '--porcelain'], capture_output=True, text=True)
                    if status.stdout.strip():
                        subprocess.check_call(['git', 'commit', '-m', 'Content Update: Auto-published from Admin Panel'])
                        
                        # 3. Push
                        subprocess.check_call(['git', 'push'])
                        print("[Server] ✅ Successfully published to GitHub.")
                        message = "Saved and published to website!"
                    else:
                        print("[Server] No changes to publish.")
                        message = "Saved (No changes to publish)."
                        
                except subprocess.CalledProcessError as e:
                    print(f"[Server] ❌ Git publish failed: {e}")
                    message = f"Saved, but publish failed: {e}"
                except Exception as e:
                    print(f"[Server] ❌ Publish error: {e}")
                    message = f"Saved, but publish error: {e}"

                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'success', 'message': message}).encode())
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'error', 'message': str(e)}).encode())
                
        # Endpoint: Upload Image
        elif self.path == '/api/upload':
            form = cgi.FieldStorage(
                fp=self.rfile,
                headers=self.headers,
                environ={'REQUEST_METHOD': 'POST'}
            )
            
            fileitem = form['file']
            
            if fileitem.filename:
                # Strip leading path from file name to avoid directory traversal attacks
                fn = os.path.basename(fileitem.filename)
                save_path = os.path.join(IMAGES_DIR, fn)
                
                # Save original file first
                with open(save_path, 'wb') as f:
                    shutil.copyfileobj(fileitem.file, f)
                
                # OPTIMIZATION STEP
                final_filename = fn
                try:
                    from PIL import Image
                    
                    with Image.open(save_path) as img:
                        # 1. Convert to RGB if necessary (e.g., from RGBA png to jpg, though webp handles RGBA)
                        if img.mode in ("RGBA", "P"):
                            img = img.convert("RGBA")
                        else:
                            img = img.convert("RGB")
                            
                        # 2. Resize if too large
                        MAX_WIDTH = 1920
                        w, h = img.size
                        if w > MAX_WIDTH:
                            ratio = MAX_WIDTH / w
                            new_h = int(h * ratio)
                            img = img.resize((MAX_WIDTH, new_h), Image.Resampling.LANCZOS)
                            print(f"[Server] Resized {fn}: {w}x{h} -> {MAX_WIDTH}x{new_h}")
                        
                        # 3. Save as WebP
                        name_without_ext = os.path.splitext(fn)[0]
                        webp_filename = f"{name_without_ext}.webp"
                        webp_path = os.path.join(IMAGES_DIR, webp_filename)
                        
                        img.save(webp_path, 'WEBP', quality=80)
                        print(f"[Server] Optimized: {fn} -> {webp_filename}")
                        
                        # Use the optimized filename for the response
                        final_filename = webp_filename
                        
                except ImportError:
                    print("[Server] PIL not installed. Skipping optimization.")
                except Exception as e:
                    print(f"[Server] Error optimizing image: {e}")
                    # Fallback to original if optimization fails
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                # Return the relative path to the image (optimized if successful)
                self.wfile.write(json.dumps({'status': 'success', 'filepath': f'{IMAGES_DIR}/{final_filename}'}).encode())
            else:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(b'No file uploaded')
        else:
            self.send_error(404, "File not found")

    def do_GET(self):
        # 1. Normalize root
        if self.path == '/' or self.path == '':
            self.path = '/index.html'
        
        # 2. Handle Directory requests without trailing slash (e.g., /info -> /info/index.html)
        else:
            # Remove query strings for file checking
            path_no_query = self.path.split('?')[0].rstrip('/')
            # Local file system path
            local_path = path_no_query.lstrip('/')
            
            if os.path.isdir(local_path):
                index_path = os.path.join(local_path, 'index.html')
                if os.path.exists(index_path):
                    # Rewrite internal path for the handler
                    query = '?' + self.path.split('?')[1] if '?' in self.path else ''
                    self.path = '/' + index_path + query

        super().do_GET()

    def send_error(self, code, message=None, explain=None):
        if code == 404:
            self.send_response(404)
            self.send_header('Content-Type', 'text/html')
            self.end_headers()
            try:
                with open('404.html', 'rb') as f:
                    self.wfile.write(f.read())
            except FileNotFoundError:
                # Fallback if 404.html doesn't exist
                super().send_error(code, message, explain)
        else:
            super().send_error(code, message, explain)

print(f"Server is running at http://localhost:{PORT}")
print(f"Admin page available at http://localhost:{PORT}/admin.html")

with socketserver.TCPServer(("", PORT), PortfolioHandler) as httpd:
    httpd.serve_forever()
