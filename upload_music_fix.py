
import paramiko
import os

# SFTP Configuration
HOST = "access-5019066038.webspace-host.com"
PORT = 22
USERNAME = "su357282"
PASSWORD = "TK##2024"

def upload_web_assets():
    print(f"Connecting to {HOST}...")
    try:
        transport = paramiko.Transport((HOST, PORT))
        transport.connect(username=USERNAME, password=PASSWORD)
        sftp = paramiko.SFTPClient.from_transport(transport)
        print("Connected successfully.")

        # Upload index.html
        print("Uploading index.html...")
        sftp.put("/Users/kevin/Desktop/leximix/ionos_deploy/index.html", "public/index.html")
        print("  - Success: index.html")

        # Upload assets
        print("Uploading assets...")
        local_assets = "/Users/kevin/Desktop/leximix/ionos_deploy/assets"
        remote_assets = "public/assets"

        for filename in os.listdir(local_assets):
            local_path = os.path.join(local_assets, filename)
            if os.path.isfile(local_path):
                remote_path = f"{remote_assets}/{filename}"
                print(f"  - Uploading {filename}...")
                sftp.put(local_path, remote_path)

        print("Upload complete!")

        sftp.close()
        transport.close()

    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    upload_web_assets()
