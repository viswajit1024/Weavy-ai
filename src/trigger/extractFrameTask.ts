import { task } from '@trigger.dev/sdk/v3';

interface ExtractFramePayload {
  videoUrl: string;
  timestamp: number;
}

export const extractFrameTask = task({
  id: 'extract-video-frame',
  maxDuration: 120,
  run: async (payload: ExtractFramePayload) => {
    const authKey = process.env.NEXT_PUBLIC_TRANSLOADIT_AUTH_KEY;
    const authSecret = process.env.TRANSLOADIT_AUTH_SECRET;

    if (!authKey || !authSecret) {
      throw new Error('Transloadit credentials not configured');
    }

    // Create Transloadit assembly for frame extraction
    const assemblyParams = {
      auth: {
        key: authKey,
      },
      steps: {
        import: {
          robot: '/http/import',
          url: payload.videoUrl,
        },
        extract: {
          robot: '/video/thumbs',
          use: 'import',
          offsets: [payload.timestamp],
          format: 'png',
          count: 1,
          width: 1920,
          height: 1080,
          resize_strategy: 'fit',
          imagemagick_stack: 'v3.0.1',
          ffmpeg_stack: 'v6.0.0',
        },
      },
    };

    const response = await fetch('https://api2.transloadit.com/assemblies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        params: JSON.stringify(assemblyParams),
      }),
    });

    const assembly = await response.json();

    if (assembly.error) {
      throw new Error(`Transloadit error: ${assembly.error}`);
    }

    // Poll for assembly completion
    let assemblyResult = assembly;
    const assemblyUrl = assembly.assembly_ssl_url || assembly.assembly_url;

    if (assemblyUrl) {
      for (let i = 0; i < 60; i++) {
        if (assemblyResult.ok === 'ASSEMBLY_COMPLETED') break;
        if (assemblyResult.ok === 'REQUEST_ABORTED' || assemblyResult.error) {
          throw new Error(`Assembly failed: ${assemblyResult.error || assemblyResult.ok}`);
        }

        await new Promise((r) => setTimeout(r, 1000));
        const pollRes = await fetch(assemblyUrl);
        assemblyResult = await pollRes.json();
      }
    }

    const outputUrl =
      assemblyResult.results?.extract?.[0]?.ssl_url ||
      assemblyResult.results?.extract?.[0]?.url ||
      '';

    return { outputFrameUrl: outputUrl };
  },
});
