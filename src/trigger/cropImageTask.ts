import { task } from '@trigger.dev/sdk/v3';

interface CropImagePayload {
  imageUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const cropImageTask = task({
  id: 'crop-image',
  maxDuration: 60,
  run: async (payload: CropImagePayload) => {
    const authKey = process.env.NEXT_PUBLIC_TRANSLOADIT_AUTH_KEY;
    const authSecret = process.env.TRANSLOADIT_AUTH_SECRET;

    if (!authKey || !authSecret) {
      throw new Error('Transloadit credentials not configured');
    }

    // Create Transloadit assembly for image cropping
    const assemblyParams = {
      auth: {
        key: authKey,
      },
      steps: {
        import: {
          robot: '/http/import',
          url: payload.imageUrl,
        },
        crop: {
          robot: '/image/resize',
          use: 'import',
          crop: {
            x1: Math.round(payload.x),
            y1: Math.round(payload.y),
            x2: Math.round(payload.x + payload.width),
            y2: Math.round(payload.y + payload.height),
          },
          resize_strategy: 'crop',
          imagemagick_stack: 'v3.0.1',
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
      assemblyResult.results?.crop?.[0]?.ssl_url ||
      assemblyResult.results?.crop?.[0]?.url ||
      payload.imageUrl;

    return { outputImageUrl: outputUrl };
  },
});
