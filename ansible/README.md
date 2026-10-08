# BorrowBox Deployment

The GitHub Actions workflow deploys successful pushes to `main` using Ansible and a private Docker Hub image. It tags each image with the commit SHA, so the deployment uses a specific build rather than `latest`.

## One-Time Setup

1. Create a **private** Docker Hub repository named `borrowbox` under the account used by `DOCKERHUB_USERNAME`.
2. Create a Docker Hub access token that can push and pull that repository. The workflow uses it to push; Ansible uses it briefly on EC2 to pull, then logs out.
3. Add these repository Actions secrets in GitHub:
    - `DOCKERHUB_USERNAME`
    - `DOCKERHUB_TOKEN`
    - `EC2_HOST` (the EC2 public IP or DNS name)
    - `EC2_SSH_PRIVATE_KEY` (the private key authorized on the EC2 instance)
    - `MONGODB_URI`
    - `AI_API_KEY` (optional; the app has a fallback description enhancer)
4. Ensure the EC2 instance is Ubuntu with the `ubuntu` SSH user, and that its security group permits HTTP on port 80 and SSH for the academic demonstration.

The playbook installs Docker if needed, pulls the requested image, replaces the existing `borrowbox` container, supplies MongoDB configuration directly to the container, and checks `http://localhost/api/health` until it returns HTTP 200.

## Monitoring

BorrowBox exposes Prometheus-formatted application and Node.js process metrics at `/metrics` on container port 5000. Prometheus scrapes `borrowbox:5000/metrics` every 15 seconds over the private `borrowbox-monitoring` Docker network. It stores metrics in the `borrowbox-prometheus-data` volume with a three-day retention period. Prometheus has no host port published.

Grafana reads Prometheus through the same Docker network and provisions the `BorrowBox Monitoring` dashboard with request rate, error percentage, p95 latency, process CPU, memory, and uptime panels. Grafana data is stored in the `borrowbox-grafana-data` volume. Its host port is bound to `127.0.0.1:3000` only and anonymous access is read-only; it is not publicly reachable.

To view Grafana, open an SSH tunnel from your local machine:

```bash
ssh -N -L 3000:127.0.0.1:3000 -i "$HOME/.ssh/your-ec2-key.pem" ubuntu@<EC2_HOST>
```

Then visit `http://localhost:3000`. Prometheus port 9090 and Grafana port 3000 are not opened in the AWS security group. BorrowBox remains available through host port 80 mapped to container port 5000.

`AI_API_KEY` is optional. The application has a fallback description enhancer and does not require this key to run.

## Academic Demonstration SSH Note

SSH is temporarily open to 0.0.0.0/0 for the academic demonstration. In a production environment, SSH access should be restricted to a trusted CIDR, VPN, bastion host, or equivalent secure access mechanism.

## Manual Ansible Syntax Check

The workflow creates its inventory and variable files in the temporary GitHub runner directory. The playbook accepts `image_name`, `image_tag`, `mongodb_uri`, `dockerhub_username`, and `dockerhub_token` as extra variables.

```bash
cd ansible
ansible-playbook --syntax-check playbook.yml \
    --extra-vars 'image_name=example/borrowbox image_tag=example mongodb_uri=placeholder dockerhub_username=example dockerhub_token=placeholder'
```

Do not use real credentials in shell arguments or commit secret files. The workflow passes real values through a temporary, permission-restricted file outside the repository.

## Local SSH Key Path Example

Keep the private key on your local machine. Set its path in a local shell variable, then pass that variable to Ansible when running a manual command:

```bash
cd ansible
export BORROWBOX_SSH_KEY="$HOME/.ssh/new-borrowbox-ec2.pem"
ansible-playbook --inventory inventory.ini --private-key "$BORROWBOX_SSH_KEY" playbook.yml
```

The example path is a placeholder; do not add your actual key path or private key contents to the repository.
