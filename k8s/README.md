# BorrowBox on Kubernetes

These manifests are separate from the EC2, Ansible, CI, and Grafana deployment. They run the existing `borrowbox:local` image in the `borrowbox-local` namespace with two replicas.

## Build and deploy

From the repository root, build the image and load it into the existing Minikube cluster:

```sh
docker build -t borrowbox:local .
minikube image load borrowbox:local
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml -f k8s/service.yaml
```

`secret.yaml` intentionally contains an empty `MONGODB_URI`; it is only a placeholder, not a usable database address. Provide the real URI interactively without putting it in a file or command history:

```sh
set -o pipefail
read -rsp "MongoDB URI: " MONGODB_URI; printf '\n'
printf 'MONGODB_URI=%s\n' "$MONGODB_URI" \
  |   kubectl create secret generic borrowbox-secrets -n borrowbox-local \
      --from-env-file=/dev/stdin --dry-run=client -o yaml \
  | kubectl apply -f -
unset MONGODB_URI
kubectl rollout restart deployment/borrowbox -n borrowbox-local
kubectl rollout status deployment/borrowbox -n borrowbox-local --timeout=120s
```

If you do not have the MongoDB URI yet, you can still apply the Deployment and Service to run the mock-store fallback, but skip the rollout wait: replicas will remain not Ready until MongoDB is configured. The readiness probe uses `/api/health`, which returns HTTP 503 until MongoDB is connected. Startup and liveness use `/metrics`, which confirms that the Express process is responding without restarting it just because the database is unavailable.

## Access and checks

Once both replicas are Ready, forward the Service to local port 8080:

```sh
kubectl port-forward -n borrowbox-local service/borrowbox 8080:5000
```

Open **Ports** in the Codespaces panel, find port **8080**, and choose **Open in Browser** (or visit the forwarded URL Codespaces displays). Test `http://localhost:8080/api/health` and `http://localhost:8080/metrics` locally.

Inspect the deployment and application logs with:

```sh
kubectl get pods,service -n borrowbox-local -o wide
kubectl logs -n borrowbox-local deployment/borrowbox --all-pods=true
```

## Troubleshooting

- `ImagePullBackOff` for BorrowBox: build the image and run `minikube image load borrowbox:local`; the Deployment uses `imagePullPolicy: Never`.
- Minikube node `NotReady` or `kindnet` image pull failures: check `kubectl describe pod -n kube-system -l k8s-app=kindnet`, `kubectl get nodes`, and host registry/DNS access. If the host can pull the exact image, load it into Minikube with `docker pull <image>` followed by `minikube image load <image>`.
- Pods run but are not Ready: check `kubectl logs -n borrowbox-local deployment/borrowbox` and `kubectl get secret borrowbox-secrets -n borrowbox-local`; the database-aware readiness probe needs a valid, reachable MongoDB URI.
- Check `/metrics` using port-forwarding even if readiness is blocked by MongoDB; `/api/health` will report the database connection status.

## Cleanup

Delete only the Kubernetes resources in this namespace:

```sh
kubectl delete namespace borrowbox-local
```
