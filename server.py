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
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'success', 'message': 'Saved successfully'}).encode())
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
                
                with open(save_path, 'wb') as f:
                    shutil.copyfileobj(fileitem.file, f)
                    
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                # Return the relative path to the image
                self.wfile.write(json.dumps({'status': 'success', 'filepath': f'{IMAGES_DIR}/{fn}'}).encode())
            else:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(b'No file uploaded')
        else:
            self.send_error(404, "File not found")

    def do_GET(self):
        # 1. Normalize path: remove query params and treat root as index.html
        base_path = self.path.split('?')[0]
        if base_path == '/' or base_path == '/index.html':
            self.path = '/index.html'
        
        # 2. Support extension-less URLs (e.g., /info -> info.html)
        else:
            # Check if path has no extension and if a .html file exists
            filename = base_path.lstrip('/')
            if not os.path.splitext(filename)[1]: # No extension
                potential_file = filename + '.html'
                if os.path.exists(potential_file):
                    # Preserving query string if any
                    query = self.path.split('?')[1] if '?' in self.path else ''
                    self.path = '/' + potential_file + (('?' + query) if query else '')

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
