FROM registry-artifacts.beyond.cegedim.cloud/release/ci/python-run-image-3.7.9:1.2.2 as build
ARG PACKAGES_TO_INSTALL
ARG PIP_INDEX_URL

#Add Packages
ADD *.whl ./

# Packages installation
RUN pip install $PACKAGES_TO_INSTALL --extra-index-url $PIP_INDEX_URL

FROM registry-artifacts.beyond.cegedim.cloud/release/ci/python-run-image-3.7.9:1.2.2

RUN apk --no-cache add librdkafka
RUN mkdir -p /tmp/artifacts/outputs


COPY --from=build /usr/local/lib/python3.7/site-packages /usr/local/lib/python3.7/site-packages
COPY entrypoint.sh .
RUN chmod +x /entrypoint.sh

ENV PYTHONUNBUFFERED True

ENTRYPOINT ["/entrypoint.sh"]
