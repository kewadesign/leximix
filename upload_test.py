from ftplib import FTP

FTP_HOST = "access-5019066038.webspace-host.com"
FTP_USER = "su357282"
FTP_PASS = "TK##2024"

try:
    ftp = FTP(FTP_HOST, timeout=10)
    ftp.login(FTP_USER, FTP_PASS)
    print("Connected.")
    with open("ionos_deploy/index.html", "rb") as f:
        ftp.storbinary("STOR index.html", f)
    print("Uploaded index.html")
    ftp.quit()
except Exception as e:
    print(f"Error: {e}")
