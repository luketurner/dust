# On-demand AI Server

This is a Fly app that lightly wraps a [Llamafile](https://github.com/Mozilla-Ocho/llamafile) to add LLM functionality to Dust.

It's run as a separate app because _most_ of the time this should be scaled to zero, even when the Dust server is running. But it has no public IPs, so it can only be accessed via the Fly internal network.

It's currently configured with a "tiny" model, `phi-2.Q2_K`, to minimize overhead. But, it doesn't work very well at the moment. This is still in the heavy experimental phase.

## Plans

Ultimately I'd like this to be used for:

1. "Smart" task selection for each day.
2. Calculating task embeddings to identify related tasks and potential duplicates.

## Setup

Replace `sea` with your region of choice.

```bash
flyctl launch --no-deploy
flyctl volume create model_data -r sea
flyctl deploy --ha=false --no-public-ips
```

## Testing

```bash
# temporarily scale up (since proxy doesn't auto-scale)
flyctl machines start

flyctl proxy 8081:8080
```

Then open http://localhost:8081 in your browser.

When finished:

```bash
# Scale back down
flyctl machines stop
```