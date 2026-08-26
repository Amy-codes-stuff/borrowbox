# Ansible Deployment for BorrowBox

This directory contains the Ansible configuration files to provision a target Ubuntu 22.04 AWS EC2 instance and deploy the BorrowBox MERN application as a Docker container.

## Directory Structure

- `ansible.cfg`: Configures Ansible defaults (such as inventory path and disabling host key checking for ease of demo deployments).
- `inventory.ini`: Lists target hosts, IP addresses, SSH users, and private key file locations.
- `playbook.yml`: Configures target system, installs Docker, clones the repository, writes the application `.env` file, builds the Docker image, runs the container, and verifies health.
- `templates/env.j2`: Template for producing the `.env` configuration file on the EC2 host.
- `vars/secrets.yml`: Local git-ignored variables containing sensitive variables.
- `vars/secrets.yml.example`: Template example for secrets setup.

## Setup Instructions

1. **Configure Secrets**:
   Copy the example secrets file:
   ```bash
   cp vars/secrets.yml.example vars/secrets.yml
   ```
   Open `vars/secrets.yml` and provide the actual values for:
   - `mongodb_uri` (Your MongoDB Atlas connection URI)
   - `ai_api_key` (Your AI API key)

2. **Verify Configuration**:
   - Check the inventory structure:
     ```bash
     ansible-inventory --graph
     ```
   - Verify the playbook syntax:
     ```bash
     ansible-playbook --syntax-check playbook.yml
     ```

3. **Run the Playbook**:
   Ensure you have your SSH key `~/.ssh/borrowbox-deploy` in place, then run:
   ```bash
   ansible-playbook playbook.yml
   ```
