import os
from ftplib import FTP

FTP_HOST = "access-5019066038.webspace-host.com"
FTP_USER = "su357282"
FTP_PASS = "TK##2024"
LOCAL_DIR = "ionos_deploy"

def upload_directory(ftp, local_dir):
    for root, dirs, files in os.walk(local_dir):
        for file in files:
            local_path = os.path.join(root, file)
            relative_path = os.path.relpath(local_path, LOCAL_DIR)
            remote_path = relative_path.replace("\\", "/") # Ensure forward slashes
            
            # Create remote directories if needed
            remote_dir = os.path.dirname(remote_path)
            if remote_dir and remote_dir != ".":
                parts = remote_dir.split("/")
                current_remote = ""
                for part in parts:
                    current_remote = f"{current_remote}/{part}" if current_remote else part
                    try:
                        ftp.mkd(current_remote)
                    except Exception:
                        pass # Directory likely exists

            print(f"Uploading {local_path} to {remote_path}...")
            with open(local_path, "rb") as f:
                ftp.storbinary(f"STOR {remote_path}", f)

def main():
    try:
        ftp = FTP(FTP_HOST)
        ftp.login(FTP_USER, FTP_PASS)
        print(f"Connected to {FTP_HOST}")
        
        upload_directory(ftp, LOCAL_DIR)
        
        ftp.quit()
        print("Upload complete!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
