FROM ubuntu:22.04 as base

WORKDIR /app

ADD --chmod=700 https://huggingface.co/jartine/phi-2-llamafile/resolve/main/phi-2.Q2_K.llamafile?download=true ./llamafile
# Does the --chmod parameter not work?
RUN chmod 700 ./llamafile

COPY ./run.sh ./run.sh

ENTRYPOINT ["/bin/sh", "-c", "./run.sh"]
