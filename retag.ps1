$services = @(
    "billing-service",
    "notification-communication-service",
    "analytics-reporting-service",
    "collection-management-service",
    "consumer-service",
    "customer-support-service",
    "gis-location-management-service",
    "meter-management-inventory-service",
    "policy-management-service",
    "third-party-integration-gateway-service",
    "user-identity-access-management-service",
    "workflow-approval-service",
    "user-service"
)

foreach ($service in $services) {
    if ([string]::IsNullOrWhiteSpace($service)) {
        Write-Host "Skipping empty service name"
        continue
    }

    $localImage = "infra-$service:latest"
    $hubImage = "ashritha07/$service:latest"

    # Check if local image exists
    $imageExists = docker images --format "{{.Repository}}:{{.Tag}}" | Where-Object { $_ -eq $localImage }

    if (-not $imageExists) {
        Write-Host "Image $localImage not found locally. Skipping..."
        continue
    }

    Write-Host "Tagging $localImage as $hubImage ..."
    docker tag $localImage $hubImage

    Write-Host "Pushing $hubImage to Docker Hub ..."
    docker push $hubImage
}
