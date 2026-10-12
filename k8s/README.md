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

If the URI is absent or MongoDB is unreachable, the API starts in mock-store mode. `/api/health` returns HTTP 200 with `status: "degraded"`, `dataMode: "mock"`, `database: "disconnected"`, and `databaseReady: false`; Kubernetes readiness can therefore route traffic to replicas serving mock data. Startup and liveness use `/metrics`, independently of database availability, so a MongoDB outage does not restart the process.

The mock store is in-memory only. Its changes disappear when a pod restarts, and separate Kubernetes replicas have separate stores that may contain different data. It does not provide durable or shared storage. Once MongoDB reconnects, new requests return to MongoDB mode; changes made in mock mode are not synchronized to MongoDB.

## Validate degraded mode

Port-forward the Service and inspect health, mock API data, pod readiness, and logs:

```sh
kubectl port-forward -n borrowbox-local service/borrowbox 8080:5000
curl -sS http://localhost:8080/api/health
curl -sS http://localhost:8080/api/items
kubectl get pods -n borrowbox-local
kubectl logs -n borrowbox-local deployment/borrowbox --all-pods=true
```

To test startup fallback with a URI present, temporarily replace the Secret value with an unreachable local MongoDB address and restart the Deployment:

```sh
kubectl create secret generic borrowbox-secrets -n borrowbox-local \
  --from-literal=MONGODB_URI='mongodb://127.0.0.1:27017/borrowbox' \
  --dry-run=client -o yaml | kubectl apply -f -
kubectl rollout restart deployment/borrowbox -n borrowbox-local
kubectl rollout status deployment/borrowbox -n borrowbox-local --timeout=120s
curl -sS http://localhost:8080/api/health
```

Health should report `status: "degraded"` and `dataMode: "mock"`, while pods remain Ready. Restore the real URI using the interactive Secret update command above and restart the Deployment; health should then report `status: "healthy"` and `dataMode: "mongodb"` after reconnection. Do not leave the temporary test address configured.

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
- The API reports `status: "degraded"`: check `kubectl logs -n borrowbox-local deployment/borrowbox` and `kubectl get secret borrowbox-secrets -n borrowbox-local`; the application is serving mock data while MongoDB is unavailable.
- Check `/metrics` and `/api/health` using port-forwarding; health reports both the active data mode and MongoDB connection state.

## Cleanup

Delete only the Kubernetes resources in this namespace:

```sh
kubectl delete namespace borrowbox-local
```
