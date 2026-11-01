import os
import subprocess

with open("report.html", "r", encoding="utf-8") as f:
    full_html = f.read()

head_part = full_html.split("<body>")[0] + "<body>"
body_part = full_html.split("<body>")[1].split("</body>")[0]

raw_pages = body_part.split('<div class="page">')[1:]
print(f"Total raw pages found: {len(raw_pages)}")

for idx, p in enumerate(raw_pages):
    page_num = idx + 1
    if page_num in [4, 6, 8, 10, 11]:
        # remove running footer to avoid duplicates, then re-add
        content = '<div class="page">' + p.split('<!-- =========================================================================')[0]
        # ensure closes properly
        if not content.strip().endswith("</div>"):
            content += "</div>"
        page_html = f"{head_part}\n{content}\n</body></html>"
        
        html_file = f"report_assets/test_p{page_num}.html"
        img_file = f"report_assets/test_p{page_num}.png"
        with open(html_file, "w", encoding="utf-8") as pf:
            pf.write(page_html)
            
        cmd = [
            r"C:\Program Files\Google\Chrome\Application\chrome.exe",
            "--headless", "--no-sandbox", "--disable-gpu",
            rf"--user-data-dir=C:\TEMP\prev_{page_num}",
            "--window-size=800,1130",
            f"--screenshot={os.path.abspath(img_file)}",
            os.path.abspath(html_file)
        ]
        subprocess.run(cmd, capture_output=True)
        if os.path.exists(img_file):
            print(f"Page {page_num} rendered successfully: {os.path.getsize(img_file)} bytes")
