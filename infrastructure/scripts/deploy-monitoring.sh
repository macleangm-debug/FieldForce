#!/bin/bash
# FieldForce Monitoring Stack Deployment Script
# Deploys Prometheus, Grafana, AlertManager to Kubernetes

set -e

echo "=============================================="
echo "  FieldForce Monitoring Stack Deployment"
echo "=============================================="

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl not found. Please install kubectl first."
    exit 1
fi

# Check cluster connection
echo "🔍 Checking Kubernetes cluster connection..."
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Cannot connect to Kubernetes cluster."
    echo "   Please ensure your kubeconfig is properly configured."
    exit 1
fi

echo "✅ Connected to cluster: $(kubectl config current-context)"

# Create namespaces
echo ""
echo "📦 Creating namespaces..."
kubectl apply -f - <<EOF
apiVersion: v1
kind: Namespace
metadata:
  name: fieldforce
  labels:
    app: fieldforce
---
apiVersion: v1
kind: Namespace
metadata:
  name: monitoring
  labels:
    app: monitoring
EOF

# Deploy Redis cluster
echo ""
echo "🔴 Deploying Redis cluster..."
kubectl apply -f kubernetes/redis-cluster.yaml
echo "   Waiting for Redis to be ready..."
kubectl wait --for=condition=ready pod -l app=redis -n fieldforce --timeout=120s 2>/dev/null || true

# Deploy MongoDB replica set
echo ""
echo "🍃 Deploying MongoDB replica set..."
kubectl apply -f kubernetes/mongodb-replicaset.yaml
echo "   Waiting for MongoDB to be ready..."
kubectl wait --for=condition=ready pod -l app=mongo -n fieldforce --timeout=180s 2>/dev/null || true

# Initialize MongoDB replica set
echo ""
echo "🔧 Initializing MongoDB replica set..."
sleep 30  # Wait for all pods to be fully ready
kubectl exec -it mongo-0 -n fieldforce -- mongosh --eval "rs.initiate()" 2>/dev/null || echo "   Replica set may already be initialized"

# Deploy monitoring stack
echo ""
echo "📊 Deploying Prometheus & Grafana..."
kubectl apply -f kubernetes/monitoring.yaml
echo "   Waiting for monitoring pods..."
kubectl wait --for=condition=ready pod -l app=prometheus -n monitoring --timeout=120s 2>/dev/null || true
kubectl wait --for=condition=ready pod -l app=grafana -n monitoring --timeout=120s 2>/dev/null || true

# Deploy FieldForce application
echo ""
echo "🚀 Deploying FieldForce application..."
kubectl apply -f kubernetes/deployment.yaml
echo "   Waiting for API pods..."
kubectl wait --for=condition=ready pod -l app=fieldforce,component=api -n fieldforce --timeout=120s 2>/dev/null || true

# Check deployment status
echo ""
echo "=============================================="
echo "  Deployment Status"
echo "=============================================="
echo ""
echo "📦 Pods in fieldforce namespace:"
kubectl get pods -n fieldforce -o wide
echo ""
echo "📊 Pods in monitoring namespace:"
kubectl get pods -n monitoring -o wide
echo ""
echo "🌐 Services:"
kubectl get svc -n fieldforce
kubectl get svc -n monitoring

# Get access URLs
echo ""
echo "=============================================="
echo "  Access URLs"
echo "=============================================="
echo ""

# Check for LoadBalancer or Ingress
GRAFANA_IP=$(kubectl get svc grafana -n monitoring -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")
PROMETHEUS_IP=$(kubectl get svc prometheus -n monitoring -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")

if [ -n "$GRAFANA_IP" ]; then
    echo "🔗 Grafana: http://$GRAFANA_IP:3000"
    echo "   Username: admin"
    echo "   Password: FieldForce2026!"
else
    echo "🔗 Grafana (port-forward): kubectl port-forward svc/grafana 3000:3000 -n monitoring"
fi

if [ -n "$PROMETHEUS_IP" ]; then
    echo "🔗 Prometheus: http://$PROMETHEUS_IP:9090"
else
    echo "🔗 Prometheus (port-forward): kubectl port-forward svc/prometheus 9090:9090 -n monitoring"
fi

echo ""
echo "=============================================="
echo "  Quick Commands"
echo "=============================================="
echo ""
echo "# Port forward Grafana"
echo "kubectl port-forward svc/grafana 3000:3000 -n monitoring"
echo ""
echo "# Port forward Prometheus"
echo "kubectl port-forward svc/prometheus 9090:9090 -n monitoring"
echo ""
echo "# View API logs"
echo "kubectl logs -f deployment/fieldforce-api -n fieldforce"
echo ""
echo "# View worker logs"
echo "kubectl logs -f deployment/fieldforce-worker -n fieldforce"
echo ""
echo "# Check HPA status"
echo "kubectl get hpa -n fieldforce"
echo ""
echo "✅ Deployment complete!"
