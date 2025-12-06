import os
import time
from ftplib import FTP, error_perm

FTP_HOST = "access-5019066038.webspace-host.com"
FTP_USER = "su357282"
FTP_PASS = "TK##2024"
LOCAL_DIR = "ionos_deploy"

def connect_ftp():
    try:
        ftp = FTP(FTP_HOST, timeout=120) # 120s timeout
        ftp.login(FTP_USER, FTP_PASS)
        ftp.set_pasv(True)
        print(f"Connected to {FTP_HOST}")
        return ftp
    except Exception as e:
        print(f"Connection failed: {e}")
        return None

def ensure_remote_dir(ftp, remote_path):
    """Recursively create directories on the server."""
    if remote_path == "." or remote_path == "/":
        return

    parts = remote_path.split("/")
    current_path = ""
    for part in parts:
        if not part: continue
        current_path = f"{current_path}/{part}" if current_path else part
        try:
            ftp.mkd(current_path)
        except error_perm:
            pass # Directory likely exists

def upload_file_with_retry(ftp, local_path, remote_path, max_retries=3):
    for attempt in range(max_retries):
        try:
            with open(local_path, "rb") as f:
                print(f"Uploading {remote_path} (Attempt {attempt + 1})...")
                ftp.storbinary(f"STOR {remote_path}", f)
                return True, ftp
        except (OSError, error_perm) as e:
            print(f"Error uploading {remote_path}: {e}")
            # If connection dropped, try to reconnect
            try:
                ftp.quit()
            except:
                pass
            time.sleep(2)
            ftp = connect_ftp()
            if not ftp:
                return False, None
    return False, ftp

def main():
    ftp = connect_ftp()
    if not ftp:
        return

    # Walk through local directory
    for root, dirs, files in os.walk(LOCAL_DIR):
        # Calculate relative path to maintain structure
        rel_dir = os.path.relpath(root, LOCAL_DIR)
        if rel_dir == ".":
            rel_dir = ""
        
        # Create directories first
        for dir_name in dirs:
            remote_dir = os.path.join(rel_dir, dir_name).replace("\\", "/")
            ensure_remote_dir(ftp, remote_dir)

        # Upload files
        for file_name in files:
            local_file_path = os.path.join(root, file_name)
            remote_file_path = os.path.join(rel_dir, file_name).replace("\\", "/")
            
            success, ftp = upload_file_with_retry(ftp, local_file_path, remote_file_path)
            if not success:
                print(f"FAILED to upload {remote_file_path} after retries.")
            
            if not ftp:
                print("Critical error: Lost FTP connection and could not reconnect.")
                return

    try:
        ftp.quit()
    except:
        pass
    print("Upload process finished.")

if __name__ == "__main__":
    main()
