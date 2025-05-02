FROM registry-prod.beyond.cegedim.cloud/release/ci/ui-base-image:v12.0.1

COPY index.html /var/www/index.html
COPY locales /var/www/locales
COPY beyond_logo.png /var/www/beyond_logo.png
COPY *.css /var/www/
COPY static /var/www/static
COPY asset-manifest.json /var/www/asset-manifest.json

#retrieve specific configuration for desktop
COPY configuration.json /etc/configuration.json